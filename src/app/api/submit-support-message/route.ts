import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { SupportMessage } from '@/types';

/**
 * Support Message API Route - Uses Gmail SMTP (nodemailer) for email delivery
 * 
 * NO DOMAIN VERIFICATION REQUIRED!
 * 
 * REQUIRED ENVIRONMENT VARIABLES:
 * - SMTP_HOST: SMTP server (default: 'smtp.gmail.com')
 * - SMTP_PORT: SMTP port (default: 587)
 * - SMTP_USER: Your Gmail address (e.g., 'yourname@gmail.com')
 * - SMTP_PASS: Gmail App Password (NOT your regular password)
 * - SUPPORT_TO_EMAIL: Email address to receive support messages (defaults to contact@agriglobalsolutions.com)
 */

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER; // Your Gmail address
const smtpPass = process.env.SMTP_PASS; // Gmail App Password
const supportToEmail = process.env.SUPPORT_TO_EMAIL || process.env.CONTACT_TO_EMAIL || 'contact@agriglobalsolutions.com';

// Plan-based monthly limits
const PLAN_LIMITS = {
  start: 3,
  smart: 5,
  precision: -1, // unlimited
} as const;

// Get the first day of current month
function getFirstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Get the first day of next month
function getFirstDayOfNextMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

// Count messages sent by user this month using Admin SDK
async function getMonthlyMessageCount(userId: string): Promise<number> {
  try {
    const { adminDb } = await import('@/lib/firebase-admin');
    const monthStart = getFirstDayOfMonth();
    const monthEnd = getFirstDayOfNextMonth();

    const snapshot = await adminDb
      .collection('supportMessages')
      .where('userId', '==', userId)
      .where('createdAt', '>=', monthStart)
      .where('createdAt', '<', monthEnd)
      .get();

    return snapshot.size;
  } catch (error) {
    console.error('Error counting messages:', error);
    return 0;
  }
}

// Get plan limit for user using Admin SDK
async function getUserPlanLimit(userId: string): Promise<number> {
  try {
    const { adminDb } = await import('@/lib/firebase-admin');
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return PLAN_LIMITS.start; // default to start plan
    }

    const userData = userDoc.data();
    const plan = userData?.plan || 'start';
    return PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.start;
  } catch (error) {
    console.error('Error getting user plan:', error);
    return PLAN_LIMITS.start;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if SMTP is configured
    if (!smtpUser || !smtpPass) {
      console.error('❌ SMTP credentials not configured');
      console.warn('⚠️ SMTP_USER and SMTP_PASS must be set in environment variables');
      return NextResponse.json(
        { error: 'Email service not configured. Please add SMTP_USER and SMTP_PASS to environment variables.' },
        { status: 503 }
      );
    }

    // Get user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return NextResponse.json({ error: 'Unauthorized - Please login again' }, { status: 401 });
    }

    // Check if we're in development/test mode
    let userId: string;
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';

    if (isDevelopment) {
      // In development, extract user ID from token without verification
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = decoded.user_id || decoded.uid || 'demo-user';
        console.log('Development mode: Extracted userId:', userId);
      } catch (error) {
        console.error('Error decoding token in dev mode:', error);
        return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
      }
    } else {
      // In production, verify Firebase token
      try {
        const { adminAuth } = await import('@/lib/firebase-admin');
        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await adminAuth.verifyIdToken(token);
        userId = decodedToken.uid;
        console.log('Production mode: Verified userId:', userId);
      } catch (error) {
        console.error('Error verifying token in production:', error);
        return NextResponse.json({ error: 'Token verification failed' }, { status: 401 });
      }
    }

    // Get user data using Admin SDK
    const { adminDb } = await import('@/lib/firebase-admin');
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const userPlan = userData?.plan || 'start';

    // Check monthly limit
    const monthlyCount = await getMonthlyMessageCount(userId);
    const planLimit = await getUserPlanLimit(userId);

    // Check if user has exceeded their limit
    if (planLimit !== -1 && monthlyCount >= planLimit) {
      return NextResponse.json(
        {
          error: 'Monthly limit exceeded',
          limit: planLimit,
          used: monthlyCount,
          plan: userPlan,
          canUpgrade: userPlan !== 'precision'
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { subject, message } = body;

    // Validate required fields
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    // Create support message object
    const supportMessage: Omit<SupportMessage, 'id'> = {
      userId,
      userEmail: userData?.email || '',
      userName: userData?.displayName || userData?.email || 'Unknown',
      userPlan,
      subject: subject?.trim() || undefined,
      message: message.trim(),
      status: 'sent',
      createdAt: new Date(),
    };

    // Save to Firestore using Admin SDK
    const docRef = await adminDb.collection('supportMessages').add({
      ...supportMessage,
      createdAt: new Date(),
    });

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #16a34a; }
            .label { font-weight: bold; color: #16a34a; margin-bottom: 5px; }
            .value { color: #4b5563; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
            .badge { display: inline-block; background: #fbbf24; color: #15803d; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🆘 New Support Message</h1>
              <p style="margin: 10px 0 0 0;">CropDrive™ Support System</p>
            </div>

            <div class="content">
              <p style="font-size: 16px; color: #16a34a; font-weight: bold; margin-bottom: 20px;">
                👤 User Details
              </p>

              <div class="field">
                <div class="label">👤 Name</div>
                <div class="value">${supportMessage.userName}</div>
              </div>

              <div class="field">
                <div class="label">📧 Email</div>
                <div class="value">${supportMessage.userEmail}</div>
              </div>

              <div class="field">
                <div class="label">📱 Plan</div>
                <div class="value">${userPlan.toUpperCase()} <span class="badge">${userPlan}</span></div>
              </div>

              ${subject ? `
              <div class="field">
                <div class="label">📝 Subject</div>
                <div class="value">${subject}</div>
              </div>
              ` : ''}

              <p style="font-size: 16px; color: #16a34a; font-weight: bold; margin: 30px 0 20px 0;">
                💬 Message
              </p>
              <div class="field">
                <div class="value" style="white-space: pre-wrap;">${message}</div>
              </div>

              <p style="font-size: 16px; color: #16a34a; font-weight: bold; margin: 30px 0 20px 0;">
                📊 Usage Info
              </p>
              <div class="field">
                <div class="value">
                  Messages this month: ${monthlyCount + 1}/${planLimit === -1 ? '∞' : planLimit}<br/>
                  Plan: ${userPlan}<br/>
                  Message ID: ${docRef.id}
                </div>
              </div>
            </div>

            <div class="footer">
              <p><strong>CropDrive™</strong> - AI-Powered Oil Palm Analytics</p>
              <p>This is an automated notification from your CropDrive support system.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create SMTP transporter
    console.log('📧 Configuring SMTP transporter...');
    console.log('📧 SMTP Host:', smtpHost);
    console.log('📧 SMTP Port:', smtpPort);
    console.log('📧 SMTP User:', smtpUser);
    console.log('📧 To Email:', supportToEmail);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Send email notification
    console.log('📧 Attempting to send support email...');
    
    try {
      const info = await transporter.sendMail({
        from: `CropDrive Support <${smtpUser}>`, // From your Gmail
        to: supportToEmail, // To the recipient email
        replyTo: supportMessage.userEmail, // Allow direct reply to farmer
        subject: `🆘 Support: ${subject || 'New Message'} - ${supportMessage.userName} (${userPlan})`,
        html: emailHtml,
      });

      console.log('✅ Support email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
      console.log('📧 Response:', info.response);
    } catch (emailError: any) {
      console.error('❌ Support email send error:', emailError);
      console.error('❌ Error details:', JSON.stringify(emailError, null, 2));
      
      // Don't fail the request if email fails, but log it
      console.warn('⚠️ Support message saved to Firestore but email failed to send');
    }

    console.log('✅ Support message submitted successfully:', docRef.id);
    return NextResponse.json(
      {
        success: true,
        message: 'Support message sent successfully',
        messageId: docRef.id,
        monthlyCount: monthlyCount + 1,
        limit: planLimit
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error processing support message:', error);
    return NextResponse.json(
      { error: 'Failed to process support message', details: error.message },
      { status: 500 }
    );
  }
}
