import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAdmin } from '@/lib/admin';

const INITIAL_EPISODES = [
  {
    title: 'Oil Palm Insights from Our AGS Community',
    titleMs: 'Pandangan Kelapa Sawit dari Komuniti AGS Kami',
    description: 'The first CropDrive podcast, developed from a Facebook post in our AGS community group (Oil Palm Malaysia). Watch to discover how we bring community insights to CropDrive. Original post: https://www.facebook.com/groups/oilpalmmalaysia/permalink/1557871882120829/',
    descriptionMs: 'Podcast CropDrive pertama, dibangunkan dari siaran Facebook dalam kumpulan komuniti AGS kami (Oil Palm Malaysia). Tonton untuk mengetahui bagaimana kami membawa pandangan komuniti ke CropDrive.',
    youtubeUrl: 'https://www.youtube.com/watch?si=My2QuuabYFHZGwhh&v=iniFCAiYw6Q&feature=youtu.be',
    order: 0,
    published: true,
  },
  {
    title: 'CropDrive & AGS: From Facebook to CropDrive.ai',
    titleMs: 'CropDrive & AGS: Dari Facebook ke CropDrive.ai',
    description: 'Episode to help bring Facebook community followers to CropDrive.ai and build steady traffic to the site. More insights on oil palm, AGS consultancy, and CropDrive tools.',
    descriptionMs: 'Episod untuk membantu membawa pengikut komuniti Facebook ke CropDrive.ai dan mewujudkan trafik tetap ke laman web. Lebih banyak pandangan tentang kelapa sawit, perundingan AGS, dan alat CropDrive.',
    youtubeUrl: 'https://www.youtube.com/watch?v=wpZNcJCqHKE&feature=youtu.be',
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
      const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
      await ref.add({
        title: ep.title,
        titleMs: ep.titleMs,
        description: ep.description,
        descriptionMs: ep.descriptionMs,
        youtubeUrl: ep.youtubeUrl,
        videoId: videoId || null,
        thumbnail,
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
