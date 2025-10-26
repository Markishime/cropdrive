import { NextResponse } from 'next/server';
import { initializeGoogleSheet } from '@/lib/googleSheets';

/**
 * API Route to initialize Google Sheets with headers
 * 
 * Call this once to set up your Google Sheet with proper headers and formatting.
 * 
 * Usage: GET http://localhost:3000/api/stripe/init-sheets
 */
export async function GET() {
  try {
    console.log('🔧 Initializing Google Sheets...');

    const success = await initializeGoogleSheet();

    if (success) {
      return NextResponse.json({
        success: true,
        message: '✅ Google Sheets initialized successfully!',
        details: 'Headers have been added and formatted. Your sheet is ready to receive payment data.',
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '⚠️ Google Sheets initialization skipped.',
        details: 'Either credentials are not configured, or headers already exist.',
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error('❌ Error initializing Google Sheets:', error);
    return NextResponse.json({
      success: false,
      message: '❌ Failed to initialize Google Sheets',
      error: error.message,
      details: 'Check your credentials and make sure the service account has access to the spreadsheet.',
    }, { status: 500 });
  }
}

