# Vercel Deployment Guide

Complete guide for deploying the Sylvan Token Airdrop Platform to Vercel with Supabase PostgreSQL.

## ✅ Prerequisites Completed

- [x] Database migrated from SQLite to PostgreSQL
- [x] Supabase PostgreSQL configured
- [x] Prisma schema updated
- [x] All tables created successfully
- [x] Connection tested and working

## 📋 Pre-Deployment Checklist

### 1. GitHub Repository Setup

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "feat: migrate to PostgreSQL and prepare for Vercel deployment"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/sylvan-airdrop-platform.git
git branch -M main
git push -u origin main
```

### 2. Verify Environment Variables

Check that `.env` is in `.gitignore`:
```bash
# Should show .env in the list
cat .gitignore | grep .env
```

## 🚀 Vercel Deployment Steps

### Step 1: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select "sylvan-airdrop-platform"

### Step 2: Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Step 3: Add Environment Variables

Go to **Project Settings** → **Environment Variables** and add:

#### Database Configuration

```env
DATABASE_URL=postgres://username:password@host:5432/database
```

#### NextAuth Configuration

```env
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=<generate-new-secret>
```

Generate secret:
```bash
openssl rand -base64 32
```

#### Admin Credentials

```env
ADMIN_EMAIL=admin@sylvantoken.org
ADMIN_PASSWORD=<secure-password>
```

#### Application Settings

```env
NODE_ENV=production
```

#### Email Configuration (Resend)

```env
RESEND_API_KEY=re_your_resend_api_key_here
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASSWORD=re_your_resend_api_key_here
USE_REDIS=false
```

#### Supabase Configuration

```env
SUPABASE_URL=https://fahcabutajczylskmmgw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaGNhYnV0YWpjenlsc2ttbWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Mzk3MTksImV4cCI6MjA3ODUxNTcxOX0.ZiANFTDtTqsYUXBbhQLxrUVU0H-4tX38n4nbxoBSngk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaGNhYnV0YWpjenlsc2ttbWd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTcxOSwiZXhwIjoyMDc4NTE1NzE5fQ._0cz1qZDF3c-QP9CBl01zo3M1wTEvkPanJso-d629a0
SUPABASE_JWT_SECRET=Me/qAOyTMg6iDSQ/HlMbwq+rPyU0vRlQhqsKObpJnau1nWGs2faznjvGTyXDs/uFEZ7v2B7X7h0he7/F35I8tA==

NEXT_PUBLIC_SUPABASE_URL=https://fahcabutajczylskmmgw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaGNhYnV0YWpjenlsc2ttbWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Mzk3MTksImV4cCI6MjA3ODUxNTcxOX0.ZiANFTDtTqsYUXBbhQLxrUVU0H-4tX38n4nbxoBSngk
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Vercel will provide a URL: `https://your-project.vercel.app`

## 🔧 Post-Deployment Configuration

### 1. Update NEXTAUTH_URL

After first deployment, update the environment variable:

```env
NEXTAUTH_URL=https://your-actual-domain.vercel.app
```

Then redeploy:
```bash
# In Vercel Dashboard
Deployments → Latest → Redeploy
```

### 2. Seed Database (Optional)

If you want to add initial data:

```bash
# Run locally with production DATABASE_URL
npm run seed
```

Or create a Vercel Function to seed:

```typescript
// pages/api/admin/seed.ts
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Add authentication check here
  
  // Run seed logic
  // ...
  
  res.json({ success: true });
}
```

### 3. Configure Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to your custom domain

### 4. Test Deployment

Visit your deployment URL and test:

- [ ] Homepage loads
- [ ] User registration works
- [ ] User login works
- [ ] Tasks display correctly
- [ ] Task completion works
- [ ] Admin panel accessible
- [ ] Timer system works
- [ ] Theme switching works
- [ ] Background images load

## 🔍 Troubleshooting

### Build Fails

**Error: Cannot find module '@prisma/client'**

Solution: Prisma generates client during build. Ensure `postinstall` script exists:

```json
// package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Database Connection Fails

**Error: P1001 Can't reach database server**

Solutions:
1. Verify `DATABASE_URL` is correct
2. Check Supabase database is running
3. Verify IP whitelist in Supabase (should allow all for Vercel)
4. Try using pooled connection URL

### Environment Variables Not Working

**Error: NEXTAUTH_SECRET is not set**

Solutions:
1. Verify all environment variables are set in Vercel
2. Redeploy after adding variables
3. Check variable names match exactly (case-sensitive)

### Authentication Issues

**Error: Invalid callback URL**

Solution: Update `NEXTAUTH_URL` to match your Vercel domain

### Images Not Loading

**Error: 404 on background images**

Solution: Ensure images are in `public/` directory and committed to Git

## 📊 Monitoring

### Vercel Analytics

Enable in **Project Settings** → **Analytics**

### Error Tracking

Add Sentry or similar:

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Database Monitoring

Monitor in Supabase Dashboard:
- Query performance
- Connection pool usage
- Database size

## 🔄 Continuous Deployment

Vercel automatically deploys on:
- Push to `main` branch → Production
- Push to other branches → Preview deployments
- Pull requests → Preview deployments

### Deployment Workflow

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel automatically deploys
# Check deployment status in Vercel Dashboard
```

## 🔐 Security Checklist

- [ ] Change default admin password immediately
- [ ] Generate new `NEXTAUTH_SECRET`
- [ ] Verify all secrets are in Vercel (not in code)
- [ ] Enable Vercel Authentication (optional)
- [ ] Configure rate limiting
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Review Supabase security rules

## 📈 Performance Optimization

### Enable Edge Functions

For better performance, consider Edge Runtime:

```typescript
// app/api/route.ts
export const runtime = 'edge';
```

### Enable ISR (Incremental Static Regeneration)

```typescript
// app/page.tsx
export const revalidate = 3600; // Revalidate every hour
```

### Optimize Images

Vercel automatically optimizes images with Next.js Image component.

## 🎯 Production Checklist

- [ ] All environment variables set
- [ ] Database migrated and seeded
- [ ] Admin user created
- [ ] Default passwords changed
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Analytics enabled
- [ ] Error tracking configured
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

## 🎉 Success!

Your Sylvan Token Airdrop Platform is now live on Vercel with Supabase PostgreSQL!

**Deployment URL**: https://your-project.vercel.app

---

**Last Updated**: November 12, 2025
**Version**: 2.0.0 (PostgreSQL Migration)
