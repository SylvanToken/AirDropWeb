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

interface WalletApprovedEmailProps {
  username: string;
  walletAddress: string;
  dashboardUrl: string;
  locale?: string;
}

/**
 * Wallet Approved Email Template
 * 
 * Sent to users when their wallet address is successfully verified.
 * Includes masked wallet address, confirmation, and next steps.
 * 
 * Requirements: 3.2, 3.4, 3.5
 */
export default function WalletApprovedEmail({
  username = 'User',
  walletAddress = '0x1234567890abcdef1234567890abcdef12345678',
  dashboardUrl = 'https://sylvantoken.org/dashboard',
  locale = 'en',
}: WalletApprovedEmailProps) {
  const t = getEmailTranslations(locale);
  const maskedAddress = maskWalletAddress(walletAddress);
  
  return (
    <EmailLayout preview={t.walletApproved.preview} locale={locale}>
      {/* Title */}
      <Heading style={h1}>{t.walletApproved.title}</Heading>
      
      {/* Greeting */}
      <Text style={text}>
        {replacePlaceholders(t.welcome.greeting, { username })}
      </Text>
      
      {/* Main Message */}
      <Text style={text}>{t.walletApproved.message}</Text>
      
      {/* Success Icon */}
      <Section style={successIconContainer}>
        <div style={successIcon}>✅</div>
      </Section>
      
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
                  {replacePlaceholders(t.walletApproved.walletAddress, { address: '' }).replace(':', '').trim()}
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
          <span style={statusIcon}>✓</span>
          <span style={statusText}>
            {locale === 'en' && 'Verified & Active'}
            {locale === 'tr' && 'Doğrulandı ve Aktif'}
            {locale === 'de' && 'Verifiziert & Aktiv'}
            {locale === 'zh' && '已验证并激活'}
            {locale === 'ru' && 'Верифицирован и активен'}
          </span>
        </div>
      </Section>
      
      <Hr style={divider} />
      
      {/* Next Steps Message */}
      <Section style={nextStepsSection}>
        <Text style={nextStepsTitle}>
          {locale === 'en' && "What's Next?"}
          {locale === 'tr' && 'Sırada Ne Var?'}
          {locale === 'de' && 'Was kommt als Nächstes?'}
          {locale === 'zh' && '接下来做什么？'}
          {locale === 'ru' && 'Что дальше?'}
        </Text>
        <Text style={nextStepsText}>
          {t.walletApproved.nextSteps}
        </Text>
      </Section>
      
      {/* Benefits List */}
      <Section style={benefitsSection}>
        <table style={benefitsList}>
          <tbody>
            <tr>
              <td style={benefitIcon}>🎁</td>
              <td style={benefitText}>
                {locale === 'en' && 'Eligible for all upcoming airdrops'}
                {locale === 'tr' && 'Tüm gelecek airdroplar için uygun'}
                {locale === 'de' && 'Berechtigt für alle kommenden Airdrops'}
                {locale === 'zh' && '有资格获得所有即将到来的空投'}
                {locale === 'ru' && 'Право на все предстоящие airdrop'}
              </td>
            </tr>
            <tr>
              <td style={benefitIcon}>⭐</td>
              <td style={benefitText}>
                {locale === 'en' && 'Points converted to token allocation'}
                {locale === 'tr' && 'Puanlar token tahsisine dönüştürülür'}
                {locale === 'de' && 'Punkte werden in Token-Zuteilung umgewandelt'}
                {locale === 'zh' && '积分转换为代币分配'}
                {locale === 'ru' && 'Баллы конвертируются в распределение токенов'}
              </td>
            </tr>
            <tr>
              <td style={benefitIcon}>🚀</td>
              <td style={benefitText}>
                {locale === 'en' && 'Priority access to platform features'}
                {locale === 'tr' && 'Platform özelliklerine öncelikli erişim'}
                {locale === 'de' && 'Prioritätszugang zu Plattformfunktionen'}
                {locale === 'zh' && '优先访问平台功能'}
                {locale === 'ru' && 'Приоритетный доступ к функциям платформы'}
              </td>
            </tr>
          </tbody>
        </table>
      </Section>
      
      {/* Call-to-Action Button */}
      <Section style={buttonContainer}>
        <EmailButton href={dashboardUrl}>
          {t.walletApproved.ctaButton}
        </EmailButton>
      </Section>
      
      <Hr style={divider} />
      
      {/* Congratulations Message */}
      <Text style={congratsText}>
        {locale === 'en' && "Congratulations on completing your verification! Keep earning points to maximize your airdrop allocation."}
        {locale === 'tr' && "Doğrulamanızı tamamladığınız için tebrikler! Airdrop tahsisinizi maksimize etmek için puan kazanmaya devam edin."}
        {locale === 'de' && "Herzlichen Glückwunsch zum Abschluss Ihrer Verifizierung! Verdienen Sie weiterhin Punkte, um Ihre Airdrop-Zuteilung zu maximieren."}
        {locale === 'zh' && "恭喜您完成验证！继续赚取积分以最大化您的空投分配。"}
        {locale === 'ru' && "Поздравляем с завершением верификации! Продолжайте зарабатывать баллы, чтобы максимизировать свою долю airdrop."}
      </Text>
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

const successIconContainer = {
  textAlign: 'center' as const,
  margin: '20px 0',
};

const successIcon = {
  fontSize: '64px',
  lineHeight: '1',
};

const walletCard = {
  backgroundColor: '#f0fdf4',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
  border: '2px solid #bbf7d0',
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
  color: '#15803d',
  fontSize: '13px',
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: '6px',
};

const walletValue = {
  color: '#166534',
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
  backgroundColor: '#d1fae5',
  color: '#065f46',
  padding: '10px 20px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: '600' as const,
  border: '2px solid #10b981',
};

const statusIcon = {
  marginRight: '8px',
  fontSize: '16px',
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

const nextStepsSection = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 0 24px',
};

const nextStepsTitle = {
  color: '#2d7a4f',
  fontSize: '18px',
  fontWeight: '600' as const,
  margin: '0 0 12px',
  textAlign: 'center' as const,
};

const nextStepsText = {
  color: '#166534',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
  textAlign: 'center' as const,
};

const benefitsSection = {
  margin: '24px 0',
};

const benefitsList = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const benefitIcon = {
  fontSize: '24px',
  width: '40px',
  textAlign: 'center' as const,
  verticalAlign: 'top' as const,
  paddingTop: '4px',
};

const benefitText = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '1.6',
  padding: '8px 0 8px 12px',
  verticalAlign: 'top' as const,
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const congratsText = {
  color: '#2d7a4f',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
  textAlign: 'center' as const,
  fontStyle: 'italic' as const,
};
