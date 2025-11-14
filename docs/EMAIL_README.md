# Email Components

Reusable React Email components for Sylvan Token email templates.

## Components

### EmailLayout
Base layout component that wraps all email templates. Provides consistent structure with header and footer.

**Props:**
- `preview` (string): Preview text shown in email clients
- `children` (ReactNode): Email content
- `locale` (string, optional): Language code (en, tr, de, zh, ru). Default: 'en'

**Example:**
```tsx
<EmailLayout preview="Welcome to Sylvan Token!" locale="en">
  <Heading>Welcome!</Heading>
  <Text>Your content here...</Text>
</EmailLayout>
```

### EmailHeader
Header component with Sylvan Token logo and branding.

**Features:**
- Eco-friendly green gradient background
- Sylvan Token logo and brand name
- Responsive design

**Example:**
```tsx
<EmailHeader />
```

### EmailFooter
Footer component with links, legal information, and unsubscribe option.

**Props:**
- `locale` (string, optional): Language code for translations. Default: 'en'
- `unsubscribeUrl` (string, optional): URL for unsubscribe link

**Features:**
- Multilingual support (EN, TR, DE, ZH, RU)
- Privacy policy, terms, and support links
- CAN-SPAM compliant unsubscribe link
- Copyright and address information

**Example:**
```tsx
<EmailFooter 
  locale="en" 
  unsubscribeUrl="https://sylvantoken.org/unsubscribe?token=abc123"
/>
```

### EmailButton
Reusable button component with multiple variants.

**Props:**
- `href` (string): Button link URL
- `children` (ReactNode): Button text
- `variant` ('primary' | 'secondary' | 'outline', optional): Button style. Default: 'primary'
- `fullWidth` (boolean, optional): Make button full width. Default: false

**Variants:**
- `primary`: Eco-friendly green background (#2d7a4f)
- `secondary`: Lighter green background (#4a9d6f)
- `outline`: Transparent with green border

**Example:**
```tsx
<EmailButton href="https://sylvantoken.org/dashboard" variant="primary">
  Go to Dashboard
</EmailButton>
```

## Branding

### Colors
- **Primary Green**: `#2d7a4f` (hsl(145, 70%, 35%))
- **Forest Green**: `#1f5438` (hsl(140, 60%, 20%))
- **Secondary Green**: `#4a9d6f`
- **Background**: `#f6f9fc`
- **Text**: `#1f2937`

### Typography
- **Font Family**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif
- **Headings**: Bold, eco-friendly green color
- **Body Text**: 16px, line-height 24px

### Spacing
- **Container**: Max-width 600px, centered
- **Padding**: 32px 40px for content areas
- **Border Radius**: 8px for cards and buttons

## Email Best Practices

1. **Responsive Design**: All components are mobile-friendly
2. **Accessibility**: Proper alt text, semantic HTML, sufficient color contrast
3. **Email Client Compatibility**: Tested across Gmail, Outlook, Apple Mail
4. **Plain Text Fallback**: Always provide plain text version
5. **CAN-SPAM Compliance**: Unsubscribe link in footer
6. **Security**: No sensitive information in emails

## Usage Example

```tsx
import { EmailLayout, EmailButton } from './components';
import { Heading, Text } from '@react-email/components';

export default function WelcomeEmail({ username }: { username: string }) {
  return (
    <EmailLayout preview="Welcome to Sylvan Token!" locale="en">
      <Heading style={{ color: '#2d7a4f', fontSize: '24px' }}>
        Welcome, {username}! 🌿
      </Heading>
      <Text style={{ fontSize: '16px', lineHeight: '24px', color: '#374151' }}>
        Thank you for joining the Sylvan Token Airdrop Platform.
      </Text>
      <EmailButton href="https://sylvantoken.org/dashboard" variant="primary">
        Get Started
      </EmailButton>
    </EmailLayout>
  );
}
```

## Testing

Test email templates using:
- Resend preview mode
- Email client testing tools (Litmus, Email on Acid)
- Manual testing across different email clients
- Mobile device testing

## Multilingual Support

All components support the following languages:
- English (en)
- Turkish (tr)
- German (de)
- Chinese (zh)
- Russian (ru)

Translations are automatically applied based on the `locale` prop.
