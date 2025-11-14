import {
  Heading,
  Text,
  Section,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { EmailButton } from './components/EmailButton';

interface EmailVerificationProps {
  verifyUrl: string;
  locale?: string;
}

/**
 * Email Verification Template
 * 
 * Sent to users to verify their email address.
 * Includes verification link and expiration notice.
 */
export default function EmailVerification({
  verifyUrl = 'https://sylvantoken.org/verify-email',
  locale = 'en',
}: EmailVerificationProps) {
  const preview = locale === 'en' ? 'Verify your email address' :
                  locale === 'tr' ? 'E-posta adresinizi doğrulayın' :
                  locale === 'de' ? 'Verifizieren Sie Ihre E-Mail-Adresse' :
                  locale === 'zh' ? '验证您的电子邮件地址' :
                  locale === 'ru' ? 'Подтвердите свой адрес электронной почты' :
                  'Verify your email address';
  
  return (
    <EmailLayout preview={preview} locale={locale}>
      {/* Title */}
      <Heading style={h1}>
        {locale === 'en' && 'Verify Your Email 📧'}
        {locale === 'tr' && 'E-postanızı Doğrulayın 📧'}
        {locale === 'de' && 'Verifizieren Sie Ihre E-Mail 📧'}
        {locale === 'zh' && '验证您的电子邮件 📧'}
        {locale === 'ru' && 'Подтвердите вашу электронную почту 📧'}
      </Heading>
      
      {/* Message */}
      <Text style={text}>
        {locale === 'en' && 'Please click the button below to verify your email address:'}
        {locale === 'tr' && 'E-posta adresinizi doğrulamak için lütfen aşağıdaki düğmeye tıklayın:'}
        {locale === 'de' && 'Bitte klicken Sie auf die Schaltfläche unten, um Ihre E-Mail-Adresse zu verifizieren:'}
        {locale === 'zh' && '请点击下面的按钮验证您的电子邮件地址：'}
        {locale === 'ru' && 'Пожалуйста, нажмите кнопку ниже, чтобы подтвердить свой адрес электронной почты:'}
      </Text>
      
      {/* Call-to-Action Button */}
      <Section style={buttonContainer}>
        <EmailButton href={verifyUrl}>
          {locale === 'en' && 'Verify Email'}
          {locale === 'tr' && 'E-postayı Doğrula'}
          {locale === 'de' && 'E-Mail verifizieren'}
          {locale === 'zh' && '验证电子邮件'}
          {locale === 'ru' && 'Подтвердить электронную почту'}
        </EmailButton>
      </Section>
      
      {/* Alternative Link */}
      <Text style={linkText}>
        {locale === 'en' && 'Or copy and paste this link into your browser:'}
        {locale === 'tr' && 'Veya bu bağlantıyı tarayıcınıza kopyalayıp yapıştırın:'}
        {locale === 'de' && 'Oder kopieren Sie diesen Link und fügen Sie ihn in Ihren Browser ein:'}
        {locale === 'zh' && '或将此链接复制并粘贴到您的浏览器中：'}
        {locale === 'ru' && 'Или скопируйте и вставьте эту ссылку в свой браузер:'}
      </Text>
      <Text style={urlText}>{verifyUrl}</Text>
      
      <Hr style={divider} />
      
      {/* Expiration Notice */}
      <Text style={warningText}>
        {locale === 'en' && '⏰ This verification link will expire in 24 hours.'}
        {locale === 'tr' && '⏰ Bu doğrulama bağlantısı 24 saat içinde sona erecektir.'}
        {locale === 'de' && '⏰ Dieser Verifizierungslink läuft in 24 Stunden ab.'}
        {locale === 'zh' && '⏰ 此验证链接将在 24 小时后过期。'}
        {locale === 'ru' && '⏰ Эта ссылка для подтверждения истечет через 24 часа.'}
      </Text>
      
      {/* Security Notice */}
      <Text style={securityText}>
        {locale === 'en' && "If you didn't create an account with Sylvan Token, please ignore this email."}
        {locale === 'tr' && 'Sylvan Token ile bir hesap oluşturmadıysanız, lütfen bu e-postayı göz ardı edin.'}
        {locale === 'de' && 'Wenn Sie kein Konto bei Sylvan Token erstellt haben, ignorieren Sie bitte diese E-Mail.'}
        {locale === 'zh' && '如果您没有在 Sylvan Token 创建账户，请忽略此电子邮件。'}
        {locale === 'ru' && 'Если вы не создавали учетную запись в Sylvan Token, пожалуйста, проигнорируйте это письмо.'}
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

const linkText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '24px 0 8px',
};

const urlText = {
  color: '#2d7a4f',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0 0 24px',
  wordBreak: 'break-all' as const,
  fontFamily: 'monospace',
};

const divider = {
  borderColor: '#e5e7eb',
  borderStyle: 'solid' as const,
  borderWidth: '1px 0 0 0',
  margin: '32px 0',
};

const warningText = {
  color: '#d97706',
  fontSize: '15px',
  lineHeight: '1.5',
  margin: '0 0 16px',
  fontWeight: '600' as const,
};

const securityText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  fontStyle: 'italic' as const,
};
