import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAdmin } from '@/lib/admin';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// GET: Fetch all blog posts (admin only)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    await verifyAdmin(token);

    const postsRef = adminFirestore.collection('blog_posts');
    const snapshot = await postsRef
      .orderBy('date', 'desc')
      .get();

    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString(),
    }));

    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST: Create a new blog post (admin only)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    await verifyAdmin(token);

    const postData = await req.json();

    // Validate required fields
    const requiredFields = ['title', 'titleMs', 'excerpt', 'excerptMs', 'content', 'contentMs', 'author', 'authorMs', 'date', 'readTime', 'readTimeMs', 'category', 'categoryMs', 'tags', 'tagsMs', 'image'];
    for (const field of requiredFields) {
      if (!postData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Add post to Firestore
    const postsRef = adminFirestore.collection('blog_posts');
    const newPostRef = await postsRef.add({
      ...postData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      published: postData.published !== undefined ? postData.published : true,
    });

    const newPost = await newPostRef.get();
    const postDataWithId = {
      id: newPost.id,
      ...newPost.data(),
      date: newPost.data()?.date?.toDate?.()?.toISOString() || newPost.data()?.date,
      createdAt: newPost.data()?.createdAt?.toDate?.()?.toISOString(),
    };

    // Send email notifications to all subscribers if published
    if (postData.published !== false && resend) {
      try {
        await sendNewPostNotifications(postDataWithId);
      } catch (emailError) {
        console.error('Failed to send email notifications:', emailError);
        // Don't fail the post creation if email fails
      }
    }

    // Send email notifications to all subscribers if published
    if (postData.published !== false && resend) {
      try {
        await sendNewPostNotifications(postDataWithId);
      } catch (emailError) {
        console.error('Failed to send email notifications:', emailError);
        // Don't fail the post creation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      post: postDataWithId,
      message: 'Blog post created successfully',
    });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}

// Function to send email notifications to all subscribers
async function sendNewPostNotifications(post: any) {
  if (!resend) {
    console.log('Resend API key not configured, skipping email notifications');
    return;
  }

  try {
    // Get all active subscribers
    const subscribersRef = adminFirestore.collection('newsletter_subscribers');
    const subscribersSnapshot = await subscribersRef
      .where('active', '==', true)
      .get();

    if (subscribersSnapshot.empty) {
      console.log('No subscribers to notify');
      return;
    }

    const subscribers = subscribersSnapshot.docs.map(doc => doc.data().email);
    
    // Determine if it's CropDrive or AGS related
    const isCropDrive = post.id?.includes('cropdrive') || post.tags?.some((tag: string) => tag.toLowerCase().includes('cropdrive'));
    const isAGS = post.id?.includes('ags') || post.tags?.some((tag: string) => tag.toLowerCase().includes('ags'));

    // Create email content
    const emailSubject = `New Blog Post: ${post.title}`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .post-image { width: 100%; max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
            .tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 15px 0; }
            .tag { background: #e5e7eb; padding: 5px 12px; border-radius: 15px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🌱 New Blog Post!</h1>
            </div>
            <div class="content">
              <h2 style="color: #16a34a; margin-top: 0;">${post.title}</h2>
              
              ${post.image ? `<img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://cropdrive.ai'}${post.image}" alt="${post.title}" class="post-image" />` : ''}
              
              <p style="font-size: 16px; color: #4b5563;">${post.excerpt}</p>
              
              ${post.tags && post.tags.length > 0 ? `
                <div class="tags">
                  ${post.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
                </div>
              ` : ''}
              
              <p style="color: #6b7280; font-size: 14px;">
                By ${post.author} • ${post.readTime}
              </p>
              
              <p style="margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cropdrive.ai'}/blog" class="button">Read Full Article</a>
              </p>
              
              ${isCropDrive ? '<p style="margin-top: 20px; padding: 15px; background: #d1fae5; border-radius: 8px; color: #065f46;"><strong>📊 CropDrive Update:</strong> Learn about the latest AI technology and features!</p>' : ''}
              ${isAGS ? '<p style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 8px; color: #1e40af;"><strong>🌾 AGS Update:</strong> Discover expert agricultural consultancy insights!</p>' : ''}
            </div>
            <div class="footer">
              <p>CropDrive OP Advisor™ Newsletter</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cropdrive.ai'}/blog" style="color: #16a34a;">View All Posts</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send emails in batches (Resend allows up to 50 recipients per batch)
    const batchSize = 50;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      await resend.emails.send({
        from: 'CropDrive <newsletter@cropdrive.ai>',
        to: batch,
        subject: emailSubject,
        html: emailHtml,
      });
    }

    console.log(`Sent email notifications to ${subscribers.length} subscribers`);
  } catch (error) {
    console.error('Error sending email notifications:', error);
    throw error;
  }
}
