# Email System Troubleshooting Guide

## Overview

This guide helps diagnose and resolve common issues with the email notification system.

## Quick Diagnostics

### Check System Health

```bash
# Check if Redis is running (required for queue)
redis-cli ping
# Should return: PONG

# Check email queue status
npm run email:queue:status

# View recent email logs
npm run email:logs
```

### Verify Configuration

```bash
# Check environment variables
echo $RESEND_API_KEY
echo $REDIS_URL
echo $NEXT_PUBLIC_APP_URL
```

## Common Issues

### 1. Emails Not Sending

#### Symptoms
- Emails queued but not delivered
- No error messages in logs
- Queue appears stuck

#### Possible Causes

**A. Queue Not Processing**

Check if queue worker is running:
```bash
# Check running processes
ps aux | grep "email-queue"

# Restart queue worker
npm run email:queue:restart
```

**B. Redis Connection Issues**

```bash
# Test Redis connection
redis-cli ping

# Check Redis logs
redis-cli info

# Restart Redis
sudo systemctl restart redis
```

**C. Invalid Resend API Key**

```typescript
// Test Resend connection
import { resend } from '@/lib/email/client';

const result = await resend.emails.send({
  from: 'test@sylvantoken.org',
  to: 'test@resend.dev',
  subject: 'Test Email',
  html: '<p>Test</p>',
});

console.log(result);
```

**D. Rate Limiting**

Check if you've exceeded Resend rate limits:
- Free plan: 100 emails/day
- Check Resend dashboard for usage

#### Solutions

1. Verify Redis is running and accessible
2. Check Resend API key is valid
3. Ensure queue worker is running
4. Check rate limits in Resend dashboard
5. Review error logs: `logs/email-errors.log`

### 2. Emails Going to Spam

#### Symptoms
- Emails delivered but in spam folder
- Low open rates
- High bounce rates

#### Possible Causes

**A. Missing Email Authentication**

Verify DNS records:
```bash
# Check SPF record
dig TXT sylvantoken.org | grep spf

# Check DKIM record
dig TXT default._domainkey.sylvantoken.org

# Check DMARC record
dig TXT _dmarc.sylvantoken.org
```

**B. Poor Sender Reputation**

Check sender reputation:
- [Google Postmaster Tools](https://postmaster.google.com/)
- [Microsoft SNDS](https://sendersupport.olc.protection.outlook.com/snds/)

**C. Spam Trigger Words**

Avoid these words in subject lines:
- Free, Winner, Congratulations
- Click here, Act now, Limited time
- $$$, !!!, ALL CAPS

#### Solutions

1. Configure SPF, DKIM, DMARC records (see `lib/email/DNS_CONFIGURATION.md`)
2. Warm up sender reputation gradually
3. Avoid spam trigger words
4. Include unsubscribe link
5. Use consistent "From" address
6. Maintain clean email list

### 3. Template Rendering Issues

#### Symptoms
- Broken layout in email clients
- Missing images
- Incorrect styling

#### Possible Causes

**A. Email Client Compatibility**

Different email clients support different CSS:
- Gmail: Limited CSS support
- Outlook: Uses Word rendering engine
- Apple Mail: Good CSS support

**B. Missing Inline Styles**

Email clients ignore external stylesheets:
```typescript
// ❌ Wrong
<div className="button">Click</div>

// ✅ Correct
<div style={{ backgroundColor: '#2d7a4f', padding: '12px' }}>
  Click
</div>
```

**C. Image Loading Issues**

```typescript
// ❌ Wrong - relative path
<img src="/images/logo.png" />

// ✅ Correct - absolute URL
<img src="https://sylvantoken.org/images/logo.png" />
```

#### Solutions

1. Use inline styles exclusively
2. Use absolute URLs for images
3. Test in multiple email clients
4. Use table-based layouts for complex designs
5. Provide alt text for images
6. Include plain text version

### 4. Translation Issues

#### Symptoms
- Wrong language displayed
- Missing translations
- Fallback to English

#### Possible Causes

**A. Missing Translation Keys**

```typescript
// Check if translation exists
const t = getEmailTranslations(locale);
if (!t.myEmail?.title) {
  console.error(`Missing translation: myEmail.title for ${locale}`);
}
```

**B. Incorrect Locale Parameter**

```typescript
// ❌ Wrong
sendEmail({ locale: 'english' });

// ✅ Correct
sendEmail({ locale: 'en' });
```

**C. Variable Substitution Errors**

```typescript
// ❌ Wrong - typo in variable name
text.replace('{{usrname}}', username);

// ✅ Correct
text.replace('{{username}}', username);
```

#### Solutions

1. Verify translation keys exist in all languages
2. Use correct locale codes (en, tr, de, zh, ru)
3. Check variable names match exactly
4. Test each language separately
5. Add fallback to English

### 5. Queue Performance Issues

#### Symptoms
- Slow email delivery
- Queue backing up
- High memory usage

#### Possible Causes

**A. Too Many Concurrent Jobs**

```typescript
// Adjust concurrency in queue config
emailQueue.process(5, async (job) => {
  // Process job
});
```

**B. Large Email Payloads**

```typescript
// Avoid storing large data in queue
// ❌ Wrong
await queueEmail({
  data: {
    largeArray: [...1000items],
  },
});

// ✅ Correct - store ID and fetch data
await queueEmail({
  data: {
    userId: user.id,
  },
});
```

**C. Redis Memory Issues**

```bash
# Check Redis memory usage
redis-cli info memory

# Clear completed jobs
redis-cli FLUSHDB
```

#### Solutions

1. Adjust queue concurrency
2. Minimize job payload size
3. Increase Redis memory limit
4. Remove completed jobs regularly
5. Monitor queue metrics

### 6. Webhook Issues

#### Symptoms
- Delivery status not updating
- Open/click events not tracked
- Webhook errors in logs

#### Possible Causes

**A. Webhook Not Configured**

Configure webhook in Resend dashboard:
- URL: `https://sylvantoken.org/api/webhooks/resend`
- Events: delivered, bounced, opened, clicked

**B. Webhook Signature Verification Failing**

```typescript
// Verify webhook signature
import { verifyWebhookSignature } from '@/lib/email/security';

const isValid = verifyWebhookSignature(
  request.body,
  request.headers.get('resend-signature')
);
```

**C. Webhook Endpoint Not Accessible**

```bash
# Test webhook endpoint
curl -X POST https://sylvantoken.org/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{"type":"email.delivered","data":{}}'
```

#### Solutions

1. Configure webhook in Resend dashboard
2. Verify webhook signature
3. Ensure endpoint is publicly accessible
4. Check firewall rules
5. Review webhook logs

### 7. Email Preferences Not Working

#### Symptoms
- Users still receiving emails after unsubscribing
- Preferences not saving
- Unsubscribe link not working

#### Possible Causes

**A. Preference Check Missing**

```typescript
// Always check preferences before sending
const preferences = await prisma.emailPreference.findUnique({
  where: { userId: user.id },
});

if (!preferences?.taskCompletions) {
  return; // Don't send
}
```

**B. Invalid Unsubscribe Token**

```typescript
// Generate secure token
import { generateUnsubscribeToken } from '@/lib/email/security';

const token = generateUnsubscribeToken(user.id, emailType);
```

**C. Database Not Updated**

```typescript
// Verify preference was saved
const updated = await prisma.emailPreference.update({
  where: { userId: user.id },
  data: { taskCompletions: false },
});

console.log('Updated:', updated);
```

#### Solutions

1. Always check preferences before sending
2. Use secure unsubscribe tokens
3. Verify database updates
4. Test unsubscribe flow end-to-end
5. Log preference changes

## Debugging Tools

### Email Logs

```typescript
// View recent email logs
const logs = await prisma.emailLog.findMany({
  where: {
    sentAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    },
  },
  orderBy: { sentAt: 'desc' },
  take: 100,
});

console.table(logs);
```

### Queue Inspection

```typescript
// Check queue status
const waiting = await emailQueue.getWaiting();
const active = await emailQueue.getActive();
const failed = await emailQueue.getFailed();

console.log({
  waiting: waiting.length,
  active: active.length,
  failed: failed.length,
});
```

### Test Email Sending

```typescript
// Send test email
import { sendTestEmail } from '@/lib/email/utils';

await sendTestEmail({
  to: 'your-email@example.com',
  template: 'welcome',
  locale: 'en',
});
```

## Error Messages

### Common Error Messages and Solutions

#### "Invalid API key"
- Check `RESEND_API_KEY` in `.env`
- Verify key is active in Resend dashboard
- Ensure no extra spaces in key

#### "Rate limit exceeded"
- Wait for rate limit to reset
- Upgrade Resend plan
- Implement email batching

#### "Connection refused to Redis"
- Start Redis: `redis-server`
- Check `REDIS_URL` in `.env`
- Verify Redis port (default: 6379)

#### "Template not found"
- Check template name spelling
- Verify template is registered
- Ensure template file exists

#### "Translation key missing"
- Add missing key to all language files
- Check for typos in key name
- Verify locale code is correct

#### "Webhook signature invalid"
- Check webhook secret in Resend
- Verify signature verification logic
- Ensure request body is not modified

## Performance Monitoring

### Key Metrics to Monitor

```typescript
// Email delivery metrics
const metrics = {
  sent: await prisma.emailLog.count({
    where: { status: 'sent' },
  }),
  delivered: await prisma.emailLog.count({
    where: { status: 'delivered' },
  }),
  bounced: await prisma.emailLog.count({
    where: { status: 'bounced' },
  }),
  failed: await prisma.emailLog.count({
    where: { status: 'failed' },
  }),
};

const deliveryRate = (metrics.delivered / metrics.sent) * 100;
const bounceRate = (metrics.bounced / metrics.sent) * 100;

console.log({
  deliveryRate: `${deliveryRate.toFixed(2)}%`,
  bounceRate: `${bounceRate.toFixed(2)}%`,
});
```

### Alert Thresholds

Set up alerts for:
- Delivery rate < 95%
- Bounce rate > 3%
- Failed emails > 5%
- Queue length > 1000
- Processing time > 30s

## Getting Help

### Before Contacting Support

1. Check this troubleshooting guide
2. Review error logs
3. Test with simple email
4. Verify configuration
5. Check Resend status page

### Information to Provide

When reporting issues, include:
- Error message (full stack trace)
- Email template being used
- Recipient email (if not sensitive)
- Timestamp of issue
- Environment (dev/staging/production)
- Recent changes to email system

### Support Resources

- Resend Documentation: https://resend.com/docs
- React Email Documentation: https://react.email/docs
- Bull Queue Documentation: https://github.com/OptimalBits/bull
- Internal Documentation: `docs/EMAIL_SYSTEM.md`

## Preventive Maintenance

### Regular Tasks

**Daily**
- Monitor email delivery rates
- Check for failed emails
- Review bounce reports

**Weekly**
- Clean up old email logs
- Review queue performance
- Check sender reputation

**Monthly**
- Update email templates
- Review email analytics
- Test all email flows
- Update translations

### Health Check Script

```typescript
// scripts/email-health-check.ts
async function checkEmailHealth() {
  const checks = {
    redis: await checkRedis(),
    resend: await checkResend(),
    queue: await checkQueue(),
    database: await checkDatabase(),
  };
  
  const allHealthy = Object.values(checks).every(c => c.healthy);
  
  if (!allHealthy) {
    await notifyAdmins({
      type: 'email_health_check_failed',
      checks,
    });
  }
  
  return checks;
}
```

## Best Practices

1. **Always Test**: Test emails before deploying
2. **Monitor Metrics**: Track delivery and engagement rates
3. **Handle Errors**: Implement proper error handling
4. **Log Everything**: Log all email attempts and results
5. **Respect Preferences**: Always check user preferences
6. **Secure Tokens**: Use secure unsubscribe tokens
7. **Clean Lists**: Remove bounced emails regularly
8. **Update Docs**: Keep documentation current

## Related Documentation

- [Email System Overview](./EMAIL_SYSTEM.md)
- [Email Templates Guide](./EMAIL_TEMPLATES_GUIDE.md)
- [Email Security Guide](../lib/email/SECURITY_GUIDE.md)
- [Email Queue Guide](../lib/email/QUEUE_README.md)
