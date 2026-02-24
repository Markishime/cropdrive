import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cropdrive.ai';

// Send from the authenticated SMTP sender (contact@agriglobalsolutions.com)
const FROM_EMAIL = smtpUser || process.env.VERIFICATION_FROM_EMAIL || 'contact@agriglobalsolutions.com';
const FROM_NAME = 'CropDrive';

export async function POST(req: NextRequest) {
  try {
    const { email, displayName } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!smtpUser || !smtpPass) {
      console.error('SMTP not configured - custom verification email required');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      );
    }

    // Generate Firebase email verification link - redirect to login with verified=1 after user clicks
    const verificationLink = await adminAuth.generateEmailVerificationLink(email, {
      url: `${appUrl}/login?verified=1`,
    });

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const greeting = displayName ? `Hi ${displayName},` : 'Hi there,';

    // Website theme: gradient from-green-900 via-green-800 to-emerald-900
    // Tailwind: green-900 #14532d, green-800 #166534, emerald-900 #064e3b
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Verify your CropDrive email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #14532d 0%, #166534 50%, #064e3b 100%); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Verify Your Email</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">CropDrive - AI-Powered Agronomy</p>
    </div>
    
    <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">${greeting}</p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
        Thank you for registering with CropDrive. Please verify your email address by clicking the button below to activate your account.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #14532d 0%, #166534 100%); color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px;">Verify Email Address</a>
      </div>
      
      <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 24px 0 0 0;">
        If the button does not work, copy and paste this link into your browser:
      </p>
      <p style="font-size: 12px; line-height: 1.5; color: #9ca3af; margin: 8px 0 0 0; word-break: break-all;">${verificationLink}</p>
      
      <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 24px 0 0 0;">
        This link expires in 24 hours. If you did not create an account with CropDrive, you can ignore this email.
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 24px 0 0 0;">
        Best regards,<br>
        <strong>The CropDrive Team</strong>
      </p>
    </div>
    
    <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">CropDrive OP Advisor - AI-Powered Agronomy for Malaysian Oil Palm Farmers</p>
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `${greeting}

Thank you for registering with CropDrive. Please verify your email address by clicking the link below to activate your account:

${verificationLink}

This link expires in 24 hours. If you did not create an account with CropDrive, you can ignore this email.

Best regards,
The CropDrive Team

---
CropDrive OP Advisor - AI-Powered Agronomy for Malaysian Oil Palm Farmers`;

    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      replyTo: process.env.VERIFICATION_REPLY_TO || FROM_EMAIL,
      subject: 'Verify your CropDrive email address',
      text: textContent,
      html: htmlContent,
      headers: {
        'X-Mailer': 'CropDrive',
        'X-Priority': '3',
      },
    });

    console.log('Verification email sent to:', email);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error & { response?: string; code?: string };
    console.error('Send verification email error:', err?.message || err);
    if (err?.response) console.error('SMTP response:', err.response);
    if (err?.code) console.error('Error code:', err.code);

    const message =
      err?.message && typeof err.message === 'string'
        ? err.message
        : 'Failed to send verification email';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
