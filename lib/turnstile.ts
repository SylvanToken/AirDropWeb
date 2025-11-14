/**
 * Cloudflare Turnstile Server-Side Verification
 * 
 * Verifies Turnstile tokens on the backend
 */

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verify Turnstile token with Cloudflare
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('[Turnstile] TURNSTILE_SECRET_KEY not configured');
    return {
      success: false,
      error: 'Turnstile not configured',
    };
  }

  if (!token) {
    return {
      success: false,
      error: 'Turnstile token missing',
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      console.error('[Turnstile] Verification request failed:', response.status);
      return {
        success: false,
        error: 'Verification request failed',
      };
    }

    const data: TurnstileVerifyResponse = await response.json();

    if (!data.success) {
      console.error('[Turnstile] Verification failed:', data['error-codes']);
      return {
        success: false,
        error: data['error-codes']?.join(', ') || 'Verification failed',
      };
    }

    console.log('[Turnstile] Verification successful:', {
      hostname: data.hostname,
      timestamp: data.challenge_ts,
    });

    return { success: true };
  } catch (error) {
    console.error('[Turnstile] Verification error:', error);
    return {
      success: false,
      error: 'Verification error',
    };
  }
}

/**
 * Middleware helper to verify Turnstile token from request
 */
export async function verifyTurnstileFromRequest(
  request: Request
): Promise<{ success: boolean; error?: string }> {
  try {
    const body = await request.json();
    const token = body.turnstileToken || body.cfTurnstileResponse;

    if (!token) {
      return {
        success: false,
        error: 'Turnstile token missing from request',
      };
    }

    // Get client IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const remoteIp = forwardedFor?.split(',')[0] || realIp || undefined;

    return await verifyTurnstileToken(token, remoteIp);
  } catch (error) {
    console.error('[Turnstile] Request parsing error:', error);
    return {
      success: false,
      error: 'Invalid request format',
    };
  }
}

/**
 * Error codes reference
 */
export const TURNSTILE_ERROR_CODES = {
  'missing-input-secret': 'The secret parameter was not passed',
  'invalid-input-secret': 'The secret parameter was invalid or did not exist',
  'missing-input-response': 'The response parameter was not passed',
  'invalid-input-response': 'The response parameter is invalid or has expired',
  'bad-request': 'The request was rejected because it was malformed',
  'timeout-or-duplicate': 'The response parameter has already been validated before',
  'internal-error': 'An internal error happened while validating the response',
} as const;
