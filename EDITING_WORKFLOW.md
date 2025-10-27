# 🔄 Website Editing Workflow Diagram

*A visual guide to the editing process*

---

## 📊 Complete Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    START EDITING SESSION                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: OPEN VS CODE                                        │
│  • Open VS Code application                                  │
│  • File → Open Folder → C:\Users\markc\cropdrive           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: START LOCAL WEBSITE                                │
│  • Press Ctrl + ` (open terminal)                           │
│  • Type: npm run dev                                         │
│  • Wait for: "Ready in X.Xs"                                │
│  • Open browser: http://localhost:3000                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: OPEN GITHUB COPILOT                                │
│  • Press Ctrl + Shift + I                                    │
│  • Chat window opens on the right                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
    ┌─────────────────┐  ┌─────────────────┐
    │  CHANGE TEXT    │  │  CHANGE IMAGES  │
    └────────┬────────┘  └────────┬────────┘
             │                    │
             │                    │
    ┌────────▼────────────────────▼────────┐
    │  TEXT EDITING WORKFLOW               │
    │  ┌──────────────────────────────┐    │
    │  │ 1. Ask Copilot to find text  │    │
    │  │    Prompt: "Find where       │    │
    │  │    [text] appears"           │    │
    │  └──────────┬───────────────────┘    │
    │             ▼                         │
    │  ┌──────────────────────────────┐    │
    │  │ 2. Copilot shows file & line │    │
    │  └──────────┬───────────────────┘    │
    │             ▼                         │
    │  ┌──────────────────────────────┐    │
    │  │ 3. Click to open file        │    │
    │  └──────────┬───────────────────┘    │
    │             ▼                         │
    │  ┌──────────────────────────────┐    │
    │  │ 4. Change the text           │    │
    │  └──────────┬───────────────────┘    │
    │             ▼                         │
    │  ┌──────────────────────────────┐    │
    │  │ 5. Press Ctrl + S (save)     │    │
    │  └──────────┬───────────────────┘    │
    └─────────────┼────────────────────────┘
                  │
    ┌─────────────┼────────────────────────┐
    │  IMAGE EDITING WORKFLOW              │
    │  ┌──────────▼───────────────────┐    │
    │  │ 1. Copy image to             │    │
    │  │    public/images/ folder     │    │
    │  └──────────┬───────────────────┘    │
    │             ▼                         │
    │  ┌──────────────────────────────┐    │
    │  │ 2. Ask Copilot to update     │    │
    │  │    Prompt: "Replace logo     │    │
    │  │    with new-logo.png"        │    │
    │  └──────────┬───────────────────┘    │
    │             ▼                         │
    │  ┌──────────────────────────────┐    │
    │  │ 3. Follow Copilot's          │    │
    │  │    instructions              │    │
    │  └──────────┬───────────────────┘    │
    │             ▼                         │
    │  ┌──────────────────────────────┐    │
    │  │ 4. Save all changed files    │    │
    │  └──────────┬───────────────────┘    │
    └─────────────┼────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: TEST YOUR CHANGES                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ✓ Refresh browser (Ctrl + R)                        │    │
│  │ ✓ Check homepage                                     │    │
│  │ ✓ Check other pages                                  │    │
│  │ ✓ Verify spelling                                    │    │
│  │ ✓ Test on mobile (resize browser)                   │    │
│  │ ✓ Click links to make sure they work                │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌────────┴────────┐
              │ Are changes OK? │
              └────────┬────────┘
                       │
         ┌─────────────┼─────────────┐
         │                           │
         ▼                           ▼
    ┌────────┐                 ┌─────────┐
    │   NO   │                 │   YES   │
    └───┬────┘                 └────┬────┘
        │                           │
        ▼                           ▼
┌──────────────────┐      ┌──────────────────────┐
│ Fix the issues   │      │  STEP 5: PUBLISH     │
│ Go back to       │      │  Run these commands: │
│ editing          │      │  1. git add .        │
└──────────────────┘      │  2. git commit -m    │
                          │     "description"    │
                          │  3. git push origin  │
                          │     main             │
                          └────┬─────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ AUTOMATIC DEPLOYMENT │
                    │ • Vercel receives    │
                    │   your changes       │
                    │ • Builds website     │
                    │ • Deploys (2-5 min)  │
                    └────┬─────────────────┘
                         │
                         ▼
                ┌────────────────────┐
                │  LIVE WEBSITE      │
                │  UPDATED! ✅       │
                │ cropdrive.vercel   │
                │ .app               │
                └────────────────────┘
```

---

## 🎯 Decision Tree: What Should I Edit?

```
                    ┌──────────────────┐
                    │ What do you want │
                    │   to change?     │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐  ┌─────────────────┐  ┌──────────────┐
│  TEXT/WORDS   │  │  IMAGES/PHOTOS  │  │  PRICES      │
└───────┬───────┘  └────────┬────────┘  └──────┬───────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────────────────────────────────────────────┐
│                                                        │
│  TEXT CHANGES:                                         │
│  ├─ Homepage title      → src/app/page.tsx           │
│  ├─ About us page       → src/app/about/page.tsx     │
│  ├─ Contact info        → src/app/contact/page.tsx   │
│  ├─ Menu items          → src/components/Navbar.tsx  │
│  └─ Footer              → src/components/Footer.tsx  │
│                                                        │
│  IMAGE CHANGES:                                        │
│  ├─ Add to public/images/                            │
│  └─ Ask Copilot to update references                 │
│                                                        │
│  PRICE CHANGES:                                        │
│  └─ Edit: src/app/pricing/page.tsx                   │
│                                                        │
└───────────────────────────────────────────────────────┘
```

---

## 🚨 Troubleshooting Flowchart

```
                    ┌──────────────────┐
                    │  Problem?        │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Website      │   │ Image not    │   │ Text didn't  │
│ won't start  │   │ showing      │   │ update live  │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                   │
       ▼                  ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Run:         │   │ 1. Check file│   │ Did you run  │
│ npm install  │   │    is in     │   │ git push?    │
│ npm run dev  │   │    public/   │   │              │
│              │   │    images/   │   │ If no:       │
│              │   │              │   │ Run git      │
│              │   │ 2. Check     │   │ commands     │
│              │   │    spelling  │   │              │
│              │   │              │   │ If yes:      │
│              │   │ 3. Refresh   │   │ Wait 5 min & │
│              │   │    browser   │   │ clear cache  │
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## 📱 Mobile-Responsive Editing Checklist

```
AFTER MAKING CHANGES, TEST ON DIFFERENT SIZES:

Desktop (Large Screen):
┌─────────────────────────────────────────────┐
│ [Logo]    Menu1  Menu2  Menu3    [Login]   │
│                                             │
│         Your Edited Content Here            │
│                                             │
└─────────────────────────────────────────────┘
✓ Logo visible
✓ All menu items showing
✓ Text readable
✓ Images fit properly

Tablet (Medium Screen):
┌───────────────────────────────┐
│ [Logo]    Menu  Menu   [☰]   │
│                               │
│    Your Edited Content        │
│                               │
└───────────────────────────────┘
✓ Logo visible  
✓ Some menus in hamburger
✓ Text still readable

Mobile (Small Screen):
┌──────────────────┐
│ [Logo]      [☰] │
│                  │
│  Your Edited     │
│  Content         │
│  (Stacked)       │
│                  │
└──────────────────┘
✓ Logo smaller but visible
✓ Hamburger menu works
✓ Text size comfortable
✓ Images scale down

HOW TO TEST: Resize your browser window smaller/larger
```

---

## 🔐 Safe vs Risky Files

```
SAFE TO EDIT (Green Light 🟢):
├── src/app/
│   ├── page.tsx .................... Homepage
│   ├── about/page.tsx .............. About page
│   ├── pricing/page.tsx ............ Pricing page  
│   ├── contact/page.tsx ............ Contact page
│   ├── features/page.tsx ........... Features page
│   └── [any other page].tsx ....... Other pages
├── src/components/
│   ├── Navbar.tsx .................. Navigation menu
│   ├── Footer.tsx .................. Footer
│   └── [visual components] ......... UI elements
└── public/images/ .................. All images

EDIT WITH CAUTION (Yellow Light 🟡):
Ask Copilot first!
├── src/lib/ ........................ Code libraries
├── src/types/ ...................... TypeScript types
└── src/styles/ ..................... CSS styles

DO NOT EDIT (Red Light 🔴):
Unless you know what you're doing!
├── node_modules/ ................... Installed packages
├── .next/ .......................... Build files
├── package.json .................... Dependencies
├── tsconfig.json ................... TypeScript config
└── next.config.mjs ................. Next.js config
```

---

## ⏱️ Time Estimates

```
TASK                          ESTIMATED TIME
─────────────────────────────────────────────────
Change simple text            2-5 minutes
Change multiple texts         10-15 minutes
Replace one image            5-10 minutes
Update logo everywhere       15-20 minutes
Change pricing page          10-15 minutes
Update contact info          5-10 minutes
Test changes locally         5-10 minutes
Publish to live site         2-5 minutes
                              (automatic)

FIRST TIME SETUP             30-60 minutes
DAILY EDITING SESSION        15-30 minutes
```

---

## 📞 Help Priority Levels

```
LEVEL 1: Use GitHub Copilot
├─ Quick questions
├─ Finding files
├─ Understanding errors
└─ Step-by-step guidance
    ↓ If unresolved:

LEVEL 2: Check Guides
├─ NON_TECHNICAL_EDITING_GUIDE.md (detailed)
├─ QUICK_REFERENCE_CARD.md (quick tips)
└─ EDITING_WORKFLOW.md (this file)
    ↓ If still stuck:

LEVEL 3: Contact Technical Admin
└─ Complex issues
```

---

## ✅ Pre-Publishing Checklist

```
Before running "git push origin main":

□ I tested the website locally
□ All text changes are correct
□ Images load properly
□ No broken links
□ Spelling is correct
□ Mobile view looks good (resized browser)
□ I'm happy with the changes
□ I know what I changed (for commit message)

If all checked, proceed to publish! 🚀
```

---

## 🎯 First Edit Walkthrough

**Your first edit should be simple. Try this:**

```
┌─────────────────────────────────────────┐
│  CHANGE FOOTER COPYRIGHT YEAR           │
├─────────────────────────────────────────┤
│  1. Open VS Code                        │
│  2. Start website (npm run dev)         │
│  3. Press Ctrl + Shift + F              │
│  4. Search: "2024 CropDrive"           │
│  5. Click result (Footer.tsx)           │
│  6. Change "2024" to "2025"            │
│  7. Press Ctrl + S (save)               │
│  8. Refresh browser - see change!       │
│  9. Run git commands to publish         │
│                                         │
│  ✅ Congratulations! First edit done!  │
└─────────────────────────────────────────┘
```

---

## 🎓 Learning Progression Path

```
WEEK 1: Getting Comfortable
└─ Open project ✓
└─ Start website ✓
└─ Use Copilot ✓
└─ Change 1-2 simple texts ✓

WEEK 2: Building Confidence  
└─ Change multiple texts ✓
└─ Update contact info ✓
└─ Modify footer ✓
└─ Publish changes ✓

WEEK 3: Getting Advanced
└─ Replace images ✓
└─ Update prices ✓
└─ Edit multiple pages ✓
└─ Use search effectively ✓

WEEK 4: Fully Independent
└─ Make any text changes ✓
└─ Handle images confidently ✓
└─ Troubleshoot minor issues ✓
└─ Publish regularly ✓

You're now a website editor! 🎉
```

---

**Print this workflow guide and keep it visible while editing!**

*Last Updated: 2025*

