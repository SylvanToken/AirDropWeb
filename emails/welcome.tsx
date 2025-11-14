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

interface WelcomeEmailProps {
  username: string;
  dashboardUrl: string;
  locale?: string;
}

/**
 * Welcome Email Template
 * 
 * Sent to new users after successful registration.
 * Includes welcome message, platform overview, and next steps.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
export default function WelcomeEmail({
  username = 'User',
  dashboardUrl = 'https://sylvantoken.org/dashboard',
  locale = 'en',
}: WelcomeEmailProps) {
  const t = getEmailTranslations(locale);
  
  return (
    <EmailLayout preview={t.welcome.preview} locale={locale}>
      {/* Welcome Title */}
      <Heading style={h1}>{t.welcome.title}</Heading>
      
      {/* Greeting */}
      <Text style={text}>
        {replacePlaceholders(t.welcome.greeting, { username })}
      </Text>
      
      {/* Introduction */}
      <Text style={text}>{t.welcome.intro}</Text>
      
      {/* Call-to-Action Button */}
      <Section style={buttonContainer}>
        <EmailButton href={dashboardUrl}>
          {t.welcome.ctaButton}
        </EmailButton>
      </Section>
      
      <Hr style={divider} />
      
      {/* Next Steps Section */}
      <Text style={sectionTitle}>{t.welcome.nextSteps}</Text>
      
      <table style={stepsList}>
        <tbody>
          <tr>
            <td style={stepNumber}>1</td>
            <td style={stepText}>{t.welcome.step1}</td>
          </tr>
          <tr>
            <td style={stepNumber}>2</td>
            <td style={stepText}>{t.welcome.step2}</td>
          </tr>
          <tr>
            <td style={stepNumber}>3</td>
            <td style={stepText}>{t.welcome.step3}</td>
          </tr>
        </tbody>
      </table>
      
      <Hr style={divider} />
      
      {/* Closing Message */}
      <Text style={closingText}>
        {locale === 'en' && "We're here to help you succeed. If you have any questions, don't hesitate to reach out to our support team."}
        {locale === 'tr' && "Başarılı olmanız için buradayız. Herhangi bir sorunuz varsa, destek ekibimizle iletişime geçmekten çekinmeyin."}
        {locale === 'de' && "Wir sind hier, um Ihnen zum Erfolg zu verhelfen. Wenn Sie Fragen haben, zögern Sie nicht, unser Support-Team zu kontaktieren."}
        {locale === 'zh' && "我们在这里帮助您取得成功。如果您有任何问题，请随时联系我们的支持团队。"}
        {locale === 'ru' && "Мы здесь, чтобы помочь вам добиться успеха. Если у вас есть вопросы, не стесняйтесь обращаться в нашу службу поддержки."}
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

const closingText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  fontStyle: 'italic' as const,
};
