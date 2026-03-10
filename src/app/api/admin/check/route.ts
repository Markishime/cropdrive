import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getAdminAuth } from '@/lib/firebase-admin';

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

    const userIsAdmin = await isAdmin(userId);

    return NextResponse.json({
      success: true,
      isAdmin: userIsAdmin,
    });
  } catch (error: any) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
