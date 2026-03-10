import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { adminDb, getAdminAuth } from '@/lib/firebase-admin';
import { getMembershipAdmin, canAccessPalmira } from '@/lib/membership-admin';

// Using adminDb from firebase-admin

interface OnboardingRequest {
  userType: 'smallholder' | 'estate' | 'dealer' | 'student' | 'lab' | 'academic' | 'farmer' | 'organization' | 'researcher' | 'other';
  language: 'en' | 'ms';
  conversationStyle: 'diagnostic_interview' | 'checklist_only' | 'short_direct';
  consentTranscripts: boolean;
  consentFarmProfile: boolean;
  consentAnonymized?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check membership using Admin SDK
    const membership = await getMembershipAdmin(userId);
    if (!canAccessPalmira(membership)) {
      return NextResponse.json(
        { success: false, error: 'Palmira access requires a plan' },
        { status: 403 }
      );
    }

    const body: OnboardingRequest = await request.json();
    const {
      userType,
      language,
      conversationStyle,
      consentTranscripts,
      consentFarmProfile,
      consentAnonymized,
    } = body;

    // Validate required fields
    if (!userType || !language || !conversationStyle) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save onboarding data
    const onboardingData = {
      userId,
      userType,
      language,
      conversationStyle,
      consentTranscripts: consentTranscripts || false,
      consentFarmProfile: consentFarmProfile || false,
      consentAnonymized: consentAnonymized || false,
      completed: true,
      completedAt: FieldValue.serverTimestamp(),
    };

    await adminDb
      .collection('palmira_onboarding')
      .doc(userId)
      .set(onboardingData, { merge: true });

    // Save preferences
    const preferences = {
      userId,
      language,
      conversationStyle,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb
      .collection('palmira_preferences')
      .doc(userId)
      .set(preferences, { merge: true });

    return NextResponse.json({
      success: true,
      data: onboardingData,
    });
  } catch (error: any) {
    console.error('Error saving onboarding:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const onboardingDoc = await adminDb
      .collection('palmira_onboarding')
      .doc(userId)
      .get();

    if (!onboardingDoc.exists) {
      return NextResponse.json({
        success: true,
        data: { completed: false },
      });
    }

    const data = onboardingDoc.data();
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        completed: data?.completed || false,
        // Convert Firestore Timestamp to ISO string for easier parsing
        completedAt: data?.completedAt?.toDate 
          ? data.completedAt.toDate().toISOString()
          : data?.completedAt?.seconds
          ? new Date(data.completedAt.seconds * 1000).toISOString()
          : data?.completedAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching onboarding:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
