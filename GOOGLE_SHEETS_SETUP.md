# 📊 Google Sheets Integration Setup Guide

This guide will help you set up automatic payment tracking in Google Sheets alongside your Firebase database.

---

## 🎯 What You'll Get

Every time a user purchases a plan through Stripe, the webhook will automatically record:
- ✅ **Timestamp** - When the payment was made
- ✅ **Email & Name** - Customer details
- ✅ **Plan Information** - Which plan they purchased
- ✅ **Payment Amount** - How much they paid
- ✅ **Billing Cycle** - Monthly or Yearly
- ✅ **Status** - Active, Canceled, Past Due, etc.
- ✅ **Stripe IDs** - Customer & Subscription IDs
- ✅ **Dates** - Start and end dates

All data is also saved to Firebase, so Google Sheets is a **supplementary tracking system** for easy viewing and reporting.

---

## 📋 Step-by-Step Setup

### **Step 1: Create a Google Cloud Project**

1. Go to: https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: **"CropDrive Payments"**
4. Click **"Create"**
5. Wait for project creation (takes ~30 seconds)

---

### **Step 2: Enable Google Sheets API**

1. In your Google Cloud Console, make sure your project is selected
2. Go to: https://console.cloud.google.com/apis/library
3. Search for **"Google Sheets API"**
4. Click on **"Google Sheets API"**
5. Click **"Enable"**
6. Wait for activation (~10 seconds)

---

### **Step 3: Create Service Account**

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click **"Create Service Account"**
3. Fill in details:
   - **Service account name**: `cropdrive-sheets`
   - **Service account ID**: `cropdrive-sheets` (auto-filled)
   - **Description**: `Service account for writing payment records to Google Sheets`
4. Click **"Create and Continue"**
5. For **"Grant this service account access to project"**:
   - Skip this step (not required)
   - Click **"Continue"**
6. For **"Grant users access to this service account"**:
   - Skip this step
   - Click **"Done"**

---

### **Step 4: Create Service Account Key**

1. On the Service Accounts page, find your `cropdrive-sheets` account
2. Click on the **email** (e.g., `cropdrive-sheets@your-project.iam.gserviceaccount.com`)
3. Go to the **"Keys"** tab
4. Click **"Add Key"** → **"Create new key"**
5. Select **"JSON"** format
6. Click **"Create"**
7. A JSON file will download - **KEEP THIS FILE SAFE!** ⚠️

The JSON file looks like this:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "cropdrive-sheets@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

---

### **Step 5: Create Google Sheet**

1. Go to: https://sheets.google.com/
2. Click **"Blank"** to create a new spreadsheet
3. Rename it to: **"CropDrive Payment Records"**
4. Rename the first sheet tab to: **"Payments"**
5. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
   For example, if your URL is:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   ```
   Your Spreadsheet ID is: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

---

### **Step 6: Share Sheet with Service Account**

1. In your Google Sheet, click **"Share"** (top right)
2. In the **"Add people and groups"** field, paste the **client_email** from your JSON file
   - Example: `cropdrive-sheets@your-project.iam.gserviceaccount.com`
3. Change permission to **"Editor"**
4. **UNCHECK** "Notify people" (it's a service account, not a person)
5. Click **"Share"**

✅ Your service account now has permission to write to this sheet!

---

### **Step 7: Add Credentials to .env.local**

1. Open your `.env.local` file in your project
2. Add these three new variables:

```env
# Google Sheets Integration
GOOGLE_SHEETS_CLIENT_EMAIL=cropdrive-sheets@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

**Important Notes:**
- Replace `GOOGLE_SHEETS_CLIENT_EMAIL` with the `client_email` from your JSON file
- Replace `GOOGLE_SHEETS_PRIVATE_KEY` with the `private_key` from your JSON file
  - ⚠️ **Keep the quotes around the private key!**
  - ⚠️ **Keep the `\n` characters in the key!**
- Replace `GOOGLE_SHEETS_SPREADSHEET_ID` with your spreadsheet ID (from Step 5)

---

### **Step 8: Initialize the Google Sheet**

Now we'll set up the headers in your Google Sheet automatically.

1. Open your terminal in the project directory
2. Run the development server:
   ```bash
   npm run dev
   ```
3. In a new terminal, run this command to initialize the sheet:
   ```bash
   curl http://localhost:3000/api/stripe/init-sheets
   ```

This will:
- ✅ Add headers to your Google Sheet
- ✅ Format the headers (green background, bold text)
- ✅ Freeze the header row
- ✅ Set up column widths

You should see:
```
✅ Google Sheets initialized successfully!
```

**Your Google Sheet will now have these columns:**

| Timestamp | Email | Name | Plan ID | Plan Name | Amount | Currency | Billing Cycle | Status | Stripe Customer ID | Stripe Subscription ID | Start Date | End Date |
|-----------|-------|------|---------|-----------|--------|----------|---------------|--------|-------------------|----------------------|------------|----------|

---

## 🧪 Test the Integration

### **Test Payment Recording:**

1. Go to `http://localhost:3000/pricing`
2. Click **"Buy Plan"** for any plan
3. Complete payment with test card: `4242 4242 4242 4242`
4. Wait for webhook to process (~2-3 seconds)
5. **Check your Google Sheet** - a new row should appear! ✨

### **What Gets Recorded:**

```
Timestamp: 2025-10-26T12:34:56.789Z
Email: user@example.com
Name: John's Farm
Plan ID: smart
Plan Name: CropDrive Smart
Amount: 199
Currency: MYR
Billing Cycle: monthly
Status: active
Stripe Customer ID: cus_ABC123
Stripe Subscription ID: sub_XYZ789
Start Date: 2025-10-26T12:34:56.789Z
End Date: 2025-11-26T12:34:56.789Z
```

---

## 🔄 What Gets Tracked Automatically

### **✅ New Subscriptions**
When a user buys a plan:
- New row added to Google Sheets
- All payment details recorded
- Status: `active`

### **✅ Subscription Updates**
When a subscription changes:
- Status column updated
- End date updated if canceled

### **✅ Cancellations**
When a user cancels:
- Status updated to `canceled`
- End date set to cancellation date

### **✅ Payment Failures**
When payment fails:
- Status updated to `past_due`

---

## 📊 View Your Data

### **In Google Sheets:**
- Open your sheet: https://sheets.google.com/
- Click on "CropDrive Payment Records"
- View all payments in the "Payments" tab
- Sort, filter, create charts, export to Excel

### **In Firebase:**
- More detailed data with user information
- Real-time access for the application
- Used by AI Assistant for access control

---

## 🔧 Troubleshooting

### **Issue: "Google Sheets credentials not configured"**
**Cause:** Environment variables not set correctly

**Fix:**
1. Check `.env.local` has all three variables
2. Restart your dev server: `Ctrl+C` then `npm run dev`
3. Verify private key has quotes around it

---

### **Issue: "Permission denied" error**
**Cause:** Service account doesn't have access to the sheet

**Fix:**
1. Go to your Google Sheet
2. Click "Share"
3. Make sure the service account email is listed with "Editor" permission
4. Try the test again

---

### **Issue: "Spreadsheet not found"**
**Cause:** Wrong Spreadsheet ID

**Fix:**
1. Open your Google Sheet in browser
2. Copy the ID from the URL (between `/d/` and `/edit`)
3. Update `GOOGLE_SHEETS_SPREADSHEET_ID` in `.env.local`
4. Restart dev server

---

### **Issue: "Failed to initialize Google Sheets"**
**Cause:** API not enabled or credentials invalid

**Fix:**
1. Verify Google Sheets API is enabled in Google Cloud Console
2. Check that the JSON key file is not expired
3. Regenerate service account key if needed

---

## 🚀 Production Deployment

### **Before deploying to production:**

1. ✅ Create a separate Google Sheet for production data
2. ✅ Add production spreadsheet ID to production environment variables
3. ✅ Keep the same service account (or create a new one for production)
4. ✅ Share the production sheet with the service account
5. ✅ Test with a real payment in Stripe test mode first

### **Environment Variables for Production:**

In your hosting platform (Vercel, Netlify, etc.), add:
```
GOOGLE_SHEETS_CLIENT_EMAIL=cropdrive-sheets@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your-production-spreadsheet-id
```

---

## 🎯 Benefits of This Setup

✅ **Dual Backup System**
- Firebase: Primary database with real-time access
- Google Sheets: Secondary backup for easy viewing

✅ **Easy Reporting**
- View all payments in one place
- Create charts and graphs
- Export to Excel for accounting

✅ **Team Access**
- Share Google Sheet with team members
- No need to give Firebase access

✅ **Historical Records**
- All payments logged permanently
- Easy to audit and review

✅ **No Manual Work**
- Everything automated via webhooks
- Consistent and reliable

---

## ✨ Success!

Your Google Sheets integration is now complete! Every payment will automatically be recorded in both Firebase and Google Sheets.

**Check your sheet after the first test payment to see the magic happen!** 🎉

---

**Need Help?**
- Check server logs for error messages
- Verify webhook is receiving events in Stripe Dashboard
- Test with Stripe test mode before going live

**Last Updated:** October 26, 2025

