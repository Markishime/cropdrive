import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// This endpoint migrates static blog posts to Firestore
// Call this once to initialize your database with existing posts
export async function POST(req: NextRequest) {
  try {
    // Import static blog posts
    const staticPosts = [
      {
        id: 'cropdrive-introduction',
        title: 'Introducing CropDrive: Revolutionizing Palm Oil Farming with AI-Powered Intelligence',
        titleMs: 'Memperkenalkan CropDrive: Merevolusikan Pertanian Kelapa Sawit dengan Kecerdasan Berkuasa AI',
        excerpt: 'Discover CropDrive, the cutting-edge AI platform transforming palm oil operations through intelligent analysis, predictive insights, and actionable recommendations for sustainable farming.',
        excerptMs: 'Temui CropDrive, platform AI canggih yang mengubah operasi kelapa sawit melalui analisis pintar, pandangan ramalan, dan cadangan yang boleh dilaksanakan untuk pertanian lestari.',
        content: 'CropDrive represents a paradigm shift in agricultural technology, specifically designed for the palm oil industry. Our platform leverages advanced artificial intelligence and machine learning algorithms to analyze crop health, predict potential issues, and provide actionable insights that help farmers maximize yields while maintaining sustainability standards. With CropDrive, farmers can upload images of their crops, receive instant AI-powered analysis, and access comprehensive reports that guide decision-making processes. The platform integrates seamlessly with existing farm management systems, making it accessible to both small-scale farmers and large plantation operations.',
        contentMs: 'CropDrive mewakili perubahan paradigma dalam teknologi pertanian, direka khusus untuk industri kelapa sawit. Platform kami memanfaatkan kecerdasan buatan dan algoritma pembelajaran mesin untuk menganalisis kesihatan tanaman, meramalkan masalah berpotensi, dan memberikan pandangan yang boleh dilaksanakan untuk membantu petani memaksimumkan hasil sambil mengekalkan standard kelestarian. Dengan CropDrive, petani boleh memuat naik imej tanaman mereka, menerima analisis berkuasa AI segera, dan mengakses laporan komprehensif yang membimbing proses membuat keputusan. Platform ini bersepadu dengan sistem pengurusan ladang sedia ada, menjadikannya boleh diakses oleh petani berskala kecil dan operasi ladang besar.',
        author: 'CropDrive Team',
        authorMs: 'Pasukan CropDrive',
        date: '2025-02-01',
        readTime: '10 min read',
        readTimeMs: '10 minit bacaan',
        category: 'Technology',
        categoryMs: 'Teknologi',
        tags: ['CropDrive', 'AI', 'Palm Oil', 'Innovation', 'Technology'],
        tagsMs: ['CropDrive', 'AI', 'Kelapa Sawit', 'Inovasi', 'Teknologi'],
        image: '/images/blog/cropdrive-intro.jpg',
        featured: true,
      },
      // Add more posts here as needed...
    ];

    const postsRef = adminFirestore.collection('blog_posts');
    const results = [];

    for (const post of staticPosts) {
      // Check if post already exists
      const existing = await postsRef
        .where('id', '==', post.id)
        .limit(1)
        .get();

      if (existing.empty) {
        const docRef = await postsRef.add({
          ...post,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          published: true,
        });
        results.push({ id: post.id, action: 'created', docId: docRef.id });
      } else {
        results.push({ id: post.id, action: 'skipped', reason: 'already exists' });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed. ${results.length} posts processed.`,
      results,
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
}
