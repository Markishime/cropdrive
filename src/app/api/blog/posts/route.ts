import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const AGS_BASE_URL = 'https://www.agriglobalsolutions.com';
const AGS_UPDATES_URL = `${AGS_BASE_URL}/updates-insights`;

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|article|section|li|h1|h2|h3|h4|h5|h6)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
  ).trim();
}

function buildExcerpt(text: string, maxLength = 220): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function estimateReadTime(text: string): string {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(wordCount / 220))} min read`;
}

function normalizeAgsUrl(href: string, currentUrl = AGS_BASE_URL): string | null {
  try {
    const url = new URL(href, currentUrl);
    if (url.hostname !== new URL(AGS_BASE_URL).hostname) return null;
    url.hash = '';
    url.search = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

function slugFromUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function extractAgsListingLinks(html: string): string[] {
  const hrefRegex = /href=["']([^"']+)["']/gi;
  const links = new Set<string>();
  let match: RegExpExecArray | null = null;

  while ((match = hrefRegex.exec(html)) !== null) {
    const normalized = normalizeAgsUrl(match[1], AGS_UPDATES_URL);
    if (!normalized) continue;

    const pathname = new URL(normalized).pathname.replace(/\/$/, '');
    if (!pathname.startsWith('/updates-insights')) continue;
    if (pathname === '/updates-insights') continue;
    links.add(normalized);
  }

  return Array.from(links).slice(0, 10);
}

function extractMetaValue(html: string, regex: RegExp): string | null {
  const match = html.match(regex);
  return match?.[1] ? decodeHtmlEntities(match[1].trim()) : null;
}

async function fetchAgsHtmlPosts(): Promise<any[]> {
  const listingResponse = await fetch(AGS_UPDATES_URL, {
    headers: {
      'User-Agent': 'CropDrive-BlogSync/1.0 (+https://cropdrive.ai)',
      Accept: 'text/html,application/xhtml+xml',
    },
    next: { revalidate: 3600 },
  });

  if (!listingResponse.ok) {
    throw new Error(`AGS updates page returned HTTP ${listingResponse.status}`);
  }

  const listingHtml = await listingResponse.text();
  const articleUrls = extractAgsListingLinks(listingHtml);

  const posts = await Promise.all(
    articleUrls.map(async (url, index) => {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CropDrive-BlogSync/1.0 (+https://cropdrive.ai)',
          Accept: 'text/html,application/xhtml+xml',
        },
        next: { revalidate: 3600 },
      });

      if (!response.ok) return null;

      const html = await response.text();
      const title = extractMetaValue(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || 'AGS Update';
      const content = stripHtml(html);
      const excerpt = buildExcerpt(content);
      const image =
        extractMetaValue(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
        '/images/blog/ags-empowering.jpg';
      const date =
        extractMetaValue(html, /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i) ||
        new Date().toISOString();

      return {
        id: `ags-${slugFromUrl(url)}`,
        title,
        titleMs: title,
        excerpt,
        excerptMs: excerpt,
        content,
        contentMs: content,
        author: 'AGS',
        authorMs: 'AGS',
        date,
        readTime: estimateReadTime(content),
        readTimeMs: estimateReadTime(content),
        category: 'AGS',
        categoryMs: 'AGS',
        tags: ['AGS', 'Updates'],
        tagsMs: ['AGS', 'Updates'],
        image,
        featured: index < 2,
        published: true,
        sourceUrl: url,
      };
    })
  );

  return posts.filter(Boolean);
}

async function fetchAgsPosts(): Promise<any[]> {
  // AGS runs on Squarespace (not WordPress) — skip the wp-json endpoint entirely
  try {
    const htmlPosts = await fetchAgsHtmlPosts();
    if (htmlPosts.length > 0) return htmlPosts;
  } catch (error) {
    console.warn('AGS HTML scrape failed:', error);
  }

  return [];
}

// GET: Fetch all blog posts
export async function GET(req: NextRequest) {
  try {
    const source = req.nextUrl.searchParams.get('source');

    if (source !== 'firestore') {
      const agsPosts = await fetchAgsPosts();
      if (agsPosts.length > 0) {
        return NextResponse.json({ posts: agsPosts, source: 'ags' });
      }
    }

    const postsRef = adminFirestore.collection('blog_posts');
    const snapshot = await postsRef
      .orderBy('date', 'desc')
      .get();

    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to ISO string
      date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString(),
    }));

    return NextResponse.json({ posts, source: 'firestore' });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST: Add a new blog post (Admin only)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // If authorization header is present, verify admin
      const token = authHeader.split('Bearer ')[1];
      const { verifyAdmin } = await import('@/lib/admin');
      try {
        await verifyAdmin(token);
      } catch {
        return NextResponse.json(
          { error: 'Unauthorized: Admin access required' },
          { status: 403 }
        );
      }
    }
    // If no auth header, allow (for backward compatibility, but should add auth in production)

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

    // Send email notifications to all subscribers
    if (postData.published !== false && process.env.RESEND_API_KEY) {
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
              
              ${post.image ? `<img src="${post.image}" alt="${post.title}" class="post-image" />` : ''}
              
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
