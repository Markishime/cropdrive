import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMembershipAdmin, canPerformAnalysis, isContractExpired } from '@/lib/membership-admin';

// Initialize Firebase Admin if not already initialized
let adminAuth: any = null;
let adminDb: any = null;

if (!getApps().length) {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      adminAuth = getAuth();
      adminDb = getFirestore();
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

const OIL_PALM_ISSUE_PATTERNS: Array<{ key: string; patterns: RegExp[] }> = [
  { key: 'potassium', patterns: [/\bpotassium\b/i, /\bk\b deficiency/i, /mop/i] },
  { key: 'magnesium', patterns: [/\bmagnesium\b/i, /\bmg\b deficiency/i, /dolomite/i, /kieserite/i] },
  { key: 'nitrogen', patterns: [/\bnitrogen\b/i, /\bn\b deficiency/i, /urea/i, /ammonium/i] },
  { key: 'phosphorus', patterns: [/\bphosphorus\b/i, /\bphosphate\b/i, /\bp\b deficiency/i] },
  { key: 'boron', patterns: [/\bboron\b/i, /borate/i] },
  { key: 'acidity', patterns: [/low ph/i, /acid/i, /acidity/i, /liming/i, /lime application/i] },
  { key: 'organic', patterns: [/organic matter/i, /soil structure/i, /mulch/i, /compost/i] },
  { key: 'water', patterns: [/drainage/i, /waterlogging/i, /moisture stress/i, /drought/i] },
];

function normalizeRecommendations(recommendations: unknown, analysisData: any): string[] {
  const direct = Array.isArray(recommendations) ? recommendations : [];
  const nested = Array.isArray(analysisData?.recommendations) ? analysisData.recommendations : [];
  return [...direct, ...nested]
    .filter((item) => typeof item === 'string')
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function extractIssueTags(summary: unknown, normalizedRecs: string[], analysisData: any): string[] {
  const textBlob = [
    typeof summary === 'string' ? summary : '',
    ...normalizedRecs,
    typeof analysisData?.summary === 'string' ? analysisData.summary : '',
  ]
    .join(' ')
    .toLowerCase();

  const matched = OIL_PALM_ISSUE_PATTERNS
    .filter((item) => item.patterns.some((pattern) => pattern.test(textBlob)))
    .map((item) => item.key);

  return Array.from(new Set(matched));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      title, 
      type, 
      summary, 
      recommendations, 
      fileUrl,
      analysisData 
    } = body;

    const normalizedRecommendations = normalizeRecommendations(recommendations, analysisData);
    const issueTags = extractIssueTags(summary, normalizedRecommendations, analysisData);

    // Validate required fields
    if (!userId || !title || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, type' },
        { status: 400 }
      );
    }

    // Verify the user is authenticated
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify token if Admin SDK is available, otherwise trust client-side validation
    if (adminAuth) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        // Verify the userId matches the authenticated user
        if (decodedToken.uid !== userId) {
          return NextResponse.json(
            { error: 'Unauthorized: User ID mismatch' },
            { status: 403 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid token' },
          { status: 401 }
        );
      }
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Admin database is not configured' },
        { status: 500 }
      );
    }

    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    const userEmail = String(userData?.email || '').trim();
    const whatsappNumber = String(userData?.phoneNumber || '').trim();
    const countryRegion = String(userData?.countryRegion || userData?.farmLocation || '').trim();

    if (!userEmail || !whatsappNumber || !countryRegion) {
      return NextResponse.json(
        {
          error: 'Incomplete profile',
          message: 'Complete Email, WhatsApp number, and Country/Region in your profile before generating reports.',
          missing: {
            email: !userEmail,
            whatsapp: !whatsappNumber,
            countryRegion: !countryRegion,
          },
        },
        { status: 400 }
      );
    }

    const reportsRef = adminDb.collection('analysis_results');
    const q1 = reportsRef.where('userId', '==', userId).where('status', '==', 'completed');
    const q2 = reportsRef.where('user_id', '==', userId).where('status', '==', 'completed');
    const [snapshot1, snapshot2] = await Promise.all([q1.get(), q2.get()]);
    const uniqueReportIds = new Set<string>();
    snapshot1.forEach((doc: any) => uniqueReportIds.add(doc.id));
    snapshot2.forEach((doc: any) => uniqueReportIds.add(doc.id));

    const MAX_REPORTS_PER_USER = 2;
    if (uniqueReportIds.size >= MAX_REPORTS_PER_USER) {
      return NextResponse.json(
        {
          error: 'Report cap reached',
          message: `Maximum ${MAX_REPORTS_PER_USER} reports per account reached.`,
          uploadsUsed: uniqueReportIds.size,
          uploadsLimit: MAX_REPORTS_PER_USER,
        },
        { status: 403 }
      );
    }

    const membership = await getMembershipAdmin(userId);
    if (!canPerformAnalysis(membership)) {
      const uploadsUsed = membership?.uploadsUsedThisMonth || 0;
      const uploadsLimit = 2;

      if (isContractExpired(membership)) {
        return NextResponse.json(
          {
            error: 'Subscription expired',
            message: 'Your 12-month contract has ended. Please subscribe to a new plan to continue.',
            uploadsUsed,
            uploadsLimit,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: 'Upload limit exceeded',
          message: 'You have reached your upload limit. Please upgrade your plan for more analyses.',
          uploadsUsed,
          uploadsLimit,
        },
        { status: 403 }
      );
    }

    // Save report to Firestore
    // Note: Firestore security rules will validate that userId matches auth.uid
    const reportData = {
      userId,
      title,
      type: type as 'soil' | 'leaf',
      summary: summary || '',
      recommendations: recommendations || 0,
      recommendationsList: normalizedRecommendations,
      status: 'completed' as const,
      date: new Date().toISOString().split('T')[0],
      fileUrl: fileUrl || null,
      analysisData: analysisData || null,
      issueTags,
      step2Issues: issueTags,
      recurringIssues: issueTags,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Use Admin SDK if available, otherwise return instructions
    if (adminDb) {
      console.log(`💾 Saving report to Firestore for user ${userId}...`);
      
      // Save the analysis report
      const docRef = await adminDb.collection('analysis_results').add(reportData);
      console.log(`✅ Report saved with ID: ${docRef.id}`);

      // Internal mirror for CropDrive operations/admin visibility.
      await adminDb.collection('internal_reports').add({
        reportId: docRef.id,
        userId,
        userEmail,
        whatsappNumber,
        countryRegion,
        title,
        type,
        summary: summary || '',
        recommendations: recommendations || 0,
        recommendationsList: normalizedRecommendations,
        fileUrl: fileUrl || null,
        issueTags,
        step2Issues: issueTags,
        createdAt: FieldValue.serverTimestamp(),
      });
      
      // Get current user data before incrementing
      const userDocBefore = await adminDb.collection('users').doc(userId).get();
      const userDataBefore = userDocBefore.exists ? userDocBefore.data() : null;
      const uploadsUsedBefore = userDataBefore?.uploadsUsed || 0;
      
      console.log(`📊 Current uploadsUsed before increment: ${uploadsUsedBefore}`);
      
      // Increment the user's uploadsUsed counter
      await adminDb.collection('users').doc(userId).update({
        uploadsUsed: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`✅ Incremented uploadsUsed for user ${userId}`);
      
      // Get updated user data
      const updatedUserDoc = await adminDb.collection('users').doc(userId).get();
      const updatedUserData = updatedUserDoc.exists ? updatedUserDoc.data() : null;
      
      const finalUploadsUsed = updatedUserData?.uploadsUsed || (uploadsUsedBefore + 1);
      const finalUploadsLimit = 2;
      
      console.log(`✅ Report saved and upload count incremented for user ${userId}: ${finalUploadsUsed}/${finalUploadsLimit}`);
      console.log(`📄 Report ID: ${docRef.id}`);
      
      return NextResponse.json({
        success: true,
        reportId: docRef.id,
        message: 'Report saved successfully',
        uploadsUsed: finalUploadsUsed,
        uploadsLimit: finalUploadsLimit,
      });
    } else {
      // If Admin SDK not available, return success but note that client-side will handle it
      // The client-side code will save directly to Firestore (with security rules validation)
      return NextResponse.json({
        success: true,
        message: 'Report will be saved client-side',
        note: 'Admin SDK not configured, using client-side save',
        incrementUsage: true, // Flag to tell client to increment usage
      });
    }
  } catch (error: any) {
    console.error('Error saving report:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save report',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

