import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key (or fallback for build time)
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_for_build');

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_placeholder_for_build') {
      console.error('❌ Resend API key not configured');
      return NextResponse.json(
        { error: 'Email service not configured. Please add RESEND_API_KEY to environment variables.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    const {
      firstName,
      lastName,
      email,
      organization,
      location,
      phone,
      website,
      message
    } = body;

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
              <h1 style="margin: 0;">🏢 New Organization Inquiry</h1>
              <p style="margin: 10px 0 0 0;">CropDrive™ Partnership Request</p>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; color: #16a34a; font-weight: bold; margin-bottom: 20px;">
                👤 Contact Person
              </p>
              
              <div class="field">
                <div class="label">Name</div>
                <div class="value">${firstName} ${lastName}</div>
              </div>
              
              <div class="field">
                <div class="label">📧 Email</div>
                <div class="value"><a href="mailto:${email}" style="color: #16a34a;">${email}</a></div>
              </div>
              
              ${phone ? `
              <div class="field">
                <div class="label">📱 Phone</div>
                <div class="value">${phone}</div>
              </div>
              ` : ''}
              
              <p style="font-size: 16px; color: #16a34a; font-weight: bold; margin: 30px 0 20px 0;">
                🏢 Organization Details
              </p>
              
              ${organization ? `
              <div class="field">
                <div class="label">Organization Name</div>
                <div class="value">${organization}</div>
              </div>
              ` : ''}
              
              ${location ? `
              <div class="field">
                <div class="label">📍 Location</div>
                <div class="value">${location}</div>
              </div>
              ` : ''}
              
              ${website ? `
              <div class="field">
                <div class="label">🌐 Website</div>
                <div class="value"><a href="${website}" style="color: #16a34a;" target="_blank">${website}</a></div>
              </div>
              ` : ''}
              
              <p style="font-size: 16px; color: #16a34a; font-weight: bold; margin: 30px 0 20px 0;">
                💬 Message
              </p>
              <div class="field">
                <div class="value" style="white-space: pre-wrap;">${message}</div>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>CropDrive™</strong> - AI-Powered Palm Oil Analytics</p>
              <p>This is an automated notification from your CropDrive system.</p>
              <p style="margin-top: 10px; font-size: 12px;">
                <strong>Action Required:</strong> Please respond to this inquiry within 24-48 hours.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'CropDrive Forms <cuizonmarklloyd@gmail.com>',
      to: ['marklloydcuizon@gmail.com'],
      replyTo: email,
      subject: `🏢 Organization Inquiry: ${organization || firstName + ' ' + lastName}`,
      html: emailHtml,
    });

    if (error) {
      console.error('❌ Email send error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    console.log('✅ Organization form email sent successfully:', data);
    return NextResponse.json(
      { success: true, message: 'Form submitted successfully', data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error processing organization form:', error);
    return NextResponse.json(
      { error: 'Failed to process form', details: error.message },
      { status: 500 }
    );
  }
}

