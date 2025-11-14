/**
 * Webhook Security Utilities
 * 
 * Provides signature verification for incoming webhooks to ensure
 * they are authentic and not from malicious sources.
 */

import crypto from 'crypto';

/**
 * Verify Resend webhook signature
 * 
 * Resend signs webhooks using HMAC-SHA256. The signature is sent in the
 * 'resend-signature' or 'svix-signature' header.
 * 
 * Format: t=<timestamp>,v1=<signature>
 * 
 * @param payload - Raw webhook payload (string)
 * @param signature - Signature from webhook header
 * @param secret - Webhook signing secret
 * @param tolerance - Maximum age of webhook in seconds (default: 5 minutes)
 * @returns true if signature is valid, false otherwise
 */
export function verifyResendWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string,
  tolerance: number = 300 // 5 minutes
): boolean {
  if (!signature) {
    console.error('[Webhook Security] No signature provided');
    return false;
  }

  try {
    // Parse signature header
    // Format: t=<timestamp>,v1=<signature>
    const parts = signature.split(',');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const signaturePart = parts.find(p => p.startsWith('v1='));

    if (!timestampPart || !signaturePart) {
      console.error('[Webhook Security] Invalid signature format');
      return false;
    }

    const timestamp = parseInt(timestampPart.split('=')[1]);
    const expectedSignature = signaturePart.split('=')[1];

    // Check timestamp tolerance (prevent replay attacks)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > tolerance) {
      console.error('[Webhook Security] Webhook timestamp too old or too new');
      return false;
    }

    // Compute expected signature
    // Signed payload format: <timestamp>.<payload>
    const signedPayload = `${timestamp}.${payload}`;
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    // Compare signatures using timing-safe comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(computedSignature)
    );

    if (!isValid) {
      console.error('[Webhook Security] Signature mismatch');
      console.error('[Webhook Security] Expected:', computedSignature);
      console.error('[Webhook Security] Received:', expectedSignature);
    }

    return isValid;
  } catch (error) {
    console.error('[Webhook Security] Error verifying signature:', error);
    return false;
  }
}

/**
 * Verify generic webhook signature using HMAC-SHA256
 * 
 * @param payload - Raw webhook payload (string)
 * @param signature - Signature from webhook header
 * @param secret - Webhook signing secret
 * @returns true if signature is valid, false otherwise
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    console.error('[Webhook Security] No signature provided');
    return false;
  }

  try {
    // Compute expected signature
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    // Compare signatures using timing-safe comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );

    if (!isValid) {
      console.error('[Webhook Security] Signature mismatch');
    }

    return isValid;
  } catch (error) {
    console.error('[Webhook Security] Error verifying signature:', error);
    return false;
  }
}

/**
 * Generate webhook signature for testing
 * 
 * @param payload - Webhook payload (string)
 * @param secret - Webhook signing secret
 * @param timestamp - Optional timestamp (defaults to now)
 * @returns Signature in Resend format: t=<timestamp>,v1=<signature>
 */
export function generateResendWebhookSignature(
  payload: string,
  secret: string,
  timestamp?: number
): string {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${payload}`;
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  return `t=${ts},v1=${signature}`;
}

/**
 * Validate webhook secret format
 * 
 * @param secret - Webhook secret to validate
 * @returns true if secret is valid, false otherwise
 */
export function isValidWebhookSecret(secret: string | undefined): boolean {
  if (!secret) {
    return false;
  }

  // Secret should be at least 32 characters
  if (secret.length < 32) {
    console.warn('[Webhook Security] Webhook secret is too short (minimum 32 characters)');
    return false;
  }

  return true;
}

/**
 * Generate a secure webhook secret
 * 
 * @param length - Length of secret (default: 64)
 * @returns Random hex string
 */
export function generateWebhookSecret(length: number = 64): string {
  return crypto.randomBytes(length / 2).toString('hex');
}
