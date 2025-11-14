/**
 * Referral Code Generator
 * 
 * Generates unique, user-friendly referral codes for user invitations
 */

import { prisma } from './prisma';

/**
 * Generate a random referral code
 * Format: 6-8 characters, alphanumeric, uppercase
 * Example: ABC123XY, DEF456ZW
 */
export function generateReferralCode(length: number = 8): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: 0, O, I, 1
  let code = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
}

/**
 * Generate a unique referral code that doesn't exist in database
 * Retries up to maxAttempts times if collision occurs
 */
export async function generateUniqueReferralCode(
  maxAttempts: number = 10
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateReferralCode();
    
    // Check if code already exists
    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    
    if (!existing) {
      return code;
    }
  }
  
  // If all attempts failed, use a longer code
  const longCode = generateReferralCode(12);
  return longCode;
}

/**
 * Validate referral code format
 * @param code - Referral code to validate
 * @returns boolean indicating if code is valid
 */
export function isValidReferralCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Must be 6-12 characters, alphanumeric, uppercase
  const codeRegex = /^[A-Z0-9]{6,12}$/;
  return codeRegex.test(code);
}

/**
 * Check if a referral code exists in database
 * @param code - Referral code to check
 * @returns User object if exists, null otherwise
 */
export async function findUserByReferralCode(code: string) {
  if (!isValidReferralCode(code)) {
    return null;
  }
  
  return await prisma.user.findUnique({
    where: { referralCode: code },
    select: {
      id: true,
      username: true,
      email: true,
      referralCode: true,
      createdAt: true,
    },
  });
}

/**
 * Get referral statistics for a user
 * @param userId - User ID to get stats for
 * @returns Referral statistics
 */
export async function getReferralStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  
  if (!user || !user.referralCode) {
    return {
      referralCode: null,
      totalReferrals: 0,
      referrals: [],
    };
  }
  
  // Count users who used this referral code
  const referrals = await prisma.user.findMany({
    where: { invitedBy: user.referralCode },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      totalPoints: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return {
    referralCode: user.referralCode,
    totalReferrals: referrals.length,
    referrals,
  };
}

/**
 * Generate referral link for a user
 * @param referralCode - User's referral code
 * @param baseUrl - Base URL of the application
 * @returns Full referral link
 */
export function generateReferralLink(
  referralCode: string,
  baseUrl: string = process.env.NEXTAUTH_URL || 'http://localhost:3005'
): string {
  return `${baseUrl}/register?ref=${referralCode}`;
}

/**
 * Format referral code for display (add dashes for readability)
 * Example: ABC123XY -> ABC-123-XY
 */
export function formatReferralCode(code: string): string {
  if (!code || code.length < 6) {
    return code;
  }
  
  // Split into groups of 3-4 characters
  if (code.length === 8) {
    return `${code.slice(0, 3)}-${code.slice(3, 6)}-${code.slice(6)}`;
  }
  
  if (code.length === 6) {
    return `${code.slice(0, 3)}-${code.slice(3)}`;
  }
  
  return code;
}

/**
 * Validate and process referral code from registration
 * @param referralCode - Referral code provided during registration
 * @returns Validated referral code or null
 */
export async function validateReferralCodeForRegistration(
  referralCode?: string | null
): Promise<string | null> {
  if (!referralCode) {
    return null;
  }
  
  // Clean up the code (remove dashes, spaces, convert to uppercase)
  const cleanCode = referralCode
    .replace(/[-\s]/g, '')
    .toUpperCase()
    .trim();
  
  if (!isValidReferralCode(cleanCode)) {
    return null;
  }
  
  // Check if referral code exists
  const referrer = await findUserByReferralCode(cleanCode);
  
  if (!referrer) {
    return null;
  }
  
  return cleanCode;
}

// Export all functions
export const ReferralCodeUtils = {
  generate: generateReferralCode,
  generateUnique: generateUniqueReferralCode,
  isValid: isValidReferralCode,
  findUser: findUserByReferralCode,
  getStats: getReferralStats,
  generateLink: generateReferralLink,
  format: formatReferralCode,
  validateForRegistration: validateReferralCodeForRegistration,
};

export default ReferralCodeUtils;
