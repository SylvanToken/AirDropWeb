/**
 * Email Sender Configuration Test Script
 * 
 * This script tests the email sender configuration to verify that emails
 * are sent from the correct address (noreply@sylvantoken.org) using Resend API.
 * 
 * Usage:
 *   npm run tsx scripts/test-email-sender.ts <email-address>
 *   npm run tsx scripts/test-email-sender.ts test@example.com
 * 
 * Environment Variables Required:
 *   - RESEND_API_KEY: Your Resend API key
 *   - EMAIL_FROM: Sender email address (default: noreply@sylvantoken.org)
 *   - EMAIL_FROM_NAME: Sender name (default: Sylvan Token)
 *   - EMAIL_REPLY_TO: Reply-to address (default: support@sylvantoken.org)
 */

import dotenv from 'dotenv';
dotenv.config();

import {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendTaskCompletionEmail,
} from '../lib/email';
import { emailConfig } from '../lib/email/client';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Print formatted header
 */
function printHeader(title: string) {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(60) + colors.reset);
  console.log(colors.bright + colors.cyan + title + colors.reset);
  console.log(colors.bright + colors.cyan + '='.repeat(60) + colors.reset + '\n');
}

/**
 * Print configuration details
 */
function printConfiguration() {
  printHeader('📧 Email Configuration');
  
  console.log(colors.bright + 'Sender Configuration:' + colors.reset);
  console.log(`  From: ${colors.green}${emailConfig.from}${colors.reset}`);
  console.log(`  Reply-To: ${colors.green}${emailConfig.replyTo}${colors.reset}`);
  console.log(`  Default Locale: ${emailConfig.defaultLocale}`);
  console.log(`  Supported Locales: ${emailConfig.supportedLocales.join(', ')}`);
  
  console.log('\n' + colors.bright + 'Environment Variables:' + colors.reset);
  console.log(`  RESEND_API_KEY: ${process.env.RESEND_API_KEY ? colors.green + '✓ Set' + colors.reset : colors.red + '✗ Not Set' + colors.reset}`);
  console.log(`  EMAIL_FROM: ${process.env.EMAIL_FROM || colors.yellow + '(using default)' + colors.reset}`);
  console.log(`  EMAIL_FROM_NAME: ${process.env.EMAIL_FROM_NAME || colors.yellow + '(using default)' + colors.reset}`);
  console.log(`  EMAIL_REPLY_TO: ${process.env.EMAIL_REPLY_TO || colors.yellow + '(using default)' + colors.reset}`);
  
  console.log('\n' + colors.bright + 'Rate Limiting:' + colors.reset);
  console.log(`  Max Emails Per Hour: ${emailConfig.rateLimitPerHour}`);
  console.log(`  Max Email Size: ${emailConfig.maxEmailSizeKb} KB`);
  console.log(`  Max Retries: ${emailConfig.maxRetries}`);
  console.log(`  Retry Delay: ${emailConfig.retryDelay}ms`);
}

/**
 * Test generic email sending
 */
async function testGenericEmail(to: string): Promise<boolean> {
  console.log(colors.bright + '\n1. Testing Generic Email (sendEmail)' + colors.reset);
  console.log(`   Recipient: ${to}`);
  
  try {
    const result = await sendEmail({
      to,
      subject: 'Test Email - Sylvan Token Sender Configuration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981;">Email Sender Configuration Test</h1>
          <p>This is a test email to verify the sender configuration.</p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Expected Sender:</strong> Sylvan Token &lt;noreply@sylvantoken.org&gt;</p>
            <p style="margin: 10px 0 0 0;"><strong>Expected Reply-To:</strong> support@sylvantoken.org</p>
          </div>
          <p>If you received this email, the configuration is working correctly! ✅</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            Sylvan Token Team
          </p>
        </div>
      `,
      text: 'Test email from Sylvan Token. Email sender configuration is working!',
    });
    
    if (result.success) {
      console.log(`   ${colors.green}✓ Success${colors.reset}`);
      console.log(`   Message ID: ${result.messageId}`);
      return true;
    } else {
      console.log(`   ${colors.red}✗ Failed${colors.reset}`);
      console.log(`   Error: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.log(`   ${colors.red}✗ Exception${colors.reset}`);
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Test welcome email
 */
async function testWelcomeEmail(to: string): Promise<boolean> {
  console.log(colors.bright + '\n2. Testing Welcome Email (sendWelcomeEmail)' + colors.reset);
  console.log(`   Recipient: ${to}`);
  
  try {
    const result = await sendWelcomeEmail(to, 'TestUser', 'test-user-id-123');
    
    if (result.success) {
      console.log(`   ${colors.green}✓ Success${colors.reset}`);
      console.log(`   Message ID: ${result.messageId}`);
      return true;
    } else {
      console.log(`   ${colors.red}✗ Failed${colors.reset}`);
      console.log(`   Error: ${result.error}`);
      if (result.retryAfter) {
        console.log(`   Retry After: ${new Date(result.retryAfter).toISOString()}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`   ${colors.red}✗ Exception${colors.reset}`);
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Test verification email
 */
async function testVerificationEmail(to: string): Promise<boolean> {
  console.log(colors.bright + '\n3. Testing Verification Email (sendVerificationEmail)' + colors.reset);
  console.log(`   Recipient: ${to}`);
  
  try {
    const testToken = 'test-verification-token-' + Date.now();
    const result = await sendVerificationEmail(to, testToken, 'test-user-id-456');
    
    if (result.success) {
      console.log(`   ${colors.green}✓ Success${colors.reset}`);
      console.log(`   Message ID: ${result.messageId}`);
      return true;
    } else {
      console.log(`   ${colors.red}✗ Failed${colors.reset}`);
      console.log(`   Error: ${result.error}`);
      if (result.retryAfter) {
        console.log(`   Retry After: ${new Date(result.retryAfter).toISOString()}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`   ${colors.red}✗ Exception${colors.reset}`);
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Test password reset email
 */
async function testPasswordResetEmail(to: string): Promise<boolean> {
  console.log(colors.bright + '\n4. Testing Password Reset Email (sendPasswordResetEmail)' + colors.reset);
  console.log(`   Recipient: ${to}`);
  
  try {
    const testToken = 'test-reset-token-' + Date.now();
    const result = await sendPasswordResetEmail(to, testToken, 'test-user-id-789');
    
    if (result.success) {
      console.log(`   ${colors.green}✓ Success${colors.reset}`);
      console.log(`   Message ID: ${result.messageId}`);
      return true;
    } else {
      console.log(`   ${colors.red}✗ Failed${colors.reset}`);
      console.log(`   Error: ${result.error}`);
      if (result.retryAfter) {
        console.log(`   Retry After: ${new Date(result.retryAfter).toISOString()}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`   ${colors.red}✗ Exception${colors.reset}`);
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Test task completion email
 */
async function testTaskCompletionEmail(to: string): Promise<boolean> {
  console.log(colors.bright + '\n5. Testing Task Completion Email (sendTaskCompletionEmail)' + colors.reset);
  console.log(`   Recipient: ${to}`);
  
  try {
    const result = await sendTaskCompletionEmail(
      to,
      'Test Task: Follow on Twitter',
      100,
      'test-user-id-999'
    );
    
    if (result.success) {
      console.log(`   ${colors.green}✓ Success${colors.reset}`);
      console.log(`   Message ID: ${result.messageId}`);
      return true;
    } else {
      console.log(`   ${colors.red}✗ Failed${colors.reset}`);
      console.log(`   Error: ${result.error}`);
      if (result.retryAfter) {
        console.log(`   Retry After: ${new Date(result.retryAfter).toISOString()}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`   ${colors.red}✗ Exception${colors.reset}`);
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Print test summary
 */
function printSummary(results: { name: string; success: boolean }[]) {
  printHeader('📊 Test Summary');
  
  const totalTests = results.length;
  const passedTests = results.filter((r) => r.success).length;
  const failedTests = totalTests - passedTests;
  
  console.log(colors.bright + 'Results:' + colors.reset);
  results.forEach((result) => {
    const status = result.success
      ? colors.green + '✓ PASS' + colors.reset
      : colors.red + '✗ FAIL' + colors.reset;
    console.log(`  ${status} - ${result.name}`);
  });
  
  console.log('\n' + colors.bright + 'Statistics:' + colors.reset);
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  Passed: ${colors.green}${passedTests}${colors.reset}`);
  console.log(`  Failed: ${failedTests > 0 ? colors.red : colors.green}${failedTests}${colors.reset}`);
  console.log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n' + colors.green + colors.bright + '🎉 All tests passed!' + colors.reset);
    console.log(colors.green + '✅ Email sender configuration is working correctly!' + colors.reset);
  } else {
    console.log('\n' + colors.red + colors.bright + '⚠️  Some tests failed!' + colors.reset);
    console.log(colors.yellow + '💡 Check the error messages above for details.' + colors.reset);
  }
}

/**
 * Print instructions for verifying sender address
 */
function printVerificationInstructions(email: string) {
  printHeader('📬 Verification Instructions');
  
  console.log('To verify the sender address configuration:');
  console.log('');
  console.log('1. Check your inbox at: ' + colors.cyan + email + colors.reset);
  console.log('2. Look for emails from: ' + colors.green + colors.bright + 'Sylvan Token <noreply@sylvantoken.org>' + colors.reset);
  console.log('3. Verify the sender name displays as: ' + colors.green + colors.bright + 'Sylvan Token' + colors.reset);
  console.log('4. Check that reply-to address is: ' + colors.green + colors.bright + 'support@sylvantoken.org' + colors.reset);
  console.log('');
  console.log(colors.yellow + '⚠️  Note: Emails may take a few moments to arrive.' + colors.reset);
  console.log(colors.yellow + '⚠️  Check your spam folder if emails don\'t appear in inbox.' + colors.reset);
}

/**
 * Main test function
 */
async function runTests() {
  // Get email address from command line arguments
  const testEmail = process.argv[2];
  
  if (!testEmail) {
    console.error(colors.red + '❌ Error: Email address is required' + colors.reset);
    console.log('\nUsage:');
    console.log('  npm run tsx scripts/test-email-sender.ts <email-address>');
    console.log('\nExample:');
    console.log('  npm run tsx scripts/test-email-sender.ts test@example.com');
    process.exit(1);
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(testEmail)) {
    console.error(colors.red + '❌ Error: Invalid email address format' + colors.reset);
    console.log(`Provided: ${testEmail}`);
    process.exit(1);
  }
  
  // Check for required environment variables
  if (!process.env.RESEND_API_KEY) {
    console.error(colors.red + '❌ Error: RESEND_API_KEY environment variable is not set' + colors.reset);
    console.log('\nPlease set the RESEND_API_KEY in your .env file:');
    console.log('  RESEND_API_KEY=re_xxxxxxxxxxxxx');
    process.exit(1);
  }
  
  // Print configuration
  printConfiguration();
  
  // Run tests
  printHeader('🧪 Running Email Tests');
  console.log(`Test recipient: ${colors.cyan}${testEmail}${colors.reset}\n`);
  
  const results = [
    { name: 'Generic Email', success: await testGenericEmail(testEmail) },
    { name: 'Welcome Email', success: await testWelcomeEmail(testEmail) },
    { name: 'Verification Email', success: await testVerificationEmail(testEmail) },
    { name: 'Password Reset Email', success: await testPasswordResetEmail(testEmail) },
    { name: 'Task Completion Email', success: await testTaskCompletionEmail(testEmail) },
  ];
  
  // Print summary
  printSummary(results);
  
  // Print verification instructions
  printVerificationInstructions(testEmail);
  
  // Exit with appropriate code
  const allPassed = results.every((r) => r.success);
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runTests().catch((error) => {
  console.error(colors.red + '\n❌ Fatal Error:' + colors.reset);
  console.error(error);
  process.exit(1);
});
