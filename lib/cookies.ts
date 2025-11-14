/**
 * Cookie Management Utilities
 * 
 * Provides helper functions for setting and retrieving browser cookies
 * with proper TypeScript typing and error handling.
 */

/**
 * Sets a cookie with the specified name, value, and expiration
 * 
 * @param name - The name of the cookie
 * @param value - The value to store in the cookie
 * @param days - Number of days until the cookie expires
 */
export function setCookie(name: string, value: string, days: number): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

/**
 * Retrieves the value of a cookie by name
 * 
 * @param name - The name of the cookie to retrieve
 * @returns The cookie value if found, null otherwise
 */
export function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  
  return null;
}
