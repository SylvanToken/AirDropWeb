# Admin Notification Emails Integration

This document describes the integration of admin notification emails into the Sylvan Token Airdrop Platform.

## Overview

Admin notification emails keep administrators informed about important platform events that require attention or action. The system sends automated emails for:

1. **Manual Review Needed** - When task completions require manual verification
2. **Fraud Alerts** - When high-risk user activity is detected
3. **Daily Digest** - Daily summary of platform statistics
4. **Error Alerts** - When critical system errors occur

## Requirements Implemented

- **4.1**: Manual review notifications for task completions
- **4.2**: Fraud alert emails for high-risk users
- **4.3**: Daily digest with platform statistics
- **4.4**: Error alert emails for system issues
- **4.5**: Direct links to admin pages in all emails

## Email Templates

### 1. Admin Review Needed (`admin-review-needed.tsx`)

**Triggered when**: A task completion requires manual review

**Contains**:
- User information (name, ID)
- Task details
- Completion ID and timestamp
- Direct link to verification dashboard

**Priority**: Medium (yellow badge)

### 2. Admin Fraud Alert (`admin-fraud-alert.tsx`)

**Triggered when**: User fraud score >= 60

**Contains**:
- User information
- Fraud score with visual indicator
- Risk level (HIGH or CRITICAL)
- List of fraud indicators
- Direct link to user profile

**Priority**: High/Critical (red badge)

### 3. Admin Daily Digest (`admin-daily-digest.tsx`)

**Triggered when**: Daily cron job runs (once per day)

**Contains**:
- New users count
- Task completions count
- Pending reviews count
- Total users and points
- Most popular task
- Direct link to admin dashboard

**Priority**: Normal

### 4. Admin Error Alert (`admin-error-alert.tsx`)

**Triggered when**: HIGH or CRITICAL system errors occur

**Contains**:
- Error type and message
- Severity level
- Timestamp
- Affected endpoint
- Number of affected users (if applicable)
- Stack trace (truncated)
- Direct link to error logs

**Priority**: High/Critical (based on severity)

## Integration Points

### 1. Fraud Detection (`lib/fraud-detection.ts`)

```typescript
// Automatically sends fraud alert when score >= 60
if (score >= 60) {
  const riskLevel = score >= 90 ? 'CRITICAL' : 'HIGH';
  await queueAdminFraudAlertEmail(
    userName,
    userId,
    userEmail,
    score,
    riskLevel,
    reasons,
    'en'
  );
}
```

### 2. Task Completion (`app/api/completions/route.ts`)

```typescript
// Sends review notification when manual review is needed
if (fraudCheck.needsReview) {
  await queueAdminReviewNeededEmail(
    userName,
    userId,
    taskName,
    completionId,
    submittedAt,
    'en'
  );
}
```

### 3. Daily Digest Cron Job (`app/api/cron/daily-digest/route.ts`)

```typescript
// Runs once per day to send platform statistics
await queueAdminDailyDigestEmail(
  date,
  {
    newUsers,
    taskCompletions,
    pendingReviews,
    totalUsers,
    totalPoints,
    topTask,
  },
  'en'
);
```

### 4. Error Monitoring (`lib/error-monitoring.ts`)

```typescript
// Sends error alerts for HIGH and CRITICAL errors
if (severity === 'HIGH' || severity === 'CRITICAL') {
  await queueAdminErrorAlertEmail(
    errorType,
    errorMessage,
    errorStack,
    severity,
    affectedUsers,
    endpoint,
    'en'
  );
}
```

## Configuration

### Environment Variables

Add to `.env`:

```bash
# Admin notification emails (comma-separated)
ADMIN_EMAILS="admin@sylvantoken.org,admin2@sylvantoken.org"

# Cron job security
CRON_SECRET="your-cron-secret-key"
```

### Admin Email Recipients

The system determines admin email recipients in this order:

1. **Environment Variable**: `ADMIN_EMAILS` (comma-separated list)
2. **Database Query**: All users with `role: 'ADMIN'` and valid email addresses

### Cron Job Setup

#### Option 1: Vercel Cron (Recommended for Vercel deployments)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-digest",
      "schedule": "0 9 * * *"
    }
  ]
}
```

#### Option 2: External Cron Service

Use services like:
- **Cron-job.org**
- **EasyCron**
- **GitHub Actions**

Configure to call:
```
GET https://your-domain.com/api/cron/daily-digest
Authorization: Bearer YOUR_CRON_SECRET
```

## Email Queue Functions

All admin emails are queued with high priority:

```typescript
// Queue with priority 1 (highest)
await emailQueue.add(options, {
  priority: 1, // Admin emails get priority
});
```

### Available Functions

```typescript
// Manual review notification
queueAdminReviewNeededEmail(
  userName: string,
  userId: string,
  taskName: string,
  completionId: string,
  submittedAt: string,
  locale?: string
)

// Fraud alert
queueAdminFraudAlertEmail(
  userName: string,
  userId: string,
  userEmail: string,
  fraudScore: number,
  riskLevel: 'HIGH' | 'CRITICAL',
  reasons: string[],
  locale?: string
)

// Daily digest
queueAdminDailyDigestEmail(
  date: string,
  stats: {
    newUsers: number;
    taskCompletions: number;
    pendingReviews: number;
    totalUsers: number;
    totalPoints: number;
    topTask?: { name: string; completions: number };
  },
  locale?: string
)

// Error alert
queueAdminErrorAlertEmail(
  errorType: string,
  errorMessage: string,
  errorStack: string | undefined,
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  affectedUsers?: number,
  endpoint?: string,
  locale?: string
)
```

## Error Monitoring

The error monitoring system (`lib/error-monitoring.ts`) provides utilities for reporting errors:

```typescript
import { reportError, reportApiError, reportCriticalError } from '@/lib/error-monitoring';

// Report general error
await reportError(error, 'HIGH', {
  endpoint: '/api/example',
  affectedUsers: 10,
});

// Report API error
await reportApiError(error, '/api/completions', 'HIGH');

// Report critical error
await reportCriticalError(error, 'Database connection lost', 1000);
```

### Error Severity Levels

- **LOW**: Informational, no email sent
- **MEDIUM**: Minor issues, no email sent
- **HIGH**: Serious issues, email sent to admins
- **CRITICAL**: Platform-breaking issues, email sent to admins

## Testing

### Test Individual Emails

```typescript
// Test review needed email
await queueAdminReviewNeededEmail(
  'Test User',
  'user123',
  'Test Task',
  'comp123',
  new Date().toISOString(),
  'en'
);

// Test fraud alert
await queueAdminFraudAlertEmail(
  'Suspicious User',
  'user456',
  'user@example.com',
  85,
  'HIGH',
  ['Multiple accounts detected', 'Suspicious IP'],
  'en'
);

// Test error alert
await queueAdminErrorAlertEmail(
  'DatabaseError',
  'Connection timeout',
  'Error stack trace...',
  'CRITICAL',
  100,
  '/api/completions',
  'en'
);
```

### Test Daily Digest

Call the cron endpoint manually:

```bash
curl -X GET http://localhost:3005/api/cron/daily-digest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Test Error Monitoring

```typescript
import { testErrorMonitoring } from '@/lib/error-monitoring';

// Run in development only
await testErrorMonitoring();
```

## Monitoring

### Check Email Queue Status

```typescript
import { getQueueStats } from '@/lib/email/queue';

const stats = await getQueueStats();
console.log(stats);
// {
//   waiting: 5,
//   active: 2,
//   completed: 100,
//   failed: 3,
//   delayed: 0,
//   total: 110
// }
```

### View Failed Jobs

Check the email queue for failed jobs and retry or investigate:

```typescript
import { emailQueue } from '@/lib/email/queue';

const failed = await emailQueue.getFailed();
console.log(failed);
```

## Troubleshooting

### Emails Not Sending

1. **Check admin emails configured**:
   ```bash
   echo $ADMIN_EMAILS
   ```

2. **Verify Resend API key**:
   ```bash
   echo $RESEND_API_KEY
   ```

3. **Check email queue**:
   ```typescript
   const stats = await getQueueStats();
   console.log('Failed jobs:', stats.failed);
   ```

4. **Check Redis connection** (if using Redis):
   ```bash
   redis-cli ping
   ```

### Daily Digest Not Running

1. **Verify cron job configured** (Vercel or external)
2. **Check cron secret** matches in environment
3. **Test endpoint manually**:
   ```bash
   curl -X GET https://your-domain.com/api/cron/daily-digest \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

### Fraud Alerts Not Triggering

1. **Check fraud score threshold** (must be >= 60)
2. **Verify fraud detection is running**
3. **Check console logs** for fraud detection output

### Error Alerts Not Sending

1. **Verify error severity** (must be HIGH or CRITICAL)
2. **Check error monitoring integration** in API routes
3. **Test error monitoring**:
   ```typescript
   await testErrorMonitoring();
   ```

## Best Practices

1. **Configure multiple admin emails** for redundancy
2. **Set up cron job monitoring** to ensure daily digest runs
3. **Review failed email jobs** regularly
4. **Test email templates** in all supported languages
5. **Monitor email delivery rates** via Resend dashboard
6. **Set up alerts** for email queue failures
7. **Keep admin email list updated** as team changes

## Future Enhancements

- [ ] Email preferences for admins (choose which alerts to receive)
- [ ] Slack/Discord integration for real-time alerts
- [ ] Weekly/monthly digest options
- [ ] Custom alert thresholds per admin
- [ ] Email template customization via admin panel
- [ ] Integration with external monitoring services (Sentry, DataDog)

## Related Documentation

- [Email System README](./README.md)
- [Admin Emails Summary](./ADMIN_EMAILS_SUMMARY.md)
- [Fraud Detection Guide](../docs/FRAUD_DETECTION.md)
- [Error Handling Guide](../lib/ERROR_HANDLING.md)
