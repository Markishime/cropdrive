import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Contact Form API Route - Uses Gmail SMTP (nodemailer) for email delivery
 * 
 * NO DOMAIN VERIFICATION REQUIRED!
 * 
 * REQUIRED ENVIRONMENT VARIABLES:
 * - SMTP_HOST: SMTP server (default: 'smtp.gmail.com')
 * - SMTP_PORT: SMTP port (default: 587)
 * - SMTP_USER: Your Gmail address (e.g., 'yourname@gmail.com')
 * - SMTP_PASS: Gmail App Password (NOT your regular password - see setup guide)
 * - CONTACT_TO_EMAIL: Email address to receive contact form submissions
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to your Google Account: https://myaccount.google.com
 * 2. Enable 2-Step Verification
 * 3. Go to App Passwords: https://myaccount.google.com/apppasswords
 * 4. Generate an App Password for "Mail"
 * 5. Use that 16-character password as SMTP_PASS
 * 
 * The email will be sent FROM your Gmail account TO the CONTACT_TO_EMAIL address
 */

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER; // Your Gmail address
const smtpPass = process.env.SMTP_PASS; // Gmail App Password
const contactToEmail = process.env.CONTACT_TO_EMAIL || 'contact@agriglobalsolutions.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, organization, role, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
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

    // Check if SMTP is configured
    if (!smtpUser || !smtpPass) {
      console.error('❌ SMTP credentials not configured');
      console.warn('⚠️ SMTP_USER and SMTP_PASS must be set in environment variables');
      console.log('Name:', name);
      console.log('Email:', email);
      console.log('Organization:', organization || 'N/A');
      console.log('Role:', role || 'N/A');
      console.log('Message:', message);

      return NextResponse.json({
        success: false,
        error: 'Email service not configured. Please contact support directly.',
        message: 'Your message has been logged but could not be sent via email.',
      }, { status: 500 });
    }

    // Create email content
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #166534; margin-top: 0;">Contact Details</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 150px;">Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <a href="mailto:${email}" style="color: #166534;">${email}</a>
              </td>
            </tr>
            ${organization ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Organization:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${organization}</td>
            </tr>
            ` : ''}
            ${role ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Role:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${role}</td>
            </tr>
            ` : ''}
          </table>
          
          <h2 style="color: #166534; margin-top: 30px;">Message</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
        </div>
        
        <div style="background: #166534; padding: 15px; text-align: center;">
          <p style="color: white; margin: 0; font-size: 12px;">
            This message was sent from the CropDrive contact form at ${new Date().toISOString()}
          </p>
        </div>
      </div>
    `;

    const textBody = `
New Contact Form Submission

Name: ${name}
Email: ${email}
${organization ? `Organization: ${organization}\n` : ''}${role ? `Role: ${role}\n` : ''}

Message:
${message}

---
Sent from CropDrive contact form at ${new Date().toISOString()}
    `;

    // Create transporter
    console.log('📧 Configuring SMTP transporter...');
    console.log('📧 SMTP Host:', smtpHost);
    console.log('📧 SMTP Port:', smtpPort);
    console.log('📧 SMTP User:', smtpUser);
    console.log('📧 To Email:', contactToEmail);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Send email
    console.log('📧 Attempting to send contact form email...');
    const info = await transporter.sendMail({
      from: `CropDrive Contact Form <${smtpUser}>`, // From your Gmail
      to: contactToEmail, // To the recipient email
      replyTo: email, // Reply to the form submitter
      subject: `[CropDrive Contact Form] New message from ${name}`,
      html: htmlBody,
      text: textBody,
    });

    console.log('✅ Contact form email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Response:', info.response);

    // Send confirmation email to the user (optional)
    try {
      const confirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Thank You for Reaching Out!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <p style="font-size: 16px; line-height: 1.6;">Dear ${name},</p>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Thank you for contacting CropDrive. We have received your message and will get back to you as soon as possible, typically within 1-2 business days.
            </p>
            
            <p style="font-size: 16px; line-height: 1.6;">
              In the meantime, feel free to explore our website or check out our <a href="https://cropdrive.ai/pricing" style="color: #166534;">pricing plans</a>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 20px;">
              <h3 style="color: #166534; margin-top: 0;">Your Message:</h3>
              <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; color: #6b7280;">${message}</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
              Best regards,<br>
              <strong>The CropDrive Team</strong>
            </p>
          </div>
          
          <div style="background: #166534; padding: 15px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 12px;">
              CropDrive - AI-Powered Agronomy for Malaysian Oil Palm Farmers
            </p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `CropDrive Support <${smtpUser}>`,
        to: email,
        replyTo: contactToEmail,
        subject: 'Thank you for contacting CropDrive',
        html: confirmationHtml,
      });
      console.log('✅ Confirmation email sent to user');
    } catch (confirmationError) {
      console.warn('⚠️ Failed to send confirmation email (non-critical):', confirmationError);
    }

    return NextResponse.json({
      success: true,
      status: 200,
      message: 'Your message has been received. We will get back to you soon!',
      messageId: info.messageId,
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Contact form error:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    
    // Provide more specific error message
    const errorMessage = error?.message || 'An unexpected error occurred';
    const isAuthError = errorMessage.includes('Invalid login') || errorMessage.includes('authentication');
    
    return NextResponse.json(
      { 
        success: false,
        error: isAuthError 
          ? 'Email service authentication failed. Please check SMTP credentials.'
          : `Failed to process your request: ${errorMessage}. Please try again.`,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// GET handler for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Contact form API (SMTP) is active',
    smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
  });
}
