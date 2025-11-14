/**
 * Test Email with Logo Attachment
 * Tests the new CID attachment system for logo display
 */

import dotenv from 'dotenv';
dotenv.config();

import { sendEmailTemplate } from '@/lib/email/client';
import WelcomeEmail from '@/emails/welcome';
import TaskCompletionEmail from '@/emails/task-completion';

async function testLogoEmail() {
  console.log('🧪 Testing email with logo attachment...\n');
  
  try {
    // Test 1: Welcome Email
    console.log('📧 Sending Welcome Email...');
    await sendEmailTemplate(
      WelcomeEmail,
      {
        username: 'Test User',
        dashboardUrl: 'https://sylvantoken.org/dashboard',
        locale: 'en',
      },
      {
        to: ['admin@sylvantoken.org', 'gada.tr@gmail.com'],
        subject: '🌿 Welcome to Sylvan Token - Logo Test',
        templateName: 'welcome-logo-test',
      }
    );
    console.log('✅ Welcome email sent successfully!\n');
    
    // Test 2: Task Completion Email
    console.log('📧 Sending Task Completion Email...');
    await sendEmailTemplate(
      TaskCompletionEmail,
      {
        username: 'Test User',
        taskName: 'Daily Login',
        points: 50,
        totalPoints: 250,
        dashboardUrl: 'https://sylvantoken.org/dashboard',
        locale: 'en',
      },
      {
        to: ['admin@sylvantoken.org', 'gada.tr@gmail.com'],
        subject: '🎯 Task Completed - Logo Test',
        templateName: 'task-completion-logo-test',
      }
    );
    console.log('✅ Task completion email sent successfully!\n');
    
    console.log('✨ All test emails sent! Check your inbox.');
    console.log('📝 The logo should appear in both header and footer.');
    
  } catch (error) {
    console.error('❌ Error sending test emails:', error);
    process.exit(1);
  }
}

testLogoEmail();
