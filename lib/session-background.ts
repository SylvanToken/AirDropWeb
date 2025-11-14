/**
 * Session-based background color manager
 * Selects a random gradient on login and persists throughout the session
 */

const BACKGROUND_GRADIENTS = [
  'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900',
  'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-green-950 dark:to-slate-900',
  'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-teal-950 dark:to-slate-900',
  'bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50 dark:from-slate-900 dark:via-lime-950 dark:to-slate-900',
  'bg-gradient-to-br from-cyan-50 via-teal-50 to-green-50 dark:from-slate-900 dark:via-cyan-950 dark:to-slate-900',
];

const SESSION_KEY = 'sylvan-bg-gradient';

/**
 * Get or set session background gradient
 */
export function getSessionBackground(): string {
  if (typeof window === 'undefined') return BACKGROUND_GRADIENTS[0];
  
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored && BACKGROUND_GRADIENTS.includes(stored)) {
      return stored;
    }
    
    // Select random gradient
    const randomIndex = Math.floor(Math.random() * BACKGROUND_GRADIENTS.length);
    const selected = BACKGROUND_GRADIENTS[randomIndex];
    sessionStorage.setItem(SESSION_KEY, selected);
    return selected;
  } catch (error) {
    console.error('Error managing session background:', error);
    return BACKGROUND_GRADIENTS[0];
  }
}

/**
 * Clear session background (called on logout)
 */
export function clearSessionBackground(): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Error clearing session background:', error);
  }
}
