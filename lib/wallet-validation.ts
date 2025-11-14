/**
 * BEP-20 Wallet Address Validation
 * 
 * BEP-20 uses the same address format as Ethereum (ERC-20)
 * - Must start with "0x"
 * - Must be 42 characters long (0x + 40 hex characters)
 * - Must contain only hexadecimal characters (0-9, a-f, A-F)
 */

/**
 * Validates if a string is a valid BEP-20 wallet address
 * @param address - The wallet address to validate
 * @returns true if valid, false otherwise
 */
export function isValidBEP20Address(address: string): boolean {
  // Check if address exists and is a string
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Remove any whitespace
  const cleanAddress = address.trim();

  // Check if it starts with 0x
  if (!cleanAddress.startsWith('0x')) {
    return false;
  }

  // Check if it's exactly 42 characters (0x + 40 hex chars)
  if (cleanAddress.length !== 42) {
    return false;
  }

  // Check if all characters after 0x are valid hexadecimal
  const hexPart = cleanAddress.slice(2);
  const hexRegex = /^[0-9a-fA-F]{40}$/;
  
  return hexRegex.test(hexPart);
}

/**
 * Formats a BEP-20 address for display (checksummed format)
 * @param address - The wallet address to format
 * @returns Formatted address or original if invalid
 */
export function formatBEP20Address(address: string): string {
  if (!isValidBEP20Address(address)) {
    return address;
  }

  // Return lowercase format for consistency
  return address.toLowerCase();
}

/**
 * Validates and returns error message if invalid
 * @param address - The wallet address to validate
 * @returns Error message or null if valid
 */
export function validateBEP20AddressWithMessage(address: string): string | null {
  if (!address || address.trim() === '') {
    return 'Wallet address is required';
  }

  const cleanAddress = address.trim();

  if (!cleanAddress.startsWith('0x')) {
    return 'BEP-20 address must start with "0x"';
  }

  if (cleanAddress.length !== 42) {
    return `BEP-20 address must be exactly 42 characters (currently ${cleanAddress.length})`;
  }

  const hexPart = cleanAddress.slice(2);
  const hexRegex = /^[0-9a-fA-F]{40}$/;
  
  if (!hexRegex.test(hexPart)) {
    return 'BEP-20 address contains invalid characters. Only hexadecimal (0-9, a-f, A-F) allowed';
  }

  return null;
}

/**
 * Masks a wallet address for display (shows first 6 and last 4 characters)
 * Example: 0x1234...5678
 * @param address - The wallet address to mask
 * @returns Masked address
 */
export function maskWalletAddress(address: string): string {
  if (!isValidBEP20Address(address)) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
