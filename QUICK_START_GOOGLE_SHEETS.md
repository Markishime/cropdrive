# ⚡ Quick Start: Google Sheets Integration

## 🎯 What This Does

Automatically records every payment to a Google Sheet for easy tracking and reporting.

---

## 🚀 5-Minute Setup

### **1. Create Google Cloud Service Account** (2 min)

1. Go to: https://console.cloud.google.com/
2. Create new project: **"CropDrive Payments"**
3. Enable **Google Sheets API**
4. Create **Service Account**: `cropdrive-sheets`
5. Download **JSON key file** ⬇️

### **2. Create & Share Google Sheet** (1 min)

1. Create new Google Sheet: https://sheets.google.com/
2. Rename to: **"CropDrive Payment Records"**
3. Rename tab to: **"Payments"**
4. Click **Share** → Add service account email (from JSON file)
5. Set permission to **Editor**

### **3. Add Credentials to .env.local** (1 min)

Open your `.env.local` and add:

```env
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

Get these values from your JSON key file:
- `client_email` → `GOOGLE_SHEETS_CLIENT_EMAIL`
- `private_key` → `GOOGLE_SHEETS_PRIVATE_KEY`
- Sheet URL → `GOOGLE_SHEETS_SPREADSHEET_ID`

### **4. Initialize Sheet** (30 sec)

```bash
# Restart dev server
npm run dev

# In new terminal:
curl http://localhost:3000/api/stripe/init-sheets
```

### **5. Test It!** (30 sec)

1. Go to: http://localhost:3000/pricing
2. Click "Buy Plan"
3. Use test card: `4242 4242 4242 4242`
4. Complete payment
5. Check your Google Sheet - new row appears! ✨

---

## ✅ What Gets Recorded

Every payment automatically creates a row with:
- Timestamp
- Customer email & name
- Plan details
- Payment amount
- Subscription dates
- Stripe IDs
- Status (active/canceled/past_due)

---

## 📊 View Your Data

Open your Google Sheet anytime to:
- See all payments
- Sort by date, plan, status
- Create charts and reports
- Export to Excel
- Share with team

---

## 🔧 Troubleshooting

**Not working?** Check:
1. Service account has "Editor" access to sheet
2. All 3 env variables in `.env.local`
3. Dev server restarted after adding variables
4. Check server console for error messages

---

## 📚 Need More Help?

- **Detailed Setup:** See `GOOGLE_SHEETS_SETUP.md`
- **Environment Variables:** See `GOOGLE_SHEETS_ENV_TEMPLATE.md`
- **Complete System:** See `COMPLETE_AUTOMATION_SYSTEM.md`

---

**That's it! Your payments are now automatically tracked in Google Sheets!** 🎉

