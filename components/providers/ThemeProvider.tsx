'use client';

/**
 * Theme Provider Component
 * 
 * Provides theme context to all components and handles theme switching.
 * Supports light, dark, and system theme modes with localStorage persistence.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { setThemeMode, applyThemeVariables } from '@/lib/theme/generator';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

// ============================================
// CONTEXT
// ============================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'sylvan-theme-preference';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get system theme preference
 * @returns 'light' or 'dark' based on system preference
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
}

/**
 * Get stored theme preference from localStorage
 * @returns Stored theme or null if not found
 */
function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch (error) {
    console.error('Failed to read theme from localStorage:', error);
  }
  
  return null;
}

/**
 * Store theme preference in localStorage
 * @param theme - Theme to store
 */
function storeTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    console.error('Failed to store theme in localStorage:', error);
  }
}

/**
 * Resolve theme mode to actual theme
 * @param theme - Theme mode (light, dark, or system)
 * @returns Resolved theme (light or dark)
 */
function resolveTheme(theme: ThemeMode): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

// ============================================
// PROVIDER COMPONENT
// ============================================

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
  enableSystem?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
}: ThemeProviderProps) {
  // Initialize theme state
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Try to get stored theme first
    const stored = getStoredTheme();
    if (stored) return stored;
    
    // Fall back to default theme
    return defaultTheme;
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    return resolveTheme(theme);
  });
  
  const [mounted, setMounted] = useState(false);
  
  // Set theme function
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    storeTheme(newTheme);
    
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    setThemeMode(resolved);
  }, []);
  
  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);
  
  // Handle system theme changes
  useEffect(() => {
    if (!enableSystem || theme !== 'system') return;
    
    const mediaQuery = window.matchMedia(MEDIA_QUERY);
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newResolvedTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newResolvedTheme);
      setThemeMode(newResolvedTheme);
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme, enableSystem]);
  
  // Apply theme on mount and when theme changes
  useEffect(() => {
    setMounted(true);
    
    // Apply initial theme
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    setThemeMode(resolved);
  }, [theme]);
  
  // Prevent flash of unstyled content
  useEffect(() => {
    if (!mounted) return;
    
    // Add transition class after mount to prevent flash
    const root = document.documentElement;
    root.style.setProperty('color-scheme', resolvedTheme);
    
    // Enable transitions after initial render
    setTimeout(() => {
      root.style.setProperty('transition', 'background-color 0.3s ease, color 0.3s ease');
    }, 100);
  }, [mounted, resolvedTheme]);
  
  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

/**
 * Hook to access theme context
 * @returns Theme context value
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// ============================================
// SCRIPT COMPONENT
// ============================================

/**
 * Script to prevent flash of unstyled content
 * Should be placed in the <head> of the document
 */
export function ThemeScript() {
  const script = `
    (function() {
      try {
        const stored = localStorage.getItem('${STORAGE_KEY}');
        const theme = stored || 'system';
        
        let resolved = theme;
        if (theme === 'system') {
          resolved = window.matchMedia('${MEDIA_QUERY}').matches ? 'dark' : 'light';
        }
        
        document.documentElement.classList.add(resolved);
        document.documentElement.style.colorScheme = resolved;
      } catch (e) {
        console.error('Failed to apply theme:', e);
      }
    })();
  `;
  
  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}

// ============================================
// EXPORTS
// ============================================

export default ThemeProvider;
