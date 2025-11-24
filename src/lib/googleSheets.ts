import { google } from 'googleapis';

/**
 * Google Sheets Integration for CropDrive Payment Tracking
 * 
 * This service automatically records all Stripe payments and subscriptions
 * to a Google Sheet for easy tracking and reporting.
 */

// Initialize Google Sheets API
const getGoogleSheetsClient = () => {
  try {
    // Check if credentials are configured
    if (!process.env.GOOGLE_SHEETS_PRIVATE_KEY || !process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
      console.warn('⚠️ Google Sheets credentials not configured. Skipping Google Sheets logging.');
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('❌ Failed to initialize Google Sheets client:', error);
    return null;
  }
};

// Google Sheet ID from environment variable
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

export interface PaymentRecord {
  email: string;
  name?: string;
  plan: string;
  planDisplayName: string;
  amount: number;
  currency: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  billingCycle: 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  timestamp: Date;
}

/**
 * Add a payment record to Google Sheets
 */
export async function addPaymentToSheet(record: PaymentRecord): Promise<boolean> {
  try {
    const sheets = getGoogleSheetsClient();
    
    if (!sheets || !SPREADSHEET_ID) {
      console.warn('⚠️ Google Sheets not configured. Skipping...');
      return false;
    }

    // Format the row data
    const row = [
      record.timestamp.toISOString(),
      record.email,
      record.name || 'N/A',
      record.plan,
      record.planDisplayName,
      record.amount,
      record.currency.toUpperCase(),
      record.billingCycle,
      record.status,
      record.stripeCustomerId,
      record.stripeSubscriptionId || 'N/A',
      record.startDate.toISOString(),
      record.endDate?.toISOString() || 'Ongoing',
    ];

    // Append the row to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Payments!A:M', // Sheet name: "Payments", columns A to M
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    console.log('✅ Payment record added to Google Sheets:', record.email);
    return true;
  } catch (error) {
    console.error('❌ Failed to add payment to Google Sheets:', error);
    return false;
  }
}

/**
 * Update a subscription status in Google Sheets
 */
export async function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  newStatus: string,
  endDate?: Date
): Promise<boolean> {
  try {
    const sheets = getGoogleSheetsClient();
    
    if (!sheets || !SPREADSHEET_ID) {
      console.warn('⚠️ Google Sheets not configured. Skipping...');
      return false;
    }

    // Find the row with matching subscription ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Payments!A:M',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.warn('⚠️ No data found in Google Sheets');
      return false;
    }

    // Find the row index (column K has subscription ID)
    const rowIndex = rows.findIndex((row, index) => 
      index > 0 && row[10] === stripeSubscriptionId
    );

    if (rowIndex === -1) {
      console.warn('⚠️ Subscription not found in Google Sheets:', stripeSubscriptionId);
      return false;
    }

    // Update status (column I) and end date (column M)
    const updates = [];
    
    // Update status
    updates.push({
      range: `Payments!I${rowIndex + 1}`,
      values: [[newStatus]],
    });

    // Update end date if provided
    if (endDate) {
      updates.push({
        range: `Payments!M${rowIndex + 1}`,
        values: [[endDate.toISOString()]],
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates,
      },
    });

    console.log('✅ Subscription status updated in Google Sheets:', stripeSubscriptionId);
    return true;
  } catch (error) {
    console.error('❌ Failed to update subscription in Google Sheets:', error);
    return false;
  }
}

/**
 * Initialize Google Sheets with headers (run once)
 */
export async function initializeGoogleSheet(): Promise<boolean> {
  try {
    const sheets = getGoogleSheetsClient();
    
    if (!sheets || !SPREADSHEET_ID) {
      console.warn('⚠️ Google Sheets not configured. Skipping initialization...');
      return false;
    }

    // Check if sheet exists and has headers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Payments!A1:M1',
    });

    if (response.data.values && response.data.values.length > 0) {
      console.log('✅ Google Sheets headers already exist');
      return true;
    }

    // Add headers
    const headers = [
      'Timestamp',
      'Email',
      'Name',
      'Plan ID',
      'Plan Name',
      'Amount',
      'Currency',
      'Billing Cycle',
      'Status',
      'Stripe Customer ID',
      'Stripe Subscription ID',
      'Start Date',
      'End Date',
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Payments!A1:M1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });

    // Format headers (bold, frozen row)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.6, blue: 0.2 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 11,
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          {
            updateSheetProperties: {
              properties: {
                sheetId: 0,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
        ],
      },
    });

    console.log('✅ Google Sheets initialized with headers');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Google Sheets:', error);
    return false;
  }
}

/**
 * Add a cancellation record
 */
export async function addCancellationToSheet(
  stripeSubscriptionId: string,
  reason?: string
): Promise<boolean> {
  try {
    await updateSubscriptionStatus(stripeSubscriptionId, 'canceled', new Date());
    console.log('✅ Cancellation recorded in Google Sheets');
    return true;
  } catch (error) {
    console.error('❌ Failed to record cancellation in Google Sheets:', error);
    return false;
  }
}

