# Design Document: Email Sender Configuration

## Overview

This design addresses the email sender address configuration issue where emails are currently being sent from `sylvantoken@gmail.com` instead of the intended `noreply@sylvantoken.org`. The system has two parallel email implementations:

1. **Legacy System** (`lib/email.ts`): Uses Gmail SMTP with nodemailer, which automatically overrides the "from" address with the authenticated account email
2. **Modern System** (`lib/email/`): Uses Resend API with proper sender address support

The solution involves migrating all email sending operations from the legacy Gmail SMTP system to the modern Resend-based system, ensuring consistent sender addresses across all emails.

## Current State Analysis

### Existing Email Infrastructure

**Legacy System (`lib/email.ts`)**:
- Uses nodemailer with Gmail SMTP
- Sends from `sylvantoken@gmail.com` (cannot be changed due to Gmail SMTP limitations)
- Includes rate limiting via `email-limiter.ts`
- Provides functions: `sendWelcomeEmail`, `sendVerificationEmail`, `sendPasswordResetEmail`, `sendTaskCompletionEmail`

**Modern System (`lib/email/`)**:
- Uses Resend API (`lib/email/client.ts`)
- Configured to send from `noreply@sylvantoken.org`
- Includes comprehensive features:
  - Email queue with Bull/Redis (`lib/email/queue.ts`)
  - Email logging and analytics (`lib/email/logger.ts`)
  - Security validation (`lib/email/security.ts`)
  - React Email template support
  - Webhook handling for delivery tracking

### Problem Identification

The issue occurs because some parts of the application still use the legacy `lib/email.ts` functions, which send emails through Gmail SMTP. Gmail SMTP enforces that the "from" address must match the authenticated account, overriding any custom sender address.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (API Routes, Server Actions, Background Jobs)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Email Service Facade (NEW)                      │
│  - Unified interface for all email operations               │
│  - Delegates to Resend-based system                         │
│  - Maintains backward compatibility                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           Resend Email System (lib/email/)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Client     │  │    Queue     │  │   Logger     │      │
│  │  (client.ts) │  │  (queue.ts)  │  │ (logger.ts)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Security   │  │    Utils     │  │ Translations │      │
│  │(security.ts) │  │  (utils.ts)  │  │(translations)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Resend API                                │
│  - Email delivery service                                    │
│  - Supports custom sender domains                           │
│  - Provides webhooks for tracking                           │
└─────────────────────────────────────────────────────────────┘
```

### Migration Strategy

**Phase 1: Create Compatibility Layer**
- Create wrapper functions in `lib/email.ts` that delegate to the modern system
- Maintain existing function signatures for backward compatibility
- Preserve rate limiting behavior

**Phase 2: Update Environment Configuration**
- Ensure `RESEND_API_KEY` is configured
- Set `EMAIL_FROM` to `noreply@sylvantoken.org`
- Set `EMAIL_FROM_NAME` to `Sylvan Token`

**Phase 3: Deprecate Legacy Code**
- Mark old Gmail SMTP code as deprecated
- Add migration notices in code comments
- Keep legacy code temporarily for rollback capability

## Components and Interfaces

### 1. Email Service Facade (`lib/email.ts` - Updated)

This file will be updated to act as a facade that delegates to the modern Resend system while maintaining backward compatibility.

```typescript
// lib/email.ts (Updated)

import { queueEmail } from './email/queue';
import { emailConfig } from './email/client';

/**
 * @deprecated Use queueEmail from lib/email/queue instead
 * Maintained for backward compatibility
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}): Promise<{ success: boolean; messageId?: string; error?: any }> {
  try {
    await queueEmail({
      to: options.to,
      subject: options.subject,
      html: options.html || '',
      text: options.text,
    });
    return { success: true, messageId: 'queued' };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * @deprecated Use queueWelcomeEmail from lib/email/queue instead
 */
export async function sendWelcomeEmail(
  to: string,
  username: string,
  userId: string
): Promise<{ success: boolean; messageId?: string; error?: any }> {
  try {
    const { queueWelcomeEmail } = await import('./email/queue');
    await queueWelcomeEmail(userId, to, username, 'en');
    return { success: true, messageId: 'queued' };
  } catch (error) {
    return { success: false, error };
  }
}

// Similar wrappers for other email functions...
```

### 2. Environment Configuration

**Required Environment Variables**:
```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email Sender Configuration
EMAIL_FROM=noreply@sylvantoken.org
EMAIL_FROM_NAME=Sylvan Token

# Email Reply-To
EMAIL_REPLY_TO=support@sylvantoken.org

# Optional: Redis for email queue
USE_REDIS=true
REDIS_URL=redis://localhost:6379
```

**Configuration Validation**:
- Check for `RESEND_API_KEY` on application startup
- Log warnings if email configuration is incomplete
- Provide clear error messages for missing configuration

### 3. Email Client Configuration (`lib/email/client.ts`)

The existing email client already supports custom sender addresses. Configuration is defined in `emailConfig`:

```typescript
export const emailConfig = {
  from: 'Sylvan Token <noreply@sylvantoken.org>',
  replyTo: 'support@sylvantoken.org',
  defaultLocale: 'en',
  supportedLocales: ['en', 'tr', 'de', 'zh', 'ru'],
  maxRetries: 3,
  retryDelay: 2000,
  maxEmailSizeKb: 100,
  rateLimitPerHour: 10,
} as const;
```

**Enhancement**: Make sender configuration environment-driven:

```typescript
export const emailConfig = {
  from: `${process.env.EMAIL_FROM_NAME || 'Sylvan Token'} <${process.env.EMAIL_FROM || 'noreply@sylvantoken.org'}>`,
  replyTo: process.env.EMAIL_REPLY_TO || 'support@sylvantoken.org',
  // ... rest of config
} as const;
```

### 4. Rate Limiting Integration

The legacy system uses `lib/email-limiter.ts` for rate limiting. The modern system has rate limiting built into `lib/email/security.ts`. 

**Decision**: Use the modern system's rate limiting and deprecate `email-limiter.ts`.

**Rationale**:
- Modern system has more comprehensive security checks
- Integrated with email logging for better tracking
- Supports per-recipient rate limiting

### 5. Email Templates

The modern system already supports React Email templates through the queue system. Templates are located in the `emails/` directory and include:

- `welcome.tsx` - Welcome email for new users
- `task-completion.tsx` - Task completion notifications
- `wallet-pending.tsx` - Wallet verification pending
- `wallet-approved.tsx` - Wallet verification approved
- `wallet-rejected.tsx` - Wallet verification rejected
- Admin notification templates

**No changes needed** - templates already work with Resend.

## Data Models

### Email Log Schema

The existing `EmailLog` model in Prisma tracks all email operations:

```prisma
model EmailLog {
  id        String   @id @default(cuid())
  to        String
  subject   String
  template  String
  status    String   // queued, processing, sent, delivered, failed, bounced, opened, clicked
  error     String?
  sentAt    DateTime @default(now())
  openedAt  DateTime?
  clickedAt DateTime?
  
  @@index([status])
  @@index([sentAt])
  @@index([template])
}
```

**No schema changes required** - existing model supports all tracking needs.

### Email Preferences (Future Enhancement)

For user email preferences, the system already checks for `EmailPreference` model:

```typescript
async function checkEmailPreference(
  userId: string,
  emailType: 'taskCompletions' | 'walletVerifications' | 'adminNotifications' | 'marketingEmails'
): Promise<boolean>
```

**Note**: This model may not exist yet in the schema. If needed, it can be added later.

## Error Handling

### Configuration Errors

**Missing RESEND_API_KEY**:
```typescript
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not configured');
}
```

**Invalid Email Addresses**:
```typescript
const validation = validateEmailAddresses(recipients);
if (validation.invalid.length > 0) {
  throw new Error(`Invalid email addresses: ${errors}`);
}
```

### Delivery Errors

**Rate Limit Exceeded**:
```typescript
if (!rateLimit.allowed) {
  throw new Error(`Rate limit exceeded for ${recipient}`);
}
```

**Email Size Exceeded**:
```typescript
if (!sizeValidation.isValid) {
  throw new Error(sizeValidation.error);
}
```

### Retry Logic

The email queue automatically retries failed emails:
- **Max Retries**: 3 attempts
- **Backoff Strategy**: Exponential (2s, 4s, 8s)
- **Timeout**: 30 seconds per attempt

Failed emails are logged with detailed error information for debugging.

## Testing Strategy

### Unit Tests

**Email Client Tests** (`__tests__/email-delivery.test.ts`):
- ✅ Already exists with comprehensive coverage
- Tests email sending, queueing, logging, and webhooks
- Mocks Resend API and Bull queue

**Additional Tests Needed**:
1. Test backward compatibility wrappers in `lib/email.ts`
2. Test environment configuration validation
3. Test sender address configuration

### Integration Tests

**Email Sending Flow**:
1. Queue email with custom sender address
2. Verify email is sent via Resend
3. Check email log for correct sender
4. Verify webhook handling updates status

**Migration Tests**:
1. Call legacy `sendWelcomeEmail` function
2. Verify it delegates to modern system
3. Check email is sent from `noreply@sylvantoken.org`

### Manual Testing

**Test Script** (`scripts/test-email-sender.ts`):
```typescript
import { sendEmail } from '@/lib/email';

async function testEmailSender() {
  const result = await sendEmail({
    to: 'test@example.com',
    subject: 'Test Email Sender',
    html: '<p>Testing sender address</p>',
  });
  
  console.log('Email sent:', result);
  console.log('Check inbox for sender: Sylvan Token <noreply@sylvantoken.org>');
}

testEmailSender();
```

### Verification Checklist

- [ ] Email sent from `noreply@sylvantoken.org`
- [ ] Email displays "Sylvan Token" as sender name
- [ ] Reply-to address is `support@sylvantoken.org`
- [ ] Email logs show correct sender information
- [ ] Rate limiting works correctly
- [ ] Email templates render properly
- [ ] Webhooks update delivery status

## Security Considerations

### Email Validation

The modern system includes comprehensive security checks:
- Email address format validation
- Rate limiting per recipient
- HTML content sanitization
- Email size validation
- Spam indicator detection

### Sender Domain Authentication

**SPF Record**: Ensure Resend's SPF record is added to `sylvantoken.org` DNS:
```
v=spf1 include:_spf.resend.com ~all
```

**DKIM**: Resend automatically handles DKIM signing for verified domains.

**DMARC**: Configure DMARC policy for `sylvantoken.org`:
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@sylvantoken.org
```

### API Key Security

- Store `RESEND_API_KEY` in environment variables only
- Never commit API keys to version control
- Use different API keys for development and production
- Rotate API keys periodically

## Performance Considerations

### Email Queue

**With Redis** (Production):
- Emails are queued in Redis
- Background workers process queue
- Supports high throughput
- Automatic retry with exponential backoff

**Without Redis** (Development):
- Emails sent directly (synchronous)
- No queue overhead
- Simpler debugging
- Lower throughput

### Rate Limiting

**Resend Limits**:
- Free tier: 100 emails/day
- Paid tier: Higher limits based on plan

**Application Limits**:
- 10 emails per recipient per hour
- Configurable via `emailConfig.rateLimitPerHour`

### Monitoring

**Email Statistics**:
- Total sent, delivered, failed, bounced
- Open rate, click rate
- Delivery rate, bounce rate
- Per-template statistics

**Logging**:
- All emails logged to database
- Failed emails logged with error details
- Security events logged separately

## Migration Plan

### Step 1: Verify Resend Configuration
- Ensure `RESEND_API_KEY` is set
- Verify domain is configured in Resend dashboard
- Test email sending with Resend API

### Step 2: Update Legacy Email Functions
- Modify `lib/email.ts` to delegate to modern system
- Add deprecation notices
- Maintain backward compatibility

### Step 3: Update Environment Variables
- Set `EMAIL_FROM=noreply@sylvantoken.org`
- Set `EMAIL_FROM_NAME=Sylvan Token`
- Update `.env.example` with new variables

### Step 4: Test Email Sending
- Run test script to verify sender address
- Check email logs for correct configuration
- Verify all email types work correctly

### Step 5: Monitor and Validate
- Monitor email delivery rates
- Check for any errors or bounces
- Verify sender address in received emails

### Step 6: Clean Up (Future)
- Remove Gmail SMTP configuration
- Delete `email-limiter.ts` (after confirming modern rate limiting works)
- Remove nodemailer dependency

## Rollback Plan

If issues occur during migration:

1. **Immediate Rollback**: Revert `lib/email.ts` changes to use Gmail SMTP
2. **Investigate**: Check Resend API status, configuration, and logs
3. **Fix**: Address configuration or code issues
4. **Retry**: Attempt migration again after fixes

**Rollback Trigger Conditions**:
- Email delivery rate drops below 90%
- Bounce rate exceeds 5%
- Critical emails fail to send
- Resend API unavailable

## Future Enhancements

### Email Preferences
- Add `EmailPreference` model to database
- Allow users to opt-out of specific email types
- Provide preference management UI

### Email Analytics Dashboard
- Visualize email statistics
- Track delivery trends over time
- Identify problematic email templates

### Advanced Templates
- A/B testing for email templates
- Personalization based on user data
- Dynamic content based on locale

### Webhook Integration
- Implement webhook endpoint for Resend events
- Update email status in real-time
- Track opens and clicks automatically

## Dependencies

### Required Packages
- `resend` - Resend API client (already installed)
- `@react-email/components` - React Email rendering (already installed)
- `bull` - Email queue (already installed, optional with Redis)

### Optional Packages
- `ioredis` - Redis client for queue (if using Redis)

### Environment Dependencies
- Node.js 18+ (for native fetch support)
- Redis (optional, for production email queue)

## Conclusion

This design provides a comprehensive migration path from Gmail SMTP to Resend API, ensuring emails are sent from the correct sender address (`noreply@sylvantoken.org`) while maintaining backward compatibility and system reliability. The modern email system already exists and is well-tested; the migration primarily involves updating the legacy facade layer and configuration.
