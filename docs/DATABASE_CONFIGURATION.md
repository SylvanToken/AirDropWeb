# Database Configuration Guide

## 🔄 Dual Database Setup

The project supports both SQLite (development/testing) and PostgreSQL (production).

## 📁 Current Configuration

### Development (Local)
- **Database**: SQLite
- **File**: `prisma/dev.db`
- **Provider**: `sqlite`
- **Use Case**: Local development and testing

### Production (Vercel)
- **Database**: PostgreSQL (Supabase)
- **Provider**: `postgresql`
- **Use Case**: Production deployment

## 🔧 Configuration Files

### 1. Prisma Schema (`prisma/schema.prisma`)

**For Development (Current)**:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**For Production (Switch before deploy)**:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Environment Variables

**Development (`.env`)**:
```env
# SQLite for local development
DATABASE_URL="file:./dev.db"
```

**Production (Vercel Environment Variables)**:
```env
# PostgreSQL for production
DATABASE_URL="postgres://username:password@host:5432/database"
```

## 🚀 Deployment Workflow

### Before Deploying to Vercel

1. **Update Prisma Schema**:
```prisma
// Change from sqlite to postgresql
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

2. **Commit Changes**:
```bash
git add prisma/schema.prisma
git commit -m "chore: switch to PostgreSQL for production"
git push origin main
```

3. **Vercel Will**:
   - Detect the change
   - Run `npm install`
   - Run `npx prisma generate` (via postinstall)
   - Build the application
   - Connect to PostgreSQL using `DATABASE_URL` from environment variables

### After Deployment

1. **Verify Database Connection**:
   - Check Vercel deployment logs
   - Test API endpoints
   - Verify data operations

2. **Run Seed (if needed)**:
   - Use Vercel Functions or
   - Run locally with production DATABASE_URL

## 🔄 Switching Between Databases

### Switch to SQLite (Development)

```bash
# 1. Update schema
# Change provider to "sqlite" in prisma/schema.prisma

# 2. Update .env
DATABASE_URL="file:./dev.db"

# 3. Regenerate client
npx prisma generate

# 4. Reset database
npx prisma migrate reset --force
```

### Switch to PostgreSQL (Production)

```bash
# 1. Update schema
# Change provider to "postgresql" in prisma/schema.prisma

# 2. Update .env (or use Vercel env vars)
DATABASE_URL="postgres://..."

# 3. Regenerate client
npx prisma generate

# 4. Run migrations (if needed)
# Note: Tables already exist from manual migration
npx prisma db push
```

## 📊 Database Status

### Current Setup

```
Development:  ✅ SQLite (Active)
Production:   ✅ PostgreSQL (Ready)
```

### Tables Created

Both databases have the same schema:
- User
- Campaign
- Task
- Completion
- LoginLog
- AuditLog
- EmailLog
- EmailPreference
- Role
- Workflow
- FilterPreset
- SearchHistory

## 🧪 Testing

### Local Tests (SQLite)

```bash
# Run all tests
npm test

# Tests use SQLite database
# Fast and isolated
```

### Production Tests (PostgreSQL)

```bash
# Set production DATABASE_URL temporarily
DATABASE_URL="postgres://..." npm test

# Or create .env.test with PostgreSQL URL
```

## 🔒 Security Notes

### SQLite (Development)
- ✅ File-based, no network exposure
- ✅ Fast for development
- ⚠️ Not suitable for production
- ⚠️ No concurrent write support

### PostgreSQL (Production)
- ✅ SSL/TLS encryption
- ✅ Connection pooling
- ✅ Concurrent connections
- ✅ Automatic backups (Supabase)
- ✅ Production-ready

## 📝 Migration Notes

### SQLite Migrations
- Located in `prisma/migrations/`
- 14 migrations applied
- Used for local development

### PostgreSQL Setup
- Tables created via `scripts/migrate-to-postgres.js`
- Schema matches SQLite exactly
- Ready for production use

## 🎯 Quick Reference

### Check Current Database

```bash
# View current provider
cat prisma/schema.prisma | grep provider

# View current DATABASE_URL
echo $DATABASE_URL
```

### Regenerate Prisma Client

```bash
# After changing provider
npx prisma generate
```

### Reset Database

```bash
# SQLite
npx prisma migrate reset --force

# PostgreSQL (careful!)
npx prisma migrate reset --force
```

## 🚨 Important Reminders

1. **Never commit `.env`** - Contains sensitive credentials
2. **Always test locally** before deploying
3. **Backup production data** before major changes
4. **Use PostgreSQL for production** - SQLite is development only
5. **Update schema provider** before deploying to Vercel

## 📞 Support

- **SQLite Issues**: Check `prisma/dev.db` exists
- **PostgreSQL Issues**: Verify Supabase connection
- **Migration Issues**: See `docs/TROUBLESHOOTING_GUIDE.md`
- **Deployment Issues**: See `docs/VERCEL_DEPLOYMENT_GUIDE.md`

---

**Last Updated**: November 12, 2025
**Current Status**: Development (SQLite) | Production Ready (PostgreSQL)
