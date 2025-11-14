import { sendEmail } from '@/lib/email/client';

async function testAdminEmail() {
  console.log('🧪 Testing admin email sending...\n');

  try {
    console.log('📧 Sending test email...');
    
    await sendEmail({
      to: 'sylvantoken@gmail.com',
      subject: '[TEST] Admin Email System',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from the admin email sender system.</p>
        <p>If you receive this, the system is working correctly!</p>
        <hr>
        <p><small>Sent at: ${new Date().toISOString()}</small></p>
      `,
      template: 'admin-test',
      skipValidation: true,
    });

    console.log('✅ Email sent successfully!');
    console.log('📬 Check your inbox: sylvantoken@gmail.com');
  } catch (error: any) {
    console.error('❌ Failed to send email:');
    console.error(error.message);
    console.error('\nFull error:', error);
  }
}

testAdminEmail();
