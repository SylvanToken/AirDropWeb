import {
  Heading,
  Text,
  Section,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { EmailButton } from './components/EmailButton';
import { getEmailTranslations, replacePlaceholders } from '@/lib/email/translations';
import { maskWalletAddress } from '@/lib/email/utils';

interface WalletPendingEmailProps {
  username: string;
  walletAddress: string;
  walletStatusUrl: string;
  locale?: string;
}

/**
 * Wallet Pending Verification Email Template
 * 
 * Sent to users after submitting their wallet address for verification.
 * Includes masked wallet address, verification status, and next steps.
 * 
 * Requirements: 3.1, 3.4, 3.5
 */
export default function WalletPendingEmail({
  username = 'User',
  walletAddress = '0x1234567890abcdef1234567890abcdef12345678',
  walletStatusUrl = 'https://sylvantoken.org/wallet',
  locale = 'en',
}: WalletPendingEmailProps) {
  const t = getEmailTranslations(locale);
  const maskedAddress = maskWalletAddress(walletAddress);
  
  return (
    <EmailLayout preview={t.walletPending.preview} locale={locale}>
      {/* Title */}
      <Heading style={h1}>{t.walletPending.title}</Heading>
      
      {/* Greeting */}
      <Text style={text}>
        {replacePlaceholders(t.welcome.greeting, { username })}
      </Text>
      
      {/* Main Message */}
      <Text style={text}>{t.walletPending.message}</Text>
      
      {/* Wallet Address Display Card */}
      <Section style={walletCard}>
        <table style={walletTable}>
          <tbody>
            <tr>
              <td style={walletIconCell}>
                <div style={walletIcon}>👛</div>
              </td>
              <td style={walletInfoCell}>
                <div style={walletLabel}>
                  {replacePlaceholders(t.walletPending.walletAddress, { address: '' }).replace(':', '').trim()}
                </div>
                <div style={walletValue}>{maskedAddress}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>
      
      {/* Status Badge */}
      <Section style={statusBadgeContainer}>
        <div style={statusBadge}>
          <span style={statusIcon}>⏳</span>
          <span style={statusText}>
            {locale === 'en' && 'Verification Pending'}
            {locale === 'tr' && 'Doğrulama Beklemede'}
            {locale === 'de' && 'Verifizierung ausstehend'}
            {locale === 'zh' && '验证待处理'}
            {locale === 'ru' && 'Ожидает верификации'}
          </span>
        </div>
      </Section>
      
      <Hr style={divider} />
      
      {/* Next Steps Section */}
      <Text style={sectionTitle}>{t.walletPending.nextSteps}</Text>
      
      <table style={stepsList}>
        <tbody>
          <tr>
            <td style={stepNumber}>1</td>
            <td style={stepText}>{t.walletPending.step1}</td>
          </tr>
          <tr>
            <td style={stepNumber}>2</td>
            <td style={stepText}>{t.walletPending.step2}</td>
          </tr>
        </tbody>
      </table>
      
      {/* Call-to-Action Button */}
      <Section style={buttonContainer}>
        <EmailButton href={walletStatusUrl}>
          {t.walletPending.ctaButton}
        </EmailButton>
      </Section>
      
      <Hr style={divider} />
      
      {/* Support Information */}
      <Section style={supportSection}>
        <Text style={supportTitle}>
          {t.common.needHelp}
        </Text>
        <Text style={supportText}>
          {t.common.support}
        </Text>
      </Section>
    </EmailLayout>
  );
}

// Styles
const h1 = {
  color: '#2d7a4f',
  fontSize: '28px',
  fontWeight: '700' as const,
  lineHeight: '1.3',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const walletCard = {
  backgroundColor: '#f8faf9',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
  border: '2px solid #e5f3ed',
};

const walletTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const walletIconCell = {
  width: '60px',
  verticalAlign: 'middle' as const,
  textAlign: 'center' as const,
};

const walletIcon = {
  fontSize: '36px',
  lineHeight: '1',
};

const walletInfoCell = {
  verticalAlign: 'middle' as const,
  paddingLeft: '16px',
};

const walletLabel = {
  color: '#6b7280',
  fontSize: '13px',
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: '6px',
};

const walletValue = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600' as const,
  fontFamily: 'monospace',
  letterSpacing: '0.5px',
};

const statusBadgeContainer = {
  textAlign: 'center' as const,
  margin: '20px 0',
};

const statusBadge = {
  display: 'inline-block',
  backgroundColor: '#fef3c7',
  color: '#92400e',
  padding: '10px 20px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: '600' as const,
  border: '2px solid #fbbf24',
};

const statusIcon = {
  marginRight: '8px',
};

const statusText = {
  verticalAlign: 'middle' as const,
};

const divider = {
  borderColor: '#e5e7eb',
  borderStyle: 'solid' as const,
  borderWidth: '1px 0 0 0',
  margin: '32px 0',
};

const sectionTitle = {
  color: '#2d7a4f',
  fontSize: '18px',
  fontWeight: '600' as const,
  lineHeight: '1.4',
  margin: '0 0 16px',
};

const stepsList = {
  width: '100%',
  margin: '0 0 24px',
  borderCollapse: 'collapse' as const,
};

const stepNumber = {
  backgroundColor: '#2d7a4f',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700' as const,
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  textAlign: 'center' as const,
  verticalAlign: 'middle' as const,
  padding: '0',
};

const stepText = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '1.5',
  padding: '8px 0 8px 16px',
  verticalAlign: 'middle' as const,
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const supportSection = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
};

const supportTitle = {
  color: '#2d7a4f',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0 0 8px',
};

const supportText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};
