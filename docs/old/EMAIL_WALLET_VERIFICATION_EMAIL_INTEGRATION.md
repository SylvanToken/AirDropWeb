# Wallet Verification Email Integration

## Overview

This document describes the integration of wallet verification emails into the Sylvan Token Airdrop Platform. The implementation sends automated emails to users at different stages of the wallet verification process.

## Implementation Summary

### Email Templates

Three email templates have been integrated:

1. **Wallet Pending Email** (`wallet-pending.tsx`)
   - Sent when user submits wallet address
   - Shows masked wallet address
   - Explains verification process
   - Provides link to check status

2. **Wallet Approved Email** (`wallet-approved.tsx`)
   - Sent when admin approves wallet
   - Confirms successful verification
   - Shows benefits of verified wallet
   - Encourages continued participation

3. **Wallet Rejected Email** (`wallet-rejected.tsx`)
   - Sent when admin rejects wallet
   - Explains rejection reason
   - Lists common issues
   - Provides link to resubmit

### API Integration Points

#### 1. User Wallet Submission
**Endpoint:** `POST /api/users/wallet`

When a user submits their wallet address:
```typescript
// Queue wallet pending email
await queueWalletPendingEmail(
  userId,
  email,
  username,
  walletAddress,
  locale
);
```

#### 2. Admin Wallet Approval
**Endpoint:** `PUT /api/admin/users/[id]/wallet` (action: 'approve')

When an admin approves a wallet:
```typescript
// Queue wallet approved email
await queueWalletApprovedEmail(
  userId,
  email,
  username,
  walletAddress,
  locale
);
```

#### 3. Admin Wallet Rejection
**Endpoint:** `PUT /api/admin/users/[id]/wallet` (action: 'reject')

When an admin rejects a wallet:
```typescript
// Queue wallet rejected email
await queueWalletRejectedEmail(
  userId,
  email,
  username,
  walletAddress,
  rejectionReason,
  locale
);
```

## Email Queue Functions

### queueWalletPendingEmail()
```typescript
export async function queueWalletPendingEmail(
  userId: string,
  email: string,
  username: string,
  walletAddress: string,
  locale: string = 'en'
): Promise<void>
```

### queueWalletApprovedEmail()
```typescript
export async function queueWalletApprovedEmail(
  userId: string,
  email: string,
  username: string,
  walletAddress: string,
  locale: string = 'en'
): Promise<void>
```

### queueWalletRejectedEmail()
```typescript
export async function queueWalletRejectedEmail(
  userId: string,
  email: string,
  username: string,
  walletAddress: string,
  rejectionReason: string,
  locale: string = 'en'
): Promise<void>
```

## Features

### Security & Privacy
- ✅ Wallet addresses are masked in emails (e.g., `0x1234...5678`)
- ✅ Emails are queued asynchronously to prevent blocking
- ✅ Email failures don't block wallet operations
- ✅ All email attempts are logged

### Multi-Language Support
- ✅ English (en)
- ✅ Turkish (tr)
- ✅ German (de)
- ✅ Chinese (zh)
- ✅ Russian (ru)

### Email Content
- ✅ Branded with Sylvan Token identity
- ✅ Responsive design for all devices
- ✅ Clear call-to-action buttons
- ✅ Status badges (pending, verified, failed)
- ✅ Helpful instructions and next steps

## Admin Wallet Verification Endpoint

A new admin endpoint has been created for wallet verification:

**Endpoint:** `PUT /api/admin/users/[id]/wallet`

**Request Body:**
```json
{
  "action": "approve" | "reject",
  "reason": "string (required for reject)"
}
```

**Approve Example:**
```bash
curl -X PUT http://localhost:3005/api/admin/users/USER_ID/wallet \
  -H "Content-Type: application/json" \
  -d '{"action": "approve"}'
```

**Reject Example:**
```bash
curl -X PUT http://localhost:3005/api/admin/users/USER_ID/wallet \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reject",
    "reason": "Invalid wallet address format"
  }'
```

## Testing

### Manual Testing

1. **Test Wallet Pending Email:**
   ```bash
   # Submit wallet address as user
   POST /api/users/wallet
   {
     "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
   }
   ```

2. **Test Wallet Approved Email:**
   ```bash
   # Approve wallet as admin
   PUT /api/admin/users/USER_ID/wallet
   {
     "action": "approve"
   }
   ```

3. **Test Wallet Rejected Email:**
   ```bash
   # Reject wallet as admin
   PUT /api/admin/users/USER_ID/wallet
   {
     "action": "reject",
     "reason": "Invalid wallet address format"
   }
   ```

### Automated Testing

Run the verification script:
```bash
npx tsx emails/verify-wallet-integration.ts
```

This script tests:
- ✅ Wallet pending email queueing
- ✅ Wallet approved email queueing
- ✅ Wallet rejected email queueing
- ✅ All supported locales

**Note:** Redis connection errors are expected if Redis is not running locally. The email queueing functions are designed to fail gracefully and log errors without blocking the main operations.

## Error Handling

All email operations are wrapped in try-catch blocks to ensure:
- Wallet operations never fail due to email issues
- Email errors are logged for monitoring
- Users receive appropriate feedback regardless of email status

## Requirements Coverage

This implementation satisfies the following requirements:

- **3.1** ✅ Send verification pending email when user submits wallet
- **3.2** ✅ Send verification approved email when admin verifies wallet
- **3.3** ✅ Send rejection email with reason when admin rejects wallet
- **3.4** ✅ Include wallet address (partially masked) in all emails
- **3.5** ✅ Include next steps and actions required in all emails

## Files Modified

### New Files
- `app/api/admin/users/[id]/wallet/route.ts` - Admin wallet verification endpoint
- `emails/verify-wallet-integration.ts` - Integration test script
- `emails/WALLET_VERIFICATION_EMAIL_INTEGRATION.md` - This documentation

### Modified Files
- `app/api/users/wallet/route.ts` - Added wallet pending email queueing
- `lib/email/queue.ts` - Added wallet email queueing functions

## Next Steps

1. ✅ Wallet verification emails are integrated
2. ⏭️ Test with real email addresses
3. ⏭️ Monitor email delivery rates
4. ⏭️ Gather user feedback on email content
5. ⏭️ Optimize email templates based on engagement metrics

## Support

For issues or questions about wallet verification emails:
- Check email queue status: Monitor Bull queue
- Review email logs: Check EmailLog database table
- Test email templates: Use React Email preview mode
- Verify email configuration: Check RESEND_API_KEY environment variable
