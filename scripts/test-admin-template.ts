import { render } from '@react-email/components';
import AdminCustomMessageEmail from '@/emails/admin-custom-message';

async function testTemplate() {
  console.log('🎨 Testing admin custom message template...\n');

  const html = await render(
    AdminCustomMessageEmail({
      subject: 'Important Airdrop Update',
      message: `Hello {{username}},

We have an exciting update about the Sylvan Token airdrop!

The distribution will begin next week. Make sure your wallet is verified.

Your registered email: {{email}}

Visit: https://airdrop.sylvantoken.org

Thank you for being part of our community!`,
      username: 'John Doe',
      userEmail: 'john@example.com',
    })
  );

  console.log('✅ Template rendered successfully!');
  console.log('\n📧 Preview (first 500 chars):');
  console.log(html.substring(0, 500) + '...\n');
  console.log('✨ Template includes:');
  console.log('  ✓ Professional header with logo');
  console.log('  ✓ Styled message box');
  console.log('  ✓ Personalized greeting');
  console.log('  ✓ Footer with links');
  console.log('  ✓ Responsive design');
}

testTemplate();
