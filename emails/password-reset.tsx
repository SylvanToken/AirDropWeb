import {
  Heading,
  Text,
  Section,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { EmailButton } from './components/EmailButton';

interface PasswordResetProps {
  resetUrl: string;
  locale?: string;
}

/**
 * Password Reset Email Template
 * 
 * Sent to users when they request a password reset.
 * Includes reset link and expiration notice.
 */
export default function PasswordReset({
  resetUrl = 'https://sylvantoken.org/reset-password',
  locale = 'en',
}: PasswordResetProps) {
  const preview = locale === 'en' ? 'Reset your password' :
                  locale === 'tr' ? 'Şifrenizi sıfırlayın' :
                  locale === 'de' ? 'Setzen Sie Ihr Passwort zurück' :
                  locale === 'zh' ? '重置您的密码' :
                  locale === 'ru' ? 'Сбросьте свой пароль' :
                  'Reset your password';
  
  return (
    <EmailLayout preview={preview} locale={locale}>
      {/* Title */}
      <Heading style={h1}>
        {locale === 'en' && 'Reset Your Password 🔐'}
        {locale === 'tr' && 'Şifrenizi Sıfırlayın 🔐'}
        {locale === 'de' && 'Setzen Sie Ihr Passwort zurück 🔐'}
        {locale === 'zh' && '重置您的密码 🔐'}
        {locale === 'ru' && 'Сбросьте свой пароль 🔐'}
      </Heading>
      
      {/* Message */}
      <Text style={text}>
        {locale === 'en' && 'Click the button below to reset your password:'}
        {locale === 'tr' && 'Şifrenizi sıfırlamak için aşağıdaki düğmeye tıklayın:'}
        {locale === 'de' && 'Klicken Sie auf die Schaltfläche unten, um Ihr Passwort zurückzusetzen:'}
        {locale === 'zh' && '点击下面的按钮重置您的密码：'}
        {locale === 'ru' && 'Нажмите кнопку ниже, чтобы сбросить свой пароль:'}
      </Text>
      
      {/* Call-to-Action Button */}
      <Section style={buttonContainer}>
        <EmailButton href={resetUrl}>
          {locale === 'en' && 'Reset Password'}
          {locale === 'tr' && 'Şifreyi Sıfırla'}
          {locale === 'de' && 'Passwort zurücksetzen'}
          {locale === 'zh' && '重置密码'}
          {locale === 'ru' && 'Сбросить пароль'}
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
      <Text style={urlText}>{resetUrl}</Text>
      
      <Hr style={divider} />
      
      {/* Expiration Notice */}
      <Text style={warningText}>
        {locale === 'en' && '⏰ This password reset link will expire in 1 hour.'}
        {locale === 'tr' && '⏰ Bu şifre sıfırlama bağlantısı 1 saat içinde sona erecektir.'}
        {locale === 'de' && '⏰ Dieser Link zum Zurücksetzen des Passworts läuft in 1 Stunde ab.'}
        {locale === 'zh' && '⏰ 此密码重置链接将在 1 小时后过期。'}
        {locale === 'ru' && '⏰ Эта ссылка для сброса пароля истечет через 1 час.'}
      </Text>
      
      {/* Security Notice */}
      <Text style={securityText}>
        {locale === 'en' && "If you didn't request a password reset, please ignore this email. Your password will remain unchanged."}
        {locale === 'tr' && 'Şifre sıfırlama talebinde bulunmadıysanız, lütfen bu e-postayı göz ardı edin. Şifreniz değişmeden kalacaktır.'}
        {locale === 'de' && 'Wenn Sie keine Passwortzurücksetzung angefordert haben, ignorieren Sie bitte diese E-Mail. Ihr Passwort bleibt unverändert.'}
        {locale === 'zh' && '如果您没有请求重置密码，请忽略此电子邮件。您的密码将保持不变。'}
        {locale === 'ru' && 'Если вы не запрашивали сброс пароля, пожалуйста, проигнорируйте это письмо. Ваш пароль останется без изменений.'}
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
