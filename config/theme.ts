/**
 * Centralized Theme Configuration
 * 
 * This file serves as the single source of truth for all theme-related values
 * including colors, spacing, typography, shadows, and transitions.
 * 
 * All color values use HSL format for better manipulation and consistency.
 * The theme supports both light and dark modes with eco-friendly color palettes.
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ThemeColors {
  // Base colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  
  // Semantic colors
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  destructive: string;
  destructiveForeground: string;
  
  // UI elements
  border: string;
  input: string;
  ring: string;
  
  // Eco-themed palette
  eco: {
    leaf: string;      // Bright lime green - primary eco color
    forest: string;    // Deep forest green - secondary eco color
    earth: string;     // Olive/earth tone
    sky: string;       // Soft sage/sky tone
    moss: string;      // Dark moss green
  };
  
  // Task state colors
  task: {
    pending: string;   // Pending tasks
    active: string;    // Active/in-progress tasks
    completed: string; // Completed tasks
    expired: string;   // Expired/overdue tasks
    urgent: string;    // Urgent/time-sensitive tasks
  };
  
  // Status colors
  status: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface ThemeTypography {
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    display: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
}

export interface ThemeShadows {
  eco: string;
  ecoLg: string;
  ecoXl: string;
  glow: string;
  glowLg: string;
  depth4k1: string;
  depth4k2: string;
  depth4k3: string;
  neonGlow: string;
  neonGlowStrong: string;
  neonBorder: string;
  neonBorderStrong: string;
  glassDepth: string;
}

export interface ThemeTransitions {
  fast: string;
  base: string;
  slow: string;
  slower: string;
}

export interface Theme {
  light: ThemeColors;
  dark: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  shadows: ThemeShadows;
  transitions: ThemeTransitions;
  radius: string;
  bgOpacity: string;
}

// ============================================
// THEME CONFIGURATION
// ============================================

export const theme: Theme = {
  // ============================================
  // LIGHT MODE COLORS
  // ============================================
  light: {
    // Base colors - Wild Nature Theme
    background: '95 35% 92%',        // Soft sage background
    foreground: '140 60% 18%',       // Deep forest green text
    card: '95 25% 96%',              // Light card background
    cardForeground: '140 60% 18%',   // Deep forest green text on cards
    popover: '95 25% 96%',           // Light popover background
    popoverForeground: '140 60% 18%', // Deep forest green text in popovers
    
    // Primary: Deep Forest Green (#2d5016)
    primary: '140 60% 18%',
    primaryForeground: '85 65% 55%', // Lime green text on primary
    
    // Secondary: Olive Green (darkened for better contrast)
    secondary: '85 40% 32%',
    secondaryForeground: '95 25% 96%', // Light text on secondary
    
    // Muted: Soft Moss
    muted: '95 20% 85%',
    mutedForeground: '140 25% 35%',
    
    // Accent: Lime Green (#9cb86e)
    accent: '85 65% 55%',
    accentForeground: '140 60% 18%',
    
    // Destructive: Natural Red
    destructive: '0 70% 50%',
    destructiveForeground: '0 0% 100%',
    
    // UI elements
    border: '95 20% 80%',            // Subtle green border
    input: '95 20% 80%',             // Input border color
    ring: '140 60% 18%',             // Focus ring color
    
    // Eco-themed palette
    eco: {
      leaf: '85 65% 55%',            // Lime green - use for decorative elements
      forest: '140 60% 18%',         // Deep forest - safe for text on light backgrounds
      earth: '85 40% 32%',           // Olive - darkened for better contrast
      sky: '95 35% 65%',             // Sage - use for backgrounds or large text
      moss: '100 40% 30%',           // Dark moss - darkened for better contrast
    },
    
    // Task state colors
    task: {
      pending: '45 90% 50%',         // Amber/yellow for pending
      active: '200 80% 50%',         // Blue for active
      completed: '145 65% 45%',      // Green for completed
      expired: '0 70% 50%',          // Red for expired
      urgent: '15 90% 55%',          // Orange for urgent
    },
    
    // Status colors
    status: {
      success: '145 65% 45%',        // Green
      error: '0 70% 50%',            // Red
      warning: '45 90% 50%',         // Amber
      info: '200 60% 50%',           // Blue
    },
  },
  
  // ============================================
  // DARK MODE COLORS
  // ============================================
  dark: {
    // Base colors - Deep forest night
    background: '140 35% 10%',       // Dark forest background
    foreground: '85 65% 55%',        // Lime green text
    card: '140 30% 14%',             // Slightly lighter card background
    cardForeground: '85 65% 55%',    // Lime green text on cards
    popover: '140 30% 14%',          // Popover background
    popoverForeground: '85 65% 55%', // Lime green text in popovers
    
    // Primary: Bright Lime Green (#9cb86e)
    primary: '85 65% 55%',
    primaryForeground: '140 35% 10%', // Dark text on primary
    
    // Secondary: Dark Olive
    secondary: '85 25% 25%',
    secondaryForeground: '95 25% 92%', // Light text on secondary
    
    // Muted: Dark Moss
    muted: '140 20% 20%',
    mutedForeground: '95 15% 65%',
    
    // Accent: Vibrant Lime
    accent: '85 70% 60%',
    accentForeground: '140 35% 10%',
    
    // Destructive: Warm Red
    destructive: '0 65% 55%',
    destructiveForeground: '0 0% 100%',
    
    // UI elements
    border: '140 20% 24%',           // Subtle dark green border
    input: '140 20% 24%',            // Input border color
    ring: '85 65% 55%',              // Focus ring color (lime green)
    
    // Eco-themed palette
    eco: {
      leaf: '85 65% 55%',            // Lime green - safe for text on dark backgrounds
      forest: '140 60% 18%',         // Deep forest - use for backgrounds or decorative
      earth: '85 40% 32%',           // Olive - darkened for consistency
      sky: '95 30% 55%',             // Sage - use for backgrounds or large text
      moss: '100 40% 30%',           // Dark moss - darkened for better contrast
    },
    
    // Task state colors (adjusted for dark mode)
    task: {
      pending: '45 90% 60%',         // Brighter amber for dark mode
      active: '200 80% 60%',         // Brighter blue for dark mode
      completed: '145 65% 55%',      // Brighter green for dark mode
      expired: '0 70% 60%',          // Brighter red for dark mode
      urgent: '15 90% 65%',          // Brighter orange for dark mode
    },
    
    // Status colors (adjusted for dark mode)
    status: {
      success: '145 65% 55%',        // Brighter green
      error: '0 70% 60%',            // Brighter red
      warning: '45 90% 60%',         // Brighter amber
      info: '200 60% 60%',           // Brighter blue
    },
  },
  
  // ============================================
  // SPACING TOKENS
  // ============================================
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  // ============================================
  // TYPOGRAPHY TOKENS
  // ============================================
  typography: {
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      display: '3rem',    // 48px
    },
    lineHeight: {
      tight: '1.1',
      normal: '1.5',
      relaxed: '1.75',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // ============================================
  // SHADOW TOKENS
  // ============================================
  shadows: {
    // Eco-themed shadows
    eco: '0 4px 20px -2px hsla(var(--eco-leaf), 0.15)',
    ecoLg: '0 10px 40px -5px hsla(var(--eco-leaf), 0.2)',
    ecoXl: '0 20px 60px -10px hsla(var(--eco-leaf), 0.25)',
    glow: '0 0 20px hsla(var(--eco-leaf), 0.3)',
    glowLg: '0 0 40px hsla(var(--eco-leaf), 0.4)',
    
    // 4K depth shadows
    depth4k1: '0 1px 2px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.05), 0 0 10px hsla(var(--eco-leaf), 0.05)',
    depth4k2: '0 2px 4px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.06), 0 8px 16px rgba(0, 0, 0, 0.06), 0 16px 32px rgba(0, 0, 0, 0.06), 0 0 20px hsla(var(--eco-leaf), 0.1)',
    depth4k3: '0 4px 8px rgba(0, 0, 0, 0.07), 0 8px 16px rgba(0, 0, 0, 0.07), 0 16px 32px rgba(0, 0, 0, 0.07), 0 32px 64px rgba(0, 0, 0, 0.07), 0 0 30px hsla(var(--eco-leaf), 0.15)',
    
    // Neon glow shadows
    neonGlow: '0 0 10px hsla(var(--eco-leaf), 0.3), 0 0 20px hsla(var(--eco-leaf), 0.2), 0 0 30px hsla(var(--eco-leaf), 0.1), inset 0 0 10px hsla(var(--eco-leaf), 0.05)',
    neonGlowStrong: '0 0 15px hsla(var(--eco-leaf), 0.5), 0 0 30px hsla(var(--eco-leaf), 0.3), 0 0 45px hsla(var(--eco-leaf), 0.2), 0 0 60px hsla(var(--eco-leaf), 0.1), inset 0 0 15px hsla(var(--eco-leaf), 0.1)',
    neonBorder: '0 0 5px hsla(var(--eco-leaf), 0.2), inset 0 0 5px hsla(var(--eco-leaf), 0.1)',
    neonBorderStrong: '0 0 10px hsla(var(--eco-leaf), 0.4), 0 0 20px hsla(var(--eco-leaf), 0.2), inset 0 0 10px hsla(var(--eco-leaf), 0.15)',
    
    // Glass depth shadow
    glassDepth: '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 0 20px 0 rgba(255, 255, 255, 0.05)',
  },
  
  // ============================================
  // TRANSITION TOKENS
  // ============================================
  transitions: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  // ============================================
  // OTHER TOKENS
  // ============================================
  radius: '0.75rem',
  bgOpacity: '0.9',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a color value from the theme
 * @param mode - 'light' or 'dark'
 * @param path - Dot-notation path to the color (e.g., 'eco.leaf', 'task.pending')
 * @returns HSL color value
 */
export function getThemeColor(mode: 'light' | 'dark', path: string): string {
  const keys = path.split('.');
  let value: any = theme[mode];
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Theme color not found: ${path}`);
      return '';
    }
  }
  
  return value;
}

/**
 * Convert HSL string to CSS custom property format
 * @param hsl - HSL color value (e.g., '85 65% 55%')
 * @returns CSS custom property value
 */
export function hslToVar(hsl: string): string {
  return `hsl(${hsl})`;
}

/**
 * Convert HSL string to CSS custom property format with alpha
 * @param hsl - HSL color value (e.g., '85 65% 55%')
 * @param alpha - Alpha value (0-1)
 * @returns CSS custom property value with alpha
 */
export function hslToVarWithAlpha(hsl: string, alpha: number): string {
  return `hsl(${hsl} / ${alpha})`;
}

// Export default theme
export default theme;
