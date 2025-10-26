# 🚨 URGENT: Fix Webhook Secret Right Now

## The Problem
Your Stripe webhooks are returning `[400]` errors (see your terminal). This means the `STRIPE_WEBHOOK_SECRET` is **WRONG**.

---

## ✅ Fix It NOW (3 Steps)

### Step 1: Look at Your Stripe CLI Terminal
In the terminal where you ran `stripe listen`, look for a line that says:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

**COPY THE ENTIRE SECRET** (everything starting with `whsec_`)

### Step 2: Update Your `.env.local` File

1. Open `.env.local` in your project root
2. Find the line that says `STRIPE_WEBHOOK_SECRET=`
3. Replace it with the EXACT secret from Step 1:

```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

(Use YOUR actual secret, not this example!)

**IMPORTANT**: Make sure there are NO spaces, NO quotes, just:
```
STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

### Step 3: Restart Your Dev Server

1. Go to the terminal running `npm run dev`
2. Press `Ctrl+C` to stop it
3. Run `npm run dev` again
4. Wait for it to fully start

---

## 🧪 Test It

### 1. Make a Test Purchase
- Go to pricing page
- Buy a plan
- Use test card: `4242 4242 4242 4242`

### 2. Check Your Stripe CLI Terminal
You should now see `[200]` instead of `[400]`:

✅ **GOOD (Fixed):**
```
2025-10-27 02:10:22  <--  [200] POST http://localhost:3000/api/stripe/webhook
```

❌ **BAD (Not Fixed):**
```
2025-10-27 02:10:38  <--  [400] POST http://localhost:3000/api/stripe/webhook
```

### 3. Check Your Dev Server Terminal
You should see:
```
🔔 Webhook: checkout.session.completed received
Session ID: cs_test_xxxxx
✅ Processing checkout for user: abc123 plan: start
✅✅✅ USER PLAN UPDATED SUCCESSFULLY ✅✅✅
```

### 4. Check Your Dashboard
After redirecting from Stripe:
- Should show your purchased plan
- No more "🔒 No Active Plan"

---

## 🔍 Quick Troubleshooting

### Still Seeing [400]?

**Problem**: Secret doesn't match
**Solution**: 
1. Copy the secret from Stripe CLI again (the line with `whsec_`)
2. Make SURE you're copying the entire secret
3. Paste it in `.env.local` with NO spaces
4. Restart dev server

### Still No Plan in Dashboard?

**Check 1**: Is Stripe CLI still running?
- You should see events appearing in real-time
- If not, run `stripe listen --forward-to localhost:3000/api/stripe/webhook` again

**Check 2**: Did you restart the dev server after updating `.env.local`?
- Must restart for changes to take effect

**Check 3**: Check the port number
- Your Stripe CLI is forwarding to `localhost:3000`
- Make sure your dev server is running on port 3000
- If it's on 3001, change the Stripe CLI command to:
  ```bash
  stripe listen --forward-to localhost:3001/api/stripe/webhook
  ```

---

## 📋 Complete Checklist

Before testing a purchase:

- [ ] Stripe CLI is running and shows "Ready! Your webhook signing secret is..."
- [ ] Copied the FULL `whsec_` secret from Stripe CLI
- [ ] Updated `.env.local` with the correct secret (no spaces, no quotes)
- [ ] Saved `.env.local` file
- [ ] Restarted dev server (Ctrl+C, then `npm run dev`)
- [ ] Dev server is fully started
- [ ] Both terminals are visible

---

## 🆘 If It's STILL Not Working

Send me:
1. The line from Stripe CLI that shows the secret (you can hide the middle part like `whsec_abc...xyz`)
2. The line from your `.env.local` showing `STRIPE_WEBHOOK_SECRET=` (hide the middle part)
3. The port your dev server is running on (check the terminal, it should say "Local: http://localhost:3000" or 3001)

---

**THIS IS THE ONLY ISSUE PREVENTING YOUR PLANS FROM WORKING!**

Once you see `[200]` responses in Stripe CLI, everything will work perfectly! 🚀

