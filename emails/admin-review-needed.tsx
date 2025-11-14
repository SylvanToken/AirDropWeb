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

interface AdminReviewNeededEmailProps {
  userName: string;
  userId: string;
  taskName: string;
  completionId: string;
  submittedAt: string;
  reviewUrl: string;
  locale?: string;
}

/**
 * Admin Review Needed Email Template
 * 
 * Sent to admins when a task completion requires manual review.
 * Includes user details, task information, and direct link to review page.
 * 
 * Requirements: 4.1, 4.5
 */
export default function AdminReviewNeededEmail({
  userName = 'John Doe',
  userId = 'user123',
  taskName = 'Twitter Follow Task',
  completionId = 'comp123',
  submittedAt = new Date().toISOString(),
  reviewUrl = 'https://sylvantoken.org/admin/verifications',
  locale = 'en',
}: AdminReviewNeededEmailProps) {
  const t = getEmailTranslations(locale);
  
  const details = `User: ${userName} (ID: ${userId})\nTask: ${taskName}\nSubmitted: ${new Date(submittedAt).toLocaleString(locale)}`;
  
  return (
    <EmailLayout preview={t.adminReviewNeeded.preview} locale={locale}>
      {/* Priority Badge */}
      <Section style={priorityBadgeContainer}>
        <div style={priorityBadge}>
          <span style={priorityIcon}>📋</span>
          <span style={priorityText}>MANUAL REVIEW REQUIRED</span>
        </div>
      </Section>
      
      {/* Title */}
      <Heading style={h1}>{t.adminReviewNeeded.title}</Heading>
      
      {/* Message */}
      <Text style={text}>{t.adminReviewNeeded.message}</Text>
      
      <Hr style={divider} />
      
      {/* Details Section */}
      <Section style={detailsBox}>
        <Text style={detailsTitle}>Completion Details:</Text>
        <table style={detailsTable}>
          <tbody>
            <tr>
              <td style={detailsLabel}>User:</td>
              <td style={detailsValue}>{userName}</td>
            </tr>
            <tr>
              <td style={detailsLabel}>User ID:</td>
              <td style={detailsValue}>{userId}</td>
            </tr>
            <tr>
              <td style={detailsLabel}>Task:</td>
              <td style={detailsValue}>{taskName}</td>
            </tr>
            <tr>
              <td style={detailsLabel}>Completion ID:</td>
              <td style={detailsValue}>{completionId}</td>
            </tr>
            <tr>
              <td style={detailsLabel}>Submitted:</td>
              <td style={detailsValue}>{new Date(submittedAt).toLocaleString(locale)}</td>
            </tr>
          </tbody>
        </table>
      </Section>
      
      {/* Call-to-Action Button */}
      <Section style={buttonContainer}>
        <EmailButton href={reviewUrl} priority="high">
          {t.adminReviewNeeded.ctaButton}
        </EmailButton>
      </Section>
      
      {/* Footer Note */}
      <Text style={footerNote}>
        {locale === 'en' && 'Please review this completion as soon as possible to maintain platform quality.'}
        {locale === 'tr' && 'Platform kalitesini korumak için lütfen bu tamamlamayı en kısa sürede inceleyin.'}
        {locale === 'de' && 'Bitte überprüfen Sie diese Fertigstellung so schnell wie möglich, um die Plattformqualität zu erhalten.'}
        {locale === 'zh' && '请尽快审核此完成以保持平台质量。'}
        {locale === 'ru' && 'Пожалуйста, проверьте это выполнение как можно скорее, чтобы поддерживать качество платформы.'}
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
  backgroundColor: '#fef3c7',
  border: '2px solid #f59e0b',
  borderRadius: '8px',
  padding: '8px 16px',
};

const priorityIcon = {
  fontSize: '20px',
  marginRight: '8px',
};

const priorityText = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '700' as const,
  letterSpacing: '0.5px',
};

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
  margin: '0 0 24px',
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
  width: '140px',
};

const detailsValue = {
  color: '#111827',
  fontSize: '14px',
  padding: '6px 0',
  verticalAlign: 'top' as const,
  wordBreak: 'break-word' as const,
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const footerNote = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '24px 0 0',
  textAlign: 'center' as const,
  fontStyle: 'italic' as const,
};
