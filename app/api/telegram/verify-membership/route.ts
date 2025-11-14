import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TelegramBot } from '@/lib/telegram-bot';
import { createErrorResponse, handleApiError } from '@/lib/utils';
import { z } from 'zod';

/**
 * Validation schema for membership verification request
 */
const verifyMembershipSchema = z.object({
  userId: z.number().optional(),
  username: z.string().optional(),
}).refine(
  (data) => data.userId || data.username,
  {
    message: 'Either userId or username must be provided',
  }
);

/**
 * POST /api/telegram/verify-membership
 * Verify if a user is a member of the Telegram channel
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return createErrorResponse(
        'Unauthorized',
        'You must be logged in to verify membership',
        401
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = verifyMembershipSchema.safeParse(body);

    if (!validation.success) {
      return createErrorResponse(
        'Validation Error',
        validation.error.errors[0].message,
        400
      );
    }

    const { userId, username } = validation.data;

    // Check membership
    let result;
    if (userId) {
      result = await TelegramBot.checkMembership(userId);
    } else if (username) {
      result = await TelegramBot.checkMembershipByUsername(username);
    } else {
      return createErrorResponse(
        'Bad Request',
        'Either userId or username must be provided',
        400
      );
    }

    // Handle errors
    if (result.error) {
      return createErrorResponse(
        'Verification Failed',
        result.error,
        500
      );
    }

    // Return result
    return NextResponse.json({
      success: true,
      isMember: result.isMember,
      status: result.status,
      message: result.isMember 
        ? 'User is a member of the Telegram channel'
        : 'User is not a member of the Telegram channel',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/telegram/verify-membership
 * Get information about the verification endpoint
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/telegram/verify-membership',
    method: 'POST',
    description: 'Verify if a user is a member of the Telegram channel',
    authentication: 'Required',
    parameters: {
      userId: {
        type: 'number',
        required: false,
        description: 'Telegram user ID',
      },
      username: {
        type: 'string',
        required: false,
        description: 'Telegram username (without @)',
      },
    },
    note: 'Either userId or username must be provided',
    example: {
      request: {
        userId: 123456789,
      },
      response: {
        success: true,
        isMember: true,
        status: 'member',
        message: 'User is a member of the Telegram channel',
      },
    },
  });
}
