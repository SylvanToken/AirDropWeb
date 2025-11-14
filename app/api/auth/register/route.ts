import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { validateRequest, handleApiError } from "@/lib/utils";
import { rateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeEmail, sanitizeUsername, sanitizeString } from "@/lib/sanitize";
import { queueWelcomeEmail } from "@/lib/email/queue";
import { verifyTurnstileToken } from "@/lib/turnstile";

/**
 * Extract preferred locale from Accept-Language header
 * Supports: en, tr, de, zh, ru
 */
function getPreferredLocale(acceptLanguage: string): string {
  const supportedLocales = ['en', 'tr', 'de', 'zh', 'ru'];
  
  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,tr;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';');
      const quality = qValue ? parseFloat(qValue.split('=')[1]) : 1.0;
      return { code: code.split('-')[0].toLowerCase(), quality };
    })
    .sort((a, b) => b.quality - a.quality);
  
  // Find first supported locale
  for (const lang of languages) {
    if (supportedLocales.includes(lang.code)) {
      return lang.code;
    }
  }
  
  // Default to English
  return 'en';
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimitResult = rateLimit(identifier, RATE_LIMITS.AUTH);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Too many registration attempts. Please try again later.",
          resetTime: rateLimitResult.resetTime,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Validate request body
    const validation = await validateRequest<{ email: string; username: string; password: string; acceptedTerms: boolean; referralCode?: string; turnstileToken?: string }>(request, registerSchema);
    
    if (!validation.success) {
      return validation.error;
    }

    const { acceptedTerms, referralCode: providedReferralCode, turnstileToken } = validation.data;

    // Verify Turnstile token (bot protection)
    // Check if Turnstile is enabled via environment variable
    const isTurnstileEnabled = process.env.TURNSTILE_ENABLED === 'true';
    
    if (isTurnstileEnabled) {
      if (!turnstileToken) {
        return NextResponse.json(
          {
            error: "Verification required",
            message: "Bot verification is required",
          },
          { status: 400 }
        );
      }

      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const remoteIp = forwardedFor?.split(',')[0] || realIp || undefined;

      const turnstileResult = await verifyTurnstileToken(turnstileToken, remoteIp);
      
      if (!turnstileResult.success) {
        console.error('[Register] Turnstile verification failed:', turnstileResult.error);
        return NextResponse.json(
          {
            error: "Verification failed",
            message: "Bot verification failed. Please try again.",
          },
          { status: 400 }
        );
      }
      
      console.log('[Register] Turnstile verification successful');
    } else {
      console.log('[Register] Turnstile is disabled via TURNSTILE_ENABLED=false');
    }

    // Validate terms acceptance
    if (!acceptedTerms) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "You must accept the Terms of Use and Privacy Policy",
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const email = sanitizeEmail(validation.data.email);
    const username = sanitizeUsername(validation.data.username);
    const password = sanitizeString(validation.data.password);

    // Validate sanitized inputs
    if (!email || !username || !password) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Invalid input data after sanitization",
        },
        { status: 400 }
      );
    }

    // Check for existing email (including deleted/blocked users)
    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          error: "Conflict",
          message: "This email address is already registered",
        },
        { status: 409 }
      );
    }

    // Check for existing username
    const existingUsername = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          error: "Conflict",
          message: "This username is already taken",
        },
        { status: 409 }
      );
    }

    // Hash password with 12 salt rounds for enhanced security
    const hashedPassword = await hash(password, 12);

    // Generate unique referral code for the new user
    const { generateUniqueReferralCode, validateReferralCodeForRegistration } = await import('@/lib/referral-code');
    const referralCode = await generateUniqueReferralCode();
    
    // Check if user was invited by someone
    const invitedByCode = await validateReferralCodeForRegistration(providedReferralCode);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: "USER",
        totalPoints: 0,
        acceptedTerms: true,
        acceptedPrivacy: true,
        termsAcceptedAt: new Date(),
        referralCode, // Unique referral code for this user
        invitedBy: invitedByCode, // Referral code of the inviter (if any)
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        referralCode: true,
        invitedBy: true,
        createdAt: true,
      },
    });

    // Get user's preferred language from Accept-Language header or default to English
    const acceptLanguage = request.headers.get('accept-language') || 'en';
    const locale = getPreferredLocale(acceptLanguage);

    // Queue welcome email (non-blocking - don't fail registration if email fails)
    try {
      await queueWelcomeEmail(user.id, user.email, user.username, locale);
    } catch (emailError) {
      // Log error but don't fail registration
      console.error('Failed to queue welcome email:', emailError);
    }

    // Process referral task completion if user was invited (non-blocking)
    if (invitedByCode) {
      try {
        const { processReferralCompletion } = await import('@/lib/referral-automation');
        const result = await processReferralCompletion(invitedByCode, user.id);
        
        if (result.success) {
          console.log('Referral task completed successfully:', {
            referralCode: invitedByCode,
            newUserId: user.id,
            completionId: result.completionId,
            pointsAwarded: result.pointsAwarded,
          });
        } else {
          console.warn('Referral task completion failed:', {
            referralCode: invitedByCode,
            newUserId: user.id,
            error: result.error,
          });
        }
      } catch (referralError) {
        // Log error but don't fail registration
        console.error('Referral task processing error:', {
          referralCode: invitedByCode,
          newUserId: user.id,
          error: referralError instanceof Error ? referralError.message : String(referralError),
          stack: referralError instanceof Error ? referralError.stack : undefined,
        });
      }
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
