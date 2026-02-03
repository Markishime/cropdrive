import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAdmin } from '@/lib/admin';
import { getYouTubeVideoId } from '@/lib/youtube';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await verifyAdmin(authHeader.split('Bearer ')[1]);

    const snapshot = await adminFirestore
      .collection('podcasts')
      .orderBy('createdAt', 'desc')
      .get();

    const episodes = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        ...d,
        createdAt: d.createdAt?.toDate?.()?.toISOString?.() ?? null,
        updatedAt: d.updatedAt?.toDate?.()?.toISOString?.() ?? null,
      };
    });

    return NextResponse.json({ success: true, episodes });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
    console.error('Podcasts admin list error:', error);
    return NextResponse.json({ error: 'Failed to fetch podcasts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await verifyAdmin(authHeader.split('Bearer ')[1]);

    const body = await req.json();
    const { title, titleMs, description, descriptionMs, youtubeUrl, thumbnail, order, published } = body;

    if (!title || !youtubeUrl) {
      return NextResponse.json(
        { error: 'Title and YouTube URL are required' },
        { status: 400 }
      );
    }

    const videoId = getYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL. Use youtu.be/xxx or youtube.com/watch?v=xxx' },
        { status: 400 }
      );
    }

    const thumbnailUrl = thumbnail ? String(thumbnail).trim() : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    const ref = adminFirestore.collection('podcasts').doc();
    await ref.set({
      title: String(title).trim(),
      titleMs: titleMs ? String(titleMs).trim() : String(title).trim(),
      description: description ? String(description).trim() : '',
      descriptionMs: descriptionMs ? String(descriptionMs).trim() : (description ? String(description).trim() : ''),
      youtubeUrl: String(youtubeUrl).trim(),
      videoId,
      thumbnail: thumbnailUrl,
      order: typeof order === 'number' ? order : 0,
      published: published !== false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const doc = await ref.get();
    const d = doc.data()!;
    return NextResponse.json({
      success: true,
      episode: {
        id: ref.id,
        title: d.title,
        titleMs: d.titleMs,
        description: d.description,
        descriptionMs: d.descriptionMs,
        youtubeUrl: d.youtubeUrl,
        videoId: d.videoId,
        thumbnail: d.thumbnail,
        order: d.order,
        published: d.published,
        createdAt: d.createdAt?.toDate?.()?.toISOString?.() ?? null,
        updatedAt: d.updatedAt?.toDate?.()?.toISOString?.() ?? null,
      },
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
    console.error('Podcasts admin create error:', error);
    return NextResponse.json({ error: 'Failed to create podcast' }, { status: 500 });
  }
}
