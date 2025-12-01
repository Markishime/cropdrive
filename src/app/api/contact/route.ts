import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Contact form submission handler
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

    // Create email transporter
    // Using environment variables for SMTP configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@cropdrive.ai',
      to: 'contact@agriglobalsolutions.com',
      replyTo: email,
      subject: `[CropDrive Contact Form] New message from ${name}`,
      html: `
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
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
${organization ? `Organization: ${organization}\n` : ''}${role ? `Role: ${role}\n` : ''}

Message:
${message}

---
Sent from CropDrive contact form at ${new Date().toISOString()}
      `,
    };

    // Send confirmation email to the user
    const confirmationMailOptions = {
      from: process.env.SMTP_FROM || 'noreply@cropdrive.ai',
      to: email,
      subject: 'Thank you for contacting CropDrive',
      html: `
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
      `,
    };

    // Try to send emails
    try {
      // Check if SMTP is configured
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail(mailOptions);
        console.log('✅ Contact form email sent to team');
        
        // Send confirmation to user
        await transporter.sendMail(confirmationMailOptions);
        console.log('✅ Confirmation email sent to user');
      } else {
        // If SMTP is not configured, just log the submission
        console.log('📧 Contact form submission (SMTP not configured):');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Organization:', organization || 'N/A');
        console.log('Role:', role || 'N/A');
        console.log('Message:', message);
      }
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError);
      // Still return success - the form data was received
      // You might want to store it in a database as backup
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We will get back to you soon!',
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    );
  }
}

// GET handler for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Contact form API is active',
  });
}

