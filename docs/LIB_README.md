# Email System

This directory contains the email notification infrastructure for the Sylvan Token Airdrop Platform.

## Overview

The email system uses:
- **Resend** - Modern email API for reliable delivery
- **Bull** - Queue system for async email processing with retry logic
- **React Email** - Component-based email templates (templates in `/emails` directory)

## Files

### `client.ts`
Core email client with Resend configuration and sending functionality.

**Key Functions:**
- `sendEmail(options)` - Send email immediately via Resend
- `isValidEmail(email)` - Validate email address format
- `sanitizeEmailContent(content)` - Remove dangerous HTML from email content

**Configuration:**
```typescript
emailConfig = {
  from: 'Sylvan Token <noreply@sylvantoken.org>',
  replyTo: 'support@sylvantoken.org',
  defaultLocale: 'en',
  supportedLocales: ['en', 'tr', 'de', 'zh', 'ru'],
  maxRetries: 3,
  retryDelay: 2000,
}
```

### `queue.ts`
Email queue management using Bull for async processing.

**Key Functions:**
- `queueEmail(options)` - Add email to queue for async sending
- `getQueueStats()` - Get queue statistics (waiting, active, completed, failed)
- `clearCompletedJobs()` - Clean up completed jobs
- `clearFailedJobs()` - Clean up failed jobs
- `pauseQueue()` / `resumeQueue()` - Control queue processing

**Features:**
- Automatic retry with exponential backoff (3 attempts)
- Priority queue (admin emails have higher priority)
- Failed job tracking and logging

### `utils.ts`
Helper utilities for email operations.

**Key Functions:**
- `generateUnsubscribeToken(userId, emailType)` - Create secure unsubscribe token
- `parseUnsubscribeToken(token)` - Parse unsubscribe token
- `generateUnsubscribeUrl(userId, emailType, locale)` - Generate unsubscribe URL
- `maskEmail(email)` - Mask email for privacy (e.g., `joh***@example.com`)
- `maskWalletAddress(address)` - Mask wallet address (e.g., `0x1234...5678`)
- `formatPoints(points, locale)` - Format points with locale-specific formatting
- `formatDate(date, locale)` - Format date with locale-specific formatting
- `formatDateTime(date, locale)` - Format date and time with locale
- `getValidLocale(locale)` - Validate and return supported locale
- `htmlToPlainText(html)` - Convert HTML to plain text
- `batchEmailsByDomain(emails, batchSize)` - Batch emails by domain to prevent rate limiting

## Usage

### Sending Email Immediately

```typescript
import { sendEmail } from '@/lib/email/client';

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to Sylvan Token',
  html: '<h1>Welcome!</h1>',
  text: 'Welcome!',
  template: 'welcome',
  locale: 'en',
});
```

### Queueing Email for Async Processing

```typescript
import { queueEmail } from '@/lib/email/queue';

await queueEmail({
  to: 'user@example.com',
  subject: 'Task Completed',
  html: '<h1>Congratulations!</h1>',
  template: 'task-completion',
  locale: 'tr',
});
```

### Using Utilities

```typescript
import {
  maskEmail,
  maskWalletAddress,
  formatPoints,
  generateUnsubscribeUrl,
} from '@/lib/email/utils';

const maskedEmail = maskEmail('john@example.com'); // joh***@example.com
const maskedWallet = maskWalletAddress('0x1234567890abcdef'); // 0x1234...cdef
const formattedPoints = formatPoints(1000, 'tr'); // 1.000
const unsubscribeUrl = generateUnsubscribeUrl('user123', 'taskCompletions', 'en');
```

## Environment Variables

Required in `.env`:

```bash
# Resend API Key (get from https://resend.com)
RESEND_API_KEY="re_your_api_key_here"

# Redis URL for email queue (optional, defaults to localhost)
REDIS_URL="redis://localhost:6379"

# Application URL for links in emails
NEXTAUTH_URL="http://localhost:3005"
```

## Email Queue

The email queue uses Bull with Redis for reliable async processing:

- **Automatic Retries**: Failed emails retry up to 3 times with exponential backoff (2s, 4s, 8s)
- **Priority Queue**: Admin emails have priority 1, others have priority 10
- **Job Cleanup**: Completed jobs are automatically removed
- **Failed Job Tracking**: Failed jobs are kept for admin review
- **Comprehensive Logging**: All email attempts are logged with status and error details
- **Stalled Job Recovery**: Automatic recovery of stalled jobs
- **Admin Notifications**: Alerts for permanent email failures

For detailed queue documentation, see [QUEUE_README.md](./QUEUE_README.md).

### Queue Statistics

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

### Queue Management API

Admins can monitor and manage the queue via API:

```bash
# Get queue statistics
GET /api/admin/email-queue

# Clear completed jobs
POST /api/admin/email-queue
{ "action": "clear-completed" }

# Clear failed jobs
POST /api/admin/email-queue
{ "action": "clear-failed" }

# Pause queue
POST /api/admin/email-queue
{ "action": "pause" }

# Resume queue
POST /api/admin/email-queue
{ "action": "resume" }

# Retry all failed jobs
POST /api/admin/email-queue
{ "action": "retry-failed" }
```

## Email Logging

All emails are comprehensively logged to the database for tracking and analytics:

- **Sent emails** with status 'sent'
- **Failed emails** with detailed error messages
- **Delivery status** updates via webhooks
- **Open and click events** for engagement tracking
- **Bounce events** for email validation

### Logging Functions

```typescript
import {
  logEmail,
  logEmailFailure,
  logEmailDelivery,
  logEmailBounce,
  logEmailOpen,
  logEmailClick,
  getEmailStats,
  getEmailStatsByTemplate,
} from '@/lib/email/logger';

// Log successful email
await logEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  template: 'welcome',
  status: 'sent',
});

// Log failed email
await logEmailFailure({
  to: 'user@example.com',
  subject: 'Welcome',
  template: 'welcome',
  error: 'SMTP timeout',
});

// Get email statistics
const stats = await getEmailStats();
console.log(`Delivery Rate: ${stats.deliveryRate}%`);
console.log(`Open Rate: ${stats.openRate}%`);
```

For detailed logging documentation, see [LOGGING_README.md](./LOGGING_README.md).

## Security

- Email addresses are validated before sending
- HTML content is sanitized to prevent injection
- Unsubscribe tokens are securely generated
- Sensitive data (passwords, full wallet addresses) are never included in emails

## Next Steps

1. **Task 3**: Add EmailLog and EmailPreference models to Prisma schema
2. **Task 4**: Create email translation system
3. **Task 5**: Create base email components with React Email
4. **Task 6+**: Create specific email templates (welcome, task completion, etc.)

## Troubleshooting

### Emails not sending

1. Check `RESEND_API_KEY` is set in `.env`
2. Verify Resend API key is valid
3. Check email queue stats for failed jobs
4. Review console logs for error messages

### Queue not processing

1. Ensure Redis is running (if using Redis)
2. Check `REDIS_URL` is correct
3. Verify Bull queue is initialized
4. Check for stalled jobs in queue

### Failed emails

1. Check failed job logs in console
2. Review EmailLog table for error messages
3. Verify email addresses are valid
4. Check Resend dashboard for delivery issues
