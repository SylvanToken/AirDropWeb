/**
 * Responsive Utilities
 * 
 * Utility functions and constants for responsive design
 * Supports mobile-first approach with breakpoints from 320px to 4K
 */

// Breakpoint constants (matching Tailwind config)
export const BREAKPOINTS = {
  xs: 320,   // Small phones
  sm: 640,   // Large phones
  md: 768,   // Tablets
  lg: 1024,  // Laptops
  xl: 1280,  // Desktops
  '2xl': 1536, // Large desktops
  '4k': 3840,  // 4K displays
} as const;

// Touch target minimum sizes (WCAG 2.1 AA compliance)
export const TOUCH_TARGET = {
  minimum: 44,  // 44x44px minimum for accessibility
  comfortable: 48, // 48x48px for better UX
  large: 56,    // 56x56px for primary actions
} as const;

// Responsive spacing scale
export const RESPONSIVE_SPACING = {
  xs: 'space-y-2 sm:space-y-3',
  sm: 'space-y-3 sm:space-y-4',
  md: 'space-y-4 sm:space-y-6',
  lg: 'space-y-6 sm:space-y-8',
  xl: 'space-y-8 sm:space-y-12',
} as const;

// Responsive padding classes
export const RESPONSIVE_PADDING = {
  xs: 'p-2 sm:p-3',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
  xl: 'p-8 sm:p-12',
} as const;

// Responsive gap classes for grids
export const RESPONSIVE_GAP = {
  xs: 'gap-2 sm:gap-3',
  sm: 'gap-3 sm:gap-4',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
} as const;

// Responsive grid columns
export const RESPONSIVE_GRID = {
  '1-2': 'grid-cols-1 sm:grid-cols-2',
  '1-2-3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '1-2-4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  '2-3-4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  '1-3': 'grid-cols-1 lg:grid-cols-3',
  '1-4': 'grid-cols-1 lg:grid-cols-4',
  auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
} as const;

// Responsive text sizes
export const RESPONSIVE_TEXT = {
  xs: 'text-xs sm:text-sm',
  sm: 'text-sm sm:text-base',
  base: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
  xl: 'text-xl sm:text-2xl',
  '2xl': 'text-2xl sm:text-3xl',
  '3xl': 'text-3xl sm:text-4xl',
  '4xl': 'text-4xl sm:text-5xl lg:text-6xl',
  display: 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl',
} as const;

// Container max-widths
export const CONTAINER_WIDTHS = {
  sm: 'max-w-screen-sm',   // 640px
  md: 'max-w-screen-md',   // 768px
  lg: 'max-w-screen-lg',   // 1024px
  xl: 'max-w-screen-xl',   // 1280px
  '2xl': 'max-w-screen-2xl', // 1536px
  full: 'max-w-full',
} as const;

/**
 * Get responsive class based on screen size
 */
export function getResponsiveClass(
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string
): string {
  const classes = [base];
  if (sm) classes.push(`sm:${sm}`);
  if (md) classes.push(`md:${md}`);
  if (lg) classes.push(`lg:${lg}`);
  if (xl) classes.push(`xl:${xl}`);
  return classes.join(' ');
}

/**
 * Check if device is mobile (client-side only)
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md;
}

/**
 * Check if device is tablet (client-side only)
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
}

/**
 * Check if device is desktop (client-side only)
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.lg;
}

/**
 * Get current breakpoint (client-side only)
 */
export function getCurrentBreakpoint(): keyof typeof BREAKPOINTS | null {
  if (typeof window === 'undefined') return null;
  
  const width = window.innerWidth;
  
  if (width >= BREAKPOINTS['4k']) return '4k';
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Hook to detect screen size changes
 */
export function useResponsive() {
  const [state, setState] = React.useState({
    isMobile: typeof window !== 'undefined' ? isMobile() : false,
    isTablet: typeof window !== 'undefined' ? isTablet() : false,
    isDesktop: typeof window !== 'undefined' ? isDesktop() : true,
    breakpoint: (typeof window !== 'undefined' ? getCurrentBreakpoint() : 'lg') as keyof typeof BREAKPOINTS,
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setState({
        isMobile: isMobile(),
        isTablet: isTablet(),
        isDesktop: isDesktop(),
        breakpoint: getCurrentBreakpoint() || 'lg',
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}

// React import for useResponsive hook
import * as React from 'react';
