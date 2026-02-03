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

    // Send welcome email
    if (resend) {
      try {
        await resend.emails.send({
          from: 'CropDrive <newsletter@cropdrive.ai>',
          to: email,
          subject: 'Welcome to CropDrive Newsletter! 🌱',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                  .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                  .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0;">🌱 Welcome to CropDrive Newsletter!</h1>
                  </div>
                  <div class="content">
                    <p>Thank you for subscribing to the CropDrive newsletter!</p>
                    <p>You'll now receive:</p>
                    <ul>
                      <li>📊 Latest updates on CropDrive AI technology</li>
                      <li>🌾 AGS consultancy services and insights</li>
                      <li>🚀 Agricultural technology innovations</li>
                      <li>🌴 Palm oil industry news and trends</li>
                    </ul>
                    <p>Stay tuned for our latest blog posts and updates delivered straight to your inbox!</p>
                    <p style="margin-top: 30px;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cropdrive.ai'}/blog" class="button">Visit Our Blog</a>
                    </p>
                  </div>
                  <div class="footer">
                    <p>CropDrive OP Advisor™</p>
                    <p>If you didn't subscribe, please ignore this email.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
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
