import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TelegramBot } from '@/lib/telegram-bot';
import { TelegramConfig, getTelegramConfigStatus } from '@/lib/telegram-config';
import { createErrorResponse, handleApiError } from '@/lib/utils';

/**
 * GET /api/telegram/bot-status
 * Get the status of the Telegram bot and configuration
 * Admin only endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return createErrorResponse(
        'Unauthorized',
        'You must be logged in',
        401
      );
    }

    if (session.user.role !== 'ADMIN') {
      return createErrorResponse(
        'Forbidden',
        'Admin access required',
        403
      );
    }

    // Get configuration status
    const configStatus = getTelegramConfigStatus();

    // Get bot information
    const botInfo = await TelegramBot.getBotInfo();

    // Verify bot access to channel
    const accessStatus = await TelegramBot.verifyAccess();

    // Get member count
    const memberCount = await TelegramBot.getMemberCount();

    // Return comprehensive status
    return NextResponse.json({
      success: true,
      configuration: {
        channelId: TelegramConfig.channelId,
        channelUrl: TelegramConfig.channelUrl,
        inviteLink: TelegramConfig.inviteLink,
        botUsername: TelegramConfig.botUsername,
        isConfigured: configStatus.isConfigured,
        isValid: configStatus.isValid,
        botConfigured: configStatus.botConfigured,
        verificationEnabled: configStatus.verificationEnabled,
      },
      bot: {
        info: botInfo.success ? botInfo.bot : null,
        hasAccess: accessStatus.hasAccess,
        error: botInfo.success ? null : botInfo.error,
      },
      channel: {
        memberCount: memberCount.count || 0,
        error: memberCount.error || null,
      },
      status: {
        overall: configStatus.isConfigured && accessStatus.hasAccess ? 'healthy' : 'error',
        message: configStatus.isConfigured && accessStatus.hasAccess
          ? 'Telegram bot is properly configured and has access to the channel'
          : 'Telegram bot configuration or access issue detected',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
