# Email Notification System Documentation

## Overview

The Sylvan Token Airdrop Platform uses a comprehensive email notification system built with Resend and React Email. This system provides reliable, multilingual, and branded email communications for user engagement and platform operations.

## Architecture

### System Components

```
Email System Architecture
├── Email Client (Resend API)
├── Email Queue (Bull + Redis)
├── Email Templates (React Email)
├── Email Logging (Database)
├── Email Preferences (User Settings)
├── Email Analytics (Admin Dashboard)
└── Webhook Handler (Delivery Tracking)
```

### Technology Stack

- **Resend**: Email delivery service provider
- **React Email**: Component-based email templates
- **Bull**: Job queue for async email processing
- **Redis**: Queue storage backend
- **Prisma**: Database ORM for logging and preferences

### Data Flow

```
User Action → Queue Email → Process Queue → Send via Resend → Log Result
                                                    ↓
                                            Webhook Events
                                                    ↓
                                            Update Logs
```

## Email Templates

### Available Templates

1. **Welcome Email** (`welcome.tsx`)
   - Sent on user registration
   - Includes platform overview and next steps
   - Available in all supported languages

2. **Task Completion Email** (`task-completion.tsx`)
   - Sent when user completes a task
   - Shows points earned and total points
   - Respects user email preferences

3. **Wallet Verification Emails**
   - `wallet-pending.tsx` - Wallet submitted for review
   - `wallet-approved.tsx` - Wallet verified successfully
   - `wallet-rejected.tsx` - Wallet verification failed

4. **Admin Notification Emails**
   - `admin-review-needed.tsx` - Manual review required
   - `admin-fraud-alert.tsx` - High fraud score detected
   - `admin-daily-digest.tsx` - Daily platform summary
   - `admin-error-alert.tsx` - System error occurred

5. **Unsubscribe Confirmation** (`unsubscribe-confirmation.tsx`)
   - Confirms email preference changes

### Template Structure

All templates use a consistent layout with:
- Sylvan Token branding (logo, colors)
- Responsive design for mobile and desktop
- Multilingual support
- Unsubscribe link in footer
- Clear call-to-action buttons

## Email Preferences

### Preference Types

Users can control these email types:

- **Task Completions**: Notifications for completed tasks
- **Wallet Verifications**: Updates on wallet status
- **Marketing Emails**: Promotional content (opt-in)
- **Admin Notifications**: Platform updates (admins only)

### Transactional vs Marketing

- **Transactional**: Always sent (welcome, password reset, critical updates)
- **Marketing**: Respects user preferences (task completions, newsletters)

### Managing Preferences

Users can manage preferences via:
1. Profile settings page
2. Unsubscribe links in emails
3. Email preference center

## Email Queue System

### Queue Configuration

```typescript
// Queue settings
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000  // 2s, 4s, 8s
  },
  removeOnComplete: true,
  removeOnFail: false
}
```

### Queue Processing

- Emails are processed asynchronously
- Failed emails retry with exponential backoff
- Permanently failed emails are logged for review
- Queue can be monitored via admin dashboard

### Priority Levels

- **High**: Admin alerts, critical notifications
- **Normal**: User notifications, task completions
- **Low**: Marketing emails, digests

## Email Logging

### Logged Information

Each email attempt logs:
- Recipient email address
- Email template used
- Subject line
- Send timestamp
- Delivery status
- Error messages (if failed)
- Open/click events (via webhooks)

### Status Types

- `queued`: Added to queue
- `sent`: Successfully sent to Resend
- `delivered`: Confirmed delivered to inbox
- `bounced`: Email bounced (hard or soft)
- `failed`: Permanent failure
- `opened`: User opened email
- `clicked`: User clicked link in email

## Email Analytics

### Available Metrics

1. **Delivery Metrics**
   - Total emails sent
   - Delivery rate
   - Bounce rate (hard/soft)
   - Failed emails

2. **Engagement Metrics**
   - Open rate
   - Click rate
   - Click-to-open rate
   - Unsubscribe rate

3. **Template Performance**
   - Performance by template type
   - Best/worst performing templates
   - Engagement trends over time

4. **User Segmentation**
   - Engagement by language
   - Engagement by user type
   - Active vs inactive users

### Accessing Analytics

Admin users can view analytics at:
- `/admin/emails` - Email analytics dashboard
- Includes charts, tables, and filters
- Export data for external analysis

## Multilingual Support

### Supported Languages

- English (en) - Default
- Turkish (tr)
- German (de)
- Chinese (zh)
- Russian (ru)

### Translation System

Translations are stored in `lib/email/translations.ts`:

```typescript
export const emailTranslations = {
  en: { /* English translations */ },
  tr: { /* Turkish translations */ },
  de: { /* German translations */ },
  zh: { /* Chinese translations */ },
  ru: { /* Russian translations */ }
};
```

### Language Selection

Email language is determined by:
1. User's language preference (from profile)
2. Browser language (if no preference set)
3. Default to English

## Security & Compliance

### Authentication

- SPF records configured for domain
- DKIM signing enabled via Resend
- DMARC policy implemented

### Data Protection

- Email addresses encrypted in database
- Sensitive data never included in emails
- Wallet addresses partially masked
- Secure unsubscribe tokens

### Compliance

- CAN-SPAM compliant (unsubscribe links)
- GDPR compliant (data export, deletion)
- Transactional emails clearly identified
- Physical address in footer

## API Endpoints

### Email Management

- `POST /api/email/send` - Send email (internal use)
- `GET /api/users/email-preferences` - Get user preferences
- `PUT /api/users/email-preferences` - Update preferences
- `POST /api/email/unsubscribe` - Unsubscribe from emails

### Admin Endpoints

- `GET /api/admin/email-analytics` - Get email analytics
- `GET /api/admin/email-queue` - Monitor email queue
- `POST /api/admin/email-queue/retry` - Retry failed emails

### Webhooks

- `POST /api/webhooks/resend` - Resend webhook handler
  - Handles delivery, bounce, open, click events

## Environment Variables

Required environment variables:

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Redis Configuration (for queue)
REDIS_URL=redis://localhost:6379

# Application URLs
NEXT_PUBLIC_APP_URL=https://sylvantoken.org

# Email Configuration
EMAIL_FROM=noreply@sylvantoken.org
EMAIL_REPLY_TO=support@sylvantoken.org
```

## Performance Considerations

### Optimization Strategies

1. **Queue System**: Async processing prevents blocking
2. **Template Caching**: Templates compiled once
3. **Batch Processing**: Group similar emails
4. **Rate Limiting**: Respect Resend limits
5. **Image CDN**: Host images on CDN

### Rate Limits

Resend rate limits (varies by plan):
- Free: 100 emails/day
- Pro: 50,000 emails/month
- Enterprise: Custom limits

## Monitoring & Alerts

### Health Checks

Monitor these metrics:
- Queue length (alert if > 1000)
- Failed email rate (alert if > 5%)
- Bounce rate (alert if > 3%)
- Processing time (alert if > 30s)

### Admin Alerts

Admins receive alerts for:
- High bounce rates
- Queue processing failures
- Webhook delivery issues
- Unusual sending patterns

## Best Practices

### Email Design

1. Keep subject lines under 50 characters
2. Use clear, actionable CTAs
3. Optimize for mobile devices
4. Include plain text version
5. Test across email clients

### Content Guidelines

1. Use personalization ({{username}})
2. Keep content concise and scannable
3. Include clear next steps
4. Maintain consistent branding
5. Provide value in every email

### Deliverability

1. Maintain clean email lists
2. Monitor bounce rates
3. Respect unsubscribe requests
4. Avoid spam trigger words
5. Authenticate emails properly

## Testing

### Development Testing

Use Resend test mode:
```typescript
// In development
const resend = new Resend(process.env.RESEND_API_KEY);
// Emails sent to test@resend.dev
```

### Email Preview

Preview emails locally:
```bash
npm run email:dev
# Opens React Email preview at localhost:3000
```

### Test Scripts

Available test scripts:
- `emails/test-welcome.tsx` - Test welcome email
- `emails/test-task-completion.tsx` - Test task email
- `emails/verify-*.ts` - Verification scripts

## Troubleshooting

See [EMAIL_TROUBLESHOOTING.md](./EMAIL_TROUBLESHOOTING.md) for detailed troubleshooting guide.

## Related Documentation

- [Email Templates Guide](../emails/README.md)
- [Email Security Guide](../lib/email/SECURITY_GUIDE.md)
- [Email Queue Guide](../lib/email/QUEUE_README.md)
- [Email Analytics Guide](./EMAIL_ANALYTICS.md)

## Support

For issues or questions:
- Check troubleshooting guide
- Review Resend documentation
- Contact development team
