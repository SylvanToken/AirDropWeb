"use client";

import { useEffect, useRef, useState } from 'react';
import { getTimerStore, TaskTimer } from './timer-manager';

/**
 * Hook for timer persistence and recovery
 * 
 * Features:
 * - Loads active timers on mount
 * - Syncs timers with server periodically
 * - Handles expired timers that occurred while offline
 * - Provides timer state updates
 */
export function useTimerPersistence(userId?: string) {
  const [timers, setTimers] = useState<TaskTimer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerStoreRef = useRef(getTimerStore());
  const hasInitialized = useRef(false);

  // Initialize timers on mount
  useEffect(() => {
    if (hasInitialized.current || !userId) {
      return;
    }

    hasInitialized.current = true;
    const timerStore = timerStoreRef.current;

    // Load timers from localStorage
    try {
      timerStore.loadFromStorage();
      
      // Get user's timers
      const userTimers = Array.from(timerStore['timers'].values()).filter(
        (timer) => timer.userId === userId
      );
      
      setTimers(userTimers);
      setIsLoading(false);

      // Sync with server on load
      timerStore.syncWithServer().catch((err) => {
        console.error('Failed to sync timers on load:', err);
        setError('Failed to sync timers with server');
      });
    } catch (err) {
      console.error('Failed to load timers:', err);
      setError('Failed to load timers');
      setIsLoading(false);
    }
  }, [userId]);

  // Subscribe to timer updates
  useEffect(() => {
    if (!userId) {
      return;
    }

    const timerStore = timerStoreRef.current;

    const unsubscribe = timerStore.subscribe((allTimers) => {
      const userTimers = allTimers.filter((timer) => timer.userId === userId);
      setTimers(userTimers);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  // Handle visibility change - sync when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userId) {
        const timerStore = timerStoreRef.current;
        timerStore.syncWithServer().catch((err) => {
          console.error('Failed to sync timers on visibility change:', err);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (userId) {
        const timerStore = timerStoreRef.current;
        timerStore.syncWithServer().catch((err) => {
          console.error('Failed to sync timers on reconnection:', err);
        });
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [userId]);

  return {
    timers,
    isLoading,
    error,
    timerStore: timerStoreRef.current,
  };
}

/**
 * Hook for a single task timer
 */
export function useTaskTimer(taskId: string, userId: string) {
  const { timers, timerStore } = useTimerPersistence(userId);
  const timer = timers.find((t) => t.taskId === taskId);

  const startTimer = (duration: number) => {
    return timerStore.startTimer(taskId, userId, duration);
  };

  const pauseTimer = () => {
    timerStore.pauseTimer(taskId);
  };

  const resumeTimer = () => {
    timerStore.resumeTimer(taskId);
  };

  const completeTimer = () => {
    timerStore.completeTimer(taskId);
  };

  const expireTimer = () => {
    timerStore.expireTimer(taskId);
  };

  return {
    timer,
    startTimer,
    pauseTimer,
    resumeTimer,
    completeTimer,
    expireTimer,
    remainingTime: timer ? timerStore.getRemainingTime(taskId) : 0,
  };
}
