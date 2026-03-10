import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, adminDb } from '@/lib/firebase-admin';

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
    
    // Verify token using Admin SDK
    try {
      const decodedToken = await getAdminAuth().verifyIdToken(token);
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

    // Check user's upload limits before saving
    // Note: Even if subscription is cancelled, limits still apply until period end
    {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const uploadsUsed = userData?.uploadsUsed || 0;
        const uploadsLimit = userData?.uploadsLimit || 10;
        const subscriptionStatus = userData?.subscriptionStatus;
        const currentPeriodEnd = userData?.currentPeriodEnd;
        
        console.log(`📊 Checking upload limits for user ${userId}: ${uploadsUsed}/${uploadsLimit}, status: ${subscriptionStatus}`);
        
        // If subscription is cancelled, check if we're still within the period end
        if (subscriptionStatus === 'canceled' && currentPeriodEnd) {
          const periodEndDate = currentPeriodEnd.toDate ? currentPeriodEnd.toDate() : new Date(currentPeriodEnd);
          const now = new Date();
          if (now >= periodEndDate) {
            console.log(`❌ User ${userId} subscription period has ended`);
            return NextResponse.json(
              { 
                error: 'Subscription expired',
                message: 'Your subscription period has ended. Please subscribe to a new plan to continue.',
                uploadsUsed,
                uploadsLimit 
              },
              { status: 403 }
            );
          }
        }
        
        // Check if user has exceeded their limit (unless unlimited: -1)
        // This applies regardless of subscription status (as long as within period end)
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
      } else {
        console.warn(`⚠️ User document not found for ${userId}`);
      }
    }

    // Save report to Firestore
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
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    console.log(`💾 Saving report to Firestore for user ${userId}...`);

    const docRef = await adminDb.collection('analysis_results').add(reportData);
    console.log(`✅ Report saved with ID: ${docRef.id}`);

    const userDocBefore = await adminDb.collection('users').doc(userId).get();
    const uploadsUsedBefore = userDocBefore.exists ? (userDocBefore.data()?.uploadsUsed || 0) : 0;

    await adminDb.collection('users').doc(userId).update({
      uploadsUsed: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedUserDoc = await adminDb.collection('users').doc(userId).get();
    const updatedUserData = updatedUserDoc.exists ? updatedUserDoc.data() : null;
    const finalUploadsUsed = updatedUserData?.uploadsUsed || (uploadsUsedBefore + 1);
    const finalUploadsLimit = updatedUserData?.uploadsLimit || 10;

    console.log(`✅ Report saved and upload count incremented: ${finalUploadsUsed}/${finalUploadsLimit}`);

    return NextResponse.json({
      success: true,
      reportId: docRef.id,
      message: 'Report saved successfully',
      uploadsUsed: finalUploadsUsed,
      uploadsLimit: finalUploadsLimit,
    });
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

