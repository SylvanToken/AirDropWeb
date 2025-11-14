# Email Preferences System

## Overview

The email preferences system allows users to control which types of emails they receive from the Sylvan Token Airdrop Platform. This ensures users only receive communications they find valuable while maintaining compliance with email regulations.

## Email Categories

### Transactional Emails

**Always Sent** - Cannot be disabled

These emails are essential for platform functionality:

1. **Welcome Email**
   - Sent on registration
   - Confirms account creation
   - Provides getting started information

2. **Password Reset**
   - Sent when user requests password reset
   - Contains secure reset link
   - Time-limited token

3. **Security Alerts**
   - Account login from new device
   - Password changed
   - Email address changed

4. **Critical Updates**
   - Terms of service changes
   - Privacy policy updates
   - Platform maintenance notices

### Marketing Emails

**User Controlled** - Can be disabled

These emails can be turned off by users:

1. **Task Completion Notifications**
   - Sent when user completes a task
   - Shows points earned
   - Displays updated total points
   - **Default**: Enabled

2. **Wallet Verification Updates**
   - Wallet submitted for review
   - Wallet approved
   - Wallet rejected
   - **Default**: Enabled

3. **Leaderboard Updates**
   - Weekly leaderboard position
   - Achievement milestones
   - Competition announcements
   - **Default**: Disabled

4. **Platform News**
   - New features
   - Platform updates
   - Community highlights
   - **Default**: Disabled

5. **Promotional Emails**
   - Special campaigns
   - Bonus point opportunities
   - Partner offers
   - **Default**: Disabled

### Admin Notifications

**Admin Only** - For platform administrators

1. **Review Needed**
   - Manual review required
   - Flagged completions
   - Wallet verifications

2. **Fraud Alerts**
   - High fraud scores
   - Suspicious activity
   - Pattern detection

3. **Daily Digest**
   - Platform statistics
   - User activity summary
   - System health

4. **Error Alerts**
   - System errors
   - Failed processes
   - Performance issues

## Database Schema

### EmailPreference Model

```prisma
model EmailPreference {
  id                    String    @id @default(cuid())
  userId                String    @unique
  
  // Marketing emails
  taskCompletions       Boolean   @default(true)
  walletVerifications   Boolean   @default(true)
  leaderboardUpdates    Boolean   @default(false)
  platformNews          Boolean   @default(false)
  promotionalEmails     Boolean   @default(false)
  
  // Admin notifications (admin users only)
  adminNotifications    Boolean   @default(true)
  
  // Metadata
  unsubscribedAt        DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}
```

## API Endpoints

### Get User Preferences

```typescript
GET /api/users/email-preferences

Response:
{
  "taskCompletions": true,
  "walletVerifications": true,
  "leaderboardUpdates": false,
  "platformNews": false,
  "promotionalEmails": false,
  "adminNotifications": true
}
```

### Update Preferences

```typescript
PUT /api/users/email-preferences

Request Body:
{
  "taskCompletions": false,
  "walletVerifications": true,
  "leaderboardUpdates": false,
  "platformNews": false,
  "promotionalEmails": false
}

Response:
{
  "success": true,
  "preferences": {
    "taskCompletions": false,
    "walletVerifications": true,
    "leaderboardUpdates": false,
    "platformNews": false,
    "promotionalEmails": false
  }
}
```

### Unsubscribe from Email Type

```typescript
POST /api/email/unsubscribe

Request Body:
{
  "token": "secure_unsubscribe_token",
  "emailType": "taskCompletions"
}

Response:
{
  "success": true,
  "message": "You have been unsubscribed from task completion emails"
}
```

### Unsubscribe from All Marketing Emails

```typescript
POST /api/email/unsubscribe-all

Request Body:
{
  "token": "secure_unsubscribe_token"
}

Response:
{
  "success": true,
  "message": "You have been unsubscribed from all marketing emails"
}
```

## Implementation

### Checking Preferences Before Sending

```typescript
// lib/email/utils.ts
export async function shouldSendEmail(
  userId: string,
  emailType: EmailType
): Promise<boolean> {
  // Transactional emails always send
  const transactionalTypes = [
    'welcome',
    'passwordReset',
    'securityAlert',
    'criticalUpdate',
  ];
  
  if (transactionalTypes.includes(emailType)) {
    return true;
  }
  
  // Check user preferences for marketing emails
  const preferences = await prisma.emailPreference.findUnique({
    where: { userId },
  });
  
  if (!preferences) {
    // Create default preferences if not exist
    await prisma.emailPreference.create({
      data: { userId },
    });
    return true; // Default to enabled
  }
  
  // Check if user unsubscribed from all
  if (preferences.unsubscribedAt) {
    return false;
  }
  
  // Check specific preference
  const preferenceMap = {
    taskCompletion: preferences.taskCompletions,
    walletVerification: preferences.walletVerifications,
    leaderboardUpdate: preferences.leaderboardUpdates,
    platformNews: preferences.platformNews,
    promotional: preferences.promotionalEmails,
    adminNotification: preferences.adminNotifications,
  };
  
  return preferenceMap[emailType] ?? false;
}
```

### Sending Email with Preference Check

```typescript
// Example: Sending task completion email
export async function sendTaskCompletionEmail(
  userId: string,
  taskData: TaskData
) {
  // Check if user wants this email
  const shouldSend = await shouldSendEmail(userId, 'taskCompletion');
  
  if (!shouldSend) {
    console.log(`User ${userId} has disabled task completion emails`);
    return;
  }
  
  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user?.email) {
    throw new Error('User email not found');
  }
  
  // Queue email
  await queueEmail({
    to: user.email,
    subject: getEmailTranslations(user.language).taskCompletion.subject,
    template: 'taskCompletion',
    data: {
      username: user.username,
      taskName: taskData.name,
      points: taskData.points,
      totalPoints: user.points,
      locale: user.language,
    },
  });
}
```

### Generating Unsubscribe Tokens

```typescript
// lib/email/security.ts
import crypto from 'crypto';

export function generateUnsubscribeToken(
  userId: string,
  emailType: string
): string {
  const secret = process.env.NEXTAUTH_SECRET!;
  const data = `${userId}:${emailType}:${Date.now()}`;
  
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  
  const signature = hmac.digest('hex');
  const token = Buffer.from(`${data}:${signature}`).toString('base64url');
  
  return token;
}

export function verifyUnsubscribeToken(
  token: string
): { userId: string; emailType: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [userId, emailType, timestamp, signature] = decoded.split(':');
    
    // Verify signature
    const secret = process.env.NEXTAUTH_SECRET!;
    const data = `${userId}:${emailType}:${timestamp}`;
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    // Check token age (valid for 30 days)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    if (tokenAge > maxAge) {
      return null;
    }
    
    return { userId, emailType };
  } catch (error) {
    return null;
  }
}
```

### Adding Unsubscribe Links to Emails

```typescript
// emails/components/EmailFooter.tsx
import { Link } from '@react-email/components';

interface EmailFooterProps {
  userId: string;
  emailType: string;
  locale: string;
}

export function EmailFooter({ userId, emailType, locale }: EmailFooterProps) {
  const t = getEmailTranslations(locale);
  const unsubscribeToken = generateUnsubscribeToken(userId, emailType);
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/email/unsubscribe?token=${unsubscribeToken}`;
  
  return (
    <div style={footerStyle}>
      <Text style={footerText}>
        {t.common.footer}
      </Text>
      <Text style={footerText}>
        <Link href={unsubscribeUrl} style={linkStyle}>
          {t.common.unsubscribe}
        </Link>
        {' | '}
        <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/${locale}/profile`} style={linkStyle}>
          {t.common.managePreferences}
        </Link>
      </Text>
      <Text style={addressStyle}>
        Sylvan Token Platform
        <br />
        {t.common.address}
      </Text>
    </div>
  );
}
```

## User Interface

### Profile Settings Page

```typescript
// components/profile/EmailPreferences.tsx
'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'next-intl';

export function EmailPreferences() {
  const t = useTranslation('profile');
  const [preferences, setPreferences] = useState({
    taskCompletions: true,
    walletVerifications: true,
    leaderboardUpdates: false,
    platformNews: false,
    promotionalEmails: false,
  });
  const [saving, setSaving] = useState(false);
  
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/users/email-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      
      if (response.ok) {
        // Show success message
      }
    } catch (error) {
      // Show error message
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          {t('emailPreferences.title')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('emailPreferences.description')}
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="taskCompletions">
            {t('emailPreferences.taskCompletions')}
          </Label>
          <Switch
            id="taskCompletions"
            checked={preferences.taskCompletions}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, taskCompletions: checked })
            }
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="walletVerifications">
            {t('emailPreferences.walletVerifications')}
          </Label>
          <Switch
            id="walletVerifications"
            checked={preferences.walletVerifications}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, walletVerifications: checked })
            }
          />
        </div>
        
        {/* More preference toggles... */}
      </div>
      
      <Button onClick={handleSave} disabled={saving}>
        {saving ? t('common.saving') : t('common.save')}
      </Button>
    </div>
  );
}
```

### Unsubscribe Page

```typescript
// app/(user)/email/unsubscribe/page.tsx
import { verifyUnsubscribeToken } from '@/lib/email/security';
import { prisma } from '@/lib/prisma';

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  const { token } = searchParams;
  
  if (!token) {
    return <div>Invalid unsubscribe link</div>;
  }
  
  const verified = verifyUnsubscribeToken(token);
  
  if (!verified) {
    return <div>Invalid or expired unsubscribe link</div>;
  }
  
  // Update preferences
  await prisma.emailPreference.update({
    where: { userId: verified.userId },
    data: {
      [verified.emailType]: false,
    },
  });
  
  return (
    <div>
      <h1>Successfully Unsubscribed</h1>
      <p>You will no longer receive {verified.emailType} emails.</p>
      <Link href="/profile">Manage all email preferences</Link>
    </div>
  );
}
```

## Compliance

### CAN-SPAM Act (US)

Requirements:
- ✅ Include physical address in footer
- ✅ Provide clear unsubscribe mechanism
- ✅ Honor unsubscribe requests within 10 days
- ✅ Clearly identify email as advertisement (for marketing)
- ✅ Include valid "From" address

### GDPR (EU)

Requirements:
- ✅ Obtain explicit consent for marketing emails
- ✅ Provide easy way to withdraw consent
- ✅ Allow users to export their email data
- ✅ Delete email data on request
- ✅ Secure storage of email addresses

### CASL (Canada)

Requirements:
- ✅ Obtain express consent before sending
- ✅ Provide unsubscribe mechanism
- ✅ Include sender information
- ✅ Honor unsubscribe within 10 days

## Best Practices

### Default Settings

- Enable essential notifications by default
- Disable promotional emails by default
- Respect user's initial choices
- Make it easy to change preferences

### Communication

- Clearly explain each email type
- Show examples of emails
- Indicate email frequency
- Confirm preference changes

### User Experience

- One-click unsubscribe from emails
- Preference center in profile
- Granular control over email types
- Easy to re-enable emails

### Technical

- Check preferences before every send
- Log preference changes
- Handle missing preferences gracefully
- Sync preferences across systems

## Testing

### Test Cases

1. **Default Preferences**
   - New user has correct defaults
   - Transactional emails always send
   - Marketing emails respect defaults

2. **Updating Preferences**
   - Changes save correctly
   - Emails respect new preferences
   - Confirmation email sent

3. **Unsubscribe**
   - One-click unsubscribe works
   - Preference updated correctly
   - Confirmation page shown
   - No more emails sent

4. **Token Security**
   - Invalid tokens rejected
   - Expired tokens rejected
   - Tampered tokens rejected
   - Valid tokens accepted

5. **Edge Cases**
   - Missing preferences handled
   - Deleted users handled
   - Invalid email types handled
   - Concurrent updates handled

## Monitoring

### Metrics to Track

- Unsubscribe rate by email type
- Preference change frequency
- Most/least popular email types
- Time to unsubscribe after signup

### Alerts

Set up alerts for:
- Unsubscribe rate > 5%
- Sudden spike in unsubscribes
- Preference update failures
- Invalid token attempts

## Related Documentation

- [Email System Overview](./EMAIL_SYSTEM.md)
- [Email Security Guide](../lib/email/SECURITY_GUIDE.md)
- [Email Templates Guide](./EMAIL_TEMPLATES_GUIDE.md)
