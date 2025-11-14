# 🚀 Creating a New Project on Vercel - Step-by-Step Guide

## 📋 Overview

You've deleted the project from Vercel. Now we'll create it from scratch.

**Duration:** 10-15 minutes
**Requirements:** GitHub account, Vercel account

---

## 🔐 STEP 1: Upload Code to GitHub

### 1.1 Open GitHub Desktop
- Open **GitHub Desktop** from desktop or start menu

### 1.2 Check Repository
- See repository name in top left: **AirDropWeb** or similar
- If repository is not visible:
  - **File** → **Add Local Repository**
  - Select `D:\SylvanToken\KiroYazılımlar\AirDropWeb` folder

### 1.3 Commit Changes

**Are there changed files on the left?**

**YES:**
1. Write in the **"Summary"** box at bottom left:
   ```
   Fixed Countdown 404 error - Ready for Vercel
   ```

2. Click **"Commit to main"** button

3. Click **"Push origin"** button at top

**NO (no changes):**
- Already up to date on GitHub, proceed to next step

### 1.4 Check on GitHub

1. Go to GitHub in browser: **github.com**
2. Find your repository (e.g., `SylvanToken/AirDropWeb`)
3. See latest commit: Should say "Fixed Countdown 404 error"
4. Check files:
   - ✅ middleware.ts
   - ✅ vercel.json
   - ✅ app/countdown/page.tsx
   - ✅ DEPLOYMENT_STEPS.md

**✅ Ready!** Code is up to date on GitHub.

---

## 🌐 STEP 2: Go to Vercel and Create New Project

### 2.1 Log In to Vercel

1. Open **vercel.com** in browser
2. Click **"Log In"** in top right
3. Log in with GitHub (skip if already logged in)

### 2.2 Go to Dashboard

- After logging in, you'll see the **Dashboard** page
- Your existing projects (if any) are listed

### 2.3 Add New Project

1. Click **"Add New..."** button in top right
2. Select **"Project"** from dropdown menu

**OR**

- Click the large **"Import Project"** button in center

---

## 📦 STEP 3: Import GitHub Repository

### 3.1 Import Git Repository

You'll see the **"Import Git Repository"** section.

### 3.2 Select GitHub

1. Click **"Continue with GitHub"** button

**If connecting for the first time:**
- GitHub authorization page will open
- Click **"Authorize Vercel"** button
- Enter your password (if required)

### 3.3 Find Repository

**Search for your repository in the search box:**
- Example: `AirDropWeb` or `sylvan-airdrop-platform`

**If you can't see it:**
1. Click **"Adjust GitHub App Permissions"** link
2. GitHub page will open
3. In **"Repository access"** section:
   - Select **"All repositories"**
   - OR select **"Only select repositories"** and add your project
4. Click **"Save"** button
5. Return to Vercel, refresh page

### 3.4 Select Repository

1. Click **"Import"** button next to your repository

---

## ⚙️ STEP 4: Configure Project Settings

### 4.1 Configure Project Page

You'll see this information:

#### Project Name
```
sylvan-airdrop-platform
```
**If you want to change:** Write desired name (lowercase, with hyphens)

#### Framework Preset
```
Next.js
```
**✅ Should be auto-detected.** If not, select **Next.js** from dropdown.

#### Root Directory
```
./
```
**✅ Leave as is** (project is at root)

#### Build and Output Settings

**Build Command:**
```
prisma generate && prisma migrate deploy && next build
```

**Output Directory:**
```
.next
```

**Install Command:**
```
npm ci
```

**✅ These should be auto-filled.** If not, enter the values above.

---

## 🔐 STEP 5: Add Environment Variables

### 5.1 Open Environment Variables Section

Scroll down the page, find the **"Environment Variables"** section.

### 5.2 Add Each Variable

**Add these variables ONE BY ONE:**

---

#### Variable 1: DATABASE_URL

**Name:**
```
DATABASE_URL
```

**Value:** (Your existing Supabase URL)
```
postgresql://postgres.fahcabutajczylskmmgw:bkEOzJECBtU2SZcM@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Environment:**
- ✅ Production
- ✅ Preview
- ✅ Development

Click **"Add"** button

---

#### Variable 2: NEXTAUTH_URL

**Name:**
```
NEXTAUTH_URL
```

**Value:** (Your Vercel domain - placeholder for now)
```
https://sylvan-airdrop-platform.vercel.app
```

**⚠️ NOTE:** We'll update with real domain after deployment

**Environment:**
- ✅ Production
- ✅ Preview
- ✅ Development

Click **"Add"** button

---

#### Variable 3: NEXTAUTH_SECRET

**Name:**
```
NEXTAUTH_SECRET
```

**Value:** (Generate a new secret)

**Run in PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output (example: `kJ8mN2pQ5rT9vX3zA6bC8dE1fG4hI7jK0lM3nO6pQ9rS2tU5vW8xY1zA4bC7dE0f`)

**Value:**
```
<secret you generated above>
```

**Environment:**
- ✅ Production
- ✅ Preview
- ✅ Development

Click **"Add"** button

---

#### Variable 4: TEST_ACCESS_KEY

**Name:**
```
TEST_ACCESS_KEY
```

**Value:**
```
07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

**Environment:**
- ✅ Production
- ✅ Preview
- ✅ Development

Click **"Add"** button

---

#### Variable 5: RESEND_API_KEY (Optional)

**Name:**
```
RESEND_API_KEY
```

**Value:** (Your existing Resend API key)
```
re_esWqEK4H_JANdaicdiRGjqfvUq4ZDmqLt
```

**Environment:**
- ✅ Production
- ✅ Preview
- ✅ Development

Click **"Add"** button

---

#### Variable 6: EMAIL_FROM (Optional)

**Name:**
```
EMAIL_FROM
```

**Value:**
```
noreply@sylvantoken.org
```

**Environment:**
- ✅ Production
- ✅ Preview
- ✅ Development

Click **"Add"** button

---

### 5.3 Check All Variables

Make sure you've added these variables:
- ✅ DATABASE_URL
- ✅ NEXTAUTH_URL
- ✅ NEXTAUTH_SECRET
- ✅ TEST_ACCESS_KEY
- ✅ RESEND_API_KEY (optional)
- ✅ EMAIL_FROM (optional)

---

## 🚀 STEP 6: Deploy!

### 6.1 Click Deploy Button

There's a large blue **"Deploy"** button at the bottom of the page.

Click the **"Deploy"** button!

### 6.2 Watch Deployment

**A new page will open:**

1. **"Building"** phase starts
   - Code is pulled from GitHub
   - Dependencies are installed
   - Prisma generate runs
   - Next.js builds

2. You'll see a **progress bar**

3. You'll see **logs** (green text)

**Expected time:** 3-5 minutes

### 6.3 Success Check

**✅ If successful:**
- **"Congratulations!"** message
- Green ✅ checkmark
- **"Visit"** button appears

**❌ If error:**
- Red ❌ checkmark
- Click **"View Build Logs"**
- Read the error (usually environment variable or database error)

---

## 🌍 STEP 7: Update Domain

### 7.1 Copy Deployment URL

After successful deployment:

1. Copy the URL next to the **"Visit"** button
   - Example: `https://sylvan-airdrop-platform.vercel.app`

### 7.2 Update NEXTAUTH_URL

1. Go to your project in Vercel Dashboard
2. Click **"Settings"** in top menu
3. Select **"Environment Variables"** from left menu
4. Find the **NEXTAUTH_URL** variable
5. Click **"Edit"** button on the right
6. Replace value with your real domain:
   ```
   https://sylvan-airdrop-platform.vercel.app
   ```
7. Click **"Save"** button

### 7.3 Redeploy

1. Click **"Deployments"** in top menu
2. Click **"..."** menu next to the top deployment
3. Select **"Redeploy"**
4. Click **"Redeploy"** button again (confirmation)
5. Wait 2-3 minutes

---

## ✅ STEP 8: Test!

### 8.1 Countdown Page

Open in browser:
```
https://sylvan-airdrop-platform.vercel.app/countdown
```

**✅ Success:** 
- Countdown page is visible
- Countdown is working
- Green theme present
- "Sylvan Token" text visible

**❌ Error:**
- If you see 404 → Check Vercel logs
- Page not loading → Could be DNS/domain issue

### 8.2 Homepage Redirect

Open in browser:
```
https://sylvan-airdrop-platform.vercel.app/
```

**✅ Success:** 
- Automatically redirects to `/countdown` page

### 8.3 Admin Access

**Open incognito window**, then:
```
https://sylvan-airdrop-platform.vercel.app/?access=07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

**✅ Success:**
- Redirects to dashboard page
- You see admin panel

**❌ Error:**
- Returns to countdown → TEST_ACCESS_KEY is wrong or missing

### 8.4 Cookie Test

After admin access:

1. Open in normal window (not incognito):
   ```
   https://sylvan-airdrop-platform.vercel.app/
   ```

2. **✅ Success:** Redirects to dashboard (cookie is working)

3. Open browser DevTools (F12)
4. **Application** tab → **Cookies**
5. You should see `sylvan_test_access=granted` cookie

### 8.5 Mobile Test

Open from your phone:
```
https://sylvan-airdrop-platform.vercel.app/countdown
```

**✅ Success:** Responsive design looks good

---

## 🎯 STEP 9: Add Custom Domain (Optional)

### 9.1 Domain Settings

If you want to use a custom domain like `airdrop.sylvantoken.org`:

1. Vercel Dashboard → Your project
2. **"Settings"** → **"Domains"**
3. Click **"Add"** button
4. Enter your domain: `airdrop.sylvantoken.org`
5. Click **"Add"** button

### 9.2 DNS Settings

Vercel will show you DNS records:

**CNAME Record:**
```
Type: CNAME
Name: airdrop
Value: cname.vercel-dns.com
```

Add this record in your domain provider (e.g., Cloudflare, GoDaddy).

### 9.3 Update NEXTAUTH_URL

After adding custom domain:

1. **Settings** → **Environment Variables**
2. Update **NEXTAUTH_URL** value:
   ```
   https://airdrop.sylvantoken.org
   ```
3. **Save** and **Redeploy**

---

## 📊 STEP 10: Final Checks

### Checklist

- [ ] Code pushed to GitHub
- [ ] Project created on Vercel
- [ ] All environment variables added
- [ ] First deployment successful
- [ ] Countdown page opens
- [ ] Homepage redirect works
- [ ] Admin access key works
- [ ] Cookie is set
- [ ] Dashboard is accessible
- [ ] Looks good on mobile
- [ ] Custom domain added (optional)

---

## 🎉 Complete!

Your project is now live on Vercel!

### 🔗 Important Links

**Production URL:**
```
https://sylvan-airdrop-platform.vercel.app
```

**Admin Access:**
```
https://sylvan-airdrop-platform.vercel.app/?access=07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

**Vercel Dashboard:**
```
https://vercel.com/dashboard
```

---

## 🆘 Troubleshooting

### Build Error

**Error:** "Build failed"

**Solution:**
1. Vercel → Deployments → Latest deployment → **"View Build Logs"**
2. Read red errors
3. Usually:
   - Missing environment variable
   - Database connection error
   - TypeScript error

### 404 Error

**Error:** All pages return 404

**Solution:**
1. Check Vercel logs
2. Is middleware.ts deployed correctly?
3. Check latest commit on GitHub

### Admin Access Not Working

**Error:** Can't log in with access key

**Solution:**
1. Is TEST_ACCESS_KEY environment variable correct?
2. Did you redeploy?
3. Test in incognito window

---

## 📞 Help

If you encounter issues:

1. **Vercel Logs:** `vercel logs` (via CLI)
2. **GitHub Issues:** Open issue in your repository
3. **Documentation:** `DEPLOYMENT_TROUBLESHOOTING.md`

---

**Last Updated:** November 14, 2025
**Status:** ✅ Vercel New Project Creation Guide

**Good luck! 🚀**
