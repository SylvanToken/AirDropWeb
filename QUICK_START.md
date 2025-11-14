# ⚡ Quick Start - 3 Steps to Deployment

## 🔐 Your Special Access Key

```
07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```

---

## 📦 Step 1: Push to GitHub

```bash
git add .
git commit -m "Add test access with secret key"
git push origin main
```

---

## ⚙️ Step 2: Vercel Environment Variable

1. https://vercel.com/dashboard → Your Project
2. Settings → Environment Variables
3. Add New:
   ```
   Name: TEST_ACCESS_KEY
   Value: 07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
   ```
4. Save → Redeploy

---

## 🌐 Step 3: Test

### Normal Users:
```
https://airdrop.sylvantoken.org/
```
→ Sees countdown ✅

### You (Test):
```
https://airdrop.sylvantoken.org/?access=07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c
```
→ Goes to dashboard ✅

---

## ✅ Prepared Files

- `middleware.ts` - Special key control
- `public/countdown.html` - Countdown
- `.gitignore` - Git ignore
- `.env.example` - Env example

---

## 🎯 Result

✅ Existing site not broken
✅ Test access with special key
✅ Automatic login with 7-day cookie
✅ Single repo, single deployment

For details: `DEPLOYMENT_INSTRUCTIONS.md`
