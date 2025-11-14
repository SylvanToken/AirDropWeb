# Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. 404 Error on Countdown Page

**Symptoms:**
- Visiting the root URL or `/countdown` returns 404 error
- Page works locally but not in production

**Possible Causes:**
1. Middleware configuration blocking the route
2. Missing environment variables
3. Build failure
4. Incorrect routing configuration

**Solutions:**

**Check Middleware Configuration:**
```typescript
// middleware.ts should exclude /countdown from processing
if (pathname === '/countdown') {
  return NextResponse.next();
}
```

**Verify Environment Variables:**
```bash
# Check Vercel environment variables
vercel env ls

# Required variables:
# - DATABASE_URL
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET
# - TEST_ACCESS_KEY
```

**Check Build Logs:**
```bash
# View Vercel deployment logs
vercel logs

# Look for:
# - Build errors
# - Missing dependencies
# - TypeScript errors
# - Prisma migration errors
```

**Test Locally:**
```bash
# Build and test locally
npm run build
npm start

# Test countdown page
curl http://localhost:3333/countdown
```

---

### 2. Admin Access Not Working

**Symptoms:**
- Access key parameter doesn't grant access
- Cookie not being set
- Redirects to countdown instead of dashboard

**Possible Causes:**
1. TEST_ACCESS_KEY not set in Vercel
2. Incorrect access key
3. Cookie configuration issues
4. Middleware logic error

**Solutions:**

**Verify TEST_ACCESS_KEY:**
```bash
# Check if TEST_ACCESS_KEY is set in Vercel
vercel env ls

# Add if missing:
vercel env add TEST_ACCESS_KEY
```

**Test Access Key:**
```bash
# Test with correct key
curl -I "https://your-domain.vercel.app/?access=YOUR_KEY"

# Should return:
# - 307 redirect to /dashboard
# - Set-Cookie header with sylvan_test_access=granted
```

**Check Cookie Settings:**
```typescript
// middleware.ts cookie configuration
response.cookies.set('sylvan_test_access', 'granted', {
  maxAge: 60 * 60 * 24 * 7, // 7 days
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Must be true in production
  sameSite: 'lax',
  path: '/'
});
```

---

### 3. Redirect Loop

**Symptoms:**
- Browser shows "Too many redirects" error
- Page keeps redirecting between routes
- Cannot access any page

**Possible Causes:**
1. Middleware logic error
2. Conflicting redirect rules
3. Cookie not being read correctly

**Solutions:**

**Check Middleware Logic:**
```typescript
// Ensure countdown page is excluded
if (pathname === '/countdown') {
  return NextResponse.next(); // Don't redirect
}

// Ensure root path doesn't redirect to itself
if (pathname === '/') {
  // Check cookie, then redirect to /countdown or /dashboard
  // Never redirect to '/' again
}
```

**Clear Cookies:**
```bash
# Clear browser cookies for the domain
# Or use incognito mode for testing
```

**Check Vercel Configuration:**
```json
// vercel.json should not have conflicting rewrites
{
  "rewrites": [
    // Remove any rewrites that might cause loops
  ]
}
```

---

### 4. Build Failures

**Symptoms:**
- Deployment fails during build
- TypeScript errors
- Prisma migration errors
- Missing dependencies

**Solutions:**

**Check TypeScript Errors:**
```bash
# Run type checking locally
npx tsc --noEmit

# Fix any type errors before deploying
```

**Check Prisma Issues:**
```bash
# Generate Prisma client
npx prisma generate

# Check migrations
npx prisma migrate status

# If migrations are out of sync:
npx prisma migrate deploy
```

**Check Dependencies:**
```bash
# Ensure all dependencies are installed
npm ci

# Check for missing peer dependencies
npm ls
```

**Review Build Command:**
```json
// vercel.json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build"
}

// If migrations fail, try:
{
  "buildCommand": "prisma generate && next build"
}
```

---

### 5. Environment Variables Not Working

**Symptoms:**
- Features not working in production
- Errors about missing environment variables
- Different behavior than local

**Solutions:**

**List All Environment Variables:**
```bash
# Check what's set in Vercel
vercel env ls

# Check what's in your .env file
cat .env
```

**Add Missing Variables:**
```bash
# Add to Vercel (production)
vercel env add VARIABLE_NAME production

# Add to Vercel (preview)
vercel env add VARIABLE_NAME preview

# Add to Vercel (development)
vercel env add VARIABLE_NAME development
```

**Verify Variable Names:**
```bash
# Common mistakes:
# - Typos in variable names
# - Missing NEXT_PUBLIC_ prefix for client-side variables
# - Wrong environment (production vs preview)
```

**Test Environment Variables:**
```typescript
// Add temporary logging in middleware or API route
console.log('TEST_ACCESS_KEY:', process.env.TEST_ACCESS_KEY ? 'SET' : 'NOT SET');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
```

---

### 6. Static Assets Not Loading

**Symptoms:**
- Images not displaying
- Fonts not loading
- CSS not applying

**Solutions:**

**Check Public Folder:**
```bash
# Ensure files are in public/ directory
ls public/

# Files should be accessible at /filename
# e.g., public/logo.png → /logo.png
```

**Check Next.js Image Configuration:**
```javascript
// next.config.js
{
  images: {
    remotePatterns: [
      // Add domains for external images
      {
        protocol: 'https',
        hostname: 'github.com',
      },
    ],
  },
}
```

**Check Headers:**
```bash
# Test static asset
curl -I https://your-domain.vercel.app/favicon.ico

# Should return 200 OK with proper cache headers
```

---

## Debugging Steps

### 1. Check Vercel Logs

```bash
# View recent logs
vercel logs

# View logs for specific deployment
vercel logs [deployment-url]

# Follow logs in real-time
vercel logs --follow
```

### 2. Test Locally

```bash
# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

### 3. Test Specific Routes

```bash
# Test countdown page
curl -I https://your-domain.vercel.app/countdown

# Test root redirect
curl -I https://your-domain.vercel.app/

# Test admin access
curl -I "https://your-domain.vercel.app/?access=YOUR_KEY"

# Test 404 page
curl -I https://your-domain.vercel.app/non-existent
```

### 4. Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for JavaScript errors
4. Check Network tab for failed requests
5. Check Application tab for cookies

### 5. Use Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull

# Deploy
vercel --prod
```

---

## Prevention Checklist

Before deploying:

- [ ] Run `npm run lint` - No linting errors
- [ ] Run `npx tsc --noEmit` - No type errors
- [ ] Run `npm run build` - Build succeeds
- [ ] Test locally with `npm start`
- [ ] Verify all environment variables are set in Vercel
- [ ] Check Prisma migrations are committed
- [ ] Review middleware logic
- [ ] Test all critical routes locally
- [ ] Clear browser cache before testing

---

## Getting Help

If you're still experiencing issues:

1. **Check Vercel Status:** https://www.vercel-status.com/
2. **Review Vercel Docs:** https://vercel.com/docs
3. **Check Next.js Docs:** https://nextjs.org/docs
4. **Search GitHub Issues:** Look for similar issues in Next.js or Vercel repos
5. **Contact Support:** Reach out to Vercel support with deployment URL and error logs

---

## Rollback Procedure

If deployment is broken:

1. **Revert to Previous Deployment:**
   ```bash
   # In Vercel dashboard:
   # 1. Go to Deployments
   # 2. Find last working deployment
   # 3. Click "..." menu
   # 4. Select "Promote to Production"
   ```

2. **Revert Git Commit:**
   ```bash
   # Find last working commit
   git log

   # Revert to that commit
   git revert HEAD

   # Or reset (if not pushed)
   git reset --hard <commit-hash>

   # Push
   git push origin main
   ```

3. **Fix Issues Locally:**
   - Identify the problem
   - Fix in local environment
   - Test thoroughly
   - Deploy again

---

## Monitoring

Set up monitoring to catch issues early:

1. **Vercel Analytics:** Enable in project settings
2. **Error Tracking:** Add Sentry or similar
3. **Uptime Monitoring:** Use UptimeRobot or similar
4. **Log Aggregation:** Use Logtail or similar

---

## Contact

For urgent issues, contact the development team:
- Email: dev@sylvantoken.org
- Slack: #deployment-issues
