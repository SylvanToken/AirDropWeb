import { Hr, Img, Link, Section, Text } from '@react-email/components';
import * as React from 'react';

interface EmailFooterProps {
  locale?: string;
  unsubscribeUrl?: string;
}

/**
 * Email footer component with links and legal information
 * Includes unsubscribe link for CAN-SPAM compliance
 */
export function EmailFooter({ locale = 'en', unsubscribeUrl }: EmailFooterProps) {
  const currentYear = new Date().getFullYear();
  // Use GitHub hosted logo URL
  const logoSrc = 'https://github.com/SylvanToken/SylvanToken/raw/main/assets/images/sylvan-token-logo.png';
  
  // Footer translations
  const translations: Record<string, any> = {
    en: {
      copyright: `© ${currentYear} Sylvan Token. All rights reserved.`,
      tagline: 'Growing together towards a sustainable future 🌿',
      unsubscribe: 'Unsubscribe from emails',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      support: 'Contact Support',
    },
    tr: {
      copyright: `© ${currentYear} Sylvan Token. Tüm hakları saklıdır.`,
      tagline: 'Sürdürülebilir bir gelecek için birlikte büyüyoruz 🌿',
      unsubscribe: 'E-posta aboneliğinden çık',
      privacy: 'Gizlilik Politikası',
      terms: 'Hizmet Şartları',
      support: 'Destek İletişim',
    },
    de: {
      copyright: `© ${currentYear} Sylvan Token. Alle Rechte vorbehalten.`,
      tagline: 'Gemeinsam wachsen für eine nachhaltige Zukunft 🌿',
      unsubscribe: 'Von E-Mails abmelden',
      privacy: 'Datenschutzrichtlinie',
      terms: 'Nutzungsbedingungen',
      support: 'Support kontaktieren',
    },
    zh: {
      copyright: `© ${currentYear} Sylvan Token. 保留所有权利。`,
      tagline: '共同成长，迈向可持续未来 🌿',
      unsubscribe: '取消订阅邮件',
      privacy: '隐私政策',
      terms: '服务条款',
      support: '联系支持',
    },
    ru: {
      copyright: `© ${currentYear} Sylvan Token. Все права защищены.`,
      tagline: 'Растем вместе к устойчивому будущему 🌿',
      unsubscribe: 'Отписаться от рассылки',
      privacy: 'Политика конфиденциальности',
      terms: 'Условия использования',
      support: 'Связаться с поддержкой',
    },
  };

  const t = translations[locale] || translations.en;
  const baseUrl = 'https://sylvantoken.org';

  return (
    <Section style={footer}>
      <Hr style={divider} />
      
      <div style={logoFooterContainer}>
        <Img
          src={logoSrc}
          width="64"
          height="64"
          alt="Sylvan Token"
          style={logoFooter}
        />
      </div>
      
      <Text style={tagline}>{t.tagline}</Text>
      
      <div style={linksContainer}>
        <Link href={`${baseUrl}/${locale}/privacy`} style={link}>
          {t.privacy}
        </Link>
        <span style={separator}>•</span>
        <Link href={`${baseUrl}/${locale}/terms`} style={link}>
          {t.terms}
        </Link>
        <span style={separator}>•</span>
        <Link href={`${baseUrl}/${locale}/support`} style={link}>
          {t.support}
        </Link>
      </div>

      {unsubscribeUrl && (
        <Text style={unsubscribeText}>
          <Link href={unsubscribeUrl} style={unsubscribeLink}>
            {t.unsubscribe}
          </Link>
        </Text>
      )}

      <Text style={copyright}>{t.copyright}</Text>
      
      <Text style={address}>
        Sylvan Token Platform
        <br />
        Airdrop & Rewards System
      </Text>
    </Section>
  );
}

// Styles
const footer = {
  padding: '32px 40px',
  backgroundColor: '#f8faf9',
  borderTop: '1px solid #e5e7eb',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '0 0 24px 0',
};

const tagline = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#2d7a4f',
  textAlign: 'center' as const,
  margin: '0 0 16px 0',
  fontWeight: '500',
};

const linksContainer = {
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const link = {
  color: '#2d7a4f',
  fontSize: '12px',
  textDecoration: 'underline',
  margin: '0 4px',
};

const separator = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0 4px',
};

const unsubscribeText = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#6b7280',
  textAlign: 'center' as const,
  margin: '16px 0 8px 0',
};

const unsubscribeLink = {
  color: '#6b7280',
  textDecoration: 'underline',
};

const copyright = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#6b7280',
  textAlign: 'center' as const,
  margin: '8px 0',
};

const address = {
  fontSize: '11px',
  lineHeight: '16px',
  color: '#9ca3af',
  textAlign: 'center' as const,
  margin: '8px 0 0 0',
};

const logoFooterContainer = {
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const logoFooter = {
  display: 'inline-block',
  opacity: '0.8',
};
