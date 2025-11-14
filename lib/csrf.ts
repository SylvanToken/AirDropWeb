import { getCsrfToken } from "next-auth/react";

/**
 * Get CSRF token for form submissions
 * NextAuth.js automatically handles CSRF protection
 * This utility helps with manual form submissions
 */
export async function getFormCsrfToken(): Promise<string | undefined> {
  return await getCsrfToken();
}

/**
 * Validate CSRF token in API routes
 * NextAuth.js handles this automatically for auth endpoints
 * For custom endpoints, use this function
 */
export function validateCsrfToken(
  requestToken: string | null,
  sessionToken: string | null
): boolean {
  if (!requestToken || !sessionToken) {
    return false;
  }
  
  return requestToken === sessionToken;
}
