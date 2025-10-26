# Stripe Webhook Setup Guide

## ⚠️ CRITICAL: Webhook Must Be Configured for Plans to Work

Your application **requires** a Stripe webhook to update user plans after purchase. Without this webhook properly configured, users will see "No Active Plan" even after paying.

---

## 🔗 Your Webhook Endpoint URL

### Local Development (Testing)
```
http://localhost:3001/api/stripe/webhook
```

### Production
```
https://your-domain.com/api/stripe/webhook
```

Replace `your-domain.com` with your actual domain (e.g., `cropdrive.com`)

---

## 📋 Setup Instructions

### Option 1: Testing Locally (Development)

#### Step 1: Install Stripe CLI
```bash
# Download from: https://stripe.com/docs/stripe-cli
# Or install via package manager:

# macOS (Homebrew)
brew install stripe/stripe-cli/stripe

# Windows (Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
# Download from GitHub releases
```

#### Step 2: Login to Stripe CLI
```bash
stripe login
```
This will open your browser to authenticate.

#### Step 3: Forward Webhooks to Local Server
```bash
# Make sure your Next.js dev server is running on port 3001
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

#### Step 4: Copy the Webhook Secret
The CLI will output something like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

#### Step 5: Add to .env.local
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

#### Step 6: Restart Your Dev Server
```bash
npm run dev
```

Now test a purchase and watch the webhook events in the CLI output!

---

### Option 2: Production Setup

#### Step 1: Deploy Your Application
Make sure your application is deployed and accessible at your domain.

#### Step 2: Go to Stripe Dashboard
1. Visit [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**

#### Step 3: Configure the Endpoint
**Endpoint URL:**
```
https://your-domain.com/api/stripe/webhook
```

**Description:**
```
CropDrive - Plan Activation Webhook
```

**Events to listen to:**
Select these events:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

**API Version:**
Select your current Stripe API version (e.g., `2023-10-16`)

#### Step 4: Copy the Signing Secret
After creating the endpoint, click on it and copy the **"Signing secret"**:
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Step 5: Add to Production Environment Variables
Add this to your hosting platform (Vercel, Netlify, etc.):
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Step 6: Redeploy Your Application
Redeploy to pick up the new environment variable.

---

## ✅ Verify Webhook is Working

### 1. Check Stripe Dashboard
Go to: [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)

Your endpoint should show:
- ✅ Green checkmark
- ✅ "Enabled" status
- ✅ Recent successful events

### 2. Test a Purchase
1. Buy a plan using test card: `4242 4242 4242 4242`
2. Complete the payment
3. Check the webhook events in Stripe Dashboard
4. Look for `checkout.session.completed` event
5. It should show **"Succeeded"** status

### 3. Check Your Application Logs

**Local Development (Terminal):**
You should see:
```
🔔 Webhook: checkout.session.completed received
Session ID: cs_test_xxxxx
Session metadata: { userId: 'abc123', planId: 'smart', isYearly: 'false' }
✅ Processing checkout for user: abc123 plan: smart yearly: false
📝 Updating user document in Firestore...
✅✅✅ USER PLAN UPDATED SUCCESSFULLY ✅✅✅
```

**Production (Check your hosting logs):**
Same logs should appear in your hosting platform's logs (Vercel logs, etc.)

### 4. Check Dashboard
After purchase:
1. User is redirected to `/success`
2. After 5 seconds, redirected to `/dashboard`
3. Dashboard should **immediately** show the purchased plan
4. No "Updating your plan..." notification
5. Plan details display correctly

---

## 🔧 Troubleshooting

### Problem: "No Active Plan" After Purchase

**Possible Causes:**

1. **Webhook Not Configured**
   - ❌ Webhook endpoint not added to Stripe
   - ✅ Add the endpoint in Stripe Dashboard

2. **Wrong Webhook URL**
   - ❌ Using `http://localhost:3000` instead of `3001`
   - ❌ Wrong domain in production
   - ✅ Verify the exact URL

3. **Wrong Webhook Secret**
   - ❌ `STRIPE_WEBHOOK_SECRET` not set
   - ❌ Using the wrong secret
   - ✅ Copy the correct secret from Stripe Dashboard

4. **Webhook Events Not Selected**
   - ❌ `checkout.session.completed` not enabled
   - ✅ Enable all 6 required events

5. **Webhook Signature Verification Failing**
   - ❌ Webhook secret mismatch
   - ✅ Check your environment variables

### Check Webhook Status

**In Stripe Dashboard:**
```
Webhooks → [Your Endpoint] → Recent Events
```

Look for:
- ✅ **200 Success** responses
- ❌ **400/500 Error** responses (click to see details)

**Common Error Messages:**

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Wrong webhook secret | Update `STRIPE_WEBHOOK_SECRET` |
| 404 Not Found | Wrong URL | Fix endpoint URL |
| 500 Internal Error | Code error | Check application logs |
| No webhooks firing | Not configured | Add endpoint in Stripe |

---

## 🔍 Testing the Webhook

### Manual Test via Stripe CLI
```bash
# Trigger a test checkout.session.completed event
stripe trigger checkout.session.completed
```

### Manual Test via Stripe Dashboard
1. Go to: [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your endpoint
3. Click **"Send test webhook"**
4. Select `checkout.session.completed`
5. Click **"Send test webhook"**
6. Check the response

---

## 📊 Expected Flow After Purchase

```
1. User clicks "Buy Plan"
   ↓
2. Stripe Checkout opens (in same window)
   ↓
3. User enters test card: 4242 4242 4242 4242
   ↓
4. Payment completes
   ↓
5. ⚡ Stripe IMMEDIATELY sends webhook
   ↓
6. Your webhook endpoint receives event
   ↓
7. Webhook updates Firestore:
   - user.plan = "smart"
   - user.uploadsLimit = 50
   - user.stripeCustomerId = "cus_xxx"
   ↓
8. User redirects to /success page (shows 5-second countdown)
   ↓
9. Auto-redirect to /dashboard?refresh=true
   ↓
10. Dashboard silently refreshes user data
    ↓
11. ✅ Plan displays immediately (no "Updating..." notification)
```

**Timeline:**
- Webhook processing: **~1-2 seconds**
- Success page countdown: **5 seconds**
- User sees plan on dashboard: **~6-7 seconds total**

---

## 🚨 Important Notes

1. **Webhook Must Process BEFORE User Redirects**
   - Stripe webhooks are typically very fast (~1-2 seconds)
   - The 5-second success page delay ensures webhook completes
   - Dashboard silently polls to catch any delayed webhooks

2. **No Manual Refresh Needed**
   - Dashboard automatically refreshes user data
   - Silent polling continues for 45 seconds
   - No visible "Updating..." notification

3. **Metadata is Critical**
   - Webhook needs `userId`, `planId`, and `isYearly` in metadata
   - These are automatically added by the checkout API
   - Don't use direct Payment Links - use Checkout Sessions

4. **Security**
   - Always verify webhook signatures
   - Never disable signature verification
   - Keep your webhook secret secure

---

## 📝 Environment Variables Checklist

Make sure you have all these in your `.env.local` (development) and production environment:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxx                    # Required
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # Required

# Webhook Secret (CRITICAL!)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx                  # Required for plan activation

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001          # Development
NEXT_PUBLIC_APP_URL=https://your-domain.com        # Production

# Optional: Stripe Price IDs (if not using inline pricing)
NEXT_PUBLIC_STRIPE_PRICE_START_MONTHLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_START_YEARLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_SMART_MONTHLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_SMART_YEARLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRECISION_MONTHLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRECISION_YEARLY=price_xxxxx
```

---

## ✅ Final Checklist

Before deploying to production:

- [ ] Webhook endpoint added in Stripe Dashboard
- [ ] All 6 events selected (checkout.session.completed, etc.)
- [ ] Webhook signing secret copied
- [ ] `STRIPE_WEBHOOK_SECRET` added to environment variables
- [ ] Application redeployed with new env var
- [ ] Test purchase completed successfully
- [ ] Plan displays on dashboard immediately
- [ ] Webhook shows "200 Success" in Stripe Dashboard
- [ ] No errors in application logs

---

## 📞 Need Help?

If you're still having issues:

1. **Check Stripe Logs:**
   - Dashboard → Webhooks → [Your Endpoint] → Events
   
2. **Check Application Logs:**
   - Look for webhook console.log messages
   
3. **Test with Stripe CLI:**
   - Run `stripe listen --forward-to localhost:3001/api/stripe/webhook`
   - Watch the events in real-time

4. **Common Issues:**
   - Port mismatch (3000 vs 3001)
   - Wrong domain in production
   - Missing webhook secret
   - Events not enabled

---

**Last Updated:** October 26, 2025  
**Webhook File Location:** `src/app/api/stripe/webhook/route.ts`

