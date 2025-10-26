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

    const formData = await request.formData();
    
    // Extract form fields
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const newsletter = formData.get('newsletter') === 'true';
    const whatsapp = formData.get('whatsapp') as string;
    const plantationSize = formData.get('plantationSize') as string;
    const palmAge = formData.get('palmAge') as string;
    const currentYield = formData.get('currentYield') as string;
    const message = formData.get('message') as string;
    const soilTestFile = formData.get('soilTestFile') as File | null;
    const leafTestFile = formData.get('leafTestFile') as File | null;

    // Prepare file attachments
    const attachments = [];
    
    if (soilTestFile) {
      const soilBuffer = await soilTestFile.arrayBuffer();
      attachments.push({
        filename: soilTestFile.name,
        content: Buffer.from(soilBuffer),
      });
    }
    
    if (leafTestFile) {
      const leafBuffer = await leafTestFile.arrayBuffer();
      attachments.push({
        filename: leafTestFile.name,
        content: Buffer.from(leafBuffer),
      });
    }

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
              <h1 style="margin: 0;">🌴 New Farmer Form Submission</h1>
              <p style="margin: 10px 0 0 0;">CropDrive™ AI Assistant</p>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; color: #16a34a; font-weight: bold; margin-bottom: 20px;">
                📋 Farmer Details
              </p>
              
              <div class="field">
                <div class="label">👤 Name</div>
                <div class="value">${firstName} ${lastName}</div>
              </div>
              
              <div class="field">
                <div class="label">📧 Email</div>
                <div class="value">${email}</div>
              </div>
              
              <div class="field">
                <div class="label">📱 WhatsApp</div>
                <div class="value">${whatsapp}</div>
              </div>
              
              <div class="field">
                <div class="label">📬 Newsletter Subscription</div>
                <div class="value">${newsletter ? '✅ Yes' : '❌ No'}</div>
              </div>
              
              <p style="font-size: 16px; color: #16a34a; font-weight: bold; margin: 30px 0 20px 0;">
                🌾 Plantation Information
              </p>
              
              <div class="field">
                <div class="label">📏 Plantation Size</div>
                <div class="value">${plantationSize} hectares</div>
              </div>
              
              <div class="field">
                <div class="label">🌱 Palm Age</div>
                <div class="value">${palmAge} years</div>
              </div>
              
              <div class="field">
                <div class="label">📊 Current FFB Yield</div>
                <div class="value">${currentYield} tons/ha</div>
              </div>
              
              ${message ? `
              <p style="font-size: 16px; color: #16a34a; font-weight: bold; margin: 30px 0 20px 0;">
                💬 Additional Message
              </p>
              <div class="field">
                <div class="value">${message}</div>
              </div>
              ` : ''}
              
              <p style="font-size: 16px; color: #16a34a; font-weight: bold; margin: 30px 0 20px 0;">
                📎 Attached Files
              </p>
              <div class="field">
                <div class="value">
                  ${soilTestFile ? `✅ Soil Test: ${soilTestFile.name}` : '❌ No soil test file'}<br/>
                  ${leafTestFile ? `✅ Leaf Test: ${leafTestFile.name}` : '❌ No leaf test file'}
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>CropDrive™</strong> - AI-Powered Palm Oil Analytics</p>
              <p>This is an automated notification from your CropDrive system.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'CropDrive Forms <cuizonmarklloyd@gmail.com>',
      to: ['marklloydcuizon@gmail.com'],
      subject: `🌴 New Farmer Submission: ${firstName} ${lastName}`,
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (error) {
      console.error('❌ Email send error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    console.log('✅ Farmer form email sent successfully:', data);
    return NextResponse.json(
      { success: true, message: 'Form submitted successfully', data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error processing farmer form:', error);
    return NextResponse.json(
      { error: 'Failed to process form', details: error.message },
      { status: 500 }
    );
  }
}

