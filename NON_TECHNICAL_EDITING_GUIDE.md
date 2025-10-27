# 🎨 CropDrive Website Editing Guide for Non-Technical Users

*A simple guide to change text and images on your website without coding knowledge*

---

## 📋 Table of Contents
1. [What You'll Need](#what-youll-need)
2. [Setting Up Your Workspace](#setting-up-your-workspace)
3. [Using GitHub Copilot (Your AI Assistant)](#using-github-copilot-your-ai-assistant)
4. [How to Change Text on Your Website](#how-to-change-text-on-your-website)
5. [How to Change Images](#how-to-change-images)
6. [Testing Your Changes](#testing-your-changes)
7. [Publishing Your Changes](#publishing-your-changes)
8. [Troubleshooting](#troubleshooting)

---

## 🛠️ What You'll Need

Before you start, make sure you have:

✅ **VS Code (Visual Studio Code)** - A free text editor
- Download from: https://code.visualstudio.com/
- Install it like any other program on your computer

✅ **GitHub Copilot** - Your AI coding assistant (subscription required)
- Sign up at: https://github.com/features/copilot
- Cost: $10/month (or free for students/teachers)

✅ **Git** - Version control software
- Download from: https://git-scm.com/
- Install with default settings

✅ **Node.js** - Required to run the website locally
- Download from: https://nodejs.org/ (choose LTS version)
- Install with default settings

---

## 🚀 Setting Up Your Workspace

### Step 1: Install GitHub Copilot in VS Code

1. Open VS Code
2. Click the **Extensions** icon on the left sidebar (looks like 4 squares)
3. Search for "GitHub Copilot"
4. Click **Install**
5. Sign in with your GitHub account when prompted

### Step 2: Open Your Website Project

1. Open VS Code
2. Go to **File** → **Open Folder**
3. Navigate to: `C:\Users\markc\cropdrive`
4. Click **Select Folder**

### Step 3: Start the Website on Your Computer

1. In VS Code, press **Ctrl + `** (backtick) to open the terminal
2. Type this command and press Enter:
   ```
   npm run dev
   ```
3. Wait until you see: `Ready in X.Xs` and `Local: http://localhost:3000`
4. Open your web browser and go to: **http://localhost:3000**
5. You should see your website running!

> 💡 **Tip**: Keep this terminal window running while you make changes. Your website will automatically update when you save files!

---

## 🤖 Using GitHub Copilot (Your AI Assistant)

GitHub Copilot is like having a coding expert sitting next to you. Here's how to use it:

### Opening Copilot Chat

1. In VS Code, press **Ctrl + Shift + I** or click the chat icon in the left sidebar
2. A chat window will open where you can ask questions

### Ready-to-Use Prompts for Common Tasks

Copy and paste these prompts into GitHub Copilot Chat:

#### **Finding Text to Change**
```
Find where the text "Welcome to CropDrive" appears in the website files
```

#### **Changing Homepage Title**
```
Change the main title on the homepage from "current text" to "new text"
```

#### **Changing Button Text**
```
Find all buttons that say "Get Started" and change them to "Start Now"
```

#### **Changing Prices**
```
Update the pricing on the pricing page to show new monthly and yearly prices
```

#### **Finding Image Locations**
```
Show me where all the images are stored in this project
```

---

## 📝 How to Change Text on Your Website

### Method 1: Using GitHub Copilot (Easiest!)

**Example: Changing the Homepage Title**

1. Open GitHub Copilot Chat (**Ctrl + Shift + I**)
2. Paste this prompt:
   ```
   I want to change the main headline on the homepage. 
   Find the file and line where it says "Transform your palm oil farming" 
   and help me change it to "Revolutionize Your Palm Oil Farm"
   ```
3. Copilot will tell you which file to open and what to change
4. Follow its instructions and save the file (**Ctrl + S**)
5. Check your browser - the change should appear automatically!

### Method 2: Manual Search and Replace

**Step-by-Step Instructions:**

1. Press **Ctrl + Shift + F** (opens search across all files)
2. Type the text you want to find (e.g., "CropDrive OP Advisor")
3. All files containing that text will appear
4. Click on any result to open that file
5. Change the text
6. Press **Ctrl + S** to save

### Common Text Locations

| What You Want to Change | Where to Find It | Prompt for Copilot |
|------------------------|------------------|-------------------|
| **Homepage Title & Hero Text** | `src/app/page.tsx` | "Change the main hero section text on the homepage" |
| **About Us Page** | `src/app/about/page.tsx` | "Update the company description on the About page" |
| **Pricing Plans** | `src/app/pricing/page.tsx` | "Update the pricing plan names and prices" |
| **Contact Information** | `src/app/contact/page.tsx` | "Change the contact email and phone number" |
| **Navigation Menu** | `src/components/Navbar.tsx` | "Change the menu items in the navigation bar" |
| **Footer Text** | `src/components/Footer.tsx` | "Update the footer copyright and links" |
| **Features Page** | `src/app/features/page.tsx` | "Modify the feature descriptions and titles" |

### Example: Changing Company Name

**Copilot Prompt:**
```
I want to change all instances of "CropDrive OP Advisor" to "CropDrive Pro". 
Show me which files need to be updated and help me make this change safely.
Include the logo text, page titles, and metadata.
```

---

## 🖼️ How to Change Images

### Understanding the Image Folder Structure

All website images are stored in: **`public/images/`**

```
public/
  └── images/
      ├── CropDrive.png (Your logo)
      ├── icon-192x192.png (App icon small)
      └── icon-512x512.png (App icon large)
  └── videos/
      └── Farmer_s_Oil_Palm_Land_Drone_Shot.mp4
```

### Step 1: Adding New Images

1. Prepare your image:
   - **Logo**: PNG format, 500x500 pixels recommended
   - **Hero images**: JPG/PNG, 1920x1080 pixels recommended
   - **Icons**: PNG with transparent background

2. Copy your image file into `public/images/` folder

3. Give it a clear name (e.g., `new-logo.png`, `hero-farm.jpg`)

### Step 2: Using Copilot to Replace Images

**Copilot Prompt for Logo Change:**
```
I want to replace the CropDrive logo throughout the website.
I have a new logo file called "new-logo.png" in the public/images folder.
Show me all places where the logo is used and help me update them to use my new logo.
```

**Copilot Prompt for Homepage Background:**
```
I want to add a new hero background image on the homepage.
My image is called "farm-background.jpg" in public/images.
Help me replace the current hero section background with my new image.
```

### Manual Image Replacement (If Needed)

1. Press **Ctrl + Shift + F** to search all files
2. Search for the old image name (e.g., `CropDrive.png`)
3. Files will appear showing where the image is used
4. Change the image filename to your new image
5. Save the file (**Ctrl + S**)

### Common Image Locations

| Image Type | File Location | What It Controls |
|-----------|---------------|------------------|
| **Website Logo** | `src/components/Navbar.tsx`<br>`src/components/Sidebar.tsx`<br>`src/app/login/page.tsx`<br>`src/app/register/page.tsx` | Logo shown in navigation, sidebar, login/register pages |
| **Favicon (browser tab icon)** | `public/favicon.ico` | Small icon in browser tabs |
| **App Icons** | `public/images/icon-*.png` | Icons when website is added to phone home screen |
| **Hero/Background Images** | `src/app/page.tsx` | Main homepage images |

### Image Optimization Tips

✅ **Do's:**
- Use JPG for photos (smaller file size)
- Use PNG for logos and graphics (transparency support)
- Keep logos under 200KB
- Keep hero images under 500KB

❌ **Don'ts:**
- Don't use huge uncompressed images (slows down website)
- Don't use spaces in filenames (use dashes: `my-logo.png`)
- Don't use special characters in filenames

### Quick Image Replacement Example

**To change the logo:**

1. Copy your new logo to `public/images/` and name it `CropDrive.png` (replace existing)
2. Refresh your browser
3. Done! The logo updates everywhere automatically

---

## 🧪 Testing Your Changes

### Always Test Before Publishing!

**Testing Checklist:**

1. ✅ **Check the local website** (http://localhost:3000)
   - Click through all pages
   - Verify text changes appear correctly
   - Check images load properly
   - Test on different screen sizes (resize browser window)

2. ✅ **Check Different Pages:**
   - Homepage (http://localhost:3000/)
   - Pricing (http://localhost:3000/pricing)
   - About (http://localhost:3000/about)
   - Contact (http://localhost:3000/contact)
   - Login (http://localhost:3000/login)

3. ✅ **Common Things to Check:**
   - All text is spelled correctly
   - Images aren't broken (no missing image icons)
   - Links still work
   - Mobile view looks good (shrink browser window)

### Using Copilot for Testing

**Prompt:**
```
I just made changes to the website text/images. 
What should I check to make sure everything is working correctly?
Create a testing checklist for me.
```

---

## 📤 Publishing Your Changes

Once you're happy with your changes, here's how to publish them to your live website:

### Step 1: Save Your Changes to Git

1. In VS Code terminal, type these commands one by one:

   ```bash
   git add .
   ```
   *(This stages all your changes)*

   ```bash
   git commit -m "Updated text and images on website"
   ```
   *(This saves your changes with a description)*

   ```bash
   git push origin main
   ```
   *(This uploads your changes to GitHub)*

2. Enter your GitHub username and password if asked

### Step 2: Automatic Deployment

If your website is connected to Vercel (which it is):
- Your changes will automatically deploy in 2-5 minutes
- Go to https://cropdrive.vercel.app to see your live changes
- You'll get an email when deployment is complete

### Copilot Prompt for Publishing

```
I've made changes to my website and want to publish them to the live site.
Walk me through the git commands I need to run step by step.
```

---

## 🆘 Troubleshooting

### Problem: "Website won't start (npm run dev fails)"

**Solution:**
```
# In terminal, run these commands:
npm install
npm run dev
```

**Copilot Prompt:**
```
The website won't start when I run "npm run dev". 
Show me troubleshooting steps.
```

---

### Problem: "I made a mistake and want to undo my changes"

**Solution - Undo unsaved changes:**
1. In VS Code, press **Ctrl + Z** to undo
2. Or: Right-click the file → **Discard Changes**

**Solution - Undo committed changes:**

**Copilot Prompt:**
```
I accidentally made wrong changes and already committed them.
How do I revert to the previous version safely?
```

---

### Problem: "Image doesn't appear on the website"

**Checklist:**
1. ✅ Is the image in the `public/images/` folder?
2. ✅ Is the filename spelled correctly (including extension)?
3. ✅ Did you use the exact filename in the code?
4. ✅ Did you save the file (**Ctrl + S**)?
5. ✅ Did you refresh the browser?

**Copilot Prompt:**
```
I added a new image called "my-image.png" to public/images/ 
but it's not showing on the website. Help me troubleshoot.
```

---

### Problem: "Text changed on my computer but not on live site"

**This means you haven't published yet!**

**Solution:**
1. Make sure you ran all git commands (see [Publishing Your Changes](#publishing-your-changes))
2. Wait 2-5 minutes for deployment
3. Clear your browser cache (Ctrl + F5)

---

### Problem: "VS Code shows red squiggly lines under my code"

**This is usually fine!** These are warnings, not errors.

**Copilot Prompt:**
```
I see red/yellow squiggly lines under some text in VS Code.
Are these errors? Do I need to fix them?
```

---

## 📚 Quick Reference: Most Common Edits

### 1. Change Company Name Throughout Website

**Copilot Prompt:**
```
Find all occurrences of "CropDrive OP Advisor" in the entire project 
and help me replace it with "My New Company Name". 
Include files like Navbar, Footer, page titles, and metadata.
```

---

### 2. Update Pricing Plans

**Copilot Prompt:**
```
I need to update the pricing page at src/app/pricing/page.tsx:
- Change "Start Plan" monthly price from RM 24 to RM 29
- Change "Smart Plan" monthly price from RM 39 to RM 49
- Change "Precision Plan" monthly price from RM 49 to RM 59
Show me exactly where and how to make these changes.
```

---

### 3. Change Contact Information

**Copilot Prompt:**
```
Update all contact information on the website:
- Email: newemail@cropdrive.com
- Phone: +60 12-345-6789
- Address: New Address Here
Show me which files need to be updated.
```

---

### 4. Replace Logo Everywhere

**Copilot Prompt:**
```
I have a new logo file called "company-logo.png" in public/images/.
Update all occurrences of the logo across the entire website including:
- Navigation bar
- Sidebar
- Login page
- Register page
- Footer
Show me each file and line number to update.
```

---

### 5. Change Homepage Hero Section

**Copilot Prompt:**
```
On the homepage (src/app/page.tsx), I want to change:
- Main headline to: "New Headline Here"
- Subheadline to: "New subheadline text"
- Button text from "Get Started" to "Start Free Trial"
Guide me through making these changes step by step.
```

---

### 6. Update Footer Copyright Year

**Copilot Prompt:**
```
Find the footer component and update the copyright year to 2025 
and change company name in footer if needed.
```

---

## 🎯 Best Practices for Non-Technical Users

### ✅ Do's:

1. **Always test locally before publishing**
   - Run `npm run dev` and check http://localhost:3000
   
2. **Make small changes at a time**
   - Change one thing, test, then move to the next
   
3. **Use meaningful commit messages**
   - Good: "Updated pricing page with new prices"
   - Bad: "changes"
   
4. **Keep a backup**
   - Before making big changes, take screenshots
   
5. **Use GitHub Copilot for guidance**
   - When in doubt, ask Copilot!

### ❌ Don'ts:

1. **Don't change files outside of these folders:**
   - ✅ Safe: `src/app/`, `src/components/`, `public/images/`
   - ⚠️ Risky: `src/lib/`, `node_modules/`, configuration files
   
2. **Don't delete files you don't recognize**
   - If unsure, ask Copilot first
   
3. **Don't commit to git without testing**
   - Always check the website works first
   
4. **Don't panic if something breaks**
   - You can always undo changes
   - Ask Copilot for help

---

## 💬 Emergency Copilot Prompts

If you're stuck, paste one of these into Copilot Chat:

### General Help
```
I'm a non-technical user trying to edit the CropDrive website.
I need help understanding [explain your issue].
Please explain in simple terms and show me step-by-step what to do.
```

### Undo Everything
```
I made changes I want to completely undo.
How do I restore the website to how it was before my changes?
Show me the exact commands to run.
```

### Find What Changed
```
Show me a list of all files I've modified since the last commit.
I want to review my changes before publishing.
```

### Check for Errors
```
Check my recent changes for any errors or problems.
Tell me if there's anything I need to fix before publishing.
```

---

## 📞 Getting Help

### When to Use GitHub Copilot

Use Copilot for:
- ✅ Finding where to change text
- ✅ Understanding error messages
- ✅ Step-by-step instructions
- ✅ Checking if your changes are safe
- ✅ Learning what files do

### General Tips for Asking Copilot

1. **Be specific**: Instead of "help me", say "I want to change the homepage title"
2. **Provide context**: Mention file names, exact text you want to change
3. **Ask for simple explanations**: Add "explain in simple terms" to your prompts
4. **Request step-by-step**: Ask for "step-by-step instructions"

---

## 🎓 Learning More

As you get comfortable with basic edits, you can gradually learn more:

1. **VS Code Basics**
   - Tutorial: https://code.visualstudio.com/docs/getstarted/introvideos

2. **Understanding File Structure**
   - Ask Copilot: "Explain the folder structure of this project in simple terms"

3. **Git Basics**
   - Visual Git Tutorial: https://learngitbranching.js.org/

---

## ✨ Success Checklist

You're ready to edit your website when you can:

- [ ] Open the project in VS Code
- [ ] Start the website locally (`npm run dev`)
- [ ] Open GitHub Copilot Chat
- [ ] Find and change text using search
- [ ] Add images to the `public/images` folder
- [ ] View changes in your browser
- [ ] Commit and push changes to GitHub
- [ ] See changes appear on the live website

---

## 🎉 You're Ready!

Remember:
- **GitHub Copilot is your friend** - ask it anything!
- **Test before publishing** - always check locally first
- **Small changes are safer** - don't try to change everything at once
- **You can always undo** - mistakes are reversible
- **Practice makes perfect** - start with simple text changes

**Happy editing! 🚀**

---

*Last Updated: 2025*
*For support, use the Copilot prompts in this guide or contact your technical administrator.*

