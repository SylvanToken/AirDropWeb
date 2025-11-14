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

interface WalletRejectedEmailProps {
  username: string;
  walletAddress: string;
  rejectionReason: string;
  updateWalletUrl: string;
  locale?: string;
}

/**
 * Wallet Rejected Email Template
 * 
 * Sent to users when their wallet address verification is rejected.
 * Includes masked wallet address, rejection reason, and instructions to resubmit.
 * 
 * Requirements: 3.3, 3.4, 3.5
 */
export default function WalletRejectedEmail({
  username = 'User',
  walletAddress = '0x1234567890abcdef1234567890abcdef12345678',
  rejectionReason = 'Invalid wallet address format',
  updateWalletUrl = 'https://sylvantoken.org/wallet',
  locale = 'en',
}: WalletRejectedEmailProps) {
  const t = getEmailTranslations(locale);
  const maskedAddress = maskWalletAddress(walletAddress);
  
  return (
    <EmailLayout preview={t.walletRejected.preview} locale={locale}>
      {/* Title */}
      <Heading style={h1}>{t.walletRejected.title}</Heading>
      
      {/* Greeting */}
      <Text style={text}>
        {replacePlaceholders(t.welcome.greeting, { username })}
      </Text>
      
      {/* Main Message */}
      <Text style={text}>{t.walletRejected.message}</Text>
      
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
                  {replacePlaceholders(t.walletRejected.walletAddress, { address: '' }).replace(':', '').trim()}
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
          <span style={statusIcon}>⚠️</span>
          <span style={statusText}>
            {locale === 'en' && 'Verification Failed'}
            {locale === 'tr' && 'Doğrulama Başarısız'}
            {locale === 'de' && 'Verifizierung fehlgeschlagen'}
            {locale === 'zh' && '验证失败'}
            {locale === 'ru' && 'Верификация не удалась'}
          </span>
        </div>
      </Section>
      
      <Hr style={divider} />
      
      {/* Rejection Reason Section */}
      <Section style={reasonSection}>
        <Text style={reasonTitle}>
          {replacePlaceholders(t.walletRejected.reason, { reason: '' }).replace(':', '').trim()}
        </Text>
        <div style={reasonBox}>
          <Text style={reasonText}>{rejectionReason}</Text>
        </div>
      </Section>
      
      <Hr style={divider} />
      
      {/* Common Issues Section */}
      <Text style={sectionTitle}>
        {locale === 'en' && 'Common Issues:'}
        {locale === 'tr' && 'Yaygın Sorunlar:'}
        {locale === 'de' && 'Häufige Probleme:'}
        {locale === 'zh' && '常见问题：'}
        {locale === 'ru' && 'Распространенные проблемы:'}
      </Text>
      
      <table style={issuesList}>
        <tbody>
          <tr>
            <td style={issueIcon}>❌</td>
            <td style={issueText}>
              {locale === 'en' && 'Invalid wallet address format'}
              {locale === 'tr' && 'Geçersiz cüzdan adresi formatı'}
              {locale === 'de' && 'Ungültiges Wallet-Adressformat'}
              {locale === 'zh' && '无效的钱包地址格式'}
              {locale === 'ru' && 'Неверный формат адреса кошелька'}
            </td>
          </tr>
          <tr>
            <td style={issueIcon}>❌</td>
            <td style={issueText}>
              {locale === 'en' && 'Wallet address already registered'}
              {locale === 'tr' && 'Cüzdan adresi zaten kayıtlı'}
              {locale === 'de' && 'Wallet-Adresse bereits registriert'}
              {locale === 'zh' && '钱包地址已注册'}
              {locale === 'ru' && 'Адрес кошелька уже зарегистрирован'}
            </td>
          </tr>
          <tr>
            <td style={issueIcon}>❌</td>
            <td style={issueText}>
              {locale === 'en' && 'Unsupported blockchain network'}
              {locale === 'tr' && 'Desteklenmeyen blockchain ağı'}
              {locale === 'de' && 'Nicht unterstütztes Blockchain-Netzwerk'}
              {locale === 'zh' && '不支持的区块链网络'}
              {locale === 'ru' && 'Неподдерживаемая сеть блокчейна'}
            </td>
          </tr>
        </tbody>
      </table>
      
      <Hr style={divider} />
      
      {/* Next Steps */}
      <Section style={nextStepsSection}>
        <Text style={nextStepsTitle}>
          {locale === 'en' && "What You Can Do:"}
          {locale === 'tr' && 'Yapabilecekleriniz:'}
          {locale === 'de' && 'Was Sie tun können:'}
          {locale === 'zh' && '您可以做什么：'}
          {locale === 'ru' && 'Что вы можете сделать:'}
        </Text>
        <Text style={nextStepsText}>
          {t.walletRejected.nextSteps}
        </Text>
      </Section>
      
      {/* Call-to-Action Button */}
      <Section style={buttonContainer}>
        <EmailButton href={updateWalletUrl}>
          {t.walletRejected.ctaButton}
        </EmailButton>
      </Section>
      
      <Hr style={divider} />
      
      {/* Support Information */}
      <Section style={supportSection}>
        <Text style={supportTitle}>
          {t.common.needHelp}
        </Text>
        <Text style={supportText}>
          {locale === 'en' && "If you believe this is an error or need assistance, please contact our support team. We're here to help!"}
          {locale === 'tr' && "Bunun bir hata olduğunu düşünüyorsanız veya yardıma ihtiyacınız varsa, lütfen destek ekibimizle iletişime geçin. Size yardımcı olmak için buradayız!"}
          {locale === 'de' && "Wenn Sie glauben, dass dies ein Fehler ist oder Hilfe benötigen, kontaktieren Sie bitte unser Support-Team. Wir sind hier, um zu helfen!"}
          {locale === 'zh' && "如果您认为这是一个错误或需要帮助，请联系我们的支持团队。我们随时为您提供帮助！"}
          {locale === 'ru' && "Если вы считаете, что это ошибка, или вам нужна помощь, пожалуйста, свяжитесь с нашей службой поддержки. Мы здесь, чтобы помочь!"}
        </Text>
      </Section>
    </EmailLayout>
  );
}

// Styles
const h1 = {
  color: '#dc2626',
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
  backgroundColor: '#fef2f2',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
  border: '2px solid #fecaca',
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
  color: '#991b1b',
  fontSize: '13px',
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: '6px',
};

const walletValue = {
  color: '#7f1d1d',
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
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  padding: '10px 20px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: '600' as const,
  border: '2px solid #ef4444',
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

const reasonSection = {
  margin: '24px 0',
};

const reasonTitle = {
  color: '#dc2626',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0 0 12px',
};

const reasonBox = {
  backgroundColor: '#fff7ed',
  border: '2px solid #fed7aa',
  borderLeft: '4px solid #f97316',
  borderRadius: '8px',
  padding: '16px 20px',
};

const reasonText = {
  color: '#9a3412',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
  fontWeight: '500' as const,
};

const sectionTitle = {
  color: '#374151',
  fontSize: '18px',
  fontWeight: '600' as const,
  lineHeight: '1.4',
  margin: '0 0 16px',
};

const issuesList = {
  width: '100%',
  margin: '0 0 24px',
  borderCollapse: 'collapse' as const,
};

const issueIcon = {
  fontSize: '20px',
  width: '36px',
  textAlign: 'center' as const,
  verticalAlign: 'top' as const,
  paddingTop: '2px',
};

const issueText = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '1.6',
  padding: '6px 0 6px 8px',
  verticalAlign: 'top' as const,
};

const nextStepsSection = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 0 24px',
  border: '2px solid #fde68a',
};

const nextStepsTitle = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0 0 12px',
};

const nextStepsText = {
  color: '#78350f',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
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
  lineHeight: '1.6',
  margin: '0',
};
