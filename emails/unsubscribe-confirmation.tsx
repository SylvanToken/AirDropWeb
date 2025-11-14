import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailHeader } from './components/EmailHeader';
import { EmailFooter } from './components/EmailFooter';
import { EmailButton } from './components/EmailButton';
import { getEmailTranslations } from '@/lib/email/translations';

interface UnsubscribeConfirmationEmailProps {
  username: string;
  emailType: string;
  resubscribeUrl: string;
  locale?: string;
}

export default function UnsubscribeConfirmationEmail({
  username,
  emailType,
  resubscribeUrl,
  locale = 'en',
}: UnsubscribeConfirmationEmailProps) {
  const t = getEmailTranslations(locale);
  const translations = t.unsubscribeConfirmation;

  return (
    <EmailLayout preview={translations.preview} locale={locale}>
      <EmailHeader />
      
      <Heading style={heading}>{translations.title}</Heading>
      
      <Text style={text}>
        {translations.greeting.replace('{{username}}', username)}
      </Text>
      
      <Text style={text}>
        {emailType === 'all'
          ? translations.messageAll
          : translations.messageType.replace('{{type}}', emailType)}
      </Text>
      
      <Section style={infoBox}>
        <Text style={infoTitle}>{translations.whatYouWillStillReceive}</Text>
        <ul style={list}>
          <li style={listItem}>{translations.stillReceive1}</li>
          <li style={listItem}>{translations.stillReceive2}</li>
          <li style={listItem}>{translations.stillReceive3}</li>
        </ul>
      </Section>
      
      <Text style={text}>{translations.changeYourMind}</Text>
      
      <EmailButton href={resubscribeUrl}>
        {translations.resubscribeButton}
      </EmailButton>
      
      <Text style={footerText}>
        {translations.questions}
        <br />
        <Link href={`mailto:support@sylvantoken.org`} style={link}>
          support@sylvantoken.org
        </Link>
      </Text>
      
      <EmailFooter locale={locale} />
    </EmailLayout>
  );
}

// Styles
const heading = {
  color: '#2d7a4f',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const infoBox = {
  backgroundColor: '#f6f9fc',
  border: '1px solid #e1e8ed',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#2d7a4f',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const list = {
  margin: '0',
  padding: '0 0 0 20px',
};

const listItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
};

const footerText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
  textAlign: 'center' as const,
};

const link = {
  color: '#2d7a4f',
  textDecoration: 'underline',
};
