/**
 * Touch Utilities
 * 
 * Utilities for touch-optimized interactions
 * Ensures WCAG 2.1 AA compliance with minimum 44x44px touch targets
 */

/**
 * Touch target sizes (in pixels)
 */
export const TOUCH_SIZES = {
  minimum: 44,      // WCAG 2.1 AA minimum
  comfortable: 48,  // Recommended for better UX
  large: 56,        // For primary actions
} as const;

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Add touch feedback to an element
 */
export function addTouchFeedback(element: HTMLElement) {
  if (!isTouchDevice()) return;

  element.addEventListener('touchstart', () => {
    element.style.transform = 'scale(0.98)';
    element.style.opacity = '0.9';
  });

  element.addEventListener('touchend', () => {
    element.style.transform = 'scale(1)';
    element.style.opacity = '1';
  });

  element.addEventListener('touchcancel', () => {
    element.style.transform = 'scale(1)';
    element.style.opacity = '1';
  });
}

/**
 * Prevent default touch behavior (like pull-to-refresh)
 */
export function preventTouchDefault(element: HTMLElement) {
  element.addEventListener('touchstart', (e) => {
    e.preventDefault();
  }, { passive: false });
}

/**
 * Detect swipe gestures
 */
export interface SwipeOptions {
  threshold?: number;  // Minimum distance for swipe (default: 50px)
  timeout?: number;    // Maximum time for swipe (default: 300ms)
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function detectSwipe(element: HTMLElement, options: SwipeOptions) {
  const threshold = options.threshold || 50;
  const timeout = options.timeout || 300;
  
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  element.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  });

  element.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const deltaTime = touchEndTime - touchStartTime;

    // Check if swipe is within timeout
    if (deltaTime > timeout) return;

    // Check if swipe distance exceeds threshold
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && options.onSwipeRight) {
          options.onSwipeRight();
        } else if (deltaX < 0 && options.onSwipeLeft) {
          options.onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && options.onSwipeDown) {
          options.onSwipeDown();
        } else if (deltaY < 0 && options.onSwipeUp) {
          options.onSwipeUp();
        }
      }
    }
  });
}

/**
 * React hook for touch detection
 */
export function useTouchDevice() {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  return isTouch;
}

/**
 * React hook for swipe detection
 */
export function useSwipe(options: SwipeOptions) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    detectSwipe(ref.current, options);
  }, [options]);

  return ref;
}

// React import
import * as React from 'react';
