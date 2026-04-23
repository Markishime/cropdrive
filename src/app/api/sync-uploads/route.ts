import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    console.log(`🔄 Syncing uploadsUsed for user ${userId}...`);

    // Count completed analysis results for this user (both userId and user_id formats)
    const reportsRef = adminDb.collection('analysis_results');
    
    // Query for userId format
    const q1 = reportsRef.where('userId', '==', userId).where('status', '==', 'completed');
    const snapshot1 = await q1.get();
    
    // Query for user_id format
    const q2 = reportsRef.where('user_id', '==', userId).where('status', '==', 'completed');
    const snapshot2 = await q2.get();
    
    // Merge results and count unique documents
    const uniqueReportIds = new Set<string>();
    snapshot1.forEach((doc) => uniqueReportIds.add(doc.id));
    snapshot2.forEach((doc) => uniqueReportIds.add(doc.id));
    
    const actualCount = uniqueReportIds.size;
    console.log(`📊 Found ${actualCount} completed analysis reports for user ${userId}`);

    // Get current user data
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const currentUploadsUsed = userData?.uploadsUsed || 0;

    // Update uploadsUsed if it doesn't match
    if (currentUploadsUsed !== actualCount) {
      console.log(`🔄 Updating uploadsUsed from ${currentUploadsUsed} to ${actualCount}`);
      await adminDb.collection('users').doc(userId).update({
        uploadsUsed: actualCount,
        uploadsLimit: 2,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await adminDb.collection('users').doc(userId).update({
        uploadsLimit: 2,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`✅ uploadsUsed already correct: ${actualCount}`);
    }

    return NextResponse.json({
      success: true,
      uploadsUsed: actualCount,
      previousUploadsUsed: currentUploadsUsed,
      synced: currentUploadsUsed !== actualCount,
    });
  } catch (error: any) {
    console.error('Error syncing uploads:', error);
    return NextResponse.json(
      { error: 'Failed to sync uploads', details: error.message },
      { status: 500 }
    );
  }
}

