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

interface AdminFraudAlertEmailProps {
  userName: string;
  userId: string;
  userEmail: string;
  fraudScore: number;
  riskLevel: 'HIGH' | 'CRITICAL';
  reasons: string[];
  investigateUrl: string;
  locale?: string;
}

/**
 * Admin Fraud Alert Email Template
 * 
 * Sent to admins when a user triggers a high fraud score.
 * Includes user details, fraud score, risk indicators, and investigation link.
 * 
 * Requirements: 4.2, 4.5
 */
export default function AdminFraudAlertEmail({
  userName = 'Suspicious User',
  userId = 'user123',
  userEmail = 'user@example.com',
  fraudScore = 85,
  riskLevel = 'HIGH',
  reasons = ['Multiple accounts detected', 'Suspicious IP address'],
  investigateUrl = 'https://sylvantoken.org/admin/users/user123',
  locale = 'en',
}: AdminFraudAlertEmailProps) {
  const t = getEmailTranslations(locale);
  
  const getRiskColor = () => {
    if (riskLevel === 'CRITICAL' || fraudScore >= 90) return '#dc2626';
    if (fraudScore >= 70) return '#f59e0b';
    return '#ef4444';
  };
  
  return (
    <EmailLayout preview={t.adminFraudAlert.preview} locale={locale}>
      {/* Priority Badge */}
      <Section style={priorityBadgeContainer}>
        <div style={{
          ...priorityBadge,
          backgroundColor: riskLevel === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
          borderColor: getRiskColor(),
        }}>
          <span style={priorityIcon}>🚨</span>
          <span style={{...priorityText, color: getRiskColor()}}>
            {riskLevel === 'CRITICAL' ? 'CRITICAL FRAUD ALERT' : 'HIGH FRAUD ALERT'}
          </span>
        </div>
      </Section>
      
      {/* Title */}
      <Heading style={h1}>{t.adminFraudAlert.title}</Heading>
      
      {/* Message */}
      <Text style={text}>{t.adminFraudAlert.message}</Text>
      
      {/* Fraud Score Display */}
      <Section style={scoreContainer}>
        <div style={scoreBox}>
          <Text style={scoreLabel}>Fraud Score</Text>
          <Text style={{...scoreValue, color: getRiskColor()}}>{fraudScore}</Text>
          <div style={scoreBar}>
            <div style={{
              ...scoreBarFill,
              width: `${fraudScore}%`,
              backgroundColor: getRiskColor(),
            }} />
          </div>
        </div>
      </Section>
      
      <Hr style={divider} />
      
      {/* User Details */}
      <Section style={detailsBox}>
        <Text style={detailsTitle}>User Information:</Text>
        <table style={detailsTable}>
          <tbody>
            <tr>
              <td style={detailsLabel}>Name:</td>
              <td style={detailsValue}>{userName}</td>
            </tr>
            <tr>
              <td style={detailsLabel}>User ID:</td>
              <td style={detailsValue}>{userId}</td>
            </tr>
            <tr>
              <td style={detailsLabel}>Email:</td>
              <td style={detailsValue}>{userEmail}</td>
            </tr>
            <tr>
              <td style={detailsLabel}>Risk Level:</td>
              <td style={{...detailsValue, color: getRiskColor(), fontWeight: '700'}}>
                {riskLevel}
              </td>
            </tr>
          </tbody>
        </table>
      </Section>
      
      {/* Fraud Indicators */}
      <Section style={reasonsBox}>
        <Text style={detailsTitle}>Fraud Indicators:</Text>
        <ul style={reasonsList}>
          {reasons.map((reason, index) => (
            <li key={index} style={reasonItem}>
              <span style={reasonBullet}>⚠️</span>
              {reason}
            </li>
          ))}
        </ul>
      </Section>
      
      {/* Call-to-Action Button */}
      <Section style={buttonContainer}>
        <EmailButton href={investigateUrl} priority="high">
          {t.adminFraudAlert.ctaButton}
        </EmailButton>
      </Section>
      
      {/* Footer Note */}
      <Text style={footerNote}>
        {locale === 'en' && 'Immediate action required. Please investigate this user and take appropriate measures.'}
        {locale === 'tr' && 'Acil eylem gerekli. Lütfen bu kullanıcıyı araştırın ve uygun önlemleri alın.'}
        {locale === 'de' && 'Sofortige Maßnahmen erforderlich. Bitte untersuchen Sie diesen Benutzer und ergreifen Sie geeignete Maßnahmen.'}
        {locale === 'zh' && '需要立即采取行动。请调查此用户并采取适当措施。'}
        {locale === 'ru' && 'Требуются немедленные действия. Пожалуйста, расследуйте этого пользователя и примите соответствующие меры.'}
      </Text>
    </EmailLayout>
  );
}

// Styles
const priorityBadgeContainer = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const priorityBadge = {
  display: 'inline-block',
  border: '2px solid',
  borderRadius: '8px',
  padding: '8px 16px',
};

const priorityIcon = {
  fontSize: '20px',
  marginRight: '8px',
};

const priorityText = {
  fontSize: '14px',
  fontWeight: '700' as const,
  letterSpacing: '0.5px',
};

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

const scoreContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const scoreBox = {
  display: 'inline-block',
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px 40px',
  minWidth: '200px',
};

const scoreLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const scoreValue = {
  fontSize: '48px',
  fontWeight: '700' as const,
  margin: '0 0 12px',
  lineHeight: '1',
};

const scoreBar = {
  width: '100%',
  height: '8px',
  backgroundColor: '#e5e7eb',
  borderRadius: '4px',
  overflow: 'hidden',
};

const scoreBarFill = {
  height: '100%',
  transition: 'width 0.3s ease',
};

const divider = {
  borderColor: '#e5e7eb',
  borderStyle: 'solid' as const,
  borderWidth: '1px 0 0 0',
  margin: '24px 0',
};

const detailsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 0 16px',
};

const detailsTitle = {
  color: '#2d7a4f',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0 0 12px',
};

const detailsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const detailsLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600' as const,
  padding: '6px 12px 6px 0',
  verticalAlign: 'top' as const,
  width: '120px',
};

const detailsValue = {
  color: '#111827',
  fontSize: '14px',
  padding: '6px 0',
  verticalAlign: 'top' as const,
  wordBreak: 'break-word' as const,
};

const reasonsBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 0 24px',
};

const reasonsList = {
  margin: '0',
  padding: '0 0 0 8px',
  listStyle: 'none',
};

const reasonItem = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px',
  display: 'flex',
  alignItems: 'flex-start',
};

const reasonBullet = {
  marginRight: '8px',
  fontSize: '16px',
  flexShrink: 0,
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const footerNote = {
  color: '#dc2626',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '24px 0 0',
  textAlign: 'center' as const,
  fontWeight: '600' as const,
};
