import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
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
      const docRef = await adminDb.collection('analysis_results').add(reportData);
      return NextResponse.json({
        success: true,
        reportId: docRef.id,
        message: 'Report saved successfully',
      });
    } else {
      // If Admin SDK not available, return success but note that client-side will handle it
      // The client-side code will save directly to Firestore (with security rules validation)
      return NextResponse.json({
        success: true,
        message: 'Report will be saved client-side',
        note: 'Admin SDK not configured, using client-side save',
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

