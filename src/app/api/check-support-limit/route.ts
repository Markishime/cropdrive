import { NextRequest, NextResponse } from 'next/server';

// Plan-based monthly limits
const PLAN_LIMITS = {
  start: 3,
  smart: 5,
  precision: -1, // unlimited
} as const;

// Get the first day of current month
function getFirstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Get the first day of next month
function getFirstDayOfNextMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

// Count messages sent by user this month using Admin SDK
async function getMonthlyMessageCount(userId: string): Promise<number> {
  try {
    const { adminDb } = await import('@/lib/firebase-admin');
    const monthStart = getFirstDayOfMonth();
    const monthEnd = getFirstDayOfNextMonth();

    const snapshot = await adminDb
      .collection('supportMessages')
      .where('userId', '==', userId)
      .where('createdAt', '>=', monthStart)
      .where('createdAt', '<', monthEnd)
      .get();

    return snapshot.size;
  } catch (error) {
    console.error('Error counting messages with admin SDK:', error);
    // Fallback: return 0 to allow sending (graceful degradation)
    return 0;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return NextResponse.json({ error: 'Unauthorized - Please login again' }, { status: 401 });
    }

    // Check if we're in development/test mode
    let userId: string;
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';

    if (isDevelopment) {
      // In development, extract user ID from token without verification
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = decoded.user_id || decoded.uid || 'demo-user';
        console.log('Development mode: Extracted userId:', userId);
      } catch (error) {
        console.error('Error decoding token in dev mode:', error);
        return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
      }
    } else {
      // In production, verify Firebase token
      try {
        const { adminAuth } = await import('@/lib/firebase-admin');
        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await adminAuth.verifyIdToken(token);
        userId = decodedToken.uid;
        console.log('Production mode: Verified userId:', userId);
      } catch (error) {
        console.error('Error verifying token in production:', error);
        return NextResponse.json({ error: 'Token verification failed' }, { status: 401 });
      }
    }

    // Get user data using Admin SDK
    const { adminDb } = await import('@/lib/firebase-admin');
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const userPlan = userData?.plan || 'start';
    const planLimit = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.start;

    // Get monthly count
    const monthlyCount = await getMonthlyMessageCount(userId);
    const canSend = planLimit === -1 || monthlyCount < planLimit;

    return NextResponse.json({
      canSend,
      monthlyCount,
      limit: planLimit,
      plan: userPlan,
    });

  } catch (error: any) {
    console.error('❌ Error checking support limit:', error);
    return NextResponse.json(
      { error: 'Failed to check support limit', details: error.message },
      { status: 500 }
    );
  }
}
