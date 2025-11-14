'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * Skip Links Component
 * Provides keyboard navigation shortcuts to main content areas
 * Meets WCAG 2.1 requirement for bypass blocks
 */
export function SkipLinks() {
  const t = useTranslations('common');

  const skipLinks = [
    { href: '#main-content', label: t('accessibility.skipToMain') || 'Skip to main content' },
    { href: '#navigation', label: t('accessibility.skipToNav') || 'Skip to navigation' },
    { href: '#footer', label: t('accessibility.skipToFooter') || 'Skip to footer' },
  ];

  return (
    <div className="sr-only focus-within:not-sr-only">
      {skipLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={cn(
            'fixed top-4 left-4 z-[9999]',
            'bg-eco-leaf text-white px-4 py-2 rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-eco-forest focus:ring-offset-2',
            'transition-all duration-200',
            'font-medium text-sm',
            'shadow-lg'
          )}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
