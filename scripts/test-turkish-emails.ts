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
  console.log('🧪 Testing Turkish email templates...\n');
  
  const testRecipients = ['admin@sylvantoken.org', 'gada.tr@gmail.com'];
  
  try {
    // Test 1: Welcome Email
    console.log('📧 1/2 Sending Welcome Email...');
    await sendEmailTemplate(
      WelcomeEmail,
      {
        username: 'Test User',
        dashboardUrl: 'https://sylvantoken.org/dashboard',
        locale: 'tr',
      },
      {
        to: testRecipients,
        subject: '🌿 Welcome to Sylvan Token',
        templateName: 'welcome-tr',
      }
    );
    console.log('✅ Welcome email sent!\n');
    
    // Test 2: Task Completion Email
    console.log('📧 2/2 Sending Task Completion Email...');
    await sendEmailTemplate(
      TaskCompletionEmail,
      {
        username: 'Test User',
        taskName: 'Daily Login',
        points: 50,
        totalPoints: 250,
        dashboardUrl: 'https://sylvantoken.org/dashboard',
        locale: 'tr',
      },
      {
        to: testRecipients,
        subject: '🎯 Task Completed - You Earned 50 Points!',
        templateName: 'task-completion-tr',
      }
    );
    console.log('✅ Task completion email sent!\n');
    
    console.log('✨ All Turkish emails sent successfully!');
    console.log('📝 Check your inbox - the logo should appear in both header and footer.');
    console.log('📧 Total emails sent: 2');
    
  } catch (error) {
    console.error('❌ Email sending error:', error);
    process.exit(1);
  }
}

testTurkishEmails();
