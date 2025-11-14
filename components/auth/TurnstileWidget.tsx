'use client';

/**
 * Cloudflare Turnstile Widget Component
 * 
 * Bot protection for signup/login forms
 * Mode: Managed (auto-detects if challenge needed)
 */

import { useEffect, useRef, useState } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
    };
    onTurnstileLoad?: () => void;
  }
}

export function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  className = '',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      setError('Turnstile site key not configured');
      console.error('[Turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY not found');
      return;
    }

    // Load Turnstile script
    const loadTurnstile = () => {
      if (window.turnstile) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsLoaded(true);
      };
      
      script.onerror = () => {
        setError('Failed to load Turnstile');
        console.error('[Turnstile] Failed to load script');
      };

      document.head.appendChild(script);
    };

    loadTurnstile();

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          console.error('[Turnstile] Cleanup error:', e);
        }
      }
    };
  }, [siteKey]);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.turnstile || !siteKey) {
      return;
    }

    // Render Turnstile widget
    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
        size: 'normal',
        callback: (token: string) => {
          console.log('[Turnstile] Verification successful');
          onVerify(token);
        },
        'error-callback': () => {
          console.error('[Turnstile] Verification error');
          setError('Verification failed');
          onError?.();
        },
        'expired-callback': () => {
          console.log('[Turnstile] Token expired');
          onExpire?.();
        },
        'timeout-callback': () => {
          console.error('[Turnstile] Verification timeout');
          setError('Verification timeout');
          onError?.();
        },
      });
    } catch (e) {
      console.error('[Turnstile] Render error:', e);
      setError('Failed to render widget');
    }
  }, [isLoaded, siteKey, onVerify, onError, onExpire]);

  if (error) {
    return (
      <div className={`text-sm text-red-600 ${className}`}>
        {error}
      </div>
    );
  }

  if (!siteKey) {
    return null;
  }

  return (
    <div className={className}>
      <div ref={containerRef} />
    </div>
  );
}

/**
 * Reset Turnstile widget
 */
export function resetTurnstile(widgetId?: string) {
  if (window.turnstile && widgetId) {
    try {
      window.turnstile.reset(widgetId);
    } catch (e) {
      console.error('[Turnstile] Reset error:', e);
    }
  }
}

/**
 * Get Turnstile response token
 */
export function getTurnstileResponse(widgetId?: string): string | null {
  if (window.turnstile && widgetId) {
    try {
      return window.turnstile.getResponse(widgetId);
    } catch (e) {
      console.error('[Turnstile] Get response error:', e);
      return null;
    }
  }
  return null;
}
