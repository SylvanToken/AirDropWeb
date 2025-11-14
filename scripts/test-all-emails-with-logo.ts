/**
 * Test All Email Templates with Logo
 * Tests all email templates to ensure logo displays correctly
 */

import dotenv from 'dotenv';
dotenv.config();

import { sendEmailTemplate } from '@/lib/email/client';
import WelcomeEmail from '@/emails/welcome';
import TaskCompletionEmail from '@/emails/task-completion';
import PasswordResetEmail from '@/emails/password-reset';
import EmailVerificationEmail from '@/emails/email-verification';

async function testAllEmails() {
  console.log('🧪 Testing all email templates with logo...\n');
  
  const testRecipients = ['admin@sylvantoken.org', 'gada.tr@gmail.com'];
  
  try {
    // Test 1: Welcome Email
    console.log('📧 1/4 Sending Welcome Email...');
    await sendEmailTemplate(
      WelcomeEmail,
      {
        username: 'Test User',
        dashboardUrl: 'https://sylvantoken.org/dashboard',
        locale: 'en',
      },
      {
        to: testRecipients,
        subject: '🌿 Welcome to Sylvan Token',
        templateName: 'welcome',
      }
    );
    console.log('✅ Welcome email sent!\n');
    
    // Test 2: Task Completion Email
    console.log('📧 2/4 Sending Task Completion Email...');
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
        to: testRecipients,
        subject: '🎯 Task Completed - You Earned 50 Points!',
        templateName: 'task-completion',
      }
    );
    console.log('✅ Task completion email sent!\n');
    
    // Test 3: Email Verification
    console.log('📧 3/4 Sending Email Verification...');
    await sendEmailTemplate(
      EmailVerificationEmail,
      {
        verifyUrl: 'https://sylvantoken.org/verify-email?token=test123',
        locale: 'en',
      },
      {
        to: testRecipients,
        subject: '📧 Verify Your Email Address',
        templateName: 'email-verification',
      }
    );
    console.log('✅ Email verification sent!\n');
    
    // Test 4: Password Reset
    console.log('📧 4/4 Sending Password Reset...');
    await sendEmailTemplate(
      PasswordResetEmail,
      {
        resetUrl: 'https://sylvantoken.org/reset-password?token=test456',
        locale: 'en',
      },
      {
        to: testRecipients,
        subject: '🔐 Reset Your Password',
        templateName: 'password-reset',
      }
    );
    console.log('✅ Password reset email sent!\n');
    
    console.log('✨ All test emails sent successfully!');
    console.log('📝 Check your inbox - logo should appear in header and footer of all emails.');
    console.log('📧 Total emails sent: 4');
    
  } catch (error) {
    console.error('❌ Error sending test emails:', error);
    process.exit(1);
  }
}

testAllEmails();
