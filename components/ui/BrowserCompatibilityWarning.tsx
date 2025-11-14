'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { isBrowserSupported } from '@/lib/browser-detection';

/**
 * Browser Compatibility Warning Component
 * Displays a warning banner if the user's browser is not fully supported
 */
export function BrowserCompatibilityWarning() {
  const [warning, setWarning] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const { supported, reason } = isBrowserSupported();
    
    if (!supported && reason) {
      setWarning(reason);
    }
  }, []);

  if (!warning || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 dark:bg-yellow-600 text-yellow-950 dark:text-yellow-50 px-4 py-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">{warning}</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 hover:bg-yellow-600 dark:hover:bg-yellow-700 rounded transition-colors"
          aria-label="Dismiss warning"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
