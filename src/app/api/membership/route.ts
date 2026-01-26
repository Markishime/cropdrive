import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { canAccessAIAssistant, canAccessPalmira, hasFullAccess, getMembershipStatusMessage } from '@/lib/membership-admin';

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
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Import the admin membership function here to avoid client-side bundling
    const { getMembershipAdmin } = await import('@/lib/membership-admin');

    const membership = await getMembershipAdmin(userId);

    return NextResponse.json({
      success: true,
      data: {
        canAccessAI: canAccessAIAssistant(membership),
        canAccessPalmira: canAccessPalmira(membership),
        hasFullAccess: hasFullAccess(membership),
        statusMessage: getMembershipStatusMessage(membership),
        membership: membership
      }
    });
  } catch (error: any) {
    console.error('Error checking membership:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}