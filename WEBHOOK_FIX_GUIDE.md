# 🔧 Fix Webhook Signature Verification Error

## Current Problem
Your webhooks are failing with:
```
Webhook signature verification failed: StripeSignatureVerificationError
```

This means the `STRIPE_WEBHOOK_SECRET` in your `.env.local` doesn't match what Stripe CLI is using.

---

## ✅ Solution: Follow These Steps EXACTLY

### Step 1: Open a NEW Terminal Window
Don't close your dev server. Open a **second terminal window**.

### Step 2: Navigate to Your Project
```bash
cd C:\Users\markc\cropdrive
```

### Step 3: Run Stripe CLI Listen Command
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

### Step 4: Look for This Output
The terminal will show something like:
```
> Ready! Your webhook signing secret is whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

### Step 5: Copy the ENTIRE Secret
Copy the ENTIRE value starting with `whsec_`

For example: `whsec_1234567890abcdefghijklmnopqrstuvwxyz`

### Step 6: Open Your `.env.local` File
Find the line that says:
```
STRIPE_WEBHOOK_SECRET=
```

Or add it if it doesn't exist.

### Step 7: Paste the Secret
Replace the entire line with:
```
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
```
(Use YOUR actual secret, not this example!)

### Step 8: Save the File
Make sure to **save** the `.env.local` file!

### Step 9: Restart Your Dev Server
Go back to the terminal running `npm run dev` and:
1. Press `Ctrl+C` to stop it
2. Run `npm run dev` again

### Step 10: Keep Both Terminals Open
You need BOTH terminals running:
- **Terminal 1**: `npm run dev` (your dev server)
- **Terminal 2**: `stripe listen --forward-to localhost:3001/api/stripe/webhook` (webhook forwarding)

---

## 🧪 Test the Fix

### In Terminal 2 (Stripe CLI)
You should see:
```
> Ready! Your webhook signing secret is whsec_...
```

### Now Make a Test Purchase
1. Go to your website
2. Login
3. Go to pricing page
4. Click "Buy Start Plan"
5. Use test card: `4242 4242 4242 4242`
6. Complete the payment

### In Terminal 2, You Should See:
```
2025-01-26 12:34:56  --> checkout.session.completed [evt_xxx]
2025-01-26 12:34:56  <-- [200] POST http://localhost:3001/api/stripe/webhook [evt_xxx]
2025-01-26 12:34:57  --> customer.subscription.created [evt_xxx]
2025-01-26 12:34:57  <-- [200] POST http://localhost:3001/api/stripe/webhook [evt_xxx]
```

**Look for `[200]`** - This means success!

### In Terminal 1 (Dev Server), You Should See:
```
🔔 Webhook: checkout.session.completed received
Session ID: cs_test_xxxxx
Session metadata: { userId: 'abc123', planId: 'start', isYearly: 'false' }
✅ Processing checkout for user: abc123 plan: start yearly: false
📝 Updating user document in Firestore...
✅✅✅ USER PLAN UPDATED SUCCESSFULLY ✅✅✅
```

### In Your Dashboard:
After redirecting from Stripe:
- Should show "CropDrive Start" plan
- No more "🔒 No Active Plan" message

---

## ❌ Common Mistakes

### Mistake 1: Not Running Stripe Listen
**Problem**: Only running `npm run dev`
**Solution**: You MUST run `stripe listen` in a separate terminal

### Mistake 2: Wrong Secret
**Problem**: Using an old webhook secret
**Solution**: Always copy the secret from the CURRENT `stripe listen` session

### Mistake 3: Not Restarting Dev Server
**Problem**: Changing `.env.local` but not restarting
**Solution**: Always restart after changing `.env.local`

### Mistake 4: Closing Stripe CLI
**Problem**: Stopping the `stripe listen` command
**Solution**: Keep it running while testing purchases

---

## 📋 Quick Checklist

Before testing a purchase, make sure:
- [ ] Stripe CLI is running (`stripe listen...`)
- [ ] Dev server is running (`npm run dev`)
- [ ] `.env.local` has the correct `STRIPE_WEBHOOK_SECRET`
- [ ] Both terminals are visible so you can see webhook events

---

## 🆘 Still Not Working?

### Check 1: Is the Webhook Secret Set?
Look in your `.env.local` file:
```bash
# Should look like this:
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

### Check 2: Is Stripe CLI Running?
In Terminal 2, you should see:
```
> Ready! Your webhook signing secret is whsec_...
```

### Check 3: Are You on the Right Port?
Your dev server should be on `localhost:3001`, not `3000`.

If it's on port 3000, you need to change the `stripe listen` command to:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 📞 Need More Help?

If you're still seeing errors, send me:
1. The output of `stripe listen` (the line with `whsec_`)
2. The `STRIPE_WEBHOOK_SECRET` line from your `.env.local` (hide the actual secret)
3. The error messages from your dev server terminal

---

**Last Updated**: October 26, 2025

