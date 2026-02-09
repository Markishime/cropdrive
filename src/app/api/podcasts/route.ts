import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { getYouTubeVideoId, extractYouTubeVideoIdFromText } from '@/lib/youtube';

/**
 * GET /api/podcasts
 * Returns published podcast episodes. Public endpoint - no authentication required.
 */
export async function GET(req: NextRequest) {
  try {

    // Fetch all podcasts then filter/sort in memory to avoid requiring a composite index
    const snapshot = await adminFirestore.collection('podcasts').get();

    const episodes = snapshot.docs
      .map((doc) => {
        const d = doc.data();
        let youtubeUrl = (d.youtubeUrl ?? d.youtube_url ?? d.youtubeLink ?? d.youtube_link ?? '').toString().trim();
        let storedVideoId = d.videoId ?? d.video_id ?? null;
        let videoId: string | null =
          storedVideoId && String(storedVideoId).trim().length === 11
            ? String(storedVideoId).trim()
            : null;
        if (!videoId && youtubeUrl) videoId = getYouTubeVideoId(youtubeUrl);
        if (!videoId) {
          const desc = (d.description ?? '').toString();
          const descMs = (d.descriptionMs ?? '').toString();
          videoId = extractYouTubeVideoIdFromText(desc) ?? extractYouTubeVideoIdFromText(descMs) ?? null;
        }
        if (!youtubeUrl && videoId) youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const thumbnail =
          d.thumbnail ?? (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);
        return {
          id: doc.id,
          title: d.title ?? '',
          titleMs: d.titleMs ?? d.title ?? '',
          description: d.description ?? '',
          descriptionMs: d.descriptionMs ?? d.description ?? '',
          youtubeUrl: youtubeUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : ''),
          videoId,
          thumbnail,
          order: d.order ?? 0,
          published: d.published !== false,
          createdAt: d.createdAt?.toDate?.()?.toISOString?.() ?? null,
        };
      })
      .filter((ep) => ep.published)
      .sort((a, b) => {
        // Newest first so "Latest Episode" is the most recently uploaded
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (tB !== tA) return tB - tA;
        return (a.order ?? 0) - (b.order ?? 0);
      });

    return NextResponse.json({ success: true, episodes });
  } catch (error: any) {
    console.error('Podcasts list error:', error);
    return NextResponse.json(
      { error: 'Failed to load podcasts' },
      { status: 500 }
    );
  }
}
