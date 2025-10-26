# 📝 Google Sheets Environment Variables Template

Copy these lines to your `.env.local` file and replace with your actual values:

```env
# ============================================
# GOOGLE SHEETS INTEGRATION
# ============================================
# Add these credentials to automatically track payments in Google Sheets
# alongside Firebase. This is optional but recommended for easy reporting.

# Service Account Email (from Google Cloud Console)
# Get this from your service account JSON file: "client_email" field
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Service Account Private Key (from Google Cloud Console)
# Get this from your service account JSON file: "private_key" field
# IMPORTANT: Keep the quotes around the key and keep the \n characters!
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyGoesHere\n-----END PRIVATE KEY-----\n"

# Google Spreadsheet ID
# Get this from your Google Sheet URL:
# https://docs.google.com/spreadsheets/d/[THIS_IS_THE_SPREADSHEET_ID]/edit
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

---

## 🔍 How to Find These Values:

### **GOOGLE_SHEETS_CLIENT_EMAIL**
1. Open your service account JSON key file (downloaded from Google Cloud Console)
2. Find the `"client_email"` field
3. Copy the entire email address

Example:
```json
{
  "client_email": "cropdrive-sheets@cropdrive-payments.iam.gserviceaccount.com"
}
```

---

### **GOOGLE_SHEETS_PRIVATE_KEY**
1. Open your service account JSON key file
2. Find the `"private_key"` field
3. Copy the ENTIRE private key including the BEGIN and END lines
4. ⚠️ **IMPORTANT**: Keep it exactly as is, with the `\n` characters!

Example:
```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5...\n-----END PRIVATE KEY-----\n"
}
```

In `.env.local`, it should look like:
```env
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5...\n-----END PRIVATE KEY-----\n"
```

---

### **GOOGLE_SHEETS_SPREADSHEET_ID**
1. Open your Google Sheet in the browser
2. Look at the URL:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   ```
3. Copy the part between `/d/` and `/edit`
4. In this example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

---

## ✅ Complete Example:

Here's what your `.env.local` should look like with all variables:

```env
# Existing variables
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_START_MONTHLY=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_PRICE_START_YEARLY=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_PRICE_SMART_MONTHLY=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_PRICE_SMART_YEARLY=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_PRICE_PRECISION_MONTHLY=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_PRICE_PRECISION_YEARLY=https://buy.stripe.com/...

# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Google Sheets Integration (NEW)
GOOGLE_SHEETS_CLIENT_EMAIL=cropdrive-sheets@cropdrive-payments.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

---

## 🚨 Important Security Notes:

1. ⚠️ **NEVER commit `.env.local` to Git!** 
   - It's already in `.gitignore`
   - Contains sensitive credentials

2. 🔒 **Keep your service account key safe**
   - Don't share the JSON file
   - Don't post it publicly
   - Store it securely

3. 🔐 **Use different credentials for production**
   - Create separate service account for production
   - Use different spreadsheets for dev/prod

---

## 🧪 After Adding These Variables:

1. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Initialize the Google Sheet:**
   ```bash
   curl http://localhost:3000/api/stripe/init-sheets
   ```

3. **Test with a payment:**
   - Go to `/pricing`
   - Buy a plan with test card
   - Check your Google Sheet for the new row!

---

**Need Help?** Check `GOOGLE_SHEETS_SETUP.md` for detailed setup instructions.

