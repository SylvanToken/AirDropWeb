# Email Security Quick Reference

## Quick Start

### 1. Validate Email Before Sending

```typescript
import { validateEmailAddress } from '@/lib/email/security';

const result = validateEmailAddress(email);
if (!result.isValid) {
  throw new Error(result.error);
}
```

### 2. Sanitize User Input

```typescript
import { sanitizeUserText } from '@/lib/email/security';

const safeName = sanitizeUserText(user.name);
const safeMessage = sanitizeUserText(user.message);
```

### 3. Encrypt Sensitive Data

```typescript
import { encryptSensitiveData } from '@/lib/email/security';

const encrypted = encryptSensitiveData(sensitiveInfo);
await prisma.emailLog.create({
  data: { encryptedData: encrypted }
});
```

### 4. Generate Secure Tokens

```typescript
import { generateUnsubscribeUrl } from '@/lib/email/utils';

const unsubscribeUrl = generateUnsubscribeUrl(
  user.id,
  'taskCompletions',
  user.locale
);
```

## Common Patterns

### Sending Secure Email

```typescript
import { sendEmail } from '@/lib/email/client';
import { sanitizeUserText } from '@/lib/email/security';

// Sanitize user input
const username = sanitizeUserText(user.username);

// Send email (security checks applied automatically)
await sendEmail({
  to: user.email,
  subject: 'Welcome!',
  html: `<p>Hello ${username}</p>`,
  template: 'welcome',
  locale: user.locale,
});
```

### Validating Multiple Emails

```typescript
import { validateEmailAddresses } from '@/lib/email/security';

const { valid, invalid } = validateEmailAddresses(emailList);

if (invalid.length > 0) {
  console.error('Invalid emails:', invalid);
}

// Send to valid emails only
await sendBulkEmail(valid);
```

### Checking Rate Limits

```typescript
import { checkEmailRateLimit } from '@/lib/email/security';

const limit = checkEmailRateLimit(user.email);
if (!limit.allowed) {
  throw new Error('Rate limit exceeded');
}

await sendEmail({ to: user.email, ... });
```

## Security Checklist

Before deploying:

- [ ] SPF record configured
- [ ] DKIM enabled in Resend
- [ ] DMARC policy set
- [ ] EMAIL_ENCRYPTION_KEY set
- [ ] All user input sanitized
- [ ] Sensitive data encrypted
- [ ] Rate limits configured
- [ ] Security logs monitored

## DNS Records

### SPF
```
v=spf1 include:_spf.resend.com ~all
```

### DMARC (Production)
```
v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@sylvantoken.org
```

## Environment Variables

```env
RESEND_API_KEY=re_xxxxx
NEXTAUTH_SECRET=your-secret
EMAIL_ENCRYPTION_KEY=your-encryption-key
```

## Testing

```bash
# Run security tests
npm test lib/email/__tests__/security.test.ts

# Test email sending
npm run test:email
```

## Monitoring

```typescript
import { getSecurityAuditLog } from '@/lib/email/security';

// Get recent security events
const events = getSecurityAuditLog(100);

// Check for blocked attempts
const blocked = events.filter(e => e.result === 'blocked');
```

## Common Issues

### Emails Going to Spam
1. Verify SPF/DKIM/DMARC
2. Check spam score
3. Warm up domain
4. Improve content

### Rate Limit Exceeded
1. Adjust limits in config
2. Use queue for bulk emails
3. Implement user-specific limits

### Token Verification Failed
1. Check NEXTAUTH_SECRET
2. Verify token not expired
3. Check for tampering

## Support

- Security Guide: `lib/email/SECURITY_GUIDE.md`
- DNS Guide: `lib/email/DNS_CONFIGURATION.md`
- Email: security@sylvantoken.org
