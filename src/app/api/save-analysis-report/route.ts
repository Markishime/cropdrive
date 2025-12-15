import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

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

    // Check user's upload limits before saving
    if (adminDb) {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const uploadsUsed = userData?.uploadsUsed || 0;
        const uploadsLimit = userData?.uploadsLimit || 10;
        
        // Check if user has exceeded their limit (unless unlimited: -1)
        if (uploadsLimit !== -1 && uploadsUsed >= uploadsLimit) {
          console.log(`❌ User ${userId} has exceeded upload limit: ${uploadsUsed}/${uploadsLimit}`);
          return NextResponse.json(
            { 
              error: 'Upload limit exceeded',
              message: 'You have reached your upload limit. Please upgrade your plan for more analyses.',
              uploadsUsed,
              uploadsLimit 
            },
            { status: 403 }
          );
        }
      }
    }

    // Save report to Firestore
    // Note: Firestore security rules will validate that userId matches auth.uid
    const reportData = {
      userId,
      title,
      type: type as 'soil' | 'leaf',
      summary: summary || '',
      recommendations: recommendations || 0,
      status: 'completed' as const,
      date: new Date().toISOString().split('T')[0],
      fileUrl: fileUrl || null,
      analysisData: analysisData || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Use Admin SDK if available, otherwise return instructions
    if (adminDb) {
      // Save the analysis report
      const docRef = await adminDb.collection('analysis_results').add(reportData);
      
      // Increment the user's uploadsUsed counter
      await adminDb.collection('users').doc(userId).update({
        uploadsUsed: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
      
      // Get updated user data
      const updatedUserDoc = await adminDb.collection('users').doc(userId).get();
      const updatedUserData = updatedUserDoc.data();
      
      console.log(`✅ Report saved and upload count incremented for user ${userId}: ${updatedUserData?.uploadsUsed}/${updatedUserData?.uploadsLimit}`);
      
      return NextResponse.json({
        success: true,
        reportId: docRef.id,
        message: 'Report saved successfully',
        uploadsUsed: updatedUserData?.uploadsUsed || 0,
        uploadsLimit: updatedUserData?.uploadsLimit || 10,
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

