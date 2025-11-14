# Email Logging System

## Overview

The email logging system provides comprehensive tracking of all email operations in the Sylvan Token Airdrop Platform. It logs email sending attempts, delivery status, user engagement (opens and clicks), and error details for debugging.

## Features

- **Comprehensive Logging**: Tracks all email lifecycle events from queue to delivery
- **Delivery Tracking**: Monitors email delivery status and bounce events
- **Engagement Tracking**: Records when users open emails and click links
- **Error Logging**: Captures detailed error information for failed emails
- **Analytics**: Provides statistics and insights on email performance
- **Template Performance**: Tracks metrics by email template type

## Architecture

### Components

1. **Logger Module** (`lib/email/logger.ts`)
   - Core logging functions
   - Database operations
   - Analytics and statistics

2. **Client Integration** (`lib/email/client.ts`)
   - Logs email sending attempts
   - Captures send failures

3. **Queue Integration** (`lib/email/queue.ts`)
   - Logs queue operations
   - Tracks retry attempts
   - Monitors job status

4. **Database Schema** (`prisma/schema.prisma`)
   - `EmailLog` model for storing email records
   - Indexes for efficient querying

## Email Status Lifecycle

```
queued → processing → sent → delivered → opened → clicked
                        ↓
                     failed
                        ↓
                    bounced
```

### Status Definitions

- **queued**: Email added to queue, waiting to be processed
- **processing**: Email is being rendered and sent
- **sent**: Email successfully sent to email provider (Resend)
- **delivered**: Email delivered to recipient's inbox (webhook confirmation)
- **failed**: Email failed to send (with error details)
- **bounced**: Email bounced (hard or soft bounce)
- **opened**: Recipient opened the email (tracked via pixel)
- **clicked**: Recipient clicked a link in the email

## Usage

### Basic Logging

```typescript
import { logEmail, logEmailFailure } from '@/lib/email/logger';

// Log successful email
await logEmail({
  to: 'user@example.com',
  subject: 'Welcome to Sylvan Token',
  template: 'welcome',
  status: 'sent',
  metadata: {
    locale: 'en',
    userId: 'user123',
  },
});

// Log failed email
await logEmailFailure({
  to: 'user@example.com',
  subject: 'Welcome to Sylvan Token',
  template: 'welcome',
  error: 'SMTP connection timeout',
  metadata: {
    locale: 'en',
    userId: 'user123',
  },
});
```

### Tracking Delivery Events

```typescript
import { 
  logEmailDelivery, 
  logEmailBounce, 
  logEmailOpen, 
  logEmailClick 
} from '@/lib/email/logger';

// Log delivery (from webhook)
await logEmailDelivery(emailId);

// Log bounce (from webhook)
await logEmailBounce(emailId, 'Mailbox full');

// Log open event (from webhook)
await logEmailOpen(emailId);

// Log click event (from webhook)
await logEmailClick(emailId);
```

### Querying Email Logs

```typescript
import { 
  getEmailLogsByRecipient,
  getEmailLogsByTemplate,
  getEmailLogsByStatus,
  getRecentFailedEmails,
  getRecentBouncedEmails
} from '@/lib/email/logger';

// Get all emails sent to a user
const userEmails = await getEmailLogsByRecipient('user@example.com');

// Get all welcome emails
const welcomeEmails = await getEmailLogsByTemplate('welcome');

// Get all failed emails
const failedEmails = await getEmailLogsByStatus('failed');

// Get recent failures for monitoring
const recentFailures = await getRecentFailedEmails(20);

// Get recent bounces
const recentBounces = await getRecentBouncedEmails(20);
```

### Email Analytics

```typescript
import { 
  getEmailStats,
  getEmailStatsByTemplate
} from '@/lib/email/logger';

// Get overall email statistics
const stats = await getEmailStats();
console.log(`Delivery Rate: ${stats.deliveryRate}%`);
console.log(`Open Rate: ${stats.openRate}%`);
console.log(`Click Rate: ${stats.clickRate}%`);

// Get statistics for a date range
const lastWeekStats = await getEmailStats(
  new Date('2025-01-01'),
  new Date('2025-01-07')
);

// Get statistics by template
const templateStats = await getEmailStatsByTemplate();
templateStats.forEach(stat => {
  console.log(`${stat.template}: ${stat.openRate}% open rate`);
});
```

### Data Cleanup

```typescript
import { cleanupOldEmailLogs } from '@/lib/email/logger';

// Delete logs older than 90 days (default)
const deletedCount = await cleanupOldEmailLogs();

// Delete logs older than 30 days
const deletedCount = await cleanupOldEmailLogs(30);
```

## Database Schema

```prisma
model EmailLog {
  id        String    @id @default(cuid())
  to        String
  subject   String
  template  String
  status    String    // queued, processing, sent, delivered, failed, bounced, opened, clicked
  error     String?
  sentAt    DateTime  @default(now())
  openedAt  DateTime?
  clickedAt DateTime?

  @@index([to])
  @@index([status])
  @@index([sentAt])
  @@index([template])
}
```

## Webhook Integration

To track delivery, bounce, open, and click events, you need to set up webhooks with Resend:

1. **Configure Webhook Endpoint**: Create `/api/webhooks/resend/route.ts`
2. **Handle Events**: Process webhook events and update email logs
3. **Verify Signatures**: Validate webhook signatures for security

Example webhook handler:

```typescript
// app/api/webhooks/resend/route.ts
import { logEmailDelivery, logEmailBounce, logEmailOpen, logEmailClick } from '@/lib/email/logger';

export async function POST(request: Request) {
  const event = await request.json();
  
  // Find email log by Resend ID
  const emailId = await findEmailLogByResendId(event.data.email_id);
  
  if (!emailId) {
    return Response.json({ error: 'Email not found' }, { status: 404 });
  }
  
  switch (event.type) {
    case 'email.delivered':
      await logEmailDelivery(emailId);
      break;
    case 'email.bounced':
      await logEmailBounce(emailId, event.data.bounce_reason);
      break;
    case 'email.opened':
      await logEmailOpen(emailId);
      break;
    case 'email.clicked':
      await logEmailClick(emailId);
      break;
  }
  
  return Response.json({ received: true });
}
```

## Monitoring and Alerts

### Failed Email Monitoring

Set up monitoring for failed emails:

```typescript
// Check for recent failures
const recentFailures = await getRecentFailedEmails(10);

if (recentFailures.length > 5) {
  // Alert admins about high failure rate
  console.error('High email failure rate detected!');
}
```

### Bounce Rate Monitoring

Monitor bounce rates to maintain sender reputation:

```typescript
const stats = await getEmailStats();

if (stats.bounceRate > 5) {
  // Alert: High bounce rate may affect sender reputation
  console.warn(`High bounce rate: ${stats.bounceRate}%`);
}
```

### Delivery Rate Monitoring

Track delivery rates to ensure emails reach recipients:

```typescript
const stats = await getEmailStats();

if (stats.deliveryRate < 95) {
  // Alert: Low delivery rate
  console.warn(`Low delivery rate: ${stats.deliveryRate}%`);
}
```

## Best Practices

1. **Log All Emails**: Always log email operations, even if they fail
2. **Include Metadata**: Add relevant context (user ID, locale, etc.) to logs
3. **Monitor Regularly**: Check email statistics daily
4. **Clean Up Old Logs**: Regularly delete old logs to maintain database performance
5. **Track Engagement**: Use open and click tracking to measure email effectiveness
6. **Handle Bounces**: Monitor bounce rates and remove invalid email addresses
7. **Error Details**: Always include error messages and stack traces for failed emails

## Performance Considerations

- **Async Logging**: All logging operations are non-blocking
- **Indexed Queries**: Database indexes optimize common queries
- **Batch Operations**: Use batch queries for analytics
- **Data Retention**: Implement automatic cleanup of old logs

## Security

- **No Sensitive Data**: Never log passwords or sensitive user information
- **Webhook Verification**: Always verify webhook signatures
- **Access Control**: Restrict access to email logs to admins only
- **Data Privacy**: Comply with GDPR and data retention policies

## Troubleshooting

### Logs Not Being Created

1. Check database connection
2. Verify EmailLog model exists in Prisma schema
3. Check for database migration errors
4. Review application logs for errors

### Webhook Events Not Updating Logs

1. Verify webhook endpoint is configured in Resend
2. Check webhook signature verification
3. Ensure email ID mapping is correct
4. Review webhook handler logs

### High Failure Rate

1. Check RESEND_API_KEY configuration
2. Verify email addresses are valid
3. Review error messages in logs
4. Check Resend account status and limits

## Future Enhancements

- [ ] Add support for storing Resend email IDs
- [ ] Implement email log search functionality
- [ ] Add email log export feature
- [ ] Create admin dashboard for email analytics
- [ ] Add real-time email monitoring
- [ ] Implement automated alerts for anomalies
- [ ] Add support for A/B testing tracking
- [ ] Implement email template performance comparison

## Related Documentation

- [Email System README](./README.md)
- [Email Queue Documentation](./QUEUE_README.md)
- [Email Templates Guide](../../emails/README.md)
- [Resend Documentation](https://resend.com/docs)
