# DNS Configuration Guide for Email Security

This guide provides step-by-step instructions for configuring DNS records to ensure secure and reliable email delivery.

## Overview

Proper DNS configuration is essential for:
- **Email Deliverability**: Ensures emails reach inboxes, not spam folders
- **Security**: Prevents email spoofing and phishing attacks
- **Reputation**: Builds trust with email providers
- **Compliance**: Meets industry standards for email authentication

## Required DNS Records

### 1. SPF (Sender Policy Framework)

SPF authorizes which mail servers can send emails on behalf of your domain.

#### Configuration

**Record Type:** TXT  
**Name:** `@` (or your root domain)  
**Value:** `v=spf1 include:_spf.resend.com ~all`  
**TTL:** 3600 (1 hour)

#### Explanation

- `v=spf1` - SPF version 1
- `include:_spf.resend.com` - Authorizes Resend's mail servers
- `~all` - Soft fail for unauthorized servers (recommended for testing)
  - Use `-all` for strict policy (reject unauthorized)
  - Use `?all` for neutral policy (no policy)

#### Example DNS Entry

```
Type: TXT
Host: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

#### Verification

Test your SPF record:
```bash
nslookup -type=txt sylvantoken.org
```

Or use online tools:
- https://mxtoolbox.com/spf.aspx
- https://www.kitterman.com/spf/validate.html

### 2. DKIM (DomainKeys Identified Mail)

DKIM adds a digital signature to your emails to verify authenticity.

#### Configuration Steps

1. **Log in to Resend Dashboard**
   - Go to https://resend.com/domains
   - Select your domain

2. **Get DKIM Records**
   - Resend will provide 3 CNAME records
   - Copy each record's name and value

3. **Add to DNS**
   - Add each CNAME record to your DNS provider
   - Wait for DNS propagation (up to 48 hours)

#### Example DKIM Records

```
Type: CNAME
Host: resend._domainkey
Value: resend._domainkey.resend.com
TTL: 3600

Type: CNAME
Host: resend2._domainkey
Value: resend2._domainkey.resend.com
TTL: 3600

Type: CNAME
Host: resend3._domainkey
Value: resend3._domainkey.resend.com
TTL: 3600
```

#### Verification

Test your DKIM record:
```bash
nslookup -type=txt resend._domainkey.sylvantoken.org
```

Or use online tools:
- https://mxtoolbox.com/dkim.aspx
- https://dkimvalidator.com/

### 3. DMARC (Domain-based Message Authentication)

DMARC tells email providers what to do with emails that fail SPF or DKIM checks.

#### Configuration

**Record Type:** TXT  
**Name:** `_dmarc`  
**Value:** See policy options below  
**TTL:** 3600 (1 hour)

#### Policy Options

**Option 1: Monitor Only (Recommended for Testing)**
```
v=DMARC1; p=none; rua=mailto:dmarc-reports@sylvantoken.org; ruf=mailto:dmarc-reports@sylvantoken.org; fo=1
```

**Option 2: Quarantine (Recommended for Production)**
```
v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@sylvantoken.org; ruf=mailto:dmarc-reports@sylvantoken.org; fo=1; pct=100
```

**Option 3: Reject (Strictest Policy)**
```
v=DMARC1; p=reject; rua=mailto:dmarc-reports@sylvantoken.org; ruf=mailto:dmarc-reports@sylvantoken.org; fo=1; pct=100
```

#### DMARC Parameters

- `v=DMARC1` - DMARC version
- `p=` - Policy for domain
  - `none` - Monitor only, no action
  - `quarantine` - Mark as spam
  - `reject` - Reject email
- `rua=` - Aggregate report email address
- `ruf=` - Forensic report email address
- `fo=1` - Generate reports for any failure
- `pct=100` - Apply policy to 100% of emails
- `sp=` - Policy for subdomains (optional)
- `adkim=` - DKIM alignment mode (optional)
  - `r` - Relaxed (default)
  - `s` - Strict
- `aspf=` - SPF alignment mode (optional)
  - `r` - Relaxed (default)
  - `s` - Strict

#### Example DNS Entry

```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@sylvantoken.org; ruf=mailto:dmarc-reports@sylvantoken.org; fo=1; pct=100
TTL: 3600
```

#### Verification

Test your DMARC record:
```bash
nslookup -type=txt _dmarc.sylvantoken.org
```

Or use online tools:
- https://mxtoolbox.com/dmarc.aspx
- https://dmarcian.com/dmarc-inspector/

## DNS Provider-Specific Instructions

### Cloudflare

1. Log in to Cloudflare dashboard
2. Select your domain
3. Go to DNS > Records
4. Click "Add record"
5. Enter record details
6. Click "Save"

### GoDaddy

1. Log in to GoDaddy account
2. Go to My Products > DNS
3. Click "Add" under Records
4. Select record type
5. Enter record details
6. Click "Save"

### Namecheap

1. Log in to Namecheap account
2. Go to Domain List
3. Click "Manage" next to your domain
4. Go to Advanced DNS tab
5. Click "Add New Record"
6. Enter record details
7. Click "Save Changes"

### AWS Route 53

1. Log in to AWS Console
2. Go to Route 53 > Hosted Zones
3. Select your domain
4. Click "Create Record"
5. Enter record details
6. Click "Create records"

### Google Domains

1. Log in to Google Domains
2. Select your domain
3. Go to DNS tab
4. Scroll to Custom records
5. Click "Manage custom records"
6. Add record details
7. Click "Save"

## Implementation Timeline

### Phase 1: Setup (Day 1)

1. Add SPF record
2. Request DKIM records from Resend
3. Add DKIM records to DNS
4. Wait for DNS propagation (24-48 hours)

### Phase 2: Monitoring (Days 2-7)

1. Add DMARC record with `p=none` policy
2. Monitor DMARC reports
3. Verify SPF and DKIM are passing
4. Check email deliverability

### Phase 3: Enforcement (Days 8-14)

1. Update DMARC to `p=quarantine`
2. Monitor for any issues
3. Adjust policy if needed

### Phase 4: Strict Policy (Days 15+)

1. Update DMARC to `p=reject` (optional)
2. Continue monitoring
3. Maintain records

## Verification Checklist

Use this checklist to verify your DNS configuration:

- [ ] SPF record added and verified
- [ ] DKIM records added (all 3 CNAMEs)
- [ ] DKIM verified in Resend dashboard
- [ ] DMARC record added
- [ ] DNS propagation complete (24-48 hours)
- [ ] Test email sent successfully
- [ ] Test email received in inbox (not spam)
- [ ] SPF check passes (view email headers)
- [ ] DKIM check passes (view email headers)
- [ ] DMARC check passes (view email headers)
- [ ] DMARC reports being received

## Testing Email Authentication

### Send Test Email

```typescript
import { sendEmail } from '@/lib/email/client';

await sendEmail({
  to: 'your-test-email@gmail.com',
  subject: 'DNS Configuration Test',
  html: '<p>Testing SPF, DKIM, and DMARC configuration</p>',
  template: 'test',
});
```

### Check Email Headers

1. Open the test email
2. View email headers (varies by email client)
3. Look for authentication results:

```
Authentication-Results: mx.google.com;
  spf=pass (google.com: domain of noreply@sylvantoken.org designates ... as permitted sender)
  dkim=pass header.i=@sylvantoken.org
  dmarc=pass (p=QUARANTINE sp=QUARANTINE dis=NONE)
```

### Gmail

1. Open email
2. Click three dots menu
3. Select "Show original"
4. Check authentication results

### Outlook

1. Open email
2. File > Properties
3. Look in Internet headers

### Apple Mail

1. Open email
2. View > Message > All Headers
3. Check authentication results

## Troubleshooting

### SPF Issues

**Problem:** SPF check fails

**Solutions:**
- Verify SPF record syntax
- Check for multiple SPF records (only one allowed)
- Ensure `include:_spf.resend.com` is present
- Wait for DNS propagation
- Test with `nslookup -type=txt yourdomain.com`

### DKIM Issues

**Problem:** DKIM check fails

**Solutions:**
- Verify all 3 DKIM CNAME records are added
- Check CNAME values match Resend dashboard
- Wait for DNS propagation (up to 48 hours)
- Verify in Resend dashboard (should show green checkmark)
- Test with `nslookup -type=txt resend._domainkey.yourdomain.com`

### DMARC Issues

**Problem:** DMARC check fails

**Solutions:**
- Verify DMARC record is at `_dmarc.yourdomain.com`
- Check DMARC syntax is correct
- Ensure SPF and DKIM are passing first
- Start with `p=none` policy for testing
- Wait for DNS propagation
- Test with `nslookup -type=txt _dmarc.yourdomain.com`

### Emails Going to Spam

**Possible Causes:**
- SPF/DKIM/DMARC not configured
- New sending domain (needs reputation)
- High spam score in content
- Low engagement rates
- Sending too many emails too quickly

**Solutions:**
- Complete all DNS configuration
- Warm up sending domain gradually
- Improve email content quality
- Monitor spam complaints
- Use double opt-in for subscribers
- Maintain clean email list

## Monitoring and Maintenance

### DMARC Reports

You'll receive two types of reports:

**Aggregate Reports (RUA)**
- Daily summaries of email authentication results
- Shows pass/fail rates for SPF and DKIM
- Helps identify configuration issues

**Forensic Reports (RUF)**
- Real-time alerts for authentication failures
- Includes email headers and details
- Helps identify spoofing attempts

### Report Analysis Tools

- [DMARC Analyzer](https://www.dmarcanalyzer.com/)
- [Postmark DMARC](https://dmarc.postmarkapp.com/)
- [Valimail](https://www.valimail.com/)

### Regular Maintenance

- Review DMARC reports weekly
- Monitor email deliverability rates
- Check for DNS record changes
- Update records if changing email providers
- Renew domain before expiration

## Security Best Practices

1. **Use Strong Policies**
   - Start with `p=none` for testing
   - Move to `p=quarantine` after verification
   - Consider `p=reject` for maximum security

2. **Monitor Reports**
   - Set up dedicated email for DMARC reports
   - Review reports regularly
   - Investigate authentication failures

3. **Keep Records Updated**
   - Update records when changing providers
   - Verify records after DNS changes
   - Document all DNS configurations

4. **Test Regularly**
   - Send test emails monthly
   - Verify authentication passes
   - Check deliverability rates

5. **Protect Your Domain**
   - Enable domain lock at registrar
   - Use two-factor authentication
   - Restrict DNS access to authorized users

## Additional Resources

### Testing Tools

- [MXToolbox](https://mxtoolbox.com/) - Comprehensive email testing
- [Mail Tester](https://www.mail-tester.com/) - Spam score checker
- [DMARC Analyzer](https://www.dmarcanalyzer.com/) - DMARC monitoring
- [Google Postmaster Tools](https://postmaster.google.com/) - Gmail deliverability

### Documentation

- [Resend Documentation](https://resend.com/docs)
- [SPF RFC 7208](https://tools.ietf.org/html/rfc7208)
- [DKIM RFC 6376](https://tools.ietf.org/html/rfc6376)
- [DMARC RFC 7489](https://tools.ietf.org/html/rfc7489)

### Support

For DNS configuration help:
- Resend Support: support@resend.com
- DNS Provider Support: Contact your DNS provider
- Email: support@sylvantoken.org

## Quick Reference

### SPF Record
```
Type: TXT
Host: @
Value: v=spf1 include:_spf.resend.com ~all
```

### DKIM Records
```
Type: CNAME
Host: resend._domainkey
Value: [Get from Resend Dashboard]
```

### DMARC Record (Production)
```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@sylvantoken.org; fo=1
```

### Verification Commands
```bash
# Check SPF
nslookup -type=txt sylvantoken.org

# Check DKIM
nslookup -type=txt resend._domainkey.sylvantoken.org

# Check DMARC
nslookup -type=txt _dmarc.sylvantoken.org
```
