/**
 * Send Welcome Emails to All Users
 * 
 * This script sends welcome emails to all users in the database
 * to test the email sender configuration with real user data.
 * 
 * Usage:
 *   npm run tsx scripts/send-welcome-emails-to-users.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { sendWelcomeEmail } from '../lib/email';

const prisma = new PrismaClient();

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function printHeader(title: string) {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(70) + colors.reset);
  console.log(colors.bright + colors.cyan + title + colors.reset);
  console.log(colors.bright + colors.cyan + '='.repeat(70) + colors.reset + '\n');
}

interface EmailResult {
  userId: string;
  email: string;
  username: string;
  role: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

async function sendWelcomeEmails() {
  try {
    printHeader('📧 Sending Welcome Emails to All Users');

    // Get all users from database
    console.log(colors.bright + 'Fetching users from database...' + colors.reset);
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`Found ${colors.cyan}${users.length}${colors.reset} users\n`);

    if (users.length === 0) {
      console.log(colors.yellow + 'No users found in database.' + colors.reset);
      return;
    }

    // Display users
    console.log(colors.bright + 'Users to receive welcome emails:' + colors.reset);
    users.forEach((user, index) => {
      const roleColor = user.role === 'ADMIN' ? colors.yellow : colors.cyan;
      console.log(`  ${index + 1}. ${user.username} (${roleColor}${user.role}${colors.reset}) - ${user.email}`);
    });
    console.log('');

    // Send emails
    printHeader('📤 Sending Emails');
    
    const results: EmailResult[] = [];
    
    for (const user of users) {
      console.log(colors.bright + `\nSending to: ${user.username} (${user.role})` + colors.reset);
      console.log(`  Email: ${user.email}`);
      
      try {
        const result = await sendWelcomeEmail(user.email, user.username, user.id);
        
        if (result.success) {
          console.log(`  ${colors.green}✓ Success${colors.reset}`);
          console.log(`  Message ID: ${result.messageId}`);
          results.push({
            userId: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            success: true,
            messageId: result.messageId,
          });
        } else {
          console.log(`  ${colors.red}✗ Failed${colors.reset}`);
          console.log(`  Error: ${result.error}`);
          results.push({
            userId: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            success: false,
            error: result.error,
          });
        }
      } catch (error) {
        console.log(`  ${colors.red}✗ Exception${colors.reset}`);
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`  Error: ${errorMessage}`);
        results.push({
          userId: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          success: false,
          error: errorMessage,
        });
      }
      
      // Small delay between emails to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Print summary
    printHeader('📊 Email Sending Summary');
    
    const totalEmails = results.length;
    const successCount = results.filter((r) => r.success).length;
    const failedCount = totalEmails - successCount;
    
    console.log(colors.bright + 'Results by User:' + colors.reset);
    results.forEach((result) => {
      const status = result.success
        ? colors.green + '✓ SENT' + colors.reset
        : colors.red + '✗ FAILED' + colors.reset;
      const roleColor = result.role === 'ADMIN' ? colors.yellow : colors.cyan;
      console.log(`  ${status} - ${result.username} (${roleColor}${result.role}${colors.reset}) - ${result.email}`);
      if (result.error) {
        console.log(`    Error: ${colors.red}${result.error}${colors.reset}`);
      }
    });
    
    console.log('\n' + colors.bright + 'Statistics:' + colors.reset);
    console.log(`  Total Users: ${totalEmails}`);
    console.log(`  Emails Sent: ${colors.green}${successCount}${colors.reset}`);
    console.log(`  Failed: ${failedCount > 0 ? colors.red : colors.green}${failedCount}${colors.reset}`);
    console.log(`  Success Rate: ${((successCount / totalEmails) * 100).toFixed(1)}%`);
    
    // Check email logs
    console.log('\n' + colors.bright + 'Checking Email Logs...' + colors.reset);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for logs to be written
    
    const recentLogs = await prisma.emailLog.findMany({
      where: {
        template: 'welcome',
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: totalEmails,
      select: {
        to: true,
        status: true,
        sentAt: true,
        error: true,
      },
    });
    
    console.log(`\nRecent welcome email logs (${recentLogs.length} entries):`);
    recentLogs.forEach((log, index) => {
      const statusColor =
        log.status === 'sent' || log.status === 'delivered'
          ? colors.green
          : log.status === 'failed'
          ? colors.red
          : colors.yellow;
      console.log(`  ${index + 1}. ${log.to} - ${statusColor}${log.status}${colors.reset} (${log.sentAt.toISOString()})`);
      if (log.error) {
        console.log(`     Error: ${colors.red}${log.error}${colors.reset}`);
      }
    });
    
    // Print verification instructions
    printHeader('📬 Verification Instructions');
    
    console.log('To verify the emails were sent correctly:');
    console.log('');
    console.log('1. Check the inbox for each user email address');
    console.log('2. Verify the sender shows as: ' + colors.green + 'Sylvan Token <noreply@sylvantoken.org>' + colors.reset);
    console.log('3. Verify the sender name displays as: ' + colors.green + 'Sylvan Token' + colors.reset);
    console.log('4. Check that reply-to address is: ' + colors.green + 'support@sylvantoken.org' + colors.reset);
    console.log('');
    console.log(colors.yellow + '⚠️  Note: If RESEND_API_KEY is not configured, emails will be queued but not sent.' + colors.reset);
    console.log(colors.yellow + '⚠️  Check email logs in database for delivery status.' + colors.reset);
    
    if (successCount === totalEmails) {
      console.log('\n' + colors.green + colors.bright + '🎉 All welcome emails sent successfully!' + colors.reset);
    } else {
      console.log('\n' + colors.red + colors.bright + '⚠️  Some emails failed to send!' + colors.reset);
      console.log(colors.yellow + '💡 Check the error messages above for details.' + colors.reset);
    }

  } catch (error) {
    console.error(colors.red + '\n❌ Fatal Error:' + colors.reset);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
sendWelcomeEmails();
