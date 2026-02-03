import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAdmin } from '@/lib/admin';
import { getYouTubeVideoId } from '@/lib/youtube';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await verifyAdmin(authHeader.split('Bearer ')[1]);

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Episode ID required' }, { status: 400 });
    }

    const body = await req.json();
    const { title, titleMs, description, descriptionMs, youtubeUrl, thumbnail, order, published } = body;

    const ref = adminFirestore.collection('podcasts').doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (title !== undefined) updates.title = String(title).trim();
    if (titleMs !== undefined) updates.titleMs = String(titleMs).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (descriptionMs !== undefined) updates.descriptionMs = String(descriptionMs).trim();
    if (thumbnail !== undefined) updates.thumbnail = thumbnail ? String(thumbnail).trim() : null;
    if (typeof order === 'number') updates.order = order;
    if (typeof published === 'boolean') updates.published = published;

    if (youtubeUrl !== undefined) {
      const videoId = getYouTubeVideoId(youtubeUrl);
      if (!videoId) {
        return NextResponse.json(
          { error: 'Invalid YouTube URL' },
          { status: 400 }
        );
      }
      updates.youtubeUrl = String(youtubeUrl).trim();
      updates.videoId = videoId;
      if (thumbnail === undefined) {
        updates.thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }

    await ref.update(updates);
    const updated = await ref.get();
    const d = updated.data()!;
    return NextResponse.json({
      success: true,
      episode: {
        id: ref.id,
        ...d,
        createdAt: d.createdAt?.toDate?.()?.toISOString?.() ?? null,
        updatedAt: d.updatedAt?.toDate?.()?.toISOString?.() ?? null,
      },
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
    console.error('Podcasts admin update error:', error);
    return NextResponse.json({ error: 'Failed to update podcast' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await verifyAdmin(authHeader.split('Bearer ')[1]);

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Episode ID required' }, { status: 400 });
    }

    const ref = adminFirestore.collection('podcasts').doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
    console.error('Podcasts admin delete error:', error);
    return NextResponse.json({ error: 'Failed to delete podcast' }, { status: 500 });
  }
}
