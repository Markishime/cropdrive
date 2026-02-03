import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const subscribersRef = adminFirestore.collection('newsletter_subscribers');
    const existingSubscriber = await subscribersRef
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (!existingSubscriber.empty) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'You are already subscribed!',
          alreadySubscribed: true 
        },
        { status: 200 }
      );
    }

    // Add subscriber to Firestore
    await subscribersRef.add({
      email: email.toLowerCase(),
      subscribedAt: FieldValue.serverTimestamp(),
      active: true,
      source: 'blog_page',
    });

    // Send congratulations email (professional format)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cropdrive.ai';
    if (resend) {
      try {
        await resend.emails.send({
          from: 'CropDrive <newsletter@cropdrive.ai>',
          to: email,
          subject: 'Congratulations – You’re In! CropDrive Newsletter',
          html: `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { margin: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; }
                  .wrapper { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
                  .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); }
                  .header { background: linear-gradient(135deg, #15803d 0%, #166534 50%, #14532d 100%); color: #ffffff; padding: 40px 32px; text-align: center; }
                  .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.02em; }
                  .header p { margin: 12px 0 0; font-size: 15px; opacity: 0.95; }
                  .content { padding: 36px 32px; }
                  .content p { margin: 0 0 16px; font-size: 16px; color: #374151; }
                  .content .lead { font-size: 17px; font-weight: 600; color: #111827; margin-bottom: 24px; }
                  .list { margin: 24px 0; padding: 0; list-style: none; }
                  .list li { padding: 10px 0 10px 32px; position: relative; font-size: 15px; color: #4b5563; border-bottom: 1px solid #f3f4f6; }
                  .list li:last-child { border-bottom: none; }
                  .list li::before { content: '✓'; position: absolute; left: 0; color: #15803d; font-weight: 700; font-size: 16px; }
                  .cta { display: inline-block; background: #15803d; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 24px 0 8px; }
                  .footer { text-align: center; padding: 28px 32px; color: #6b7280; font-size: 13px; border-top: 1px solid #f3f4f6; background: #fafafa; }
                  .footer p { margin: 0 0 8px; }
                </style>
              </head>
              <body>
                <div class="wrapper">
                  <div class="card">
                    <div class="header">
                      <h1>Congratulations – You’re In!</h1>
                      <p>You have successfully subscribed to the CropDrive newsletter.</p>
                    </div>
                    <div class="content">
                      <p class="lead">Thank you for joining our community. You will now receive:</p>
                      <ul class="list">
                        <li>Latest updates on CropDrive AI and palm oil advisory technology</li>
                        <li>AGS consultancy insights and agricultural best practices</li>
                        <li>Industry news, tips, and innovations delivered to your inbox</li>
                        <li>Early access to new features and resources</li>
                      </ul>
                      <p>We’re glad to have you. Stay tuned for high-quality content—no spam, just value.</p>
                      <p style="margin-top: 28px;">
                        <a href="${appUrl}/blog" class="cta">Visit Our Blog</a>
                      </p>
                    </div>
                    <div class="footer">
                      <p><strong>CropDrive OP Advisor™</strong></p>
                      <p>If you did not subscribe to this newsletter, you can safely ignore this email.</p>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send congratulations email:', emailError);
        // Don't fail the subscription if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
    });
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
