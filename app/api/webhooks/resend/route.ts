import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  logEmailDelivery,
  logEmailBounce,
  logEmailOpen,
  logEmailClick,
} from '@/lib/email/logger';
import { verifyResendWebhookSignature, isValidWebhookSecret } from '@/lib/webhook-security';

/**
 * Resend Webhook Handler
 * 
 * This endpoint receives webhook events from Resend to track email delivery,
 * opens, clicks, and bounces. It updates the EmailLog records accordingly.
 * 
 * Webhook events from Resend:
 * - email.delivered: Email was successfully delivered to recipient
 * - email.bounced: Email bounced (hard or soft bounce)
 * - email.opened: Recipient opened the email
 * - email.clicked: Recipient clicked a link in the email
 * 
 * Security: In production, verify webhook signature using Resend's signing secret
 */

// Resend webhook event types
type ResendEventType = 
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked';

// Resend webhook payload structure
interface ResendWebhookPayload {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id?: string;
    to?: string | string[];
    from?: string;
    subject?: string;
    bounce_type?: 'hard' | 'soft';
    bounce_reason?: string;
    complaint_type?: string;
    link?: string;
  };
}

/**
 * Find email log by Resend ID
 * 
 * Since we don't have a dedicated resendId field in the schema,
 * we need to search through recent emails to find a match.
 * This is a temporary solution until we add a resendId field.
 */
async function findEmailLogByResendId(resendId: string): Promise<string | null> {
  try {
    // Search recent email logs (last 7 days) for matching subject/recipient
    // This is a workaround since we don't store Resend IDs directly yet
    // In production, consider adding a resendId field to EmailLog model
    
    console.log(`Looking for email log with Resend ID: ${resendId}`);
    
    // For now, we'll return null and log a warning
    // The webhook will still process but won't update specific logs
    console.warn('Email log lookup by Resend ID not fully implemented');
    console.warn('Consider adding resendId field to EmailLog model for accurate tracking');
    
    return null;
  } catch (error) {
    console.error('Error finding email log by Resend ID:', error);
    return null;
  }
}

/**
 * Find email log by recipient and subject
 * 
 * Fallback method to find email logs when Resend ID is not available
 */
async function findEmailLogByRecipientAndSubject(
  to: string | string[],
  subject: string
): Promise<string | null> {
  try {
    const recipient = Array.isArray(to) ? to[0] : to;
    
    // Find the most recent email log matching recipient and subject
    const emailLog = await prisma.emailLog.findFirst({
      where: {
        to: {
          contains: recipient,
        },
        subject: subject,
        // Only look at recent emails (last 24 hours)
        sentAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
    });
    
    return emailLog?.id || null;
  } catch (error) {
    console.error('Error finding email log by recipient and subject:', error);
    return null;
  }
}

/**
 * Handle email.delivered event
 */
async function handleDelivered(data: ResendWebhookPayload['data']): Promise<void> {
  console.log('Processing email.delivered event:', data);
  
  try {
    // Try to find email log by Resend ID first
    let emailLogId = data.email_id ? await findEmailLogByResendId(data.email_id) : null;
    
    // Fallback to finding by recipient and subject
    if (!emailLogId && data.to && data.subject) {
      emailLogId = await findEmailLogByRecipientAndSubject(data.to, data.subject);
    }
    
    if (emailLogId) {
      await logEmailDelivery(emailLogId);
      console.log(`Email delivered: ${emailLogId}`);
    } else {
      console.warn('Could not find email log for delivered event');
    }
  } catch (error) {
    console.error('Error handling email.delivered event:', error);
  }
}

/**
 * Handle email.bounced event
 */
async function handleBounced(data: ResendWebhookPayload['data']): Promise<void> {
  console.log('Processing email.bounced event:', data);
  
  try {
    // Try to find email log by Resend ID first
    let emailLogId = data.email_id ? await findEmailLogByResendId(data.email_id) : null;
    
    // Fallback to finding by recipient and subject
    if (!emailLogId && data.to && data.subject) {
      emailLogId = await findEmailLogByRecipientAndSubject(data.to, data.subject);
    }
    
    if (emailLogId) {
      const bounceReason = data.bounce_reason || 
        `${data.bounce_type || 'unknown'} bounce`;
      
      await logEmailBounce(emailLogId, bounceReason);
      console.log(`Email bounced: ${emailLogId} - ${bounceReason}`);
      
      // If hard bounce, mark user email as invalid
      if (data.bounce_type === 'hard' && data.to) {
        const recipient = Array.isArray(data.to) ? data.to[0] : data.to;
        
        await prisma.user.updateMany({
          where: {
            email: recipient,
          },
          data: {
            // Note: This requires adding an emailValid field to User model
            // For now, we'll just log it
          },
        });
        
        console.log(`Hard bounce detected for: ${recipient}`);
      }
    } else {
      console.warn('Could not find email log for bounced event');
    }
  } catch (error) {
    console.error('Error handling email.bounced event:', error);
  }
}

/**
 * Handle email.opened event
 */
async function handleOpened(data: ResendWebhookPayload['data']): Promise<void> {
  console.log('Processing email.opened event:', data);
  
  try {
    // Try to find email log by Resend ID first
    let emailLogId = data.email_id ? await findEmailLogByResendId(data.email_id) : null;
    
    // Fallback to finding by recipient and subject
    if (!emailLogId && data.to && data.subject) {
      emailLogId = await findEmailLogByRecipientAndSubject(data.to, data.subject);
    }
    
    if (emailLogId) {
      await logEmailOpen(emailLogId);
      console.log(`Email opened: ${emailLogId}`);
    } else {
      console.warn('Could not find email log for opened event');
    }
  } catch (error) {
    console.error('Error handling email.opened event:', error);
  }
}

/**
 * Handle email.clicked event
 */
async function handleClicked(data: ResendWebhookPayload['data']): Promise<void> {
  console.log('Processing email.clicked event:', data);
  
  try {
    // Try to find email log by Resend ID first
    let emailLogId = data.email_id ? await findEmailLogByResendId(data.email_id) : null;
    
    // Fallback to finding by recipient and subject
    if (!emailLogId && data.to && data.subject) {
      emailLogId = await findEmailLogByRecipientAndSubject(data.to, data.subject);
    }
    
    if (emailLogId) {
      await logEmailClick(emailLogId);
      console.log(`Email clicked: ${emailLogId} - Link: ${data.link || 'unknown'}`);
    } else {
      console.warn('Could not find email log for clicked event');
    }
  } catch (error) {
    console.error('Error handling email.clicked event:', error);
  }
}

/**
 * Verify webhook signature
 * 
 * Resend signs webhooks with a secret key using HMAC-SHA256.
 * Verify the signature to ensure the webhook is authentic and not from a malicious source.
 * 
 * @param request - NextRequest object
 * @param payload - Raw webhook payload (string)
 * @returns true if signature is valid or verification is skipped, false otherwise
 */
function verifyWebhookSignature(
  request: NextRequest,
  payload: string
): boolean {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  
  // If no webhook secret is configured, skip verification (dev mode only)
  if (!webhookSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('⚠️ RESEND_WEBHOOK_SECRET not configured in production - SECURITY RISK!');
      return false; // Reject webhooks in production without secret
    }
    console.warn('[Webhook] RESEND_WEBHOOK_SECRET not configured - skipping signature verification (dev mode)');
    return true;
  }
  
  // Validate webhook secret format
  if (!isValidWebhookSecret(webhookSecret)) {
    console.error('[Webhook] Invalid webhook secret format');
    return false;
  }
  
  // Get the signature from headers
  // Resend uses 'svix-signature' or 'resend-signature' header
  const signature = request.headers.get('svix-signature') || 
                   request.headers.get('resend-signature');
  
  // If no signature provided, reject
  if (!signature) {
    console.error('[Webhook] No signature provided in webhook request');
    return false;
  }
  
  // Verify signature using HMAC-SHA256
  const isValid = verifyResendWebhookSignature(
    payload,
    signature,
    webhookSecret,
    300 // 5 minutes tolerance
  );
  
  if (!isValid) {
    console.error('[Webhook] Invalid webhook signature - possible security threat');
  } else {
    console.log('[Webhook] Signature verified successfully');
  }
  
  return isValid;
}

/**
 * POST /api/webhooks/resend
 * 
 * Receives webhook events from Resend and processes them
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    
    // Verify webhook signature (optional but recommended)
    if (!verifyWebhookSignature(request, body)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Parse webhook payload
    const payload: ResendWebhookPayload = JSON.parse(body);
    
    console.log('Received Resend webhook:', payload.type);
    
    // Process webhook based on event type
    switch (payload.type) {
      case 'email.delivered':
        await handleDelivered(payload.data);
        break;
        
      case 'email.bounced':
        await handleBounced(payload.data);
        break;
        
      case 'email.opened':
        await handleOpened(payload.data);
        break;
        
      case 'email.clicked':
        await handleClicked(payload.data);
        break;
        
      case 'email.sent':
        // Already logged when email was sent
        console.log('Email sent event received (already logged)');
        break;
        
      case 'email.delivery_delayed':
        console.log('Email delivery delayed:', payload.data);
        break;
        
      case 'email.complained':
        // NOTE: Spam complaint handling not implemented
        // Future enhancement: Auto-unsubscribe users who mark emails as spam
        console.log('Email complaint received:', payload.data);
        break;
        
      default:
        console.log('Unknown webhook event type:', payload.type);
    }
    
    // Return success response
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Resend webhook:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/resend
 * 
 * Health check endpoint for webhook
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Resend webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
