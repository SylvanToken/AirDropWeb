# Email Templates Guide

## Overview

This guide explains how to create, customize, and maintain email templates for the Sylvan Token Airdrop Platform using React Email.

## Template Structure

### Base Components

All templates use these shared components:

```typescript
// emails/components/
├── EmailLayout.tsx    // Wrapper with consistent styling
├── EmailHeader.tsx    // Logo and branding
├── EmailFooter.tsx    // Footer with links and unsubscribe
└── EmailButton.tsx    // Styled CTA button
```

### Template Anatomy

```typescript
import { EmailLayout } from './components/EmailLayout';
import { EmailButton } from './components/EmailButton';

interface MyEmailProps {
  username: string;
  locale: string;
}

export default function MyEmail({ username, locale = 'en' }: MyEmailProps) {
  const t = getEmailTranslations(locale);
  
  return (
    <EmailLayout locale={locale}>
      <Heading>{t.myEmail.title}</Heading>
      <Text>{t.myEmail.greeting.replace('{{username}}', username)}</Text>
      <EmailButton href="https://sylvantoken.org/dashboard">
        {t.myEmail.ctaButton}
      </EmailButton>
    </EmailLayout>
  );
}
```

## Creating a New Template

### Step 1: Create Template File

Create a new file in `emails/` directory:

```typescript
// emails/my-new-email.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailButton } from './components/EmailButton';
import { getEmailTranslations } from '@/lib/email/translations';

interface MyNewEmailProps {
  recipientName: string;
  actionUrl: string;
  locale?: string;
}

export default function MyNewEmail({
  recipientName,
  actionUrl,
  locale = 'en',
}: MyNewEmailProps) {
  const t = getEmailTranslations(locale);
  
  return (
    <Html>
      <Head />
      <Preview>{t.myNewEmail.preview}</Preview>
      <EmailLayout locale={locale}>
        <Heading style={heading}>
          {t.myNewEmail.title}
        </Heading>
        
        <Text style={text}>
          {t.myNewEmail.greeting.replace('{{name}}', recipientName)}
        </Text>
        
        <Section style={buttonContainer}>
          <EmailButton href={actionUrl}>
            {t.myNewEmail.ctaButton}
          </EmailButton>
        </Section>
        
        <Text style={text}>
          {t.myNewEmail.footer}
        </Text>
      </EmailLayout>
    </Html>
  );
}

// Styles
const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#2d7a4f',
  marginBottom: '20px',
};

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333333',
  marginBottom: '16px',
};

const buttonContainer = {
  margin: '32px 0',
};
```

### Step 2: Add Translations

Add translations to `lib/email/translations.ts`:

```typescript
export const emailTranslations = {
  en: {
    myNewEmail: {
      preview: 'Preview text shown in inbox',
      title: 'Email Title',
      greeting: 'Hello {{name}},',
      ctaButton: 'Take Action',
      footer: 'Thank you for using Sylvan Token.',
    },
  },
  tr: {
    myNewEmail: {
      preview: 'Gelen kutusunda gösterilen önizleme metni',
      title: 'E-posta Başlığı',
      greeting: 'Merhaba {{name}},',
      ctaButton: 'İşlem Yap',
      footer: 'Sylvan Token kullandığınız için teşekkürler.',
    },
  },
  // Add other languages...
};
```

### Step 3: Create Test File

Create a test file to preview your template:

```typescript
// emails/test-my-new-email.tsx
import MyNewEmail from './my-new-email';

export default function TestMyNewEmail() {
  return (
    <MyNewEmail
      recipientName="John Doe"
      actionUrl="https://sylvantoken.org/action"
      locale="en"
    />
  );
}
```

### Step 4: Register Template

Add template to the registry in `lib/email/client.ts`:

```typescript
const emailTemplates = {
  welcome: WelcomeEmail,
  taskCompletion: TaskCompletionEmail,
  myNewEmail: MyNewEmail, // Add your template
};

export function getEmailTemplate(templateName: string) {
  return emailTemplates[templateName];
}
```

### Step 5: Create Sending Function

Add a helper function in `lib/email/utils.ts`:

```typescript
export async function sendMyNewEmail(
  to: string,
  data: {
    recipientName: string;
    actionUrl: string;
  },
  locale: string = 'en'
) {
  const t = getEmailTranslations(locale);
  
  await queueEmail({
    to,
    subject: t.myNewEmail.subject,
    template: 'myNewEmail',
    data: {
      ...data,
      locale,
    },
  });
}
```

### Step 6: Test Template

Preview your template:

```bash
# Start React Email dev server
npm run email:dev

# Navigate to your test template
# http://localhost:3000/test-my-new-email
```

## Template Best Practices

### Design Guidelines

1. **Mobile-First**: Design for mobile screens first
2. **Single Column**: Use single-column layouts
3. **Clear Hierarchy**: Use headings and spacing
4. **Readable Fonts**: Use web-safe fonts (Arial, Helvetica)
5. **Sufficient Contrast**: Ensure text is readable

### Content Guidelines

1. **Clear Subject**: Write compelling subject lines
2. **Personalization**: Use recipient's name
3. **Single CTA**: One primary call-to-action
4. **Scannable**: Use short paragraphs and bullet points
5. **Value Proposition**: Explain benefit to user

### Technical Guidelines

1. **Inline Styles**: Use inline styles for compatibility
2. **Table Layouts**: Use tables for complex layouts
3. **Alt Text**: Add alt text to all images
4. **Plain Text**: Provide plain text version
5. **Test Thoroughly**: Test across email clients

## Styling Templates

### Color Palette

Use Sylvan Token brand colors:

```typescript
const colors = {
  primary: '#2d7a4f',      // Forest green
  secondary: '#4a9d6f',    // Light green
  accent: '#8bc34a',       // Lime green
  text: '#333333',         // Dark gray
  textLight: '#666666',    // Medium gray
  background: '#f6f9fc',   // Light blue-gray
  white: '#ffffff',
};
```

### Typography

```typescript
const typography = {
  h1: {
    fontSize: '28px',
    fontWeight: 'bold',
    lineHeight: '36px',
    color: colors.primary,
  },
  h2: {
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: '32px',
    color: colors.primary,
  },
  body: {
    fontSize: '16px',
    lineHeight: '24px',
    color: colors.text,
  },
  small: {
    fontSize: '14px',
    lineHeight: '20px',
    color: colors.textLight,
  },
};
```

### Spacing

```typescript
const spacing = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
};
```

## Responsive Design

### Mobile Optimization

```typescript
// Use media queries for responsive design
const responsiveStyles = `
  @media only screen and (max-width: 600px) {
    .container {
      width: 100% !important;
      padding: 16px !important;
    }
    .heading {
      font-size: 20px !important;
    }
    .button {
      width: 100% !important;
      display: block !important;
    }
  }
`;
```

### Touch-Friendly

- Buttons: Minimum 44x44px
- Links: Adequate spacing between
- Text: Minimum 14px font size

## Internationalization

### Variable Substitution

Use double curly braces for variables:

```typescript
const message = t.email.message
  .replace('{{username}}', user.username)
  .replace('{{points}}', points.toString());
```

### Date Formatting

Format dates according to locale:

```typescript
import { format } from 'date-fns';
import { enUS, tr, de, zhCN, ru } from 'date-fns/locale';

const locales = { en: enUS, tr, de, zh: zhCN, ru };

const formattedDate = format(
  new Date(),
  'PPP',
  { locale: locales[locale] }
);
```

### Number Formatting

```typescript
const formattedNumber = new Intl.NumberFormat(locale).format(number);
```

## Testing Templates

### Visual Testing

1. **React Email Preview**: Use dev server
2. **Email Clients**: Test in Gmail, Outlook, Apple Mail
3. **Devices**: Test on mobile and desktop
4. **Dark Mode**: Check dark mode rendering

### Automated Testing

```typescript
// emails/__tests__/my-new-email.test.tsx
import { render } from '@react-email/render';
import MyNewEmail from '../my-new-email';

describe('MyNewEmail', () => {
  it('renders with correct content', () => {
    const html = render(
      <MyNewEmail
        recipientName="John Doe"
        actionUrl="https://example.com"
        locale="en"
      />
    );
    
    expect(html).toContain('John Doe');
    expect(html).toContain('https://example.com');
  });
  
  it('supports all languages', () => {
    const locales = ['en', 'tr', 'de', 'zh', 'ru'];
    
    locales.forEach(locale => {
      const html = render(
        <MyNewEmail
          recipientName="Test User"
          actionUrl="https://example.com"
          locale={locale}
        />
      );
      
      expect(html).toBeTruthy();
    });
  });
});
```

### Manual Testing Checklist

- [ ] Subject line is clear and compelling
- [ ] Preview text is informative
- [ ] All variables are replaced correctly
- [ ] Links work and point to correct URLs
- [ ] Images load properly
- [ ] Unsubscribe link is present
- [ ] Renders correctly in Gmail
- [ ] Renders correctly in Outlook
- [ ] Renders correctly in Apple Mail
- [ ] Looks good on mobile devices
- [ ] Looks good in dark mode
- [ ] All languages display correctly

## Common Patterns

### Conditional Content

```typescript
{user.hasWallet && (
  <Text>Your wallet: {maskWalletAddress(user.wallet)}</Text>
)}
```

### Lists

```typescript
<ul style={listStyle}>
  {items.map(item => (
    <li key={item.id} style={listItemStyle}>
      {item.text}
    </li>
  ))}
</ul>
```

### Tables

```typescript
<table style={tableStyle}>
  <thead>
    <tr>
      <th style={thStyle}>Task</th>
      <th style={thStyle}>Points</th>
    </tr>
  </thead>
  <tbody>
    {tasks.map(task => (
      <tr key={task.id}>
        <td style={tdStyle}>{task.name}</td>
        <td style={tdStyle}>{task.points}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### Images

```typescript
<Img
  src="https://sylvantoken.org/images/logo.png"
  width="150"
  height="50"
  alt="Sylvan Token Logo"
  style={imageStyle}
/>
```

## Troubleshooting

### Template Not Rendering

- Check for syntax errors
- Verify all imports are correct
- Ensure translations exist for all languages
- Check console for error messages

### Styles Not Applied

- Use inline styles instead of CSS classes
- Check for typos in style objects
- Verify media queries are properly formatted
- Test in different email clients

### Variables Not Replaced

- Check variable names match exactly
- Ensure double curly braces: `{{variable}}`
- Verify data is passed to template
- Check translation keys exist

## Resources

- [React Email Documentation](https://react.email/docs)
- [Email Client CSS Support](https://www.caniemail.com/)
- [Email Design Best Practices](https://www.campaignmonitor.com/resources/)
- [Litmus Email Testing](https://www.litmus.com/)

## Examples

See existing templates for reference:
- `emails/welcome.tsx` - Simple welcome email
- `emails/task-completion.tsx` - Dynamic content
- `emails/wallet-approved.tsx` - Conditional content
- `emails/admin-daily-digest.tsx` - Complex layout
