# 📧 How to Set Up Email for Your Contact Form (Simple Guide)

**Good news!** You don't need to verify any domain or do complicated technical setup. This guide will help you set up email using your Gmail account in simple, easy steps.

## ✅ What You'll Get

- ✅ **No complicated domain setup** - Just use your Gmail account
- ✅ **Works right away** - Set it up once and it's done
- ✅ **Free** - Uses your existing Gmail account
- ✅ **Easy** - Just follow the steps below
- ✅ **Sends to any email** - Can send to Gmail, Outlook, or any email address

---

## 📋 What You Need Before Starting

- A Gmail account (if you don't have one, create one at https://gmail.com)
- Access to your phone (for security verification)
- About 10 minutes of time

---

## 🚀 Step-by-Step Instructions

### Step 1: Turn On 2-Step Verification (Security Feature)

**Why?** Gmail requires this security feature to generate a special password for your contact form.

1. **Open your web browser** and go to: **https://myaccount.google.com**
   - Make sure you're signed in to your Gmail account

2. **Click on "Security"** in the left menu (or scroll down to find it)

3. **Find "2-Step Verification"** 
   - It should be under the section called "Signing in to Google"
   - You might see it says "Off" or "Not set up"

4. **Click "Get started"** or "Turn on" button

5. **Follow the instructions** on screen:
   - Google will ask for your phone number
   - They'll send you a code via text message
   - Enter the code when asked
   - Click "Turn on" to finish

**✅ Done!** You've enabled 2-Step Verification. Now move to Step 2.

---

### Step 2: Create an App Password (Special Password for Your Website)

**What is this?** This is a special password that lets your website send emails through your Gmail account. It's different from your regular Gmail password.

1. **Go to the App Passwords page**: **https://myaccount.google.com/apppasswords**
   - Or you can find it by going to: Google Account → Security → 2-Step Verification → App passwords
   - You might need to sign in again

2. **Select "Mail"** from the dropdown menu that says "Select app"
   - This tells Google you want a password for sending emails

3. **Select "Other (Custom name)"** from the dropdown that says "Select device"
   - This lets you give it a name

4. **Type a name** like: **"CropDrive Contact Form"** or **"My Website"**
   - This is just a label so you remember what this password is for

5. **Click the "Generate" button**

6. **IMPORTANT: Copy the password immediately!**
   - You'll see a 16-character password that looks like: `abcd efgh ijkl mnop`
   - **This is the ONLY time you'll see this password!**
   - Copy it somewhere safe (like a text file or notes app)
   - **Remove the spaces** when you use it (so it becomes: `abcdefghijklmnop`)

**✅ Done!** You now have an App Password. Keep it safe and move to Step 3.

---

### Step 3: Add the Settings to Your Website

**What you're doing:** You're telling your website how to send emails using your Gmail account.

You need to add these settings to your website's configuration file (called `.env.local` or environment variables).

#### If You're Running the Website Locally (On Your Computer):

1. **Find the `.env.local` file** in your project folder
   - If you don't have one, create a new file called `.env.local`

2. **Open the file** in a text editor (like Notepad, VS Code, or any text editor)

3. **Add these lines** (replace the example values with your actual information):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
CONTACT_TO_EMAIL=contact@agriglobalsolutions.com
```

**Replace these parts:**
- `your-email@gmail.com` → Put your actual Gmail address here (the one you used in Step 1)
- `abcdefghijklmnop` → Put the 16-character App Password you copied in Step 2 (no spaces!)
- `contact@agriglobalsolutions.com` → This is where form submissions will be sent (you can change this to any email address)

4. **Save the file**

#### If Your Website is Hosted Online (Vercel, Netlify, etc.):

1. **Log in** to your hosting provider's dashboard
2. **Find "Environment Variables"** or "Settings" → "Environment Variables"
3. **Add each setting one by one:**
   - Click "Add" or "New Variable"
   - For each setting below, add the name and value:

| Setting Name | Setting Value |
|-------------|---------------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your Gmail address (e.g., `yourname@gmail.com`) |
| `SMTP_PASS` | Your 16-character App Password (no spaces!) |
| `CONTACT_TO_EMAIL` | `contact@agriglobalsolutions.com` (or your preferred email) |

4. **Save all the settings**

**✅ Done!** Your website is now configured to send emails.

---

### Step 4: Test It Out!

1. **Restart your website** (if running locally, stop and start it again)
   - This makes sure it picks up the new settings

2. **Go to your contact form** on your website

3. **Fill out the form** with a test message:
   - Enter your name
   - Enter your email
   - Type a test message like "This is a test"

4. **Submit the form**

5. **Check the email inbox** for `contact@agriglobalsolutions.com` (or whatever email you set)
   - Look in the inbox, spam folder, and promotions folder
   - You should receive the email within a few seconds!

**✅ Success!** If you received the email, everything is working perfectly!

---

## 📖 How It Works (Simple Explanation)

Think of it like sending a letter:

1. **Someone fills out your contact form** (like writing a letter)
2. **Your website receives it** (like a mailbox)
3. **Your website uses your Gmail account** to send it (like using the post office)
4. **The email arrives** at the address you specified (like the letter arriving at the destination)

```
Contact Form → Your Website → Your Gmail Account → Recipient's Email ✅
```

---

## ⚠️ Important Things to Know

### Email Limits

Gmail has limits on how many emails you can send per day:
- **Free Gmail accounts:** Up to 500 emails per day
- **Google Workspace (paid):** Up to 2,000 emails per day

**For most contact forms, 500 emails per day is more than enough!**

### Security Tips

- ✅ **Never share your App Password** with anyone
- ✅ **Never put your App Password in code** that gets uploaded to GitHub or shared
- ✅ **Keep your App Password safe** - treat it like your regular password
- ✅ **You can delete App Passwords** anytime from your Google Account if needed

### What the Emails Will Look Like

- **From address:** Will show as "CropDrive Contact Form" with your Gmail address
- **To address:** The email address you set (like `contact@agriglobalsolutions.com`)
- **Reply-To:** When someone replies, it will go to the person who filled out the form

---

## 🔧 Troubleshooting (If Something Doesn't Work)

### Problem: "Invalid login" or "Authentication failed"

**What this means:** The website can't log in to your Gmail account.

**How to fix:**
1. ✅ Make sure you're using the **App Password** (from Step 2), NOT your regular Gmail password
2. ✅ Check that you **removed all spaces** from the App Password
3. ✅ Make sure **2-Step Verification is turned on** (Step 1)
4. ✅ Try generating a **new App Password** and use that one instead

### Problem: "Connection timeout"

**What this means:** The website can't connect to Gmail's servers.

**How to fix:**
1. ✅ Check your internet connection
2. ✅ Make sure your firewall isn't blocking the connection
3. ✅ Try changing `SMTP_PORT` from `587` to `465` in your settings

### Problem: Emails not arriving

**What this means:** The email was sent but you're not receiving it.

**How to fix:**
1. ✅ **Check your spam/junk folder** - emails sometimes go there
2. ✅ **Check the promotions/social tabs** in Gmail
3. ✅ **Verify the email address** in `CONTACT_TO_EMAIL` is correct
4. ✅ **Check your website's logs** for any error messages
5. ✅ Make sure you **haven't exceeded Gmail's daily limit** (500 emails for free accounts)

### Problem: "Less secure app access" error

**What this means:** This shouldn't happen if you followed all steps correctly.

**How to fix:**
1. ✅ Make sure you're using an **App Password**, not your regular password
2. ✅ Make sure **2-Step Verification is enabled**
3. ✅ Generate a **new App Password** and try again

---

## 💡 Using Other Email Services

If you don't want to use Gmail, you can use other email services:

### Outlook/Hotmail

Use these settings instead:

```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-outlook-password
```

### Other Email Providers

Contact your email provider to get their SMTP settings. They usually look like:
- `SMTP_HOST=mail.yourdomain.com` (or similar)
- `SMTP_PORT=587` (or 465)
- `SMTP_USER=your-email@yourdomain.com`
- `SMTP_PASS=your-password`

---

## 📝 Support Page Setup

Your support page uses the same email settings! You don't need to do anything extra.

If you want support messages to go to a different email address, you can add:

```
SUPPORT_TO_EMAIL=your-support-email@example.com
```

If you don't add this, it will use the same email as your contact form.

---

## ✅ You're All Done!

Once you've completed all the steps above, your contact form will automatically send emails to `contact@agriglobalsolutions.com` (or whatever email you set) whenever someone submits the form.

**No domain verification needed!** 🎉

---

## 🆘 Need Help?

If you're stuck:
1. **Re-read the steps** - sometimes it's easy to miss a small detail
2. **Check the troubleshooting section** above
3. **Make sure all settings are correct** - double-check your Gmail address and App Password
4. **Try generating a new App Password** if the current one doesn't work

Remember: This setup is permanent! Once it's working, you don't need to do it again unless you change your Gmail account or App Password.
