/**
 * Telegram Configuration
 * 
 * This file contains Telegram-related configuration and helper functions
 * for social media verification and integration.
 */

/**
 * Official Telegram Channel ID
 * Format: Negative number for channels/groups
 */
export const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || '-1002857056222';

/**
 * Telegram Channel URL
 * Constructed from the channel ID
 */
export const TELEGRAM_CHANNEL_URL = `https://t.me/c/${TELEGRAM_CHANNEL_ID.replace('-100', '')}`;

/**
 * Telegram Bot Configuration (Sylvus Bot)
 * Bot is used for automated membership verification
 */
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8083809833:AAGMj_xHy12LwF89_inbwiifok6FjjuOJoE';
export const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'SylvusBot';

/**
 * Validate if a Telegram channel ID is valid
 * @param channelId - Telegram channel ID to validate
 * @returns boolean indicating if the channel ID is valid
 */
export function isValidTelegramChannelId(channelId: string): boolean {
  // Telegram channel IDs start with -100 followed by digits
  const channelIdRegex = /^-100\d+$/;
  return channelIdRegex.test(channelId);
}

/**
 * Format Telegram channel ID for display
 * @param channelId - Telegram channel ID
 * @returns formatted channel ID
 */
export function formatTelegramChannelId(channelId: string): string {
  if (!channelId) return 'Not configured';
  return channelId;
}

/**
 * Get Telegram channel invite link
 * Note: This requires the actual invite link to be set in environment variables
 */
export const TELEGRAM_INVITE_LINK = process.env.TELEGRAM_INVITE_LINK || 'https://t.me/your_channel';

/**
 * Telegram verification settings
 */
export const TELEGRAM_VERIFICATION = {
  enabled: process.env.TELEGRAM_VERIFICATION_ENABLED === 'true',
  requireMembership: process.env.TELEGRAM_REQUIRE_MEMBERSHIP === 'true',
  autoVerify: process.env.TELEGRAM_AUTO_VERIFY === 'true',
};

/**
 * Check if Telegram integration is properly configured
 * @returns boolean indicating if Telegram is configured
 */
export function isTelegramConfigured(): boolean {
  return !!(TELEGRAM_CHANNEL_ID && isValidTelegramChannelId(TELEGRAM_CHANNEL_ID));
}

/**
 * Get Telegram configuration status
 * @returns object with configuration status
 */
export function getTelegramConfigStatus() {
  return {
    channelId: TELEGRAM_CHANNEL_ID,
    isValid: isValidTelegramChannelId(TELEGRAM_CHANNEL_ID),
    isConfigured: isTelegramConfigured(),
    botConfigured: !!(TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_USERNAME),
    verificationEnabled: TELEGRAM_VERIFICATION.enabled,
  };
}

// Export all configuration as a single object
export const TelegramConfig = {
  channelId: TELEGRAM_CHANNEL_ID,
  channelUrl: TELEGRAM_CHANNEL_URL,
  inviteLink: TELEGRAM_INVITE_LINK,
  botToken: TELEGRAM_BOT_TOKEN,
  botUsername: TELEGRAM_BOT_USERNAME,
  verification: TELEGRAM_VERIFICATION,
  isConfigured: isTelegramConfigured(),
  isValid: isValidTelegramChannelId(TELEGRAM_CHANNEL_ID),
};

export default TelegramConfig;
