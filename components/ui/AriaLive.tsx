'use client';

import { useEffect, useRef } from 'react';

/**
 * ARIA Live Region Component
 * Announces dynamic content changes to screen readers
 */
interface AriaLiveProps {
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
  clearAfter?: number; // Clear message after X milliseconds
  className?: string;
}

export function AriaLive({ 
  message, 
  politeness = 'polite', 
  clearAfter,
  className = 'sr-only'
}: AriaLiveProps) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (clearAfter && message) {
      timeoutRef.current = setTimeout(() => {
        // Message will be cleared by parent component
      }, clearAfter);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className={className}
    >
      {message}
    </div>
  );
}

/**
 * Status Message Component
 * For success/error messages that should be announced
 */
interface StatusMessageProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  visible?: boolean;
}

export function StatusMessage({ type, message, visible = true }: StatusMessageProps) {
  if (!visible || !message) return null;

  const politeness = type === 'error' ? 'assertive' : 'polite';

  return (
    <AriaLive 
      message={message} 
      politeness={politeness}
      clearAfter={5000}
    />
  );
}

/**
 * Loading Announcement Component
 * Announces loading states to screen readers
 */
interface LoadingAnnouncementProps {
  isLoading: boolean;
  loadingMessage?: string;
  completeMessage?: string;
}

export function LoadingAnnouncement({ 
  isLoading, 
  loadingMessage = 'Loading...', 
  completeMessage = 'Content loaded'
}: LoadingAnnouncementProps) {
  return (
    <AriaLive 
      message={isLoading ? loadingMessage : completeMessage}
      politeness="polite"
    />
  );
}
