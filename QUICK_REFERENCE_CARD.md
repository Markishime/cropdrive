# 📋 Quick Reference Card - CropDrive Website Editing

*Print this page and keep it at your desk!*

---

## 🚀 Getting Started (Every Time)

1. Open **VS Code**
2. Open folder: `C:\Users\markc\cropdrive`
3. Press **Ctrl + `** to open terminal
4. Type: `npm run dev` and press Enter
5. Open browser: **http://localhost:3000**

---

## 🤖 Opening GitHub Copilot

**Press: Ctrl + Shift + I**

Or click the chat icon (💬) in the left sidebar

---

## 🔍 Finding Text to Change

**Press: Ctrl + Shift + F**

1. Type the text you're looking for
2. Results show all files with that text
3. Click a result to open the file
4. Make your change
5. Press **Ctrl + S** to save

---

## 📝 Common File Locations

| What to Change | File Location |
|---------------|---------------|
| Homepage text | `src/app/page.tsx` |
| Pricing | `src/app/pricing/page.tsx` |
| About page | `src/app/about/page.tsx` |
| Contact info | `src/app/contact/page.tsx` |
| Navigation menu | `src/components/Navbar.tsx` |
| Footer | `src/components/Footer.tsx` |
| Logo | `src/components/Navbar.tsx`<br>`src/components/Sidebar.tsx` |

---

## 🖼️ Adding Images

1. Put image in: `public/images/`
2. Use a simple name: `my-image.png`
3. Ask Copilot to help update the code

---

## 📤 Publishing Changes (3 Commands)

```bash
git add .
git commit -m "Describe your changes here"
git push origin main
```

Wait 2-5 minutes, then check: **https://cropdrive.vercel.app**

---

## 🆘 Emergency Copilot Prompts

### When Stuck
```
I'm stuck. I need help with [describe problem].
Explain in simple terms and show me step-by-step what to do.
```

### Undo Changes
```
I made a mistake. How do I undo my recent changes?
Show me the exact commands to run.
```

### Find My Changes
```
Show me all files I've changed. I want to review before publishing.
```

### Fix Errors
```
I see error messages. Help me understand and fix them.
```

---

## 🎯 Ready-to-Use Copilot Prompts

### Change Company Name
```
Replace all "CropDrive OP Advisor" with "New Company Name" 
throughout the website. Show me which files to update.
```

### Update Logo
```
I have new-logo.png in public/images/. 
Update all logo references to use this new file.
```

### Change Prices
```
Update pricing page:
- Start Plan: RM 24 → RM 29
- Smart Plan: RM 39 → RM 49  
- Precision Plan: RM 49 → RM 59
```

### Update Contact Info
```
Change contact information:
- Email: newemail@company.com
- Phone: +60 12-345-6789
Show which files need updating.
```

### Change Homepage Title
```
On homepage, change main headline to "New Headline" 
and button text to "New Button Text". Guide me step-by-step.
```

---

## ✅ Testing Checklist

Before publishing, check:

- [ ] Homepage looks correct
- [ ] All text changes are visible
- [ ] Images load properly
- [ ] Links work
- [ ] Mobile view is good (resize browser)
- [ ] Spelling is correct

---

## 🔧 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open terminal | `Ctrl + `` |
| Open Copilot | `Ctrl + Shift + I` |
| Search all files | `Ctrl + Shift + F` |
| Save file | `Ctrl + S` |
| Undo | `Ctrl + Z` |
| Open file | `Ctrl + P` |

---

## ⚠️ Safety Rules

**DO:**
- ✅ Test locally first
- ✅ Make small changes
- ✅ Save often (Ctrl + S)
- ✅ Ask Copilot when unsure

**DON'T:**
- ❌ Delete files you don't recognize
- ❌ Edit config files without help
- ❌ Publish without testing
- ❌ Change many things at once

---

## 🎓 Learning Path

**Week 1:** Change text only
**Week 2:** Replace images  
**Week 3:** Update multiple pages
**Week 4:** Comfortable with basic edits!

---

## 💡 Pro Tips

1. **Use Copilot for everything** - It's your 24/7 expert
2. **Keep browser open** - See changes instantly
3. **Commit often** - Small changes are safer
4. **Take screenshots** - Document before big changes
5. **Don't panic** - Everything can be undone!

---

## 📞 When You Need Help

1. **First**: Ask GitHub Copilot
2. **Second**: Check the full guide (NON_TECHNICAL_EDITING_GUIDE.md)
3. **Third**: Contact technical administrator

---

**Remember**: GitHub Copilot is your coding buddy! When in doubt, just ask. 🤖💚

---

*Keep this card visible while editing!*
*Last Updated: 2025*

