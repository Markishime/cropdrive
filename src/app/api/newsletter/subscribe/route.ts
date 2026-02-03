import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

// SMTP Configuration (same as contact form)
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

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

    // Send congratulations email using SMTP
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cropdrive.ai';
    
    if (smtpUser && smtpPass) {
      try {
        console.log('📧 Sending newsletter welcome email via SMTP...');
        
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6;">
              <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">
                <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);">
                  <div style="background: linear-gradient(135deg, #15803d 0%, #166534 50%, #14532d 100%); color: #ffffff; padding: 40px 32px; text-align: center;">
                    <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.02em;">Congratulations – You're In!</h1>
                    <p style="margin: 12px 0 0; font-size: 15px; opacity: 0.95;">You have successfully subscribed to the CropDrive newsletter.</p>
                  </div>
                  <div style="padding: 36px 32px;">
                    <p style="font-size: 17px; font-weight: 600; color: #111827; margin-bottom: 24px;">Thank you for joining our community. You will now receive:</p>
                    <ul style="margin: 24px 0; padding: 0; list-style: none;">
                      <li style="padding: 10px 0 10px 32px; position: relative; font-size: 15px; color: #4b5563; border-bottom: 1px solid #f3f4f6;">
                        <span style="position: absolute; left: 0; color: #15803d; font-weight: 700; font-size: 16px;">✓</span>
                        Latest updates on CropDrive AI and palm oil advisory technology
                      </li>
                      <li style="padding: 10px 0 10px 32px; position: relative; font-size: 15px; color: #4b5563; border-bottom: 1px solid #f3f4f6;">
                        <span style="position: absolute; left: 0; color: #15803d; font-weight: 700; font-size: 16px;">✓</span>
                        AGS consultancy insights and agricultural best practices
                      </li>
                      <li style="padding: 10px 0 10px 32px; position: relative; font-size: 15px; color: #4b5563; border-bottom: 1px solid #f3f4f6;">
                        <span style="position: absolute; left: 0; color: #15803d; font-weight: 700; font-size: 16px;">✓</span>
                        Industry news, tips, and innovations delivered to your inbox
                      </li>
                      <li style="padding: 10px 0 10px 32px; position: relative; font-size: 15px; color: #4b5563;">
                        <span style="position: absolute; left: 0; color: #15803d; font-weight: 700; font-size: 16px;">✓</span>
                        Early access to new features and resources
                      </li>
                    </ul>
                    <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">We're glad to have you. Stay tuned for high-quality content—no spam, just value.</p>
                    <p style="margin-top: 28px;">
                      <a href="${appUrl}/blog" style="display: inline-block; background: #15803d; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px;">Visit Our Blog</a>
                    </p>
                  </div>
                  <div style="text-align: center; padding: 28px 32px; color: #6b7280; font-size: 13px; border-top: 1px solid #f3f4f6; background: #fafafa;">
                    <p style="margin: 0 0 8px;"><strong>CropDrive OP Advisor™</strong></p>
                    <p style="margin: 0;">If you did not subscribe to this newsletter, you can safely ignore this email.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

        await transporter.sendMail({
          from: `CropDrive Newsletter <${smtpUser}>`,
          to: email,
          subject: 'Congratulations – You\'re In! CropDrive Newsletter',
          html: htmlContent,
        });

        console.log('✅ Newsletter welcome email sent successfully to:', email);
      } catch (emailError) {
        console.error('Failed to send congratulations email:', emailError);
        // Don't fail the subscription if email fails
      }
    } else {
      console.warn('⚠️ SMTP not configured - skipping welcome email');
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
