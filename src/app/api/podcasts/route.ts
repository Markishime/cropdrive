import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminFirestore } from '@/lib/firebase-admin';

/**
 * GET /api/podcasts
 * Returns published podcast episodes. Only for authenticated users with a plan.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'auth_required' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const userDoc = await adminFirestore.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const plan = (userData?.plan ?? '').toString().toLowerCase().trim();

    if (!plan || plan === 'none') {
      return NextResponse.json(
        { error: 'A plan is required to access podcasts', code: 'plan_required' },
        { status: 403 }
      );
    }

    // Fetch all podcasts then filter/sort in memory to avoid requiring a composite index
    const snapshot = await adminFirestore.collection('podcasts').get();

    const episodes = snapshot.docs
      .map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title ?? '',
          titleMs: d.titleMs ?? d.title ?? '',
          description: d.description ?? '',
          descriptionMs: d.descriptionMs ?? d.description ?? '',
          youtubeUrl: d.youtubeUrl ?? '',
          videoId: d.videoId ?? null,
          thumbnail: d.thumbnail ?? null,
          order: d.order ?? 0,
          published: d.published !== false,
          createdAt: d.createdAt?.toDate?.()?.toISOString?.() ?? null,
        };
      })
      .filter((ep) => ep.published)
      .sort((a, b) => {
        const orderDiff = (a.order ?? 0) - (b.order ?? 0);
        if (orderDiff !== 0) return orderDiff;
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });

    return NextResponse.json({ success: true, episodes });
  } catch (error: any) {
    if (error.code === 'auth/id-token-expired' || error.message?.includes('auth')) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'auth_required' },
        { status: 401 }
      );
    }
    console.error('Podcasts list error:', error);
    return NextResponse.json(
      { error: 'Failed to load podcasts' },
      { status: 500 }
    );
  }
}
