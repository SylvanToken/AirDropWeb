/**
 * Comprehensive Email Types Test Script
 * 
 * This script tests all email types to verify sender configuration.
 * It sends test emails for each type and checks the email logs.
 * 
 * Usage:
 *   npm run tsx scripts/test-all-email-types.ts <email-address>
 *   npm run tsx scripts/test-all-email-types.ts test@example.com
 */

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendTaskCompletionEmail,
} from '../lib/email';
import { emailConfig } from '../lib/email/client';

const prisma = new PrismaClient();

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface TestResult {
  type: string;
  success: boolean;
  messageId?: string;
  error?: any;
  logEntry?: any;
}

function printHeader(title: string) {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(70) + colors.reset);
  console.log(colors.bright + colors.cyan + title + colors.reset);
  console.log(colors.bright + colors.cyan + '='.repeat(70) + colors.reset + '\n');
}

/**
 * Print sender configuration
 */
function printSenderConfiguration() {
  printHeader('📧 Sender Configuration');
  
  console.log(colors.bright + 'Expected Sender Information:' + colors.reset);
  console.log(`  From: ${colors.green}${emailConfig.from}${colors.reset}`);
  console.log(`  Reply-To: ${colors.green}${emailConfig.replyTo}${colors.reset}`);
  console.log('');
  
  console.log(colors.bright + 'Configuration Source:' + colors.reset);
  console.log(`  EMAIL_FROM: ${process.env.EMAIL_FROM || colors.yellow + '(default)' + colors.reset}`);
  console.log(`  EMAIL_FROM_NAME: ${process.env.EMAIL_FROM_NAME || colors.yellow + '(default)' + colors.reset}`);
  console.log(`  EMAIL_REPLY_TO: ${process.env.EMAIL_REPLY_TO || colors.yellow + '(default)' + colors.reset}`);
}

/**
 * Test welcome email
 */
async function testWelcomeEmail(to: string): Promise<TestResult> {
  console.log(colors.bright + '\n1. Testing Welcome Email' + colors.reset);
  console.log(`   Recipient: ${to}`);
  
  try {
    const result = await sendWelcomeEmail(to, 'TestUser', 'test-user-welcome-' + Date.now());
    
    if (result.success) {
      console.log(`   ${colors.green}✓ Success${colors.reset}`);
      console.log(`   Message ID: ${result.messageId}`);
      
      // Wait a moment for the log to be written
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check email log
      const logEntry = await prisma.emailLog.findFirst({
        where: {
          to,
          template: 'welcome',
        },
        orderBy: { sentAt: 'desc' },
      });
      
      if (logEntry) {
        console.log(`   Log Status: ${colors.cyan}${logEntry.status}${colors.reset}`);
      }
      
      return { type: 'Welcome Email', success: true, messageId: result.messageId, logEntry };
    } else {
      console.log(`   ${colors.red}✗ Failed${colors.reset}`);
      console.log(`   Error: ${result.error}`);
      return { type: 'Welcome Email', success: false, error: result.error };
    }
  } catch (error) {
    console.log(`   ${colors.red}✗ Exception${colors.reset}`);
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    return { type: 'Welcome Email', success: false, error };
  }
}

/**
 * Test verification email
 */
async function testVerificationEmail(to: string): Promise<TestResult> {
  console.log(colors.bright + '\n2. Testing Verification Email' + colors.reset);
  console.log(`   Recipient: ${to}`);
  
  try {
    const testToken = 'test-verification-token-' + Date.now();
    const result = await sendVerificationEmail(to, testToken, 'test-user-verify-' + Date.now());
    
    if (result.success) {
      console.log(`   ${colors.green}✓ Success${colors.reset}`);
      console.log(`   Message ID: ${result.messageId}`);
      
      // Wait a moment for the log to be written
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check email log
      const logEntry = await prisma.emailLog.findFirst({
        where: {
          to,
          template: 'email-verification',
        },
        orderBy: { sentAt: 'desc' },
      });
      
      if (logEntry) {
        console.log(`   Log Status: ${colors.cyan}${logEntry.status}${colors.reset}`);
      }
      
      return { type: 'Verification Email', success: true, messageId: result.messageId, logEntry };
    } else {
      console.log(`   ${colors.red}✗ Failed${colors.reset}`);
      console.log(`   Error: ${result.error}`);
      return { type: 'Verification Email', success: false, error: result.error };
    }
  } catch (error) {
    console.log(`   ${colors.red}✗ Exception${colors.reset}`);
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    return { type: 'Verification Email', success: false, error };
  }
}

/**
 * Test password reset email
 */
async function testPasswordResetEmail(to: string): Promise<TestResult> {
  console.log(colors.bright + '\n3. Testing Password Reset Email' + colors.reset);
  console.log(`   Recipient: ${to}`);
  
  try {
    const testToken = 'test-reset-token-' + Date.now();
    const result = await sendPasswordResetEmail(to, testToken, 'test-user-reset-' + Date.now());
    
    if (result.success) {
      console.log(`   ${colors.green}✓ Success${colors.reset}`);
      console.log(`   Message ID: ${result.messageId}`);
      
      // Wait a moment for the log to be written
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check email log
      const logEntry = await prisma.emailLog.findFirst({
        where: {
          to,
          template: 'password-reset',
        },
        orderBy: { sentAt: 'desc' },
      });
      
      if (logEntry) {
        console.log(`   Log Status: ${colors.cyan}${logEntry.status}${colors.reset}`);
      }
      
      return { type: 'Password Reset Email', success: true, messageId: result.messageId, logEntry };
    } else {
      console.log(`   ${colors.red}✗ Failed${colors.reset}`);
      console.log(`   Error: ${result.error}`);
      return { type: 'Password Reset Email', success: false, error: result.error };
    }
  } catch (error) {
    console.log(`   ${colors.red}✗ Exception${colors.reset}`);
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    return { type: 'Password Reset Email', success: false, error };
  }
}

/**
 * Test task completion email
 */
async function testTaskCompletionEmail(to: string): Promise<TestResult> {
  console.log(colors.bright + '\n4. Testing Task Completion Email' + colors.reset);
  console.log(`   Recipient: ${to}`);
  
  try {
    const result = await sendTaskCompletionEmail(
      to,
      'Test Task: Follow on Twitter',
      100,
      'test-user-task-' + Date.now()
    );
    
    if (result.success) {
      console.log(`   ${colors.green}✓ Success${colors.reset}`);
      console.log(`   Message ID: ${result.messageId}`);
      
      // Wait a moment for the log to be written
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check email log
      const logEntry = await prisma.emailLog.findFirst({
        where: {
          to,
          template: 'task-completion',
        },
        orderBy: { sentAt: 'desc' },
      });
      
      if (logEntry) {
        console.log(`   Log Status: ${colors.cyan}${logEntry.status}${colors.reset}`);
      }
      
      return { type: 'Task Completion Email', success: true, messageId: result.messageId, logEntry };
    } else {
      console.log(`   ${colors.red}✗ Failed${colors.reset}`);
      console.log(`   Error: ${result.error}`);
      return { type: 'Task Completion Email', success: false, error: result.error };
    }
  } catch (error) {
    console.log(`   ${colors.red}✗ Exception${colors.reset}`);
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    return { type: 'Task Completion Email', success: false, error };
  }
}

/**
 * Print test summary
 */
function printSummary(results: TestResult[]) {
  printHeader('📊 Test Summary');
  
  const totalTests = results.length;
  const passedTests = results.filter((r) => r.success).length;
  const failedTests = totalTests - passedTests;
  
  console.log(colors.bright + 'Results:' + colors.reset);
  results.forEach((result) => {
    const status = result.success
      ? colors.green + '✓ PASS' + colors.reset
      : colors.red + '✗ FAIL' + colors.reset;
    console.log(`  ${status} - ${result.type}`);
    if (result.logEntry) {
      console.log(`    Log Status: ${result.logEntry.status}`);
    }
  });
  
  console.log('\n' + colors.bright + 'Statistics:' + colors.reset);
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  Passed: ${colors.green}${passedTests}${colors.reset}`);
  console.log(`  Failed: ${failedTests > 0 ? colors.red : colors.green}${failedTests}${colors.reset}`);
  console.log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n' + colors.green + colors.bright + '🎉 All email types tested successfully!' + colors.reset);
  } else {
    console.log('\n' + colors.red + colors.bright + '⚠️  Some email types failed!' + colors.reset);
  }
}

/**
 * Print verification instructions
 */
function printVerificationInstructions(email: string) {
  printHeader('📬 Manual Verification Steps');
  
  console.log('To complete the verification:');
  console.log('');
  console.log('1. Check your inbox at: ' + colors.cyan + email + colors.reset);
  console.log('');
  console.log('2. Verify each email shows:');
  console.log(`   From: ${colors.green}Sylvan Token <noreply@sylvantoken.org>${colors.reset}`);
  console.log(`   Reply-To: ${colors.green}support@sylvantoken.org${colors.reset}`);
  console.log('');
  console.log('3. Expected emails:');
  console.log('   - Welcome Email');
  console.log('   - Email Verification');
  console.log('   - Password Reset');
  console.log('   - Task Completion');
  console.log('');
  console.log(colors.yellow + '⚠️  Note: Emails may take a few moments to arrive.' + colors.reset);
  console.log(colors.yellow + '⚠️  Check your spam folder if emails don\'t appear.' + colors.reset);
}

/**
 * Main test function
 */
async function runTests() {
  try {
    // Get email address from command line
    const testEmail = process.argv[2];
    
    if (!testEmail) {
      console.error(colors.red + '❌ Error: Email address is required' + colors.reset);
      console.log('\nUsage:');
      console.log('  npm run tsx scripts/test-all-email-types.ts <email-address>');
      console.log('\nExample:');
      console.log('  npm run tsx scripts/test-all-email-types.ts test@example.com');
      process.exit(1);
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      console.error(colors.red + '❌ Error: Invalid email address format' + colors.reset);
      console.log(`Provided: ${testEmail}`);
      process.exit(1);
    }
    
    // Print sender configuration
    printSenderConfiguration();
    
    // Run tests
    printHeader('🧪 Testing All Email Types');
    console.log(`Test recipient: ${colors.cyan}${testEmail}${colors.reset}`);
    
    const results: TestResult[] = [];
    
    results.push(await testWelcomeEmail(testEmail));
    results.push(await testVerificationEmail(testEmail));
    results.push(await testPasswordResetEmail(testEmail));
    results.push(await testTaskCompletionEmail(testEmail));
    
    // Print summary
    printSummary(results);
    
    // Print verification instructions
    printVerificationInstructions(testEmail);
    
    // Exit with appropriate code
    const allPassed = results.every((r) => r.success);
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error(colors.red + '\n❌ Fatal Error:' + colors.reset);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
runTests();
