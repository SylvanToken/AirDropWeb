/**
 * Final Logo Test - Send to cdokuyucu@gmail.com
 * Tests the GitHub logo with 2x size
 */

import dotenv from 'dotenv';
dotenv.config();

import { sendEmailTemplate } from '@/lib/email/client';
import WelcomeEmail from '@/emails/welcome';
import TaskCompletionEmail from '@/emails/task-completion';

async function testFinalLogo() {
  console.log('🧪 Final logo test - Admin only...\n');
  
  const testRecipient = 'admin@sylvantoken.org';
  
  try {
    // Test 1: Welcome Email
    console.log('📧 1/2 Sending Welcome Email...');
    await sendEmailTemplate(
      WelcomeEmail,
      {
        username: 'Admin User',
        dashboardUrl: 'https://sylvantoken.org/dashboard',
        locale: 'tr',
      },
      {
        to: testRecipient,
        subject: '🌿 Sylvan Token\'a Hoş Geldiniz - Logo Test',
        templateName: 'welcome-logo-final',
      }
    );
    console.log('✅ Welcome email sent!\n');
    
    // Test 2: Task Completion Email
    console.log('📧 2/2 Sending Task Completion Email...');
    await sendEmailTemplate(
      TaskCompletionEmail,
      {
        username: 'Admin User',
        taskName: 'Günlük Giriş',
        points: 100,
        totalPoints: 500,
        dashboardUrl: 'https://sylvantoken.org/dashboard',
        locale: 'tr',
      },
      {
        to: testRecipient,
        subject: '🎯 Görev Tamamlandı - 100 Puan Kazandınız!',
        templateName: 'task-completion-logo-final',
      }
    );
    console.log('✅ Task completion email sent!\n');
    
    console.log('✨ Test e-postaları gönderildi!');
    console.log(`📧 Alıcı: ${testRecipient}`);
    console.log('\n📝 Logo boyutları:');
    console.log('   - Header: 144x144px');
    console.log('   - Footer: 64x64px');
    console.log('   - Gap: 8px');
    console.log('🔗 Logo URL: GitHub (SylvanToken/SylvanToken)');
    console.log('\n💡 Not: E-posta istemcinizde "Görselleri Göster" seçeneğini etkinleştirin.');
    
  } catch (error) {
    console.error('❌ E-posta gönderme hatası:', error);
    process.exit(1);
  }
}

testFinalLogo();
