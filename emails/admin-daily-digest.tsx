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

interface AdminDailyDigestEmailProps {
  date: string;
  newUsers: number;
  taskCompletions: number;
  pendingReviews: number;
  totalUsers: number;
  totalPoints: number;
  topTask?: {
    name: string;
    completions: number;
  };
  dashboardUrl: string;
  locale?: string;
}

/**
 * Admin Daily Digest Email Template
 * 
 * Sent to admins daily with platform statistics and activity summary.
 * Includes user metrics, task completions, and pending reviews.
 * 
 * Requirements: 4.3, 4.5
 */
export default function AdminDailyDigestEmail({
  date = new Date().toLocaleDateString(),
  newUsers = 0,
  taskCompletions = 0,
  pendingReviews = 0,
  totalUsers = 0,
  totalPoints = 0,
  topTask,
  dashboardUrl = 'https://sylvantoken.org/admin/dashboard',
  locale = 'en',
}: AdminDailyDigestEmailProps) {
  const t = getEmailTranslations(locale);
  
  return (
    <EmailLayout preview={t.adminDailyDigest.preview} locale={locale}>
      {/* Title */}
      <Heading style={h1}>{t.adminDailyDigest.title}</Heading>
      
      {/* Greeting */}
      <Text style={text}>{t.adminDailyDigest.greeting}</Text>
      
      {/* Date */}
      <Text style={dateText}>
        {locale === 'en' && `Daily Summary for ${date}`}
        {locale === 'tr' && `${date} için Günlük Özet`}
        {locale === 'de' && `Tägliche Zusammenfassung für ${date}`}
        {locale === 'zh' && `${date} 的每日摘要`}
        {locale === 'ru' && `Ежедневная сводка за ${date}`}
      </Text>
      
      <Hr style={divider} />
      
      {/* Stats Grid */}
      <Section style={statsGrid}>
        {/* New Users */}
        <div style={statCard}>
          <div style={statIcon}>👥</div>
          <div style={statValue}>{newUsers}</div>
          <div style={statLabel}>
            {locale === 'en' && 'New Users'}
            {locale === 'tr' && 'Yeni Kullanıcılar'}
            {locale === 'de' && 'Neue Benutzer'}
            {locale === 'zh' && '新用户'}
            {locale === 'ru' && 'Новые пользователи'}
          </div>
        </div>
        
        {/* Task Completions */}
        <div style={statCard}>
          <div style={statIcon}>✅</div>
          <div style={statValue}>{taskCompletions}</div>
          <div style={statLabel}>
            {locale === 'en' && 'Task Completions'}
            {locale === 'tr' && 'Görev Tamamlamaları'}
            {locale === 'de' && 'Aufgabenabschlüsse'}
            {locale === 'zh' && '任务完成'}
            {locale === 'ru' && 'Выполнения заданий'}
          </div>
        </div>
        
        {/* Pending Reviews */}
        <div style={{...statCard, ...(pendingReviews > 0 ? statCardWarning : {})}}>
          <div style={statIcon}>⏳</div>
          <div style={statValue}>{pendingReviews}</div>
          <div style={statLabel}>
            {locale === 'en' && 'Pending Reviews'}
            {locale === 'tr' && 'Bekleyen İncelemeler'}
            {locale === 'de' && 'Ausstehende Überprüfungen'}
            {locale === 'zh' && '待审核'}
            {locale === 'ru' && 'Ожидающие проверки'}
          </div>
        </div>
      </Section>
      
      <Hr style={divider} />
      
      {/* Platform Overview */}
      <Section style={overviewBox}>
        <Text style={overviewTitle}>
          {locale === 'en' && 'Platform Overview'}
          {locale === 'tr' && 'Platform Genel Bakış'}
          {locale === 'de' && 'Plattformübersicht'}
          {locale === 'zh' && '平台概览'}
          {locale === 'ru' && 'Обзор платформы'}
        </Text>
        <table style={overviewTable}>
          <tbody>
            <tr>
              <td style={overviewLabel}>
                {locale === 'en' && 'Total Users:'}
                {locale === 'tr' && 'Toplam Kullanıcılar:'}
                {locale === 'de' && 'Gesamtbenutzer:'}
                {locale === 'zh' && '总用户数：'}
                {locale === 'ru' && 'Всего пользователей:'}
              </td>
              <td style={overviewValue}>{totalUsers.toLocaleString(locale)}</td>
            </tr>
            <tr>
              <td style={overviewLabel}>
                {locale === 'en' && 'Total Points Earned:'}
                {locale === 'tr' && 'Kazanılan Toplam Puan:'}
                {locale === 'de' && 'Gesamtpunkte verdient:'}
                {locale === 'zh' && '总获得积分：'}
                {locale === 'ru' && 'Всего заработано баллов:'}
              </td>
              <td style={overviewValue}>{totalPoints.toLocaleString(locale)}</td>
            </tr>
            {topTask && (
              <tr>
                <td style={overviewLabel}>
                  {locale === 'en' && 'Most Popular Task:'}
                  {locale === 'tr' && 'En Popüler Görev:'}
                  {locale === 'de' && 'Beliebteste Aufgabe:'}
                  {locale === 'zh' && '最受欢迎的任务：'}
                  {locale === 'ru' && 'Самое популярное задание:'}
                </td>
                <td style={overviewValue}>
                  {topTask.name} ({topTask.completions} {locale === 'en' ? 'completions' : locale === 'tr' ? 'tamamlama' : locale === 'de' ? 'Abschlüsse' : locale === 'zh' ? '完成' : 'выполнений'})
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>
      
      {/* Call-to-Action Button */}
      <Section style={buttonContainer}>
        <EmailButton href={dashboardUrl}>
          {t.adminDailyDigest.ctaButton}
        </EmailButton>
      </Section>
      
      {/* Footer Note */}
      {pendingReviews > 0 && (
        <Text style={warningNote}>
          {locale === 'en' && `⚠️ You have ${pendingReviews} pending review${pendingReviews > 1 ? 's' : ''} that require attention.`}
          {locale === 'tr' && `⚠️ Dikkat gerektiren ${pendingReviews} bekleyen incelemeniz var.`}
          {locale === 'de' && `⚠️ Sie haben ${pendingReviews} ausstehende Überprüfung${pendingReviews > 1 ? 'en' : ''}, die Aufmerksamkeit erfordern.`}
          {locale === 'zh' && `⚠️ 您有 ${pendingReviews} 个待审核需要处理。`}
          {locale === 'ru' && `⚠️ У вас есть ${pendingReviews} ожидающих проверки, требующих внимания.`}
        </Text>
      )}
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

const dateText = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 24px',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const divider = {
  borderColor: '#e5e7eb',
  borderStyle: 'solid' as const,
  borderWidth: '1px 0 0 0',
  margin: '24px 0',
};

const statsGrid = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  margin: '0 0 24px',
};

const statCard = {
  flex: '1',
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px 16px',
  textAlign: 'center' as const,
};

const statCardWarning = {
  backgroundColor: '#fef3c7',
  borderColor: '#f59e0b',
};

const statIcon = {
  fontSize: '32px',
  margin: '0 0 12px',
};

const statValue = {
  color: '#2d7a4f',
  fontSize: '36px',
  fontWeight: '700' as const,
  lineHeight: '1',
  margin: '0 0 8px',
};

const statLabel = {
  color: '#6b7280',
  fontSize: '13px',
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const overviewBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 0 24px',
};

const overviewTitle = {
  color: '#2d7a4f',
  fontSize: '18px',
  fontWeight: '600' as const,
  margin: '0 0 16px',
};

const overviewTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const overviewLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600' as const,
  padding: '8px 12px 8px 0',
  verticalAlign: 'top' as const,
};

const overviewValue = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: '600' as const,
  padding: '8px 0',
  verticalAlign: 'top' as const,
  textAlign: 'right' as const,
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const warningNote = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '24px 0 0',
  textAlign: 'center' as const,
  fontWeight: '600' as const,
  backgroundColor: '#fef3c7',
  padding: '12px',
  borderRadius: '6px',
};
