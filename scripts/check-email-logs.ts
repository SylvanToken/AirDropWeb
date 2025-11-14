/**
 * Email Logs Verification Script
 * 
 * This script checks the email logs in the database to verify sender configuration.
 * 
 * Usage:
 *   npm run tsx scripts/check-email-logs.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

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

async function checkEmailLogs() {
  try {
    printHeader('📧 Email Logs Analysis');

    // Get total email count
    const totalEmails = await prisma.emailLog.count();
    console.log(`Total emails logged: ${colors.cyan}${totalEmails}${colors.reset}\n`);

    if (totalEmails === 0) {
      console.log(colors.yellow + 'No emails found in the database.' + colors.reset);
      console.log('This is expected if no emails have been sent yet.\n');
      return;
    }

    // Get recent emails
    const recentEmails = await prisma.emailLog.findMany({
      take: 10,
      orderBy: { sentAt: 'desc' },
      select: {
        id: true,
        to: true,
        subject: true,
        template: true,
        status: true,
        sentAt: true,
        error: true,
      },
    });

    console.log(colors.bright + 'Recent Emails (last 10):' + colors.reset);
    console.log('');

    recentEmails.forEach((email, index) => {
      const statusColor =
        email.status === 'sent' || email.status === 'delivered'
          ? colors.green
          : email.status === 'failed'
          ? colors.red
          : colors.yellow;

      console.log(`${colors.bright}${index + 1}. ${email.template || 'Generic'}${colors.reset}`);
      console.log(`   To: ${email.to}`);
      console.log(`   Subject: ${email.subject}`);
      console.log(`   Status: ${statusColor}${email.status}${colors.reset}`);
      console.log(`   Sent: ${email.sentAt.toISOString()}`);
      if (email.error) {
        console.log(`   Error: ${colors.red}${email.error}${colors.reset}`);
      }
      console.log('');
    });

    // Get statistics by status
    const statusStats = await prisma.emailLog.groupBy({
      by: ['status'],
      _count: true,
    });

    console.log(colors.bright + 'Email Status Statistics:' + colors.reset);
    console.log('');
    statusStats.forEach((stat) => {
      const statusColor =
        stat.status === 'sent' || stat.status === 'delivered'
          ? colors.green
          : stat.status === 'failed'
          ? colors.red
          : colors.yellow;
      console.log(`  ${statusColor}${stat.status}${colors.reset}: ${stat._count}`);
    });
    console.log('');

    // Get statistics by template
    const templateStats = await prisma.emailLog.groupBy({
      by: ['template'],
      _count: true,
      orderBy: {
        _count: {
          template: 'desc',
        },
      },
    });

    console.log(colors.bright + 'Email Template Statistics:' + colors.reset);
    console.log('');
    templateStats.forEach((stat) => {
      console.log(`  ${stat.template || 'Generic'}: ${colors.cyan}${stat._count}${colors.reset}`);
    });
    console.log('');

    // Check for sender information (if available in metadata)
    console.log(colors.bright + 'Sender Configuration Check:' + colors.reset);
    console.log('');
    console.log(colors.yellow + 'Note: Email logs do not store sender address directly.' + colors.reset);
    console.log('Sender address is configured in the email client and used when sending.');
    console.log('');
    console.log('Expected sender configuration:');
    console.log(`  From: ${colors.green}Sylvan Token <noreply@sylvantoken.org>${colors.reset}`);
    console.log(`  Reply-To: ${colors.green}support@sylvantoken.org${colors.reset}`);
    console.log('');
    console.log('To verify actual sender address, check received emails in your inbox.');

  } catch (error) {
    console.error(colors.red + '❌ Error checking email logs:' + colors.reset);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmailLogs();
