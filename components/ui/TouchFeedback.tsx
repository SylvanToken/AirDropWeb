'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TouchFeedbackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Strength of the touch feedback
   * @default 'normal'
   */
  strength?: 'subtle' | 'normal' | 'strong';
  
  /**
   * Whether to disable touch feedback
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether the element is a touch target (ensures minimum size)
   * @default true
   */
  touchTarget?: boolean;
  
  /**
   * Custom touch target size
   */
  touchSize?: 'sm' | 'md' | 'lg';
}

/**
 * TouchFeedback component
 * Provides visual feedback for touch interactions
 * Ensures WCAG 2.1 AA compliance with minimum touch target sizes
 */
export function TouchFeedback({
  strength = 'normal',
  disabled = false,
  touchTarget = true,
  touchSize = 'md',
  className,
  children,
  ...props
}: TouchFeedbackProps) {
  const feedbackClasses = {
    subtle: 'touch-feedback-subtle',
    normal: 'touch-feedback',
    strong: 'touch-feedback-strong',
  };

  const touchSizeClasses = {
    sm: 'touch-target-sm',
    md: 'touch-target',
    lg: 'touch-target-lg',
  };

  return (
    <div
      className={cn(
        !disabled && feedbackClasses[strength],
        touchTarget && touchSizeClasses[touchSize],
        'tap-highlight-eco',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SwipeableProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Callback when swiped left
   */
  onSwipeLeft?: () => void;
  
  /**
   * Callback when swiped right
   */
  onSwipeRight?: () => void;
  
  /**
   * Callback when swiped up
   */
  onSwipeUp?: () => void;
  
  /**
   * Callback when swiped down
   */
  onSwipeDown?: () => void;
  
  /**
   * Minimum distance for swipe detection (in pixels)
   * @default 50
   */
  threshold?: number;
  
  /**
   * Maximum time for swipe detection (in milliseconds)
   * @default 300
   */
  timeout?: number;
  
  /**
   * Whether to show swipe indicator
   * @default false
   */
  showIndicator?: boolean;
}

/**
 * Swipeable component
 * Detects swipe gestures on touch devices
 */
export function Swipeable({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  timeout = 300,
  showIndicator = false,
  className,
  children,
  ...props
}: SwipeableProps) {
  const [isSwiping, setIsSwiping] = React.useState(false);
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);
  const touchStartTime = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    setIsSwiping(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();

    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    const deltaTime = touchEndTime - touchStartTime.current;

    setIsSwiping(false);

    // Check if swipe is within timeout
    if (deltaTime > timeout) return;

    // Check if swipe distance exceeds threshold
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }
  };

  return (
    <div
      className={cn('relative', className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {showIndicator && isSwiping && (
        <div className="swipe-indicator active" />
      )}
      {children}
    </div>
  );
}

interface TouchRippleProps {
  /**
   * Color of the ripple effect
   * @default 'eco-leaf'
   */
  color?: string;
  
  /**
   * Duration of the ripple animation (in milliseconds)
   * @default 600
   */
  duration?: number;
}

/**
 * TouchRipple component
 * Adds Material Design-style ripple effect on touch
 */
export function TouchRipple({ color = 'eco-leaf', duration = 600 }: TouchRippleProps) {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

  const addRipple = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, duration);
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none rounded-inherit"
      onTouchStart={addRipple}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            backgroundColor: `hsl(var(--${color}) / 0.3)`,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
}
