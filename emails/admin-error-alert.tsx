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

interface AdminErrorAlertEmailProps {
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedUsers?: number;
  endpoint?: string;
  detailsUrl: string;
  locale?: string;
}

/**
 * Admin Error Alert Email Template
 * 
 * Sent to admins when system errors occur that require attention.
 * Includes error details, severity level, and link to error logs.
 * 
 * Requirements: 4.4, 4.5
 */
export default function AdminErrorAlertEmail({
  errorType = 'System Error',
  errorMessage = 'An unexpected error occurred',
  errorStack,
  timestamp = new Date().toISOString(),
  severity = 'MEDIUM',
  affectedUsers,
  endpoint,
  detailsUrl = 'https://sylvantoken.org/admin/logs',
  locale = 'en',
}: AdminErrorAlertEmailProps) {
  const t = getEmailTranslations(locale);
  
  const getSeverityColor = () => {
    switch (severity) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#f59e0b';
      case 'MEDIUM': return '#f97316';
      case 'LOW': return '#84cc16';
      default: return '#6b7280';
    }
  };
  
  const getSeverityBgColor = () => {
    switch (severity) {
      case 'CRITICAL': return '#fee2e2';
      case 'HIGH': return '#fef3c7';
      case 'MEDIUM': return '#ffedd5';
      case 'LOW': return '#f7fee7';
      default: return '#f9fafb';
    }
  };
  
  return (
    <EmailLayout preview={t.adminErrorAlert.preview} locale={locale}>
      {/* Priority Badge */}
      <Section style={priorityBadgeContainer}>
        <div style={{
          ...priorityBadge,
          backgroundColor: getSeverityBgColor(),
          borderColor: getSeverityColor(),
        }}>
          <span style={priorityIcon}>⚠️</span>
          <span style={{...priorityText, color: getSeverityColor()}}>
            {severity} SEVERITY ERROR
          </span>
        </div>
      </Section>
      
      {/* Title */}
      <Heading style={{...h1, color: getSeverityColor()}}>{t.adminErrorAlert.title}</Heading>
      
      {/* Message */}
      <Text style={text}>{t.adminErrorAlert.message}</Text>
      
      <Hr style={divider} />
      
      {/* Error Details */}
      <Section style={errorBox}>
        <Text style={errorTitle}>Error Details:</Text>
        <table style={detailsTable}>
          <tbody>
            <tr>
              <td style={detailsLabel}>Type:</td>
              <td style={detailsValue}>{errorType}</td>
            </tr>
            <tr>
              <td style={detailsLabel}>Severity:</td>
              <td style={{...detailsValue, color: getSeverityColor(), fontWeight: '700'}}>
                {severity}
              </td>
            </tr>
            <tr>
              <td style={detailsLabel}>Timestamp:</td>
              <td style={detailsValue}>{new Date(timestamp).toLocaleString(locale)}</td>
            </tr>
            {endpoint && (
              <tr>
                <td style={detailsLabel}>Endpoint:</td>
                <td style={detailsValue}>{endpoint}</td>
              </tr>
            )}
            {affectedUsers !== undefined && (
              <tr>
                <td style={detailsLabel}>Affected Users:</td>
                <td style={detailsValue}>{affectedUsers}</td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>
      
      {/* Error Message */}
      <Section style={messageBox}>
        <Text style={messageTitle}>Error Message:</Text>
        <div style={codeBlock}>
          <code style={codeText}>{errorMessage}</code>
        </div>
      </Section>
      
      {/* Stack Trace (if available) */}
      {errorStack && (
        <Section style={stackBox}>
          <Text style={messageTitle}>Stack Trace:</Text>
          <div style={codeBlock}>
            <code style={codeText}>{errorStack.substring(0, 500)}{errorStack.length > 500 ? '...' : ''}</code>
          </div>
        </Section>
      )}
      
      {/* Call-to-Action Button */}
      <Section style={buttonContainer}>
        <EmailButton href={detailsUrl} priority="high">
          {t.adminErrorAlert.ctaButton}
        </EmailButton>
      </Section>
      
      {/* Footer Note */}
      <Text style={footerNote}>
        {severity === 'CRITICAL' && (
          <>
            {locale === 'en' && '🚨 CRITICAL: Immediate action required. This error may be affecting platform functionality.'}
            {locale === 'tr' && '🚨 KRİTİK: Acil eylem gerekli. Bu hata platform işlevselliğini etkileyebilir.'}
            {locale === 'de' && '🚨 KRITISCH: Sofortige Maßnahmen erforderlich. Dieser Fehler kann die Plattformfunktionalität beeinträchtigen.'}
            {locale === 'zh' && '🚨 严重：需要立即采取行动。此错误可能影响平台功能。'}
            {locale === 'ru' && '🚨 КРИТИЧНО: Требуются немедленные действия. Эта ошибка может влиять на функциональность платформы.'}
          </>
        )}
        {severity === 'HIGH' && (
          <>
            {locale === 'en' && '⚠️ HIGH: Please investigate and resolve this error as soon as possible.'}
            {locale === 'tr' && '⚠️ YÜKSEK: Lütfen bu hatayı en kısa sürede araştırın ve çözün.'}
            {locale === 'de' && '⚠️ HOCH: Bitte untersuchen und beheben Sie diesen Fehler so schnell wie möglich.'}
            {locale === 'zh' && '⚠️ 高：请尽快调查并解决此错误。'}
            {locale === 'ru' && '⚠️ ВЫСОКАЯ: Пожалуйста, расследуйте и устраните эту ошибку как можно скорее.'}
          </>
        )}
        {severity === 'MEDIUM' && (
          <>
            {locale === 'en' && 'ℹ️ MEDIUM: This error should be investigated when convenient.'}
            {locale === 'tr' && 'ℹ️ ORTA: Bu hata uygun olduğunda araştırılmalıdır.'}
            {locale === 'de' && 'ℹ️ MITTEL: Dieser Fehler sollte bei Gelegenheit untersucht werden.'}
            {locale === 'zh' && 'ℹ️ 中：应在方便时调查此错误。'}
            {locale === 'ru' && 'ℹ️ СРЕДНЯЯ: Эту ошибку следует расследовать при удобной возможности.'}
          </>
        )}
        {severity === 'LOW' && (
          <>
            {locale === 'en' && '✓ LOW: This is a minor error for informational purposes.'}
            {locale === 'tr' && '✓ DÜŞÜK: Bu bilgilendirme amaçlı küçük bir hatadır.'}
            {locale === 'de' && '✓ NIEDRIG: Dies ist ein geringfügiger Fehler zu Informationszwecken.'}
            {locale === 'zh' && '✓ 低：这是一个用于信息目的的小错误。'}
            {locale === 'ru' && '✓ НИЗКАЯ: Это незначительная ошибка в информационных целях.'}
          </>
        )}
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

const divider = {
  borderColor: '#e5e7eb',
  borderStyle: 'solid' as const,
  borderWidth: '1px 0 0 0',
  margin: '24px 0',
};

const errorBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 0 16px',
};

const errorTitle = {
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
  width: '140px',
};

const detailsValue = {
  color: '#111827',
  fontSize: '14px',
  padding: '6px 0',
  verticalAlign: 'top' as const,
  wordBreak: 'break-word' as const,
};

const messageBox = {
  margin: '0 0 16px',
};

const stackBox = {
  margin: '0 0 24px',
};

const messageTitle = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const codeBlock = {
  backgroundColor: '#1f2937',
  border: '1px solid #374151',
  borderRadius: '6px',
  padding: '16px',
  overflow: 'auto',
};

const codeText = {
  color: '#f9fafb',
  fontSize: '13px',
  fontFamily: 'monospace',
  lineHeight: '1.5',
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const,
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const footerNote = {
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '24px 0 0',
  textAlign: 'center' as const,
  fontWeight: '600' as const,
  padding: '12px',
  borderRadius: '6px',
  backgroundColor: '#f9fafb',
};
