import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, getAdminAuth } from '@/lib/firebase-admin';
import { getMembershipAdmin, canAccessPalmira } from '@/lib/membership-admin';

interface SettingsUpdateRequest {
  conversationStyle?: 'diagnostic_interview' | 'checklist_only' | 'short_direct';
  language?: 'en' | 'ms';
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
        data: {
          conversationStyle: 'short_direct',
          language: 'en',
        },
      });
    }

    const data = onboardingDoc.data();
    return NextResponse.json({
      success: true,
      data: {
        conversationStyle: data?.conversationStyle || 'short_direct',
        language: data?.language || 'en',
      },
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // Check membership
    const membership = await getMembershipAdmin(userId);
    if (!canAccessPalmira(membership)) {
      return NextResponse.json(
        { success: false, error: 'Palmira access requires a plan' },
        { status: 403 }
      );
    }

    const body: SettingsUpdateRequest = await request.json();
    const { conversationStyle, language } = body;

    // Validate conversationStyle if provided
    if (conversationStyle && !['diagnostic_interview', 'checklist_only', 'short_direct'].includes(conversationStyle)) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversation style' },
        { status: 400 }
      );
    }

    // Validate language if provided
    if (language && !['en', 'ms'].includes(language)) {
      return NextResponse.json(
        { success: false, error: 'Invalid language' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (conversationStyle) {
      updateData.conversationStyle = conversationStyle;
    }

    if (language) {
      updateData.language = language;
    }

    // Update onboarding document
    await adminDb
      .collection('palmira_onboarding')
      .doc(userId)
      .set(updateData, { merge: true });

    // Also update preferences collection for consistency
    await adminDb
      .collection('palmira_preferences')
      .doc(userId)
      .set(updateData, { merge: true });

    return NextResponse.json({
      success: true,
      data: {
        conversationStyle: conversationStyle || undefined,
        language: language || undefined,
      },
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
