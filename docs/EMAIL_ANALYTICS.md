# Email Analytics Dashboard

## Overview

The Email Analytics Dashboard provides comprehensive insights into email delivery and engagement metrics for the Sylvan Token Airdrop Platform. This feature allows administrators to monitor email performance, identify issues, and optimize email campaigns.

## Features

### 1. Overview Statistics
- **Total Emails Sent**: Total number of emails sent through the platform
- **Delivery Rate**: Percentage of emails successfully delivered
- **Open Rate**: Percentage of delivered emails that were opened
- **Click Rate**: Percentage of opened emails where links were clicked
- **Bounce Rate**: Percentage of emails that bounced
- **Failure Rate**: Percentage of emails that failed to send

### 2. Date Range Filtering
- Filter analytics by custom date ranges
- Quick access to common date ranges (last 7 days, 30 days, etc.)
- Reset filters to view all-time data

### 3. Bounce Breakdown
- **Hard Bounces**: Permanent delivery failures (invalid email addresses)
- **Soft Bounces**: Temporary delivery failures (full mailbox, server issues)
- **Spam Reports**: Emails marked as spam by recipients
- **Other**: Other types of bounces

### 4. Template Performance
- View performance metrics for each email template
- Compare delivery, open, and click rates across templates
- Identify best and worst performing templates
- Visual progress bars for easy comparison

### 5. Recent Failures
- List of most recent failed emails
- Error messages for debugging
- Recipient information
- Template identification
- Timestamp of failure

## Access

The Email Analytics Dashboard is accessible to administrators at:
```
/admin/emails
```

The navigation link is available in the admin sidebar under "Email Analytics".

## API Endpoint

### GET /api/admin/email-analytics

Fetches email analytics data with optional date range filtering.

**Query Parameters:**
- `startDate` (optional): ISO date string for start of date range
- `endDate` (optional): ISO date string for end of date range

**Response:**
```json
{
  "overview": {
    "totalSent": 1000,
    "totalDelivered": 980,
    "totalFailed": 10,
    "totalBounced": 10,
    "totalOpened": 500,
    "totalClicked": 100,
    "deliveryRate": 98.0,
    "openRate": 51.0,
    "clickRate": 20.0,
    "bounceRate": 1.0,
    "failureRate": 1.0
  },
  "templateStats": [
    {
      "template": "welcome",
      "sent": 500,
      "delivered": 490,
      "failed": 5,
      "bounced": 5,
      "opened": 250,
      "clicked": 50,
      "deliveryRate": 98.0,
      "openRate": 51.0,
      "clickRate": 20.0
    }
  ],
  "bounceBreakdown": {
    "hard": 5,
    "soft": 3,
    "spam": 2,
    "other": 0
  },
  "recentFailures": [
    {
      "id": "clx...",
      "to": "user@example.com",
      "subject": "Welcome to Sylvan Token",
      "template": "welcome",
      "error": "Invalid email address",
      "sentAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

## Database Schema

The email analytics feature uses the `EmailLog` model:

```prisma
model EmailLog {
  id        String    @id @default(cuid())
  to        String
  subject   String
  template  String
  status    String    // sent, delivered, failed, bounced, opened, clicked
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

## Email Statuses

- **sent**: Email sent to email service provider
- **delivered**: Email successfully delivered to recipient
- **failed**: Email failed to send
- **bounced**: Email bounced back
- **opened**: Email opened by recipient (tracked via pixel)
- **clicked**: Link clicked in email (tracked via link tracking)

## Performance Metrics

### Success Criteria
- Delivery rate: >98%
- Open rate: >25%
- Click rate: >5%
- Bounce rate: <2%
- Failure rate: <1%

### Monitoring
- Monitor bounce rates to identify email list quality issues
- Track open rates to measure subject line effectiveness
- Monitor click rates to measure content engagement
- Review failed emails regularly to identify systemic issues

## Troubleshooting

### High Bounce Rate
- Review email list quality
- Remove invalid email addresses
- Check for spam complaints
- Verify email authentication (SPF, DKIM, DMARC)

### Low Open Rate
- Improve subject lines
- Test send times
- Verify sender reputation
- Check spam folder placement

### Low Click Rate
- Improve email content
- Make CTAs more prominent
- Test different email designs
- Ensure mobile responsiveness

### High Failure Rate
- Check email service provider status
- Review error messages
- Verify API credentials
- Check rate limits

## Internationalization

The Email Analytics Dashboard supports all platform languages:
- English (en)
- Turkish (tr)
- German (de)
- Chinese (zh)
- Russian (ru)

Translations are available in `locales/*/admin.json` under the `emails` key.

## Related Documentation

- [Email System Overview](../lib/email/README.md)
- [Email Logging](../lib/email/LOGGING_README.md)
- [Email Security](../lib/email/SECURITY_GUIDE.md)
- [Email Webhooks](../app/api/webhooks/resend/README.md)

## Future Enhancements

- Export analytics data to CSV/Excel
- Email campaign comparison
- A/B testing results
- Automated alerts for anomalies
- Predictive analytics
- Recipient engagement scoring
- Geographic distribution of opens/clicks
- Device and email client breakdown
