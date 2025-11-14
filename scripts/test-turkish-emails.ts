/**
 * Test Turkish Email Templates
 * Tests Turkish localization with logo
 */

import dotenv from 'dotenv';
dotenv.config();

import { sendEmailTemplate } from '@/lib/email/client';
import WelcomeEmail from '@/emails/welcome';
import TaskCompletionEmail from '@/emails/task-completion';

async function testTurkishEmails() {
  console.log('🧪 Türkçe e-posta şablonlarını test ediyoruz...\n');
  
  const testRecipients = ['admin@sylvantoken.org', 'gada.tr@gmail.com'];
  
  try {
    // Test 1: Hoş Geldiniz E-postası
    console.log('📧 1/2 Hoş Geldiniz E-postası gönderiliyor...');
    await sendEmailTemplate(
      WelcomeEmail,
      {
        username: 'Test Kullanıcı',
        dashboardUrl: 'https://sylvantoken.org/dashboard',
        locale: 'tr',
      },
      {
        to: testRecipients,
        subject: '🌿 Sylvan Token\'a Hoş Geldiniz',
        templateName: 'welcome-tr',
      }
    );
    console.log('✅ Hoş geldiniz e-postası gönderildi!\n');
    
    // Test 2: Görev Tamamlama E-postası
    console.log('📧 2/2 Görev Tamamlama E-postası gönderiliyor...');
    await sendEmailTemplate(
      TaskCompletionEmail,
      {
        username: 'Test Kullanıcı',
        taskName: 'Günlük Giriş',
        points: 50,
        totalPoints: 250,
        dashboardUrl: 'https://sylvantoken.org/dashboard',
        locale: 'tr',
      },
      {
        to: testRecipients,
        subject: '🎯 Görev Tamamlandı - 50 Puan Kazandınız!',
        templateName: 'task-completion-tr',
      }
    );
    console.log('✅ Görev tamamlama e-postası gönderildi!\n');
    
    console.log('✨ Tüm Türkçe e-postalar başarıyla gönderildi!');
    console.log('📝 Gelen kutunuzu kontrol edin - logo hem başlıkta hem de alt bilgide görünmelidir.');
    console.log('📧 Gönderilen toplam e-posta: 2');
    
  } catch (error) {
    console.error('❌ E-posta gönderme hatası:', error);
    process.exit(1);
  }
}

testTurkishEmails();
