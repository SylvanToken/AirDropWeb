# Deployment Guide

## Overview

This guide covers deploying the Sylvan Token Airdrop Platform to Vercel.

## Prerequisites

- GitHub account
- Vercel account (linked to GitHub)
- PostgreSQL database (Supabase recommended)
- All required environment variables

---

## Environment Variables

### Required Variables

Create these environment variables in Vercel:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Authentication
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"

# Admin Access (for pre-launch testing)
TEST_ACCESS_KEY="<generate-secure-random-key>"

# Email (Optional but recommended)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"
```

### Generating Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate TEST_ACCESS_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Deployment Steps

### 1. Prepare Repository

```bash
# Ensure all changes are committed
git status
git add .
git commit -m "Prepare for deployment"

# Push to GitHub
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository

### 3. Configure Project

**Framework Preset:** Next.js

**Build Command:**
```bash
prisma generate && prisma migrate deploy && next build
```

**Output Directory:** `.next`

**Install Command:**
```bash
npm ci
```

### 4. Add Environment Variables

In Vercel project settings:

1. Go to "Settings" → "Environment Variables"
2. Add each variable:
   - Name: `DATABASE_URL`
   - Value: Your database connection string
   - Environment: Production, Preview, Development
3. Repeat for all required variables

### 5. Deploy

Click "Deploy" button. Vercel will:
1. Clone your repository
2. Install dependencies
3. Run Prisma migrations
4. Build Next.js application
5. Deploy to production

---

## Post-Deployment Verification

### 1. Check Deployment Status

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Check deployment
vercel ls
```

### 2. Test Critical Routes

```bash
# Test countdown page
curl -I https://your-domain.vercel.app/countdown

# Expected: 200 OK

# Test root redirect
curl -I https://your-domain.vercel.app/

# Expected: 307 redirect to /countdown

# Test admin access
curl -I "https://your-domain.vercel.app/?access=YOUR_KEY"

# Expected: 307 redirect to /dashboard with Set-Cookie header
```

### 3. Run Verification Script

```bash
# Run post-deployment verification
npm run verify:deployment https://your-domain.vercel.app
```

### 4. Manual Testing

1. Visit `https://your-domain.vercel.app`
2. Verify countdown page loads
3. Test admin access with key
4. Check dashboard functionality
5. Test on mobile device
6. Test in different browsers

---

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys to production
```

### Preview Deployments

Every pull request gets a preview deployment:

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and push
git push origin feature/new-feature

# Create pull request on GitHub
# Vercel creates preview deployment
# Test at: https://your-app-git-feature-new-feature.vercel.app
```

---

## Domain Configuration

### 1. Add Custom Domain

In Vercel project settings:

1. Go to "Settings" → "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `app.sylvantoken.org`)
4. Follow DNS configuration instructions

### 2. Configure DNS

Add these records to your DNS provider:

**For apex domain (sylvantoken.org):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For subdomain (app.sylvantoken.org):**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

### 3. Update Environment Variables

```bash
# Update NEXTAUTH_URL to use custom domain
NEXTAUTH_URL="https://app.sylvantoken.org"
```

---

## Database Migrations

### Running Migrations

Migrations run automatically during deployment via build command:

```bash
prisma generate && prisma migrate deploy && next build
```

### Manual Migration

If needed, run migrations manually:

```bash
# Connect to production database
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Or use Vercel CLI
vercel env pull
npx prisma migrate deploy
```

### Creating New Migrations

```bash
# Create migration locally
npx prisma migrate dev --name add_new_feature

# Commit migration files
git add prisma/migrations
git commit -m "Add migration: add_new_feature"

# Push to GitHub
git push origin main

# Vercel runs migration automatically
```

---

## Monitoring

### 1. Vercel Analytics

Enable in project settings:
1. Go to "Analytics"
2. Enable "Web Analytics"
3. View real-time metrics

### 2. Error Tracking

Check deployment logs:

```bash
# View logs
vercel logs

# View logs for specific deployment
vercel logs [deployment-url]

# Follow logs in real-time
vercel logs --follow
```

### 3. Performance Monitoring

Use Vercel Speed Insights:
1. Go to "Speed Insights"
2. Enable feature
3. Monitor Core Web Vitals

---

## Rollback

If deployment has issues:

### Option 1: Revert in Vercel Dashboard

1. Go to "Deployments"
2. Find last working deployment
3. Click "..." menu
4. Select "Promote to Production"

### Option 2: Revert Git Commit

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

---

## Troubleshooting

See [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md) for common issues and solutions.

### Quick Checks

1. **Build failing?**
   - Check Vercel logs
   - Run `npm run build` locally
   - Check for TypeScript errors

2. **404 errors?**
   - Verify middleware configuration
   - Check environment variables
   - Test routes locally

3. **Admin access not working?**
   - Verify TEST_ACCESS_KEY is set
   - Check cookie configuration
   - Test with correct key

---

## Security Checklist

Before deploying to production:

- [ ] All environment variables are set
- [ ] TEST_ACCESS_KEY is secure and unique
- [ ] NEXTAUTH_SECRET is generated securely
- [ ] Database credentials are secure
- [ ] No secrets in code or git history
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured

---

## Performance Optimization

### 1. Enable Caching

Already configured in `next.config.js`:
- Static assets: 1 year cache
- API routes: No cache
- Pages: Dynamic based on content

### 2. Image Optimization

Use Next.js Image component:
```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={200}
/>
```

### 3. Code Splitting

Automatic with Next.js. For manual optimization:
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Review performance metrics
- Monitor uptime

**Monthly:**
- Update dependencies
- Review security advisories
- Optimize database queries
- Clean up old deployments

**Quarterly:**
- Rotate secrets (TEST_ACCESS_KEY, NEXTAUTH_SECRET)
- Review and update documentation
- Conduct security audit

---

## Support

For deployment issues:

1. Check [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md)
2. Review Vercel logs
3. Test locally
4. Contact development team

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Supabase Documentation](https://supabase.com/docs)
