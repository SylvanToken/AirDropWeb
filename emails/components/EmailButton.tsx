import { Button } from '@react-email/components';
import * as React from 'react';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  priority?: 'normal' | 'high';
  fullWidth?: boolean;
}

/**
 * Reusable button component for emails with Sylvan Token branding
 * Supports multiple variants, priority levels, and responsive design
 */
export function EmailButton({
  href,
  children,
  variant = 'primary',
  priority = 'normal',
  fullWidth = false,
}: EmailButtonProps) {
  const buttonStyle = {
    ...baseButton,
    ...(variant === 'primary' && primaryButton),
    ...(variant === 'secondary' && secondaryButton),
    ...(variant === 'outline' && outlineButton),
    ...(priority === 'high' && highPriorityButton),
    ...(fullWidth && { width: '100%' }),
  };

  return (
    <Button href={href} style={buttonStyle}>
      {children}
    </Button>
  );
}

// Base button styles
const baseButton = {
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: 'none',
  lineHeight: '20px',
  WebkitFontSmoothing: 'antialiased' as const,
  MozOsxFontSmoothing: 'grayscale' as const,
};

// Primary button (eco-friendly green)
const primaryButton = {
  backgroundColor: '#2d7a4f',
  color: '#ffffff',
  boxShadow: '0 2px 8px rgba(45, 122, 79, 0.25)',
};

// Secondary button (lighter green)
const secondaryButton = {
  backgroundColor: '#4a9d6f',
  color: '#ffffff',
  boxShadow: '0 2px 8px rgba(74, 157, 111, 0.25)',
};

// Outline button
const outlineButton = {
  backgroundColor: 'transparent',
  color: '#2d7a4f',
  border: '2px solid #2d7a4f',
  boxShadow: 'none',
};

// High priority button (urgent actions)
const highPriorityButton = {
  backgroundColor: '#dc2626',
  color: '#ffffff',
  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
  fontWeight: '700' as const,
};
