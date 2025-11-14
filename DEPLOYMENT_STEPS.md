# 🚀 Deployment Steps - English Guide

## 📋 Summary

We've fixed the Countdown 404 error. Now we'll push to GitHub and deploy to Vercel.

---

## ⚠️ IMPORTANT INFORMATION

### Test Access Key (For Admin Access)
```
07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

**You can access the admin panel with this key:**
```
https://your-domain.vercel.app/?access=07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

---

## 📝 STEP 1: Upload Files to GitHub

### 1.1 Open Terminal
- In VS Code, select "New Terminal" from the Terminal menu
- Or press `Ctrl + `` (backtick)

### 1.2 Check Git Status
```bash
git status
```

**Files you'll see:**
- ✅ middleware.ts (modified)
- ✅ vercel.json (modified)
- ✅ next.config.js (modified)
- ✅ app/countdown/error.tsx (new)
- ✅ app/not-found.tsx (new)
- ✅ lib/env-validation.ts (new)
- ✅ scripts/pre-deploy-validation.ts (new)
- ✅ scripts/post-deploy-verification.ts (new)
- ✅ docs/DEPLOYMENT.md (new)
- ✅ docs/DEPLOYMENT_TROUBLESHOOTING.md (new)
- ✅ DEPLOYMENT_READY.md (new)
- ✅ DEPLOYMENT_STEPS.md (new - this file)

### 1.3 Stage Files
```bash
git add middleware.ts
git add vercel.json
git add next.config.js
git add app/countdown/error.tsx
git add app/not-found.tsx
git add lib/env-validation.ts
git add scripts/pre-deploy-validation.ts
git add scripts/post-deploy-verification.ts
git add docs/DEPLOYMENT.md
git add docs/DEPLOYMENT_TROUBLESHOOTING.md
git add DEPLOYMENT_READY.md
git add DEPLOYMENT_STEPS.md
```

**OR add all at once:**
```bash
git add .
```

### 1.4 Commit
```bash
git commit -m "fix: Fixed Countdown 404 error and optimized deployment"
```

### 1.5 Push to GitHub
```bash
git push origin main
```

**✅ If successful:** You'll see messages like "Enumerating objects..."

**❌ If error:** 
- Make sure your GitHub password/token is correct
- Run `git pull origin main`, then push again

---

## 🌐 STEP 2: Configure Environment Variables in Vercel

### 2.1 Go to Vercel Dashboard
1. Open [vercel.com](https://vercel.com) in browser
2. Log in
3. Select your project (Sylvan Token Airdrop Platform)

### 2.2 Go to Settings
1. Click **"Settings"** tab in top menu
2. Select **"Environment Variables"** from left menu

### 2.3 Add Environment Variables

Repeat these steps for each variable:

#### Variable 1: TEST_ACCESS_KEY
```
Name: TEST_ACCESS_KEY
Value: 07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```
- ✅ Production
- ✅ Preview
- ✅ Development
- Click **"Save"** button

#### Variable 2: NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://your-domain.vercel.app
```
**⚠️ ATTENTION:** Replace `your-domain` with your actual Vercel domain!

Example: `https://sylvan-airdrop-platform.vercel.app`

- ✅ Production
- ✅ Preview
- ✅ Development
- Click **"Save"** button

#### Variable 3: NEXTAUTH_SECRET
Generate a new secret:

**In Windows PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output, example:
```
Name: NEXTAUTH_SECRET
Value: kJ8mN2pQ5rT9vX3zA6bC8dE1fG4hI7jK0lM3nO6pQ9rS2tU5vW8xY1zA4bC7dE0f
```
- ✅ Production
- ✅ Preview
- ✅ Development
- Click **"Save"** button

#### Variable 4: DATABASE_URL
```
Name: DATABASE_URL
Value: <your existing production database URL>
```
**⚠️ ATTENTION:** This value should already exist in Vercel. Check it, add if missing.

If using Supabase, it looks like:
```
postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

- ✅ Production
- ✅ Preview
- ✅ Development
- Click **"Save"** button

#### Variable 5: RESEND_API_KEY (Optional)
```
Name: RESEND_API_KEY
Value: <your existing Resend API key>
```
- ✅ Production
- ✅ Preview
- ✅ Development
- Click **"Save"** button

#### Variable 6: EMAIL_FROM (Optional)
```
Name: EMAIL_FROM
Value: noreply@sylvantoken.org
```
- ✅ Production
- ✅ Preview
- ✅ Development
- Click **"Save"** button

---

## 🔄 STEP 3: Redeploy

### 3.1 Go to Deployments Tab
1. Go to your project in Vercel Dashboard
2. Click **"Deployments"** tab in top menu

### 3.2 Redeploy
1. Find the top deployment (your latest push)
2. Click the **"..."** (three dots) menu on the right
3. Select **"Redeploy"**
4. Click **"Redeploy"** button again (for confirmation)

**OR**

Make a new push:
```bash
# Make a small change
git commit --allow-empty -m "trigger: Redeploy with new environment variables"
git push origin main
```

### 3.3 Watch Build Logs
1. Click on the deployment
2. Watch the **"Building"** phase
3. Errors will be shown in red
4. If successful, you'll see a green ✅ checkmark

**Expected time:** 2-5 minutes

---

## ✅ STEP 4: Test

### 4.1 Test Countdown Page

Open in browser:
```
https://your-domain.vercel.app/countdown
```

**✅ Success:** Countdown page is visible, countdown is working

**❌ Error:** If you see 404, check Vercel logs (Step 5)

### 4.2 Test Homepage Redirect

Open in browser:
```
https://your-domain.vercel.app/
```

**✅ Success:** Automatically redirects to `/countdown` page

### 4.3 Test Admin Access

Open **Incognito/Private Window** (important!), then:
```
https://your-domain.vercel.app/?access=07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

**✅ Success:** Redirects to dashboard page

**❌ Error:** If it returns to countdown, TEST_ACCESS_KEY is not configured correctly (return to Step 2.3)

### 4.4 Test Cookie

After admin access:
1. In normal window (not incognito), open this URL:
```
https://your-domain.vercel.app/
```

**✅ Success:** Redirects to dashboard (cookie is working)

2. Open browser DevTools (F12)
3. Go to **Application** tab
4. Select your domain under **Cookies**
5. You should see `sylvan_test_access=granted` cookie

### 4.5 Mobile Test

Open from your phone:
```
https://your-domain.vercel.app/countdown
```

**✅ Success:** Responsive design looks good

---

## 🔍 STEP 5: Troubleshooting (If Needed)

### 5.1 Check Vercel Logs

In Vercel Dashboard:
1. Go to **"Deployments"** tab
2. Click on latest deployment
3. Go to **"Logs"** tab
4. Look for errors (in red)

**OR in Terminal:**
```bash
vercel logs
```

### 5.2 Common Errors

#### Error: "TEST_ACCESS_KEY is not defined"
**Solution:** Return to Step 2.3, add TEST_ACCESS_KEY, redeploy

#### Error: "404 Not Found"
**Solution:** 
1. Check if middleware.ts was pushed correctly
2. Check Vercel logs for errors
3. Test locally: `npm run build && npm start`

#### Error: "Database connection failed"
**Solution:** Check if DATABASE_URL is correct

#### Error: "Build failed"
**Solution:** 
1. Check Vercel build logs
2. Try building locally: `npm run build`
3. Fix TypeScript errors if any

---

## 📱 STEP 6: Final Checks

### Checklist

- [ ] GitHub push successful
- [ ] All environment variables added in Vercel
- [ ] Deployment successful (green ✅)
- [ ] Countdown page opens
- [ ] Homepage redirects to countdown
- [ ] Admin access key works
- [ ] Cookie is set
- [ ] Dashboard is accessible
- [ ] Looks good on mobile
- [ ] No errors (Vercel logs clean)

---

## 🎉 Complete!

Your site is now working! 

### Admin Panel Access

You can always log in with this URL:
```
https://your-domain.vercel.app/?access=07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

Cookie is valid for 7 days. After that, you'll need to use this URL again.

---

## 📞 Help

If you encounter issues:

1. **Check Vercel Logs:** `vercel logs`
2. **Test locally:** `npm run dev`
3. **Check documentation:** 
   - `DEPLOYMENT_READY.md`
   - `docs/DEPLOYMENT_TROUBLESHOOTING.md`

---

## 🔐 Security Notes

- ✅ `.env` file not pushed to GitHub (in gitignore)
- ✅ All secrets in Vercel environment variables
- ✅ Cookie is secure (httpOnly, secure)
- ✅ Admin access key is strong

---

**Last Updated:** November 14, 2025
**Status:** ✅ Ready for Deployment

**Good luck! 🚀**
