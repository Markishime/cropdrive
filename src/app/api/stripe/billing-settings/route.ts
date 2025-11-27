import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

// GET - Fetch billing settings
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    
    return NextResponse.json({
      settings: {
        emailNotifications: userData?.billingSettings?.emailNotifications ?? true,
        autoRenewal: !(userData?.subscriptionCancelAtPeriodEnd ?? false),
      },
    });

  } catch (error: any) {
    console.error('Error fetching billing settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing settings', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update billing settings
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await req.json();
    const { emailNotifications } = body;

    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update billing settings in Firestore
    await adminDb.collection('users').doc(userId).update({
      'billingSettings.emailNotifications': emailNotifications,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Billing settings updated successfully',
      settings: {
        emailNotifications,
      },
    });

  } catch (error: any) {
    console.error('Error updating billing settings:', error);
    return NextResponse.json(
      { error: 'Failed to update billing settings', details: error.message },
      { status: 500 }
    );
  }
}

