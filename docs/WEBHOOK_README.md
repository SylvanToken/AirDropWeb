# Resend Webhook Handler

This endpoint receives webhook events from Resend to track email delivery, opens, clicks, and bounces.

## Setup

### 1. Configure Webhook in Resend Dashboard

1. Log in to your Resend dashboard at https://resend.com/webhooks
2. Click "Add Webhook"
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/resend`
4. Select the events you want to receive:
   - `email.delivered` - Email was successfully delivered
   - `email.bounced` - Email bounced (hard or soft)
   - `email.opened` - Recipient opened the email
   - `email.clicked` - Recipient clicked a link in the email
5. Copy the webhook signing secret
6. Add the secret to your `.env` file:
   ```
   RESEND_WEBHOOK_SECRET=your_webhook_secret_here
   ```

### 2. Test Webhook Locally

For local development, you can use a tool like ngrok to expose your local server:

```bash
# Start your development server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Use the ngrok URL in Resend webhook configuration
# Example: https://abc123.ngrok.io/api/webhooks/resend
```

### 3. Verify Webhook is Working

You can test the webhook endpoint with a GET request:

```bash
curl https://yourdomain.com/api/webhooks/resend
```

Expected response:
```json
{
  "status": "ok",
  "message": "Resend webhook endpoint is active",
  "timestamp": "2024-11-11T14:30:00.000Z"
}
```

## Webhook Events

### email.delivered

Triggered when an email is successfully delivered to the recipient's mail server.

**Payload:**
```json
{
  "type": "email.delivered",
  "created_at": "2024-11-11T14:30:00.000Z",
  "data": {
    "email_id": "abc123",
    "to": "user@example.com",
    "from": "noreply@sylvantoken.org",
    "subject": "Welcome to Sylvan Token"
  }
}
```

**Action:** Updates EmailLog status to `delivered`

### email.bounced

Triggered when an email bounces (hard or soft bounce).

**Payload:**
```json
{
  "type": "email.bounced",
  "created_at": "2024-11-11T14:30:00.000Z",
  "data": {
    "email_id": "abc123",
    "to": "user@example.com",
    "from": "noreply@sylvantoken.org",
    "subject": "Welcome to Sylvan Token",
    "bounce_type": "hard",
    "bounce_reason": "Mailbox does not exist"
  }
}
```

**Action:** 
- Updates EmailLog status to `bounced`
- Stores bounce reason in error field
- For hard bounces, marks user email as invalid (future enhancement)

### email.opened

Triggered when a recipient opens an email (requires tracking pixel).

**Payload:**
```json
{
  "type": "email.opened",
  "created_at": "2024-11-11T14:30:00.000Z",
  "data": {
    "email_id": "abc123",
    "to": "user@example.com",
    "from": "noreply@sylvantoken.org",
    "subject": "Welcome to Sylvan Token"
  }
}
```

**Action:** 
- Updates EmailLog status to `opened`
- Records `openedAt` timestamp (first open only)

### email.clicked

Triggered when a recipient clicks a link in an email (requires link tracking).

**Payload:**
```json
{
  "type": "email.clicked",
  "created_at": "2024-11-11T14:30:00.000Z",
  "data": {
    "email_id": "abc123",
    "to": "user@example.com",
    "from": "noreply@sylvantoken.org",
    "subject": "Welcome to Sylvan Token",
    "link": "https://sylvantoken.org/dashboard"
  }
}
```

**Action:** 
- Updates EmailLog status to `clicked`
- Records `clickedAt` timestamp (first click only)

## Email Log Matching

The webhook handler uses two methods to match webhook events to EmailLog records:

### 1. Resend ID Matching (Recommended)

The handler attempts to find the EmailLog by the Resend email ID. This requires storing the Resend ID when sending emails.

**Current Status:** Not fully implemented. The `resendId` is logged in metadata but not stored in a dedicated field.

**Future Enhancement:** Add a `resendId` field to the EmailLog model for accurate tracking.

### 2. Recipient and Subject Matching (Fallback)

If Resend ID matching fails, the handler falls back to finding the most recent email log that matches:
- Recipient email address
- Email subject
- Sent within the last 24 hours

This method works but may not be 100% accurate if multiple identical emails are sent to the same recipient.

## Security

### Webhook Signature Verification

The webhook handler includes signature verification to ensure requests are authentic.

**Configuration:**
```env
RESEND_WEBHOOK_SECRET=your_webhook_secret_here
```

**Implementation Status:** Basic structure in place, full verification to be implemented.

**Production Recommendation:** Always verify webhook signatures in production to prevent malicious requests.

## Monitoring

### View Webhook Logs

Check your application logs for webhook processing:

```bash
# Development
npm run dev

# Production (check your hosting provider's logs)
```

### Common Log Messages

- `Received Resend webhook: email.delivered` - Webhook received
- `Email delivered: abc123` - Email log updated successfully
- `Could not find email log for delivered event` - Email log not found (check matching logic)
- `Invalid webhook signature` - Signature verification failed (check webhook secret)

## Troubleshooting

### Webhook Not Receiving Events

1. **Check Resend Dashboard:** Verify webhook is configured and active
2. **Check URL:** Ensure webhook URL is correct and accessible
3. **Check Logs:** Look for incoming requests in application logs
4. **Test Endpoint:** Send a GET request to verify endpoint is accessible

### Email Logs Not Updating

1. **Check Email Log Matching:** Verify emails are being logged when sent
2. **Check Resend ID:** Ensure Resend ID is being stored (future enhancement)
3. **Check Timestamps:** Verify emails are within 24-hour window for fallback matching
4. **Check Database:** Verify EmailLog records exist in database

### Signature Verification Failing

1. **Check Secret:** Verify `RESEND_WEBHOOK_SECRET` matches Resend dashboard
2. **Check Headers:** Ensure `resend-signature` header is present
3. **Check Implementation:** Verify signature verification logic is correct

## Future Enhancements

1. **Add resendId Field:** Add dedicated field to EmailLog model for accurate tracking
2. **Implement Full Signature Verification:** Complete HMAC signature verification
3. **Add Retry Logic:** Handle temporary failures with retry mechanism
4. **Add Webhook Queue:** Process webhooks asynchronously for better performance
5. **Add Email Validation:** Mark user emails as invalid after hard bounces
6. **Add Complaint Handling:** Process spam complaints and unsubscribe users
7. **Add Webhook Analytics:** Track webhook processing metrics

## API Reference

### POST /api/webhooks/resend

Receives webhook events from Resend.

**Headers:**
- `resend-signature` - Webhook signature for verification

**Request Body:**
```json
{
  "type": "email.delivered",
  "created_at": "2024-11-11T14:30:00.000Z",
  "data": {
    "email_id": "abc123",
    "to": "user@example.com",
    "from": "noreply@sylvantoken.org",
    "subject": "Welcome to Sylvan Token"
  }
}
```

**Response:**
```json
{
  "received": true
}
```

**Status Codes:**
- `200` - Webhook processed successfully
- `401` - Invalid signature
- `500` - Webhook processing failed

### GET /api/webhooks/resend

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Resend webhook endpoint is active",
  "timestamp": "2024-11-11T14:30:00.000Z"
}
```

## Related Documentation

- [Resend Webhooks Documentation](https://resend.com/docs/webhooks)
- [Email Logging System](../../../../lib/email/LOGGING_README.md)
- [Email Client](../../../../lib/email/README.md)
