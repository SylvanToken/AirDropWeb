"use client";

import { useState, useEffect, memo } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { formatTime, getUrgencyLevel, getTimerStore } from '@/lib/tasks/timer-manager';
import { cn } from '@/lib/utils';

interface TaskTimerDisplayProps {
  taskId: string;
  deadline: Date;
  onExpire?: () => void;
  variant?: 'compact' | 'full';
  className?: string;
}

/**
 * TaskTimerDisplay Component
 * 
 * Displays a real-time countdown timer for scheduled tasks.
 * Features:
 * - Real-time countdown with seconds precision
 * - Visual urgency indicators (color changes based on remaining time)
 * - Automatic expiration handling
 * - ARIA live regions for screen reader support
 * - Compact and full display variants
 */
const TaskTimerDisplayComponent = ({
  taskId,
  deadline,
  onExpire,
  variant = 'full',
  className,
}: TaskTimerDisplayProps) => {
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timerStore = getTimerStore();
    const timer = timerStore.getTimer(taskId);

    // Calculate initial remaining time
    const calculateRemaining = () => {
      const now = Date.now();
      const deadlineTime = new Date(deadline).getTime();
      const remaining = Math.max(0, Math.floor((deadlineTime - now) / 1000));
      return remaining;
    };

    let lastRemaining = -1;
    let lastUrgency: 'low' | 'medium' | 'high' | 'critical' | null = null;

    const updateTimer = () => {
      const remaining = calculateRemaining();
      
      // Only update state if value changed (reduce re-renders)
      if (remaining !== lastRemaining) {
        setRemainingTime(remaining);
        lastRemaining = remaining;

        // Calculate total duration for urgency level
        const timer = timerStore.getTimer(taskId);
        const totalDuration = timer?.duration || remaining;
        const urgency = getUrgencyLevel(remaining, totalDuration);
        
        // Only update urgency if it changed
        if (urgency !== lastUrgency) {
          setUrgencyLevel(urgency);
          lastUrgency = urgency;
        }

        // Check if expired
        if (remaining === 0 && !isExpired) {
          setIsExpired(true);
          if (onExpire) {
            onExpire();
          }
        }
      }
    };

    // Initial update
    updateTimer();

    // Subscribe to timer updates
    const unsubscribe = timerStore.subscribe(() => {
      updateTimer();
    });

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [taskId, deadline, onExpire, isExpired]);

  // Get color classes based on urgency
  const getColorClasses = () => {
    if (isExpired) {
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-300 dark:border-red-700',
        text: 'text-red-900 dark:text-red-100',
        icon: 'text-red-600 dark:text-red-400',
        progress: 'bg-red-600',
      };
    }

    switch (urgencyLevel) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-300 dark:border-red-700',
          text: 'text-red-900 dark:text-red-100',
          icon: 'text-red-600 dark:text-red-400',
          progress: 'bg-red-600',
        };
      case 'high':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-300 dark:border-orange-700',
          text: 'text-orange-900 dark:text-orange-100',
          icon: 'text-orange-600 dark:text-orange-400',
          progress: 'bg-orange-600',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-300 dark:border-yellow-700',
          text: 'text-yellow-900 dark:text-yellow-100',
          icon: 'text-yellow-600 dark:text-yellow-400',
          progress: 'bg-yellow-600',
        };
      default:
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          border: 'border-emerald-300 dark:border-emerald-700',
          text: 'text-emerald-900 dark:text-emerald-100',
          icon: 'text-emerald-600 dark:text-emerald-400',
          progress: 'bg-emerald-600',
        };
    }
  };

  const colors = getColorClasses();
  const formattedTime = formatTime(remainingTime);

  // Compact variant - single line display
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
          colors.bg,
          colors.border,
          colors.text,
          'border',
          className
        )}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={
          isExpired
            ? 'Task expired'
            : `Time remaining: ${formattedTime}`
        }
      >
        {isExpired ? (
          <AlertCircle className={cn('w-4 h-4', colors.icon)} />
        ) : (
          <Clock className={cn('w-4 h-4', colors.icon)} />
        )}
        <span className="tabular-nums">
          {isExpired ? 'Expired' : formattedTime}
        </span>
      </div>
    );
  }

  // Full variant - detailed display with progress bar
  return (
    <div
      className={cn(
        'rounded-lg border-2 p-4 space-y-3',
        colors.bg,
        colors.border,
        className
      )}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={
        isExpired
          ? 'Task expired'
          : `Time remaining: ${formattedTime}`
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isExpired ? (
            <AlertCircle className={cn('w-5 h-5', colors.icon)} />
          ) : (
            <Clock
              className={cn(
                'w-5 h-5',
                colors.icon,
                urgencyLevel === 'critical' && 'animate-pulse'
              )}
            />
          )}
          <span className={cn('font-semibold', colors.text)}>
            {isExpired ? 'Expired' : 'Time Remaining'}
          </span>
        </div>
        <div
          className={cn(
            'text-2xl font-bold tabular-nums',
            colors.text
          )}
        >
          {formattedTime}
        </div>
      </div>

      {/* Progress Bar */}
      {!isExpired && (
        <div className="space-y-1">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-1000 ease-linear',
                colors.progress
              )}
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, (remainingTime / (remainingTime + 1)) * 100)
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Urgency Message */}
      {urgencyLevel === 'critical' && !isExpired && (
        <p className={cn('text-sm font-medium', colors.text)}>
          ⚠️ Urgent: Complete this task soon!
        </p>
      )}

      {isExpired && (
        <p className={cn('text-sm font-medium', colors.text)}>
          This task has expired and can no longer be completed.
        </p>
      )}
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const TaskTimerDisplay = memo(TaskTimerDisplayComponent);
