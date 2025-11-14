import {
  Body,
  Container,
  Head,
  Html,
  Preview,
} from '@react-email/components';
import * as React from 'react';
import { EmailHeader } from './EmailHeader';
import { EmailFooter } from './EmailFooter';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  locale?: string;
}

/**
 * Base email layout component with Sylvan Token branding
 * Provides consistent structure for all email templates
 */
export function EmailLayout({
  preview,
  children,
  locale = 'en',
}: EmailLayoutProps) {
  return (
    <Html lang={locale}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="format-detection" content="telephone=no,address=no,email=no,date=no" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />
          <div style={content}>{children}</div>
          <EmailFooter locale={locale} />
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  WebkitFontSmoothing: 'antialiased' as const,
  MozOsxFontSmoothing: 'grayscale' as const,
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden' as const,
  boxShadow: '0 4px 20px -2px rgba(45, 122, 79, 0.15)',
};

const content = {
  padding: '32px 40px',
};
