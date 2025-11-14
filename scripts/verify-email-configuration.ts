/**
 * Email Configuration Verification Script
 * 
 * This script verifies the email sender configuration without sending actual emails.
 * It checks environment variables, configuration values, and provides a detailed report.
 * 
 * Usage:
 *   npm run tsx scripts/verify-email-configuration.ts
 */

import dotenv from 'dotenv';
dotenv.config();

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

interface ConfigCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: string;
}

/**
 * Print formatted header
 */
function printHeader(title: string) {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(70) + colors.reset);
  console.log(colors.bright + colors.cyan + title + colors.reset);
  console.log(colors.bright + colors.cyan + '='.repeat(70) + colors.reset + '\n');
}

/**
 * Check environment variables
 */
function checkEnvironmentVariables(): ConfigCheck[] {
  const checks: ConfigCheck[] = [];

  // Check RESEND_API_KEY
  if (process.env.RESEND_API_KEY) {
    const keyLength = process.env.RESEND_API_KEY.length;
    const maskedKey = process.env.RESEND_API_KEY.substring(0, 8) + '...' + process.env.RESEND_API_KEY.substring(keyLength - 4);
    checks.push({
      name: 'RESEND_API_KEY',
      status: 'pass',
      message: 'API key is configured',
      details: maskedKey,
    });
  } else {
    checks.push({
      name: 'RESEND_API_KEY',
      status: 'fail',
      message: 'API key is not configured',
      details: 'Required for sending emails via Resend',
    });
  }

  // Check EMAIL_FROM
  if (process.env.EMAIL_FROM) {
    const isCorrect = process.env.EMAIL_FROM === 'noreply@sylvantoken.org';
    checks.push({
      name: 'EMAIL_FROM',
      status: isCorrect ? 'pass' : 'warn',
      message: isCorrect ? 'Sender address is correctly configured' : 'Sender address differs from expected',
      details: process.env.EMAIL_FROM,
    });
  } else {
    checks.push({
      name: 'EMAIL_FROM',
      status: 'warn',
      message: 'Using default sender address',
      details: 'noreply@sylvantoken.org (default)',
    });
  }

  // Check EMAIL_FROM_NAME
  if (process.env.EMAIL_FROM_NAME) {
    const isCorrect = process.env.EMAIL_FROM_NAME === 'Sylvan Token';
    checks.push({
      name: 'EMAIL_FROM_NAME',
      status: isCorrect ? 'pass' : 'warn',
      message: isCorrect ? 'Sender name is correctly configured' : 'Sender name differs from expected',
      details: process.env.EMAIL_FROM_NAME,
    });
  } else {
    checks.push({
      name: 'EMAIL_FROM_NAME',
      status: 'warn',
      message: 'Using default sender name',
      details: 'Sylvan Token (default)',
    });
  }

  // Check EMAIL_REPLY_TO
  if (process.env.EMAIL_REPLY_TO) {
    const isCorrect = process.env.EMAIL_REPLY_TO === 'support@sylvantoken.org';
    checks.push({
      name: 'EMAIL_REPLY_TO',
      status: isCorrect ? 'pass' : 'warn',
      message: isCorrect ? 'Reply-to address is correctly configured' : 'Reply-to address differs from expected',
      details: process.env.EMAIL_REPLY_TO,
    });
  } else {
    checks.push({
      name: 'EMAIL_REPLY_TO',
      status: 'warn',
      message: 'Using default reply-to address',
      details: 'support@sylvantoken.org (default)',
    });
  }

  return checks;
}

/**
 * Check email configuration object
 */
function checkEmailConfig(): ConfigCheck[] {
  const checks: ConfigCheck[] = [];

  // Check from address
  const expectedFrom = 'Sylvan Token <noreply@sylvantoken.org>';
  const isFromCorrect = emailConfig.from === expectedFrom;
  checks.push({
    name: 'emailConfig.from',
    status: isFromCorrect ? 'pass' : 'warn',
    message: isFromCorrect ? 'From address matches expected format' : 'From address differs from expected',
    details: emailConfig.from,
  });

  // Check reply-to address
  const expectedReplyTo = 'support@sylvantoken.org';
  const isReplyToCorrect = emailConfig.replyTo === expectedReplyTo;
  checks.push({
    name: 'emailConfig.replyTo',
    status: isReplyToCorrect ? 'pass' : 'warn',
    message: isReplyToCorrect ? 'Reply-to address matches expected' : 'Reply-to address differs from expected',
    details: emailConfig.replyTo,
  });

  // Check rate limiting
  checks.push({
    name: 'emailConfig.rateLimitPerHour',
    status: 'pass',
    message: 'Rate limiting is configured',
    details: `${emailConfig.rateLimitPerHour} emails per hour per recipient`,
  });

  // Check max retries
  checks.push({
    name: 'emailConfig.maxRetries',
    status: 'pass',
    message: 'Retry configuration is set',
    details: `${emailConfig.maxRetries} retries with ${emailConfig.retryDelay}ms delay`,
  });

  // Check supported locales
  checks.push({
    name: 'emailConfig.supportedLocales',
    status: 'pass',
    message: 'Localization is configured',
    details: `${emailConfig.supportedLocales.length} locales: ${emailConfig.supportedLocales.join(', ')}`,
  });

  return checks;
}

/**
 * Print check results
 */
function printChecks(title: string, checks: ConfigCheck[]) {
  console.log(colors.bright + title + colors.reset);
  console.log('');

  checks.forEach((check) => {
    let statusIcon: string;
    let statusColor: string;

    switch (check.status) {
      case 'pass':
        statusIcon = '✓';
        statusColor = colors.green;
        break;
      case 'warn':
        statusIcon = '⚠';
        statusColor = colors.yellow;
        break;
      case 'fail':
        statusIcon = '✗';
        statusColor = colors.red;
        break;
    }

    console.log(`  ${statusColor}${statusIcon}${colors.reset} ${colors.bright}${check.name}${colors.reset}`);
    console.log(`    ${check.message}`);
    if (check.details) {
      console.log(`    ${colors.cyan}${check.details}${colors.reset}`);
    }
    console.log('');
  });
}

/**
 * Print summary
 */
function printSummary(allChecks: ConfigCheck[]) {
  printHeader('📊 Configuration Summary');

  const passed = allChecks.filter((c) => c.status === 'pass').length;
  const warnings = allChecks.filter((c) => c.status === 'warn').length;
  const failed = allChecks.filter((c) => c.status === 'fail').length;
  const total = allChecks.length;

  console.log(colors.bright + 'Results:' + colors.reset);
  console.log(`  Total Checks: ${total}`);
  console.log(`  Passed: ${colors.green}${passed}${colors.reset}`);
  console.log(`  Warnings: ${colors.yellow}${warnings}${colors.reset}`);
  console.log(`  Failed: ${failed > 0 ? colors.red : colors.green}${failed}${colors.reset}`);
  console.log('');

  if (failed === 0 && warnings === 0) {
    console.log(colors.green + colors.bright + '🎉 Perfect! Email configuration is complete and correct!' + colors.reset);
  } else if (failed === 0) {
    console.log(colors.yellow + colors.bright + '✅ Email configuration is functional with minor warnings.' + colors.reset);
    console.log(colors.yellow + '💡 Review warnings above for optimal configuration.' + colors.reset);
  } else {
    console.log(colors.red + colors.bright + '❌ Email configuration has critical issues!' + colors.reset);
    console.log(colors.red + '⚠️  Fix failed checks before sending emails.' + colors.reset);
  }
}

/**
 * Print expected configuration
 */
function printExpectedConfiguration() {
  printHeader('📋 Expected Configuration');

  console.log(colors.bright + 'Environment Variables (.env file):' + colors.reset);
  console.log('');
  console.log(colors.cyan + '# Resend API Configuration' + colors.reset);
  console.log('RESEND_API_KEY="re_xxxxxxxxxxxxx"');
  console.log('');
  console.log(colors.cyan + '# Email Sender Configuration' + colors.reset);
  console.log('EMAIL_FROM="noreply@sylvantoken.org"');
  console.log('EMAIL_FROM_NAME="Sylvan Token"');
  console.log('EMAIL_REPLY_TO="support@sylvantoken.org"');
  console.log('');
  console.log(colors.bright + 'Expected Email Appearance:' + colors.reset);
  console.log('');
  console.log(`  From: ${colors.green}Sylvan Token <noreply@sylvantoken.org>${colors.reset}`);
  console.log(`  Reply-To: ${colors.green}support@sylvantoken.org${colors.reset}`);
  console.log('');
}

/**
 * Print next steps
 */
function printNextSteps(hasFailures: boolean) {
  printHeader('🚀 Next Steps');

  if (hasFailures) {
    console.log('1. Fix the failed configuration checks above');
    console.log('2. Update your .env file with the required values');
    console.log('3. Run this script again to verify the configuration');
    console.log('4. Once all checks pass, test email sending with:');
    console.log(`   ${colors.cyan}npm run tsx scripts/test-email-sender.ts your-email@example.com${colors.reset}`);
  } else {
    console.log('1. Test email sending with:');
    console.log(`   ${colors.cyan}npm run tsx scripts/test-email-sender.ts your-email@example.com${colors.reset}`);
    console.log('');
    console.log('2. Verify received emails show:');
    console.log(`   - Sender: ${colors.green}Sylvan Token <noreply@sylvantoken.org>${colors.reset}`);
    console.log(`   - Reply-To: ${colors.green}support@sylvantoken.org${colors.reset}`);
    console.log('');
    console.log('3. Check email logs in the database for sender information');
  }
}

/**
 * Main verification function
 */
async function runVerification() {
  printHeader('📧 Email Sender Configuration Verification');

  console.log('This script verifies that the email sender configuration is correct.');
  console.log('It checks environment variables and configuration values.');
  console.log('');

  // Check environment variables
  const envChecks = checkEnvironmentVariables();
  printChecks('Environment Variables:', envChecks);

  // Check email configuration
  const configChecks = checkEmailConfig();
  printChecks('Email Configuration Object:', configChecks);

  // Print summary
  const allChecks = [...envChecks, ...configChecks];
  printSummary(allChecks);

  // Print expected configuration
  printExpectedConfiguration();

  // Print next steps
  const hasFailures = allChecks.some((c) => c.status === 'fail');
  printNextSteps(hasFailures);

  // Exit with appropriate code
  process.exit(hasFailures ? 1 : 0);
}

// Run the verification
runVerification().catch((error) => {
  console.error(colors.red + '\n❌ Fatal Error:' + colors.reset);
  console.error(error);
  process.exit(1);
});
