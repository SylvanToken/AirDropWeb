# Time-Limited Tasks Deployment Checklist

Quick reference checklist for deploying the time-limited tasks feature.

---

## Pre-Deployment

### Code Quality
- [ ] All unit tests passing (100%)
- [ ] All integration tests passing (100%)
- [ ] Manual testing completed
- [ ] Code review approved
- [ ] No console errors or warnings
- [ ] TypeScript compilation successful
- [ ] ESLint checks passed
- [ ] No security vulnerabilities (`npm audit`)

### Documentation
- [ ] API documentation complete
- [ ] User guide created
- [ ] Deployment guide reviewed
- [ ] CHANGELOG.md updated
- [ ] README.md updated (if needed)

### Database
- [ ] Migration files created
- [ ] Migration tested locally
- [ ] Rollback migration prepared
- [ ] Backup strategy confirmed
- [ ] Indexes reviewed

### Environment
- [ ] Environment variables documented
- [ ] Staging environment ready
- [ ] Production environment ready
- [ ] Secrets/API keys secured

---

## Staging Deployment

### Preparation
- [ ] Backup staging database
- [ ] Verify environment variables
- [ ] Pull latest code
- [ ] Install dependencies (`npm ci`)
- [ ] Build application (`npm run build`)

### Database Migration
- [ ] Check migration status (`npx prisma migrate status`)
- [ ] Run migrations (`npx prisma migrate deploy`)
- [ ] Generate Prisma client (`npx prisma generate`)
- [ ] Verify schema changes in database

### Application Restart
- [ ] Restart application (PM2/systemd/Docker)
- [ ] Verify health endpoint responds
- [ ] Check application logs for errors

### Testing
- [ ] Run automated smoke tests
- [ ] Admin: Create task without time limit ✓
- [ ] Admin: Create task with time limit ✓
- [ ] Admin: Edit task duration ✓
- [ ] Admin: View audit logs ✓
- [ ] User: View organized tasks page ✓
- [ ] User: See countdown timer ✓
- [ ] User: Complete time-limited task ✓
- [ ] User: Verify expired task moves to "Missed" ✓
- [ ] User: Cannot complete expired task ✓
- [ ] User: Open task detail modal ✓
- [ ] Test timer behavior (pause/resume) ✓
- [ ] Test on mobile device ✓
- [ ] Test on multiple browsers ✓

### Performance & Security
- [ ] Load test API endpoints
- [ ] Response times acceptable (< 200ms p95)
- [ ] Verify authentication/authorization
- [ ] Test input validation
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

### Sign-Off
- [ ] All tests passed
- [ ] No critical errors in logs
- [ ] Performance metrics acceptable
- [ ] Stakeholder approval received

---

## Production Deployment

### Pre-Production
- [ ] Schedule maintenance window
- [ ] Notify users (24-48 hours advance)
- [ ] Backup production database
- [ ] Verify backup integrity
- [ ] Store backup securely (S3/backup server)
- [ ] Enable maintenance mode (optional)

### Deployment
- [ ] SSH into production server
- [ ] Pull latest code (`git pull origin main`)
- [ ] Install dependencies (`npm ci`)
- [ ] Build application (`npm run build`)
- [ ] Review pending migrations
- [ ] Run migrations (`npx prisma migrate deploy`)
- [ ] Generate Prisma client (`npx prisma generate`)
- [ ] Verify database schema changes

### Application Restart
- [ ] Restart application
- [ ] Verify health endpoint responds
- [ ] Check application logs
- [ ] Disable maintenance mode

### Smoke Tests
- [ ] Health check endpoint responds
- [ ] Database connection successful
- [ ] Create test time-limited task (API)
- [ ] Get organized tasks (API)
- [ ] Check task expiration (API)
- [ ] Admin dashboard loads
- [ ] User tasks page loads
- [ ] Countdown timer displays

### Monitoring (First 30 Minutes)
- [ ] Watch application logs
- [ ] Monitor error rate (< 0.1%)
- [ ] Check response times (< 200ms p95)
- [ ] Verify database connections
- [ ] Monitor CPU/memory usage
- [ ] Check for any user reports

---

## Post-Deployment

### First 24 Hours
- [ ] Monitor error logs hourly
- [ ] Check database performance
- [ ] Review API response times
- [ ] Monitor feature usage metrics
- [ ] Check countdown timer accuracy
- [ ] Verify expiration marking works
- [ ] Review user feedback/support tickets

### First Week
- [ ] Daily error log review
- [ ] Daily performance metrics check
- [ ] Analyze feature adoption rate
- [ ] Review completion vs. missed ratio
- [ ] Check audit logs for anomalies
- [ ] Gather user feedback
- [ ] Plan optimizations if needed

### Documentation
- [ ] Publish API documentation
- [ ] Publish user guide
- [ ] Update internal wiki
- [ ] Share deployment summary with team
- [ ] Document any issues encountered
- [ ] Update runbook if needed

---

## Rollback (If Needed)

### Decision Criteria
Rollback if:
- [ ] Critical errors in production logs
- [ ] Database migration failures
- [ ] Application won't start
- [ ] Core functionality broken
- [ ] Data corruption detected
- [ ] Performance degradation > 50%

### Rollback Steps
- [ ] Stop application
- [ ] Restore database backup (if needed)
- [ ] Revert code to previous commit
- [ ] Reinstall dependencies
- [ ] Rebuild application
- [ ] Restart application
- [ ] Verify application is working
- [ ] Notify stakeholders
- [ ] Document rollback reason
- [ ] Schedule post-mortem

---

## Success Criteria

### Technical
- ✅ Zero critical errors
- ✅ Response times < 200ms (p95)
- ✅ Error rate < 0.1%
- ✅ All features working as designed
- ✅ Database performance stable

### Business
- ✅ Users can create time-limited tasks
- ✅ Countdown timers display correctly
- ✅ Tasks expire automatically
- ✅ Expired tasks cannot be completed
- ✅ Task organization works correctly
- ✅ Audit logging captures all changes

### User Experience
- ✅ No user-reported critical issues
- ✅ Positive user feedback
- ✅ Feature adoption rate > 10% (first week)
- ✅ Task completion rate > 50% for time-limited tasks
- ✅ No accessibility complaints

---

## Notes

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Deployment Duration:** _______________  
**Issues Encountered:** _______________  
**Rollback Required:** Yes / No  
**Overall Status:** Success / Partial / Failed  

---

## Sign-Off

**Developer:** _______________ Date: _______________  
**QA Lead:** _______________ Date: _______________  
**DevOps:** _______________ Date: _______________  
**Product Manager:** _______________ Date: _______________  

---

**Version:** 1.0.0  
**Last Updated:** November 12, 2025
