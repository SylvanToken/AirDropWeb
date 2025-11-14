'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

/**
 * Keyboard Shortcuts Hook
 * Implements common keyboard shortcuts for navigation
 */
export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if no input/textarea is focused
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Alt + H: Home
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        router.push('/');
      }

      // Alt + D: Dashboard
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        router.push('/dashboard');
      }

      // Alt + T: Tasks
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        router.push('/tasks');
      }

      // Alt + L: Leaderboard
      if (e.altKey && e.key === 'l') {
        e.preventDefault();
        router.push('/leaderboard');
      }

      // Alt + P: Profile
      if (e.altKey && e.key === 'p') {
        e.preventDefault();
        router.push('/profile');
      }

      // Escape: Close modals (handled by individual components)
      // Tab: Native browser behavior for focus management
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
}

/**
 * Keyboard Shortcuts Provider Component
 * Wraps the app to enable keyboard shortcuts
 */
export function KeyboardShortcutsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useKeyboardShortcuts();
  return <>{children}</>;
}

/**
 * Keyboard Shortcuts Help Component
 * Displays available keyboard shortcuts
 */
export function KeyboardShortcutsHelp() {
  const t = useTranslations('common');

  const shortcuts = [
    { keys: 'Alt + H', description: t('shortcuts.home') || 'Go to Home' },
    { keys: 'Alt + D', description: t('shortcuts.dashboard') || 'Go to Dashboard' },
    { keys: 'Alt + T', description: t('shortcuts.tasks') || 'Go to Tasks' },
    { keys: 'Alt + L', description: t('shortcuts.leaderboard') || 'Go to Leaderboard' },
    { keys: 'Alt + P', description: t('shortcuts.profile') || 'Go to Profile' },
    { keys: 'Tab', description: t('shortcuts.tab') || 'Navigate between elements' },
    { keys: 'Shift + Tab', description: t('shortcuts.shiftTab') || 'Navigate backwards' },
    { keys: 'Enter', description: t('shortcuts.enter') || 'Activate focused element' },
    { keys: 'Escape', description: t('shortcuts.escape') || 'Close modal/dropdown' },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-eco-forest dark:text-eco-leaf">
        {t('shortcuts.title') || 'Keyboard Shortcuts'}
      </h3>
      <div className="space-y-1">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.keys}
            className="flex items-center justify-between text-sm"
          >
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
              {shortcut.keys}
            </kbd>
            <span className="text-muted-foreground ml-4">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
