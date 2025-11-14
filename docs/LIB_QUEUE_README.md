# Email Queue System

## Overview

The email queue system uses Bull (backed by Redis) to handle asynchronous email sending with retry logic, comprehensive logging, and failure handling.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│   API/App   │────▶│ Queue Email  │────▶│ Redis Queue │────▶│ Processor│
│   Routes    │     │   Function   │     │   (Bull)    │     │  Worker  │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────┘
                                                                    │
                                                                    ▼
                                                              ┌──────────┐
                                                              │  Resend  │
                                                              │   API    │
                                                              └──────────┘
```

## Features

### 1. Redis Configuration

The queue supports two configuration methods:

**Option 1: Connection String**
```env
REDIS_URL="redis://localhost:6379"
```

**Option 2: Individual Parameters**
```env
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="your-password"
REDIS_DB="0"
```

### 2. Retry Logic with Exponential Backoff

- **Max Retries**: 3 attempts (configurable via `emailConfig.maxRetries`)
- **Backoff Strategy**: Exponential
- **Initial Delay**: 2000ms (2 seconds)
- **Retry Delays**: 2s → 4s → 8s

Example:
```
Attempt 1: Immediate
Attempt 2: After 2 seconds
Attempt 3: After 4 seconds
Attempt 4: After 8 seconds (final)
```

### 3. Job Priority

Emails are prioritized based on their importance:

- **Admin Emails**: Priority 1 (highest)
- **User Emails**: Priority 10 (normal)

### 4. Comprehensive Logging

Every email attempt is logged with:

- Job ID
- Recipient(s)
- Subject
- Template name
- Status (queued, processing, sent, failed, etc.)
- Error message (if failed)
- Attempt number
- Timestamp

### 5. Job Timeout

Each job has a 30-second timeout to prevent hanging jobs.

### 6. Stalled Job Recovery

- Jobs are checked for stalled state every 30 seconds
- Maximum 2 recoveries from stalled state
- After max recoveries, job is marked as failed

## Queue Events

The queue emits various events for monitoring:

### `ready`
Queue is connected to Redis and ready to process jobs.

### `active`
A job has started processing.

### `completed`
A job completed successfully.

### `failed`
A job failed (will retry if attempts remaining).

### `stalled`
A job stalled and will be recovered.

### `waiting`
A job is waiting in the queue.

### `progress`
Job progress update (if implemented).

### `error`
Queue-level error occurred.

## Usage

### Queueing an Email

```typescript
import { queueEmail } from '@/lib/email/queue';

await queueEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  template: 'welcome',
  locale: 'en',
  data: {
    username: 'John',
    dashboardUrl: 'https://example.com/dashboard',
  },
});
```

### Using Helper Functions

```typescript
// Welcome email
await queueWelcomeEmail(
  userId,
  'user@example.com',
  'john_doe',
  'en'
);

// Task completion email
await queueTaskCompletionEmail(
  userId,
  'user@example.com',
  'john_doe',
  'Daily Twitter Follow',
  50,
  1250,
  'en'
);

// Wallet verification emails
await queueWalletPendingEmail(userId, email, username, walletAddress, locale);
await queueWalletApprovedEmail(userId, email, username, walletAddress, locale);
await queueWalletRejectedEmail(userId, email, username, walletAddress, reason, locale);

// Admin notification emails
await queueAdminReviewNeededEmail(userName, userId, taskName, completionId, submittedAt, locale);
await queueAdminFraudAlertEmail(userName, userId, userEmail, fraudScore, riskLevel, reasons, locale);
await queueAdminDailyDigestEmail(date, stats, locale);
await queueAdminErrorAlertEmail(errorType, errorMessage, errorStack, severity, affectedUsers, endpoint, locale);
```

## Queue Management

### Get Queue Statistics

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

### Clear Completed Jobs

```typescript
import { clearCompletedJobs } from '@/lib/email/queue';

await clearCompletedJobs();
```

### Clear Failed Jobs

```typescript
import { clearFailedJobs } from '@/lib/email/queue';

await clearFailedJobs();
```

### Pause Queue

```typescript
import { pauseQueue } from '@/lib/email/queue';

await pauseQueue();
```

### Resume Queue

```typescript
import { resumeQueue } from '@/lib/email/queue';

await resumeQueue();
```

### Close Queue Connection

```typescript
import { closeQueue } from '@/lib/email/queue';

await closeQueue();
```

## Error Handling

### Retry Behavior

1. Job fails on first attempt
2. Bull waits 2 seconds (exponential backoff)
3. Job retries (attempt 2)
4. If fails again, waits 4 seconds
5. Job retries (attempt 3)
6. If fails again, waits 8 seconds
7. Job retries (attempt 4 - final)
8. If fails, marked as permanently failed

### Permanent Failure Handling

When a job fails after all retry attempts:

1. Logged to database with status `permanently_failed`
2. Error details captured
3. Admins notified (for critical emails)
4. Job removed from queue (but failure logged)

### Admin Notifications

Admins are notified of permanent failures for:

- Admin emails (all types)
- Welcome emails (critical for user onboarding)

## Monitoring

### Console Logs

The queue provides detailed console logging:

```
Email queued successfully (Job ID: 123): Welcome to Sylvan Token! 🌿
Processing email job 123 (attempt 1/3): Welcome to Sylvan Token! 🌿
Email job 123 completed successfully (attempt 1)
```

### Database Logs

All email attempts are logged to the database (when EmailLog model is available):

```sql
SELECT * FROM "EmailLog" 
WHERE template = 'welcome' 
ORDER BY "sentAt" DESC 
LIMIT 10;
```

### Queue Dashboard

You can use Bull Board for a visual queue dashboard:

```bash
npm install @bull-board/express @bull-board/api
```

## Production Considerations

### Redis Configuration

For production, use a managed Redis service:

- **AWS ElastiCache**
- **Redis Cloud**
- **Heroku Redis**
- **DigitalOcean Managed Redis**

### Scaling

To scale email processing:

1. Increase Redis memory
2. Add more worker processes
3. Use Bull's concurrency option:

```typescript
emailQueue.process(5, async (job) => {
  // Process up to 5 jobs concurrently
});
```

### Monitoring

Integrate with monitoring services:

- **Sentry** for error tracking
- **DataDog** for metrics
- **New Relic** for APM
- **Bull Board** for queue visualization

### Security

1. Use strong Redis password
2. Enable Redis AUTH
3. Use TLS for Redis connections
4. Restrict Redis network access
5. Rotate credentials regularly

## Troubleshooting

### Queue Not Processing Jobs

1. Check Redis connection:
   ```bash
   redis-cli ping
   ```

2. Check queue status:
   ```typescript
   const stats = await getQueueStats();
   console.log(stats);
   ```

3. Check for stalled jobs:
   ```typescript
   const stalled = await emailQueue.getStalled();
   console.log('Stalled jobs:', stalled.length);
   ```

### High Failure Rate

1. Check Resend API key
2. Verify email templates render correctly
3. Check Redis memory usage
4. Review error logs in database

### Slow Processing

1. Increase worker concurrency
2. Check Redis latency
3. Optimize email templates
4. Review job timeout settings

## Configuration Reference

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Full Redis connection string | `redis://localhost:6379` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | (none) |
| `REDIS_DB` | Redis database number | `0` |
| `RESEND_API_KEY` | Resend API key | (required) |
| `ADMIN_EMAILS` | Comma-separated admin emails | (required) |

### Queue Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| Max Retries | 3 | Maximum retry attempts |
| Retry Delay | 2000ms | Initial backoff delay |
| Backoff Type | Exponential | Retry delay strategy |
| Job Timeout | 30000ms | Maximum job execution time |
| Stalled Interval | 30000ms | Check for stalled jobs interval |
| Max Stalled Count | 2 | Maximum stalled recoveries |

## Best Practices

1. **Always use queueEmail()** instead of sendEmail() directly
2. **Handle errors gracefully** - don't let email failures break user flows
3. **Monitor queue statistics** regularly
4. **Clear completed jobs** periodically to save Redis memory
5. **Use appropriate priorities** for different email types
6. **Test email templates** before deploying
7. **Set up alerts** for high failure rates
8. **Review failed jobs** regularly
9. **Keep Redis updated** for security and performance
10. **Use connection pooling** in production

## Related Documentation

- [Email Client README](./README.md)
- [Email Templates](../../emails/README.md)
- [Bull Documentation](https://github.com/OptimalBits/bull)
- [Redis Documentation](https://redis.io/documentation)
- [Resend Documentation](https://resend.com/docs)
