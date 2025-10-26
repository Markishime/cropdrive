# 🏗️ CropDrive Membership Automation Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🌐 Landing Page          💳 Pricing Page         🤖 AI Assistant       │
│  (Marketing)              (Plan Selection)         (Protected)          │
│                                   │                     ▲               │
│                                   │                     │               │
│                                   ▼                     │               │
│                           [Buy Plan Button]             │               │
│                                   │                     │               │
└───────────────────────────────────┼─────────────────────┼───────────────┘
                                    │                     │
                                    ▼                     │
┌─────────────────────────────────────────────────────────────────────────┐
│                         STRIPE CHECKOUT                                  │
│                     (Opens in New Tab)                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  💳 Payment Form                                                         │
│  └─ Test Card: 4242 4242 4242 4242                                      │
│                                                                          │
│  [Complete Payment] ─────────────────────► ✅ Payment Success           │
│                                                    │                     │
└────────────────────────────────────────────────────┼─────────────────────┘
                                                     │
                                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         STRIPE WEBHOOK                                   │
│              POST /api/stripe/webhook                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  📡 Receives: checkout.session.completed                                │
│  🔍 Extracts: user_id, plan_id, amount, dates                          │
│  ✅ Verifies: webhook signature                                         │
│                                                                          │
│              ┌──────────────┴────────────────┐                          │
│              ▼                                ▼                          │
│  ┌───────────────────────┐      ┌──────────────────────┐               │
│  │   WRITE TO FIREBASE   │      │ WRITE TO GOOGLE SHEETS│               │
│  └───────────────────────┘      └──────────────────────┘               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                    │                              │
                    ▼                              ▼
┌──────────────────────────────┐    ┌──────────────────────────────────┐
│     FIREBASE FIRESTORE       │    │      GOOGLE SHEETS               │
│     (Primary Database)       │    │   (Backup & Reporting)           │
├──────────────────────────────┤    ├──────────────────────────────────┤
│                              │    │                                  │
│  📁 users/{userId}           │    │  📊 Payments Sheet               │
│  ├─ plan: "smart"            │    │  ┌─────────────────────────┐    │
│  ├─ uploadsLimit: 50         │    │  │ Row 1: Headers (green)  │    │
│  ├─ uploadsUsed: 0           │    │  ├─────────────────────────┤    │
│  └─ stripeCustomerId         │    │  │ Row 2: Payment Record   │    │
│                              │    │  │ - Timestamp             │    │
│  📁 subscriptions/{subId}    │    │  │ - Email                 │    │
│  ├─ status: "active"         │    │  │ - Plan: CropDrive Smart │    │
│  ├─ planId: "smart"          │    │  │ - Amount: 199 MYR       │    │
│  ├─ currentPeriodStart       │    │  │ - Status: active        │    │
│  └─ currentPeriodEnd         │    │  │ - Dates...              │    │
│                              │    │  └─────────────────────────┘    │
│  🔄 Real-time Updates        │    │  📈 Easy Viewing & Reports      │
│  ⚡ Powers AI Assistant      │    │  📤 Export to Excel             │
│                              │    │  👥 Team Sharing                │
└──────────────────────────────┘    └──────────────────────────────────┘
            ▲                                       ▲
            │                                       │
            │ Reads Data                            │ Manual View
            │                                       │
┌───────────┴──────────────────────────────────────┴─────────────────────┐
│                         APPLICATION LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🔐 useAuth() Hook                                                       │
│  └─ Fetches user.plan from Firebase                                     │
│                                                                          │
│  🤖 AI Assistant Access Control                                          │
│  ├─ if (user.plan === 'smart') → ✅ Grant Access                       │
│  ├─ Check uploadsUsed < uploadsLimit                                    │
│  └─ Enable plan features                                                │
│                                                                          │
│  📊 Dashboard Display                                                    │
│  ├─ Shows current plan with features                                    │
│  ├─ Display upload usage                                                │
│  └─ Plan details and metrics                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            USER SEES                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ✅ Success Page (5-second countdown)                                   │
│  ✅ Dashboard with purchased plan details                               │
│  ✅ AI Assistant unlocked with features                                 │
│  ✅ Upload limits displayed                                             │
│  ✅ Full access granted automatically                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Components

### **1. Frontend (Next.js)**
- `/pricing` - Plan selection & purchase
- `/assistant` - AI Assistant (protected)
- `/dashboard` - User dashboard
- `/success` - Post-payment confirmation

### **2. Backend API Routes**
- `/api/stripe/create-checkout` - Creates Stripe sessions
- `/api/stripe/webhook` - Processes payment events
- `/api/stripe/init-sheets` - Initializes Google Sheets

### **3. Database Layer**
- **Firebase Firestore** - Primary real-time database
- **Google Sheets** - Secondary backup & reporting

### **4. External Services**
- **Stripe** - Payment processing
- **Google Sheets API** - Spreadsheet integration

---

## Data Flow Details

### **When Payment Completes:**

1. **Stripe** sends webhook → `/api/stripe/webhook`
2. **Webhook** extracts:
   - User ID (from `client_reference_id`)
   - Plan ID (from price mapping)
   - Amount, dates, customer info
3. **Webhook writes to Firebase:**
   - Updates user document with plan
   - Creates subscription document
4. **Webhook writes to Google Sheets:**
   - Adds new row with payment details
5. **User dashboard** auto-refreshes
6. **AI Assistant** checks `user.plan` → grants access

### **Access Verification:**

```typescript
// AI Assistant checks membership
const { user } = useAuth();

if (user.plan === 'smart') {
  ✅ Grant access
  ✅ Allow 50 uploads/month
  ✅ Enable Smart features
}

if (user.plan === 'precision') {
  ✅ Grant premium access
  ✅ Unlimited uploads
  ✅ Enable all features
}

if (!user.plan || user.plan === 'none') {
  ❌ Redirect to /pricing
}
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Authentication | Firebase Auth |
| Database | Firebase Firestore |
| Payments | Stripe Checkout & Webhooks |
| Spreadsheet | Google Sheets API (googleapis) |
| Hosting | Ready for Vercel/Netlify |

---

## Security Features

✅ **Webhook Verification** - Stripe signature validation
✅ **Environment Variables** - All secrets in `.env.local`
✅ **Service Account** - Minimal permissions (Sheets only)
✅ **Server-Side Only** - No client access to credentials
✅ **Firebase Rules** - Secure database access
✅ **HTTPS Required** - Production webhook endpoint

---

## Scalability

✅ **Real-Time** - Firebase handles instant updates
✅ **Async Processing** - Webhook handles high volume
✅ **Error Handling** - Google Sheets failure doesn't break flow
✅ **Logging** - Comprehensive error tracking
✅ **Monitoring** - Check Stripe Dashboard for events

---

## Monitoring & Debugging

### **Check System Health:**

1. **Stripe Dashboard** → Webhooks → View events
   - Verify webhook receives events
   - Check response status (200 = success)

2. **Server Console** → Logs
   - `✅ Subscription created successfully`
   - `✅ Payment recorded in Google Sheets`

3. **Firebase Console** → Firestore
   - Check users collection
   - Verify plan updates

4. **Google Sheets**
   - Open spreadsheet
   - Verify new rows appear

---

## Error Handling

### **Graceful Degradation:**

- ✅ If Google Sheets fails → Firebase still updates
- ✅ If Firebase query fails → Uses token email
- ✅ If webhook signature invalid → Rejects request
- ✅ All errors logged to console

### **Non-Critical Failures:**

Google Sheets is supplementary - if it fails:
- ⚠️ Warning logged: "Failed to add to Google Sheets (non-critical)"
- ✅ Firebase update continues
- ✅ User gets access
- ✅ System keeps working

---

## Production Deployment

### **Before Going Live:**

1. Switch Stripe to live mode
2. Update webhook URL to production domain
3. Create production Google Sheet
4. Update all environment variables
5. Test with small real payment
6. Monitor logs for 24 hours

### **Production URLs:**
```
Webhook: https://cropdrive.com/api/stripe/webhook
Success: https://cropdrive.com/success?session_id={CHECKOUT_SESSION_ID}
```

---

**This architecture is production-ready and fully automated!** 🚀

