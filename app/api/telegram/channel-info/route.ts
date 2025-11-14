import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TelegramBot } from '@/lib/telegram-bot';
import { TelegramConfig } from '@/lib/telegram-config';
import { createErrorResponse, handleApiError } from '@/lib/utils';

/**
 * GET /api/telegram/channel-info
 * Get information about the Telegram channel
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication (optional - you can make this public)
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return createErrorResponse(
        'Unauthorized',
        'You must be logged in to view channel information',
        401
      );
    }

    // Get channel information
    const channelInfo = await TelegramBot.getChannelInfo();

    if (!channelInfo.success) {
      return createErrorResponse(
        'Failed to Get Channel Info',
        channelInfo.error || 'Unknown error',
        500
      );
    }

    // Get member count
    const memberCount = await TelegramBot.getMemberCount();

    // Return channel information
    return NextResponse.json({
      success: true,
      channel: {
        id: TelegramConfig.channelId,
        inviteLink: TelegramConfig.inviteLink,
        memberCount: memberCount.count || 0,
        info: channelInfo.channel,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
