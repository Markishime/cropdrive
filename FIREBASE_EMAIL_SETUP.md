# Firebase Email Template Setup Guide

This guide will help you configure custom CropDrive-branded email templates in Firebase Authentication.

## 📧 Password Reset Email Template

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **CropDrive** project
3. Navigate to **Authentication** → **Templates** (in the left sidebar)

### Step 2: Configure Password Reset Template

1. Click on **Password reset** template
2. Click **Edit template** or **Customize**

### Step 3: Customize Email Settings

#### **From Email Address:**
- **Display name:** `CropDrive Support`
- **Email address:** Use your custom domain email (e.g., `support@cropdrive.ai`) or Gmail

#### **Email Subject (English):**
```
Reset Your CropDrive Password
```

#### **Email Subject (Malay):**
```
Set Semula Kata Laluan CropDrive Anda
```

### Step 4: Copy HTML Template

#### **For English Users:**

Copy the content from `public/email-templates/password-reset-email.html` and paste it into the **Email body** field in Firebase Console.

**Key Variables:**
- `{{displayName}}` - User's display name
- `{{email}}` - User's email address
- `{{link}}` - Password reset link (automatically replaced by Firebase)

#### **For Malay Users:**

Copy the content from `public/email-templates/password-reset-email-ms.html` and paste it into the **Email body** field.

### Step 5: Configure Action URL

In the Firebase Console, under **Action URL**, set:

```
https://cropdrive.ai/login?mode=resetPassword&oobCode={{oobCode}}
```

This ensures users are redirected back to your CropDrive login page after clicking the reset link.

### Step 6: Test the Email

1. In Firebase Console, go to **Authentication** → **Settings** → **Email Templates**
2. Click **Send test email** for the password reset template
3. Enter your email address
4. Check your inbox to verify the email looks correct

## 🎨 Email Template Features

The custom email template includes:

✅ **CropDrive Branding**
- Green gradient header matching your brand colors
- CropDrive™ logo and branding
- Professional, modern design

✅ **User-Friendly Design**
- Clear call-to-action button
- Alternative text link for accessibility
- Mobile-responsive layout

✅ **Security Information**
- Expiration notice (1 hour)
- Security tips
- Warning if user didn't request reset

✅ **Professional Footer**
- Links to website, support, and privacy policy
- Copyright information
- Clear identification of sender

## 🔧 Gmail Setup (If Using Gmail as Sender)

If you want to use Gmail as the sender email:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate password for "Firebase"
3. **Configure in Firebase:**
   - Use your Gmail address as the sender
   - Firebase will handle authentication automatically

## 📝 Email Verification Template (Optional)

You can also customize the email verification template using similar branding:

1. Go to **Authentication** → **Templates** → **Email address verification**
2. Use similar HTML structure with CropDrive branding
3. Update the content to match verification flow

## ✅ Verification Checklist

After setup, verify:

- [ ] Email displays CropDrive branding correctly
- [ ] Reset link redirects to `/login?mode=resetPassword`
- [ ] Email is mobile-responsive
- [ ] All links work correctly
- [ ] Email arrives in inbox (not spam)
- [ ] Test with both English and Malay users

## 🐛 Troubleshooting

**Email not sending:**
- Check Firebase Console → Authentication → Settings
- Verify sender email is configured
- Check spam/junk folder

**Links not working:**
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check Action URL format in Firebase Console
- Test the reset link manually

**Styling issues:**
- Some email clients strip CSS - test in multiple clients
- Use inline styles for better compatibility
- Test in Gmail, Outlook, Apple Mail

## 📞 Support

If you need help:
- Check Firebase documentation: https://firebase.google.com/docs/auth/custom-email-handler
- Contact Firebase support
- Review email template best practices

---

**Note:** The email templates use Firebase's built-in variables (`{{displayName}}`, `{{email}}`, `{{link}}`). These are automatically replaced by Firebase when sending emails.

