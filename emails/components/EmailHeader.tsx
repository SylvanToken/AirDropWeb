import { Img, Section } from '@react-email/components';
import * as React from 'react';

/**
 * Email header component with Sylvan Token logo and branding
 * Uses the eco-friendly green color palette
 * Logo uses GitHub hosted URL for testing
 */
export function EmailHeader() {
  // Use GitHub hosted logo URL
  const logoSrc = 'https://github.com/SylvanToken/SylvanToken/raw/main/assets/images/sylvan-token-logo.png';
  
  return (
    <Section style={header}>
      <div style={logoContainer}>
        <Img
          src={logoSrc}
          width="144"
          height="144"
          alt="Sylvan Token"
          style={logo}
        /><div></div>
        <div style={brandText}>Sylvan Token</div>
      </div>
    </Section>
    
  );
}

// Styles
const header = {
  background: 'linear-gradient(135deg, hsl(145, 70%, 35%) 0%, hsl(140, 60%, 20%) 100%)',
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const logoContainer = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: '100%',
};

const logo = {
  display: 'block',
  margin: '0 auto',
};

const brandText = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#ffffff',
  letterSpacing: '-0.5px',
  textAlign: 'center' as const,
  width: '100%',
  margin: '0 auto',
};
