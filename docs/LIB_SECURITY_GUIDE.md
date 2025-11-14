# Email Security Implementation Guide

This guide covers the security measures implemented in the email notification system for the Sylvan Token Airdrop Platform.

## Overview

The email system implements multiple layers of security to protect against:
- Email injection attacks
- XSS (Cross-Site Scripting) attacks
- Spam and phishing
- Data breaches
- Rate limiting abuse
- Invalid or malicious email addresses

## Security Features

### 1. Email Address Validation

All email addresses are validated before sending using comprehensive checks:

```typescript
import { validateEmailAddress } from '@/lib/email/security';

const result = validateEmailAddress('user@example.com');
if (!result.isValid) {
  console.error('Invalid email:', result.error);
}
```

**Validation includes:**
- RFC 5321 compliance
- Format validation (local part and domain)
- Length restrictions (max 254 characters)
- Disposable email detection
- Consecutive dots check
- Leading/trailing dots check

### 2. Content Sanitization

All HTML content is sanitized to prevent XSS attacks:

```typescript
import { sanitizeHtmlContent, sanitizeUserText } from '@/lib/email/security';

// Sanitize HTML email content
const safeHtml = sanitizeHtmlContent(userProvidedHtml);

// Sanitize plain text (escapes HTML entities)
const safeText = sanitizeUserText(userInput);
```

**Sanitization removes:**
- `<script>` tags
- `<iframe>` tags
- `<object>` and `<embed>` tags
- `<form>` tags
- Event handlers (onclick, onerror, etc.)
- `javascript:` protocol
- `data:text/html` protocol

### 3. Data Encryption

Sensitive data is encrypted before storage in the database:

```typescript
import { encryptSensitiveData, decryptSensitiveData } from '@/lib/email/security';

// Encrypt before storing
const encrypted = encryptSensitiveData(sensitiveInfo);
await prisma.emailLog.create({
  data: { encryptedData: encrypted }
});

// Decrypt when reading
const decrypted = decryptSensitiveData(record.encryptedData);
```

**Encryption details:**
- Algorithm: AES-256-CBC
- Key derivation: scrypt with salt
- Random IV for each encryption
- Format: `iv:encryptedData` (hex encoded)

### 4. Secure Tokens

Unsubscribe and tracking links use HMAC-signed tokens:

```typescript
import { generateSecureToken, verifySecureToken } from '@/lib/email/security';

// Generate token
const token = generateSecureToken(userId, 'taskCompletions');

// Verify token
const result = verifySecureToken(token);
if (result) {
  console.log('Valid token:', result.userId, result.emailType);
}
```

**Token features:**
- HMAC-SHA256 signature
- Timestamp validation (30-day expiry)
- Tamper-proof
- Base64url encoding

### 5. Rate Limiting

Prevents email bombing and abuse:

```typescript
import { checkEmailRateLimit } from '@/lib/email/security';

const limit = checkEmailRateLimit('user@example.com', 10, 3600000);
if (!limit.allowed) {
  console.log('Rate limit exceeded, resets at:', new Date(limit.resetAt!));
}
```

**Default limits:**
- 10 emails per hour per recipient
- Configurable window and max count
- Automatic cleanup of expired entries

### 6. Spam Detection

Checks email content for spam indicators:

```typescript
import { checkSpamIndicators } from '@/lib/email/security';

const check = checkSpamIndicators(subject, htmlContent);
if (check.isSpammy) {
  console.warn('Spam detected:', check.indicators);
}
```

**Spam indicators:**
- Excessive capitalization (>50% caps)
- Too many exclamation marks (>2)
- Common spam keywords
- Spam score threshold: 5

### 7. Email Size Validation

Prevents oversized emails:

```typescript
import { validateEmailSize } from '@/lib/email/security';

const validation = validateEmailSize(htmlContent, 100);
if (!validation.isValid) {
  console.error('Email too large:', validation.error);
}
```

**Limits:**
- Default: 100KB per email
- Configurable maximum size
- Returns actual size in KB

### 8. Security Audit Logging

All security events are logged:

```typescript
import { logSecurityEvent, getSecurityAuditLog } from '@/lib/email/security';

// Log event
logSecurityEvent({
  action: 'email_sent',
  recipient: 'user@example.com',
  result: 'success',
  metadata: { template: 'welcome' }
});

// Get recent events
const events = getSecurityAuditLog(100);
```

## DNS Configuration

### SPF (Sender Policy Framework)

Add this TXT record to your domain DNS:

```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**What it does:**
- Authorizes Resend to send emails on your behalf
- Prevents email spoofing
- Improves deliverability

### DKIM (DomainKeys Identified Mail)

Resend automatically configures DKIM signing. To verify:

1. Log in to your Resend dashboard
2. Go to Domains section
3. Verify DKIM is enabled for your domain
4. Add the provided DKIM records to your DNS

**What it does:**
- Cryptographically signs your emails
- Verifies email authenticity
- Prevents tampering

### DMARC (Domain-based Message Authentication)

Add this TXT record to your domain DNS:

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@sylvantoken.org; ruf=mailto:dmarc-reports@sylvantoken.org; fo=1
```

**Policy options:**
- `p=none` - Monitor only (recommended for testing)
- `p=quarantine` - Mark suspicious emails as spam
- `p=reject` - Reject unauthorized emails (strictest)

**What it does:**
- Enforces SPF and DKIM policies
- Provides reporting on email authentication
- Protects against phishing

## Environment Variables

Required environment variables for email security:

```env
# Required: Resend API key
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Required: Secret for token signing and encryption
NEXTAUTH_SECRET=your-secret-key-here

# Optional: Dedicated encryption key (falls back to NEXTAUTH_SECRET)
EMAIL_ENCRYPTION_KEY=your-encryption-key-here

# Optional: Application URL for links
NEXTAUTH_URL=https://sylvantoken.org
```

## Best Practices

### 1. Never Include Sensitive Data

❌ **Don't:**
```typescript
// Don't send passwords
await sendEmail({
  to: user.email,
  subject: 'Your password',
  html: `Your password is: ${user.password}`
});

// Don't send full wallet addresses
await sendEmail({
  to: user.email,
  subject: 'Wallet verified',
  html: `Wallet ${user.walletAddress} verified`
});
```

✅ **Do:**
```typescript
// Send password reset links
await sendEmail({
  to: user.email,
  subject: 'Reset your password',
  html: `Click here to reset: ${resetLink}`
});

// Send masked wallet addresses
import { maskWalletAddress } from '@/lib/email/utils';
await sendEmail({
  to: user.email,
  subject: 'Wallet verified',
  html: `Wallet ${maskWalletAddress(user.walletAddress)} verified`
});
```

### 2. Sanitize User Input

Always sanitize user-provided content:

```typescript
import { sanitizeUserText } from '@/lib/email/security';

const username = sanitizeUserText(user.username);
const taskName = sanitizeUserText(task.title);

await sendEmailTemplate(TaskCompletionEmail, {
  username,
  taskName,
  points: task.points
});
```

### 3. Use Secure Tokens

For unsubscribe and tracking links:

```typescript
import { generateUnsubscribeUrl } from '@/lib/email/utils';

const unsubscribeUrl = generateUnsubscribeUrl(
  user.id,
  'taskCompletions',
  user.locale
);
```

### 4. Validate Before Sending

Always validate email addresses:

```typescript
import { validateEmailAddress } from '@/lib/email/security';

const validation = validateEmailAddress(email);
if (!validation.isValid) {
  throw new Error(`Invalid email: ${validation.error}`);
}
```

### 5. Monitor Security Events

Regularly review security audit logs:

```typescript
import { getSecurityAuditLog } from '@/lib/email/security';

// Get recent security events
const events = getSecurityAuditLog(100);

// Check for blocked attempts
const blocked = events.filter(e => e.result === 'blocked');
console.log('Blocked attempts:', blocked.length);
```

## Testing Security

### Test Email Validation

```typescript
import { validateEmailAddress } from '@/lib/email/security';

// Valid emails
console.log(validateEmailAddress('user@example.com')); // { isValid: true }

// Invalid emails
console.log(validateEmailAddress('invalid')); // { isValid: false, error: '...' }
console.log(validateEmailAddress('user@tempmail.com')); // Disposable email blocked
```

### Test Content Sanitization

```typescript
import { sanitizeHtmlContent } from '@/lib/email/security';

const malicious = '<script>alert("xss")</script><p>Hello</p>';
const safe = sanitizeHtmlContent(malicious);
console.log(safe); // '<p>Hello</p>'
```

### Test Rate Limiting

```typescript
import { checkEmailRateLimit } from '@/lib/email/security';

// Send multiple emails
for (let i = 0; i < 15; i++) {
  const limit = checkEmailRateLimit('test@example.com', 10);
  console.log(`Email ${i + 1}:`, limit.allowed);
}
```

### Test Token Security

```typescript
import { generateSecureToken, verifySecureToken } from '@/lib/email/security';

const token = generateSecureToken('user123', 'welcome');
console.log('Token:', token);

const verified = verifySecureToken(token);
console.log('Verified:', verified);

// Test tampered token
const tampered = token.slice(0, -5) + 'xxxxx';
const invalid = verifySecureToken(tampered);
console.log('Tampered:', invalid); // null
```

## Troubleshooting

### Emails Not Sending

1. Check RESEND_API_KEY is configured
2. Verify email addresses are valid
3. Check rate limits haven't been exceeded
4. Review security audit logs for blocked attempts

### Emails Going to Spam

1. Verify SPF record is configured
2. Enable DKIM in Resend dashboard
3. Configure DMARC policy
4. Check spam indicators in content
5. Warm up your sending domain gradually

### Token Verification Failing

1. Verify NEXTAUTH_SECRET is consistent
2. Check token hasn't expired (30-day limit)
3. Ensure token hasn't been tampered with
4. Review security audit logs

### Rate Limit Issues

1. Adjust rate limit settings in emailConfig
2. Implement user-specific limits
3. Use queue system for bulk emails
4. Monitor rate limit events in audit log

## Security Checklist

- [ ] SPF record configured in DNS
- [ ] DKIM enabled in Resend dashboard
- [ ] DMARC policy configured
- [ ] RESEND_API_KEY environment variable set
- [ ] NEXTAUTH_SECRET environment variable set
- [ ] Email validation enabled for all sends
- [ ] Content sanitization applied to user input
- [ ] Sensitive data encrypted in database
- [ ] Rate limiting configured
- [ ] Security audit logging enabled
- [ ] Unsubscribe links use secure tokens
- [ ] Email size limits enforced
- [ ] Spam detection enabled
- [ ] Regular security audit log reviews

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [SPF Record Checker](https://mxtoolbox.com/spf.aspx)
- [DKIM Validator](https://mxtoolbox.com/dkim.aspx)
- [DMARC Analyzer](https://mxtoolbox.com/dmarc.aspx)
- [Email Security Best Practices](https://owasp.org/www-community/vulnerabilities/Email_Security)

## Support

For security concerns or questions:
- Email: security@sylvantoken.org
- Review security audit logs regularly
- Monitor Resend dashboard for delivery issues
