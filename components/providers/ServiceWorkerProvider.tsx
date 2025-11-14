'use client';

import { useEffect } from 'react';
import { registerServiceWorker, isServiceWorkerSupported } from '@/lib/caching';

/**
 * Service Worker Provider
 * 
 * Registers the service worker for offline support and caching.
 */
export function ServiceWorkerProvider() {
  useEffect(() => {
    // Only register in production and if supported
    if (
      process.env.NODE_ENV === 'production' &&
      isServiceWorkerSupported()
    ) {
      registerServiceWorker()
        .then((registration) => {
          if (registration) {
            console.log('Service Worker registered successfully');
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (
                    newWorker.state === 'installed' &&
                    navigator.serviceWorker.controller
                  ) {
                    // New service worker available
                    console.log('New service worker available');
                    
                    // Optionally show update notification
                    if (window.confirm('New version available! Reload to update?')) {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                    }
                  }
                });
              }
            });
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
      
      // Listen for controller change (new service worker activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
      });
    }
  }, []);

  // This component doesn't render anything
  return null;
}
