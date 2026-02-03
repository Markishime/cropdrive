import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAdmin } from '@/lib/admin';

const INITIAL_EPISODES = [
  {
    title: 'Oil Palm Insights from Our AGS Community',
    titleMs: 'Pandangan Kelapa Sawit dari Komuniti AGS Kami',
    description: 'First podcast episode developed from a Facebook post in our AGS community group. Join the conversation on oil palm farming and CropDrive.',
    descriptionMs: 'Episod podcast pertama yang dibangunkan dari siaran Facebook dalam kumpulan komuniti AGS kami. Sertai perbincangan tentang pertanian kelapa sawit dan CropDrive.',
    youtubeUrl: 'https://youtu.be/iniFCAiYw6Q',
    order: 0,
    published: true,
  },
  {
    title: 'CropDrive & AGS: Driving Traffic from Community to CropDrive',
    titleMs: 'CropDrive & AGS: Memandu Trafik dari Komuniti ke CropDrive',
    description: 'Another episode to help divert traffic from Facebook to CropDrive. Insights on community engagement and agricultural technology.',
    descriptionMs: 'Episod lain untuk membantu mengalihkan trafik dari Facebook ke CropDrive. Pandangan tentang penglibatan komuniti dan teknologi pertanian.',
    youtubeUrl: 'https://youtu.be/wpZNcJCqHKE',
    order: 1,
    published: true,
  },
];

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await verifyAdmin(authHeader.split('Bearer ')[1]);

    const snapshot = await adminFirestore.collection('podcasts').limit(1).get();
    if (!snapshot.empty) {
      return NextResponse.json(
        { success: true, message: 'Podcasts already exist; seed skipped.', count: 0 },
        { status: 200 }
      );
    }

    const { getYouTubeVideoId } = await import('@/lib/youtube');
    const ref = adminFirestore.collection('podcasts');

    for (let i = 0; i < INITIAL_EPISODES.length; i++) {
      const ep = INITIAL_EPISODES[i];
      const videoId = getYouTubeVideoId(ep.youtubeUrl);
      await ref.add({
        title: ep.title,
        titleMs: ep.titleMs,
        description: ep.description,
        descriptionMs: ep.descriptionMs,
        youtubeUrl: ep.youtubeUrl,
        videoId: videoId || null,
        thumbnail: null,
        order: ep.order,
        published: ep.published,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${INITIAL_EPISODES.length} podcast episodes.`,
      count: INITIAL_EPISODES.length,
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
    console.error('Podcasts seed error:', error);
    return NextResponse.json({ error: 'Failed to seed podcasts' }, { status: 500 });
  }
}
