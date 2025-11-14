# Email System Quick Reference

## Quick Start

### Send an Email

```typescript
import { queueEmail } from '@/lib/email/queue';
import { getEmailTranslations } from '@/lib/email/translations';

await queueEmail({
  to: user.email,
  subject: getEmailTranslations(user.language).welcome.subject,
  template: 'welcome',
  data: {
    username: user.username,
    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    locale: user.language,
  },
});
```

### Check User Preferences

```typescript
import { shouldSendEmail } from '@/lib/email/utils';

const canSend = await shouldSendEmail(userId, 'taskCompletion');
if (canSend) {
  await queueEmail({...});
}
```

### Generate Unsubscribe Link

```typescript
import { generateUnsubscribeToken } from '@/lib/email/security';

const token = generateUnsubscribeToken(userId, 'taskCompletions');
const url = `${process.env.NEXT_PUBLIC_APP_URL}/email/unsubscribe?token=${token}`;
```

## Available Templates

| Template | Type | Trigger | Respects Preferences |
|----------|------|---------|---------------------|
| `welcome` | Transactional | User registration | No (always sent) |
| `taskCompletion` | Marketing | Task completed | Yes |
| `walletPending` | Transactional | Wallet submitted | No |
| `walletApproved` | Transactional | Wallet approved | No |
| `walletRejected` | Transactional | Wallet rejected | No |
| `adminReviewNeeded` | Admin | Review required | No |
| `adminFraudAlert` | Admin | High fraud score | No |
| `adminDailyDigest` | Admin | Daily cron | No |
| `adminErrorAlert` | Admin | System error | No |
| `unsubscribeConfirmation` | System | Unsubscribe | No |

## Email Types

### Transactional (Always Sent)
- Welcome emails
- Password resets
- Security alerts
- Wallet verification updates
- Critical platform updates

### Marketing (User Controlled)
- Task completion notifications
- Leaderboard updates
- Platform news
- Promotional emails

### Admin (Admin Only)
- Review notifications
- Fraud alerts
- Daily digests
- Error alerts

## Common Commands

```bash
# Preview templates
npm run email:dev

# Check queue status
npm run email:queue:status

# View email logs
npm run email:logs

# Test email sending
npx tsx emails/test-welcome.tsx

# Verify integration
npx tsx emails/verify-welcome.ts

# Run email tests
npm test emails/__tests__/email-templates.test.tsx
```

## Environment Variables

```env
# Required
RESEND_API_KEY=re_xxxxxxxxxxxxx
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_APP_URL=https://sylvantoken.org

# Optional
EMAIL_FROM=noreply@sylvantoken.org
EMAIL_REPLY_TO=support@sylvantoken.org
```

## API Endpoints

### User Endpoints
- `GET /api/users/email-preferences` - Get preferences
- `PUT /api/users/email-preferences` - Update preferences
- `POST /api/email/unsubscribe` - Unsubscribe

### Admin Endpoints
- `GET /api/admin/email-analytics` - View analytics
- `GET /api/admin/email-queue` - Monitor queue
- `POST /api/admin/email-queue/retry` - Retry failed

### Webhooks
- `POST /api/webhooks/resend` - Resend events

## Supported Languages

- `en` - English (default)
- `tr` - Turkish
- `de` - German
- `zh` - Chinese (Simplified)
- `ru` - Russian

## Email Preferences

```typescript
interface EmailPreference {
  taskCompletions: boolean;       // Default: true
  walletVerifications: boolean;   // Default: true
  leaderboardUpdates: boolean;    // Default: false
  platformNews: boolean;          // Default: false
  promotionalEmails: boolean;     // Default: false
  adminNotifications: boolean;    // Default: true (admins only)
}
```

## Queue Configuration

```typescript
{
  attempts: 3,                    // Retry 3 times
  backoff: {
    type: 'exponential',
    delay: 2000                   // 2s, 4s, 8s
  },
  priority: 'normal',             // high, normal, low
  removeOnComplete: true,
  removeOnFail: false
}
```

## Email Status

- `queued` - Added to queue
- `sent` - Sent to Resend
- `delivered` - Delivered to inbox
- `bounced` - Email bounced
- `failed` - Permanent failure
- `opened` - User opened email
- `clicked` - User clicked link

## Troubleshooting

### Emails Not Sending
1. Check Redis: `redis-cli ping`
2. Check queue: `npm run email:queue:status`
3. Verify API key: `echo $RESEND_API_KEY`
4. Check logs: `npm run email:logs`

### Emails in Spam
1. Verify SPF/DKIM/DMARC records
2. Check sender reputation
3. Avoid spam trigger words
4. Include unsubscribe link

### Template Errors
1. Check translations exist
2. Verify variable names
3. Test in preview mode
4. Check console for errors

## Performance Metrics

### Target Metrics
- Delivery rate: >98%
- Open rate: >25%
- Click rate: >5%
- Bounce rate: <2%
- Unsubscribe rate: <1%
- Processing time: <5s

### Alert Thresholds
- Queue length > 1000
- Failed rate > 5%
- Bounce rate > 3%
- Processing time > 30s

## Security Checklist

- ✅ SPF record configured
- ✅ DKIM signing enabled
- ✅ DMARC policy set
- ✅ Email addresses encrypted
- ✅ Secure unsubscribe tokens
- ✅ Webhook signature verification
- ✅ Rate limiting enabled
- ✅ No sensitive data in emails

## Testing Checklist

- [ ] Template renders correctly
- [ ] All variables replaced
- [ ] Links work properly
- [ ] Images load
- [ ] Unsubscribe link present
- [ ] Responsive on mobile
- [ ] Works in Gmail
- [ ] Works in Outlook
- [ ] Works in Apple Mail
- [ ] All languages display correctly

## Common Patterns

### Send Welcome Email
```typescript
await queueEmail({
  to: user.email,
  subject: t.welcome.subject,
  template: 'welcome',
  data: {
    username: user.username,
    dashboardUrl: `${baseUrl}/dashboard`,
    locale: user.language,
  },
});
```

### Send Task Completion Email
```typescript
// Check preferences first
if (await shouldSendEmail(userId, 'taskCompletion')) {
  await queueEmail({
    to: user.email,
    subject: t.taskCompletion.subject,
    template: 'taskCompletion',
    data: {
      username: user.username,
      taskName: task.name,
      points: task.points,
      totalPoints: user.points,
      locale: user.language,
    },
  });
}
```

### Send Admin Alert
```typescript
await queueEmail({
  to: 'admin@sylvantoken.org',
  subject: 'Fraud Alert',
  template: 'adminFraudAlert',
  data: {
    userId: user.id,
    username: user.username,
    fraudScore: score,
    indicators: indicators,
    adminUrl: `${baseUrl}/admin/users/${user.id}`,
    locale: 'en',
  },
  priority: 'high', // High priority for admin alerts
});
```

## File Structure

```
emails/
├── welcome.tsx
├── task-completion.tsx
├── wallet-*.tsx
├── admin-*.tsx
├── unsubscribe-confirmation.tsx
├── components/
│   ├── EmailLayout.tsx
│   ├── EmailHeader.tsx
│   ├── EmailFooter.tsx
│   └── EmailButton.tsx
├── test-*.tsx (preview files)
└── verify-*.ts (integration tests)

lib/email/
├── client.ts (Resend config)
├── queue.ts (Bull queue)
├── utils.ts (helpers)
├── translations.ts (i18n)
├── security.ts (tokens, auth)
└── logger.ts (logging)

docs/
├── EMAIL_SYSTEM.md
├── EMAIL_TEMPLATES_GUIDE.md
├── EMAIL_TROUBLESHOOTING.md
├── EMAIL_PREFERENCES.md
└── EMAIL_QUICK_REFERENCE.md (this file)
```

## Resources

- [Resend Docs](https://resend.com/docs)
- [React Email Docs](https://react.email/docs)
- [Bull Queue Docs](https://github.com/OptimalBits/bull)
- [Email CSS Support](https://www.caniemail.com/)

## Support

1. Check [Troubleshooting Guide](./EMAIL_TROUBLESHOOTING.md)
2. Review [Complete Documentation](./EMAIL_SYSTEM.md)
3. Check Resend status page
4. Contact development team
