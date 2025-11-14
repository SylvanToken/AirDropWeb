"use client";

import { useState, useEffect, useRef } from 'react';
import { Clock, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface TaskTimerProps {
  taskId: string;
  taskUrl: string;
  taskTitle: string;
  onComplete: (taskId: string, completionTime: number) => void;
  isCompleting: boolean;
}

export function TaskTimer({ taskId, taskUrl, taskTitle, onComplete, isCompleting }: TaskTimerProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [taskWindow, setTaskWindow] = useState<Window | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const windowCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const t = useTranslations('tasks');

  // Check if window is closed
  useEffect(() => {
    if (isActive && taskWindow) {
      windowCheckInterval.current = setInterval(() => {
        if (taskWindow.closed) {
          // Window closed before timer finished
          handleWindowClosed();
        }
      }, 500);

      return () => {
        if (windowCheckInterval.current) {
          clearInterval(windowCheckInterval.current);
        }
      };
    }
  }, [isActive, taskWindow]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Timer finished - auto complete
      const completionTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 30;
      onComplete(taskId, completionTime);
      setIsActive(false);
      
      // Close task window if still open
      if (taskWindow && !taskWindow.closed) {
        taskWindow.close();
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, taskId, onComplete, startTime, taskWindow]);

  const handleWindowClosed = () => {
    // Stop timer and reset
    setIsActive(false);
    setTimeLeft(30);
    setStartTime(null);
    setTaskWindow(null);
    setShowWarning(true);
    
    if (windowCheckInterval.current) {
      clearInterval(windowCheckInterval.current);
    }

    // Hide warning after 5 seconds
    setTimeout(() => {
      setShowWarning(false);
    }, 5000);
  };

  const handleStartTask = () => {
    if (!taskUrl) return;
    
    setShowWarning(false);
    
    // Open task URL in new window
    const newWindow = window.open(
      taskUrl, 
      '_blank',
      'width=1200,height=800,menubar=no,toolbar=no,location=yes,status=yes,scrollbars=yes,resizable=yes'
    );
    
    if (newWindow) {
      setTaskWindow(newWindow);
      
      // Try to set initial title
      try {
        newWindow.document.title = `⏱️ 30s - ${taskTitle}`;
      } catch (e) {
        // Cross-origin, can't set title
      }
    }
    
    // Start timer
    setIsActive(true);
    setStartTime(Date.now());
  };

  if (!isActive) {
    return (
      <div className="space-y-2">
        {showWarning && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-200">
                  {t('taskFailed')}
                </p>
                <p className="text-red-700 dark:text-red-300 mt-1">
                  {t('taskFailedMessage')}
                </p>
              </div>
            </div>
          </div>
        )}
        <Button
          onClick={handleStartTask}
          disabled={isCompleting || !taskUrl}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          {!taskUrl ? t('noLink') : t('startTask')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Timer Display */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-lg border-2 border-emerald-300 dark:border-emerald-700 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-600 animate-pulse" />
            <span className="font-bold text-lg text-emerald-900 dark:text-emerald-100">
              {t('timerActive')}
            </span>
          </div>
          <div className="text-4xl font-bold text-emerald-600 tabular-nums">
            {timeLeft}s
          </div>
        </div>
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          {t('timerDescription')}
        </p>
        <div className="mt-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-emerald-600 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <AlertTriangle className="w-4 h-4 inline mr-1" />
          {t('doNotCloseWindow')}
        </p>
      </div>
    </div>
  );
}
