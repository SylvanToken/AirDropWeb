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

interface TaskCompletionEmailProps {
  username: string;
  taskName: string;
  points: number;
  totalPoints: number;
  dashboardUrl: string;
  locale?: string;
}

/**
 * Task Completion Email Template
 * 
 * Sent to users after successfully completing a task.
 * Includes congratulations message, task details, points earned, and total points.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export default function TaskCompletionEmail({
  username = 'User',
  taskName = 'Daily Task',
  points = 10,
  totalPoints = 100,
  dashboardUrl = 'https://sylvantoken.org/dashboard',
  locale = 'en',
}: TaskCompletionEmailProps) {
  const t = getEmailTranslations(locale);
  
  return (
    <EmailLayout 
      preview={replacePlaceholders(t.taskCompletion.preview, { points: points.toString() })} 
      locale={locale}
    >
      {/* Congratulations Title */}
      <Heading style={h1}>{t.taskCompletion.title}</Heading>
      
      {/* Greeting */}
      <Text style={text}>
        {replacePlaceholders(t.welcome.greeting, { username })}
      </Text>
      
      {/* Task Completion Message */}
      <Text style={text}>
        {replacePlaceholders(t.taskCompletion.message, { 
          taskName, 
          points: points.toString() 
        })}
      </Text>
      
      {/* Points Display Card */}
      <Section style={pointsCard}>
        <table style={pointsTable}>
          <tbody>
            <tr>
              <td style={pointsCell}>
                <div style={pointsIcon}>🎯</div>
                <div style={pointsLabel}>
                  {locale === 'en' && 'Points Earned'}
                  {locale === 'tr' && 'Kazanılan Puan'}
                  {locale === 'de' && 'Verdiente Punkte'}
                  {locale === 'zh' && '获得积分'}
                  {locale === 'ru' && 'Заработано баллов'}
                </div>
                <div style={pointsValue}>+{points}</div>
              </td>
              <td style={pointsDivider}></td>
              <td style={pointsCell}>
                <div style={pointsIcon}>⭐</div>
                <div style={pointsLabel}>
                  {locale === 'en' && 'Total Points'}
                  {locale === 'tr' && 'Toplam Puan'}
                  {locale === 'de' && 'Gesamtpunkte'}
                  {locale === 'zh' && '总积分'}
                  {locale === 'ru' && 'Всего баллов'}
                </div>
                <div style={pointsValue}>{totalPoints}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>
      
      {/* Call-to-Action Button */}
      <Section style={buttonContainer}>
        <EmailButton href={dashboardUrl}>
          {t.taskCompletion.ctaButton}
        </EmailButton>
      </Section>
      
      <Hr style={divider} />
      
      {/* Encouragement Message */}
      <Text style={encouragementText}>
        {t.taskCompletion.keepGoing}
      </Text>
      
      {/* Task Name Display */}
      <Section style={taskNameSection}>
        <Text style={taskNameLabel}>
          {locale === 'en' && 'Completed Task:'}
          {locale === 'tr' && 'Tamamlanan Görev:'}
          {locale === 'de' && 'Abgeschlossene Aufgabe:'}
          {locale === 'zh' && '已完成任务：'}
          {locale === 'ru' && 'Выполненное задание:'}
        </Text>
        <Text style={taskNameValue}>{taskName}</Text>
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

const pointsCard = {
  backgroundColor: '#f8faf9',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #e5f3ed',
};

const pointsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const pointsCell = {
  textAlign: 'center' as const,
  padding: '8px',
  verticalAlign: 'top' as const,
};

const pointsDivider = {
  width: '1px',
  backgroundColor: '#d1e7dd',
  padding: '0',
};

const pointsIcon = {
  fontSize: '32px',
  marginBottom: '8px',
};

const pointsLabel = {
  color: '#6b7280',
  fontSize: '13px',
  fontWeight: '500' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: '4px',
};

const pointsValue = {
  color: '#2d7a4f',
  fontSize: '32px',
  fontWeight: '700' as const,
  lineHeight: '1',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const divider = {
  borderColor: '#e5e7eb',
  borderStyle: 'solid' as const,
  borderWidth: '1px 0 0 0',
  margin: '32px 0',
};

const encouragementText = {
  color: '#2d7a4f',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px',
  textAlign: 'center' as const,
  fontWeight: '500' as const,
};

const taskNameSection = {
  backgroundColor: '#ffffff',
  borderLeft: '4px solid #2d7a4f',
  padding: '16px 20px',
  margin: '0',
};

const taskNameLabel = {
  color: '#6b7280',
  fontSize: '13px',
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
};

const taskNameValue = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600' as const,
  lineHeight: '1.4',
  margin: '0',
};
