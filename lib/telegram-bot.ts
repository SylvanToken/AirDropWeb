/**
 * Telegram Bot API Helper
 * 
 * This file contains helper functions for interacting with the Telegram Bot API
 * using the Sylvus Bot token.
 */

import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID } from './telegram-config';

/**
 * Base URL for Telegram Bot API
 */
const TELEGRAM_API_BASE = 'https://api.telegram.org';

/**
 * Telegram Bot API URL
 */
export const TELEGRAM_BOT_API_URL = `${TELEGRAM_API_BASE}/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Telegram Chat Member Status
 */
export type TelegramMemberStatus = 
  | 'creator'      // Channel/group creator
  | 'administrator' // Admin
  | 'member'       // Regular member
  | 'restricted'   // Restricted user
  | 'left'         // Left the channel
  | 'kicked';      // Banned from channel

/**
 * Telegram Chat Member Response
 */
export interface TelegramChatMember {
  user: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  status: TelegramMemberStatus;
  custom_title?: string;
  is_anonymous?: boolean;
  can_be_edited?: boolean;
}

/**
 * Telegram API Response
 */
export interface TelegramApiResponse<T = any> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

/**
 * Check if a user is a member of the Telegram channel
 * 
 * @param userId - Telegram user ID
 * @returns Promise with membership status
 */
export async function checkTelegramMembership(
  userId: number
): Promise<{ isMember: boolean; status?: TelegramMemberStatus; error?: string }> {
  try {
    const response = await fetch(`${TELEGRAM_BOT_API_URL}/getChatMember`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        user_id: userId,
      }),
    });

    const data: TelegramApiResponse<TelegramChatMember> = await response.json();

    if (!data.ok) {
      return {
        isMember: false,
        error: data.description || 'Failed to check membership',
      };
    }

    const memberStatuses: TelegramMemberStatus[] = ['creator', 'administrator', 'member'];
    const isMember = memberStatuses.includes(data.result!.status);

    return {
      isMember,
      status: data.result!.status,
    };
  } catch (error) {
    console.error('Telegram membership check error:', error);
    return {
      isMember: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a user is a member by username
 * Note: This requires the user to have a public username
 * 
 * @param username - Telegram username (without @)
 * @returns Promise with membership status
 */
export async function checkTelegramMembershipByUsername(
  username: string
): Promise<{ isMember: boolean; status?: TelegramMemberStatus; error?: string }> {
  try {
    // Remove @ if present
    const cleanUsername = username.replace('@', '');

    const response = await fetch(`${TELEGRAM_BOT_API_URL}/getChatMember`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        user_id: `@${cleanUsername}`,
      }),
    });

    const data: TelegramApiResponse<TelegramChatMember> = await response.json();

    if (!data.ok) {
      return {
        isMember: false,
        error: data.description || 'Failed to check membership',
      };
    }

    const memberStatuses: TelegramMemberStatus[] = ['creator', 'administrator', 'member'];
    const isMember = memberStatuses.includes(data.result!.status);

    return {
      isMember,
      status: data.result!.status,
    };
  } catch (error) {
    console.error('Telegram membership check error:', error);
    return {
      isMember: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get information about the Telegram channel
 * 
 * @returns Promise with channel information
 */
export async function getTelegramChannelInfo() {
  try {
    const response = await fetch(`${TELEGRAM_BOT_API_URL}/getChat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
      }),
    });

    const data: TelegramApiResponse = await response.json();

    if (!data.ok) {
      throw new Error(data.description || 'Failed to get channel info');
    }

    return {
      success: true,
      channel: data.result,
    };
  } catch (error) {
    console.error('Get channel info error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get the number of members in the Telegram channel
 * 
 * @returns Promise with member count
 */
export async function getTelegramMemberCount(): Promise<{ count?: number; error?: string }> {
  try {
    const response = await fetch(`${TELEGRAM_BOT_API_URL}/getChatMemberCount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
      }),
    });

    const data: TelegramApiResponse<number> = await response.json();

    if (!data.ok) {
      return {
        error: data.description || 'Failed to get member count',
      };
    }

    return {
      count: data.result,
    };
  } catch (error) {
    console.error('Get member count error:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a message to the Telegram channel
 * Note: Bot must have permission to post messages
 * 
 * @param message - Message text to send
 * @returns Promise with send status
 */
export async function sendTelegramMessage(
  message: string
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  try {
    const response = await fetch(`${TELEGRAM_BOT_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data: TelegramApiResponse = await response.json();

    if (!data.ok) {
      return {
        success: false,
        error: data.description || 'Failed to send message',
      };
    }

    return {
      success: true,
      messageId: data.result.message_id,
    };
  } catch (error) {
    console.error('Send message error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify bot has access to the channel
 * 
 * @returns Promise with verification status
 */
export async function verifyBotAccess(): Promise<{ hasAccess: boolean; error?: string }> {
  try {
    const channelInfo = await getTelegramChannelInfo();
    
    if (!channelInfo.success) {
      return {
        hasAccess: false,
        error: channelInfo.error,
      };
    }

    return {
      hasAccess: true,
    };
  } catch (error) {
    console.error('Verify bot access error:', error);
    return {
      hasAccess: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get bot information
 * 
 * @returns Promise with bot information
 */
export async function getBotInfo() {
  try {
    const response = await fetch(`${TELEGRAM_BOT_API_URL}/getMe`, {
      method: 'GET',
    });

    const data: TelegramApiResponse = await response.json();

    if (!data.ok) {
      throw new Error(data.description || 'Failed to get bot info');
    }

    return {
      success: true,
      bot: data.result,
    };
  } catch (error) {
    console.error('Get bot info error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Rate limiter for Telegram API calls
 * Telegram allows 30 requests per second
 */
class TelegramRateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastCallTime = 0;
  private minInterval = 34; // ~30 requests per second

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.process();
      }
    });
  }

  private async process() {
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallTime;

      if (timeSinceLastCall < this.minInterval) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minInterval - timeSinceLastCall)
        );
      }

      const fn = this.queue.shift();
      if (fn) {
        this.lastCallTime = Date.now();
        await fn();
      }
    }

    this.processing = false;
  }
}

export const telegramRateLimiter = new TelegramRateLimiter();

/**
 * Export all functions with rate limiting
 */
export const TelegramBot = {
  checkMembership: (userId: number) => 
    telegramRateLimiter.add(() => checkTelegramMembership(userId)),
  
  checkMembershipByUsername: (username: string) => 
    telegramRateLimiter.add(() => checkTelegramMembershipByUsername(username)),
  
  getChannelInfo: () => 
    telegramRateLimiter.add(() => getTelegramChannelInfo()),
  
  getMemberCount: () => 
    telegramRateLimiter.add(() => getTelegramMemberCount()),
  
  sendMessage: (message: string) => 
    telegramRateLimiter.add(() => sendTelegramMessage(message)),
  
  verifyAccess: () => 
    telegramRateLimiter.add(() => verifyBotAccess()),
  
  getBotInfo: () => 
    telegramRateLimiter.add(() => getBotInfo()),
};

export default TelegramBot;
