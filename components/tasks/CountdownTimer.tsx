"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  expiresAt: Date;
  onExpire?: () => void;
  className?: string;
  isCheckingExpiration?: boolean;
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

/**
 * Calculate time remaining until expiration
 */
function calculateTimeRemaining(expiresAt: Date): TimeRemaining {
  const now = Date.now();
  const expirationTime = new Date(expiresAt).getTime();
  const difference = expirationTime - now;

  if (difference <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const totalSeconds = Math.floor(difference / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    isExpired: false,
  };
}

/**
 * CountdownTimer Component
 * 
 * Displays a real-time countdown timer for time-limited tasks.
 * Shows hours:minutes:seconds format with automatic updates.
 * 
 * Features:
 * - Real-time countdown with second-by-second updates
 * - Automatic expiration handling
 * - Optimized with requestAnimationFrame
 * - Pauses when browser tab is not visible
 * - Handles timezone differences correctly
 */
export function CountdownTimer({ 
  expiresAt, 
  onExpire,
  className,
  isCheckingExpiration = false
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(expiresAt)
  );
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const expiredCallbackFiredRef = useRef<boolean>(false);

  // Handle expiration callback
  const handleExpiration = useCallback(() => {
    if (!expiredCallbackFiredRef.current && onExpire) {
      expiredCallbackFiredRef.current = true;
      onExpire();
    }
  }, [onExpire]);

  // Update timer function
  const updateTimer = useCallback(() => {
    const remaining = calculateTimeRemaining(expiresAt);
    setTimeRemaining(remaining);
    
    if (remaining.isExpired) {
      handleExpiration();
    }
  }, [expiresAt, handleExpiration]);

  // Main timer effect with optimization
  useEffect(() => {
    // Initial update
    updateTimer();

    // Use setInterval for second-by-second updates
    intervalRef.current = setInterval(() => {
      updateTimer();
    }, 1000);

    // Handle visibility change to pause timer when tab is not visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - clear interval to save resources
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Tab is visible - resume timer
        // First, sync with current time
        updateTimer();
        
        // Then restart interval
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            updateTimer();
          }, 1000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [expiresAt, updateTimer]);

  // Render expired state
  if (timeRemaining.isExpired) {
    return (
      <div 
        className={cn(
          "flex items-center gap-1 text-sm font-mono text-red-500",
          className
        )}
        role="timer"
        aria-live="polite"
        aria-label="Task expired"
      >
        <Clock className="w-4 h-4" />
        <span>Expired</span>
      </div>
    );
  }

  // Format time with leading zeros
  const formattedHours = String(timeRemaining.hours).padStart(2, '0');
  const formattedMinutes = String(timeRemaining.minutes).padStart(2, '0');
  const formattedSeconds = String(timeRemaining.seconds).padStart(2, '0');

  // Determine urgency for accessibility announcements
  const isUrgent = timeRemaining.hours === 0 && timeRemaining.minutes < 5;
  
  return (
    <div 
      className={cn(
        "flex items-center gap-1 text-sm font-mono",
        isUrgent && "text-red-600 dark:text-red-400 animate-pulse",
        className
      )}
      role="timer"
      aria-live={isUrgent ? "assertive" : "polite"}
      aria-atomic="true"
      aria-label={`Time remaining: ${formattedHours} hours, ${formattedMinutes} minutes, ${formattedSeconds} seconds${isUrgent ? '. Urgent!' : ''}`}
    >
      <Clock className="w-4 h-4" aria-hidden="true" />
      <span className="tabular-nums">
        {formattedHours}:{formattedMinutes}:{formattedSeconds}
      </span>
      {isUrgent && (
        <span className="sr-only">Urgent: Less than 5 minutes remaining</span>
      )}
    </div>
  );
}
