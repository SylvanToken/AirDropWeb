/**
 * Orientation Utilities
 * 
 * Utilities for detecting and handling device orientation
 */

import * as React from 'react';

/**
 * Orientation types
 */
export type Orientation = 'portrait' | 'landscape';

/**
 * Check if device is in landscape orientation (client-side only)
 */
export function isLandscape(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(orientation: landscape)').matches;
}

/**
 * Check if device is in portrait orientation (client-side only)
 */
export function isPortrait(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(orientation: portrait)').matches;
}

/**
 * Get current orientation (client-side only)
 */
export function getOrientation(): Orientation {
  return isLandscape() ? 'landscape' : 'portrait';
}

/**
 * Check if device is mobile in landscape (small screen + landscape)
 */
export function isMobileLandscape(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth < 768 && isLandscape();
}

/**
 * Check if device is tablet in landscape
 */
export function isTabletLandscape(): boolean {
  if (typeof window === 'undefined') return false;
  
  const width = window.innerWidth;
  return width >= 768 && width < 1024 && isLandscape();
}

/**
 * React hook for orientation detection
 */
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<Orientation>('portrait');
  const [isMobileLandscapeMode, setIsMobileLandscapeMode] = React.useState(false);
  const [isTabletLandscapeMode, setIsTabletLandscapeMode] = React.useState(false);

  React.useEffect(() => {
    const updateOrientation = () => {
      setOrientation(getOrientation());
      setIsMobileLandscapeMode(isMobileLandscape());
      setIsTabletLandscapeMode(isTabletLandscape());
    };

    // Initial check
    updateOrientation();

    // Listen for orientation changes
    const mediaQuery = window.matchMedia('(orientation: landscape)');
    const handleChange = () => updateOrientation();
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      // @ts-ignore
      mediaQuery.addListener(handleChange);
    }

    // Also listen for resize events (for when device rotates)
    window.addEventListener('resize', updateOrientation);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // @ts-ignore
        mediaQuery.removeListener(handleChange);
      }
      window.removeEventListener('resize', updateOrientation);
    };
  }, []);

  return {
    orientation,
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
    isMobileLandscape: isMobileLandscapeMode,
    isTabletLandscape: isTabletLandscapeMode,
  };
}

/**
 * Get optimal grid columns based on orientation and screen size
 */
export function getOptimalGridCols(
  portraitCols: number,
  landscapeCols: number
): number {
  if (typeof window === 'undefined') return portraitCols;
  
  return isLandscape() ? landscapeCols : portraitCols;
}

/**
 * Get optimal spacing based on orientation
 */
export function getOptimalSpacing(
  portraitSpacing: string,
  landscapeSpacing: string
): string {
  if (typeof window === 'undefined') return portraitSpacing;
  
  return isLandscape() ? landscapeSpacing : portraitSpacing;
}

/**
 * CSS class helper for orientation-specific styling
 */
export function orientationClass(
  portraitClass: string,
  landscapeClass: string
): string {
  if (typeof window === 'undefined') return portraitClass;
  
  return isLandscape() ? landscapeClass : portraitClass;
}
