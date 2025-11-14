import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email/client';

/**
 * POST /api/admin/email/send
 * 
 * Send email to users (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { senderAddress, recipientType, recipientEmails, subject, body: emailBody } = body;

    // Validation
    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
      );
    }

    // Get recipients based on type
    let recipients: { email: string; username: string }[] = [];

    if (recipientType === 'custom') {
      // Parse custom email list
      const emails = recipientEmails
        .split(',')
        .map((e: string) => e.trim())
        .filter((e: string) => e);
      
      recipients = emails.map((email: string) => ({
        email,
        username: email.split('@')[0],
      }));
    } else {
      // Get users from database
      const where: any = {};
      
      if (recipientType === 'active') {
        where.lastActive = {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        };
      } else if (recipientType === 'verified') {
        where.walletVerified = true;
        where.twitterVerified = true;
        where.telegramVerified = true;
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          email: true,
          username: true,
        },
      });

      recipients = users;
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found' },
        { status: 400 }
      );
    }

    // Send emails in batches
    const batchSize = 50;
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      // Render email template once (outside the loop for better performance)
      const { render } = await import('@react-email/components');
      const AdminCustomMessageEmail = (await import('@/emails/admin-custom-message')).default;

      await Promise.all(
        batch.map(async (recipient) => {
          try {
            // Replace variables
            const personalizedBody = emailBody
              .replace(/\{\{username\}\}/g, recipient.username)
              .replace(/\{\{email\}\}/g, recipient.email);

            // Render email with template
            const emailHtml = await render(
              AdminCustomMessageEmail({
                subject,
                message: personalizedBody,
                username: recipient.username,
                userEmail: recipient.email,
              })
            );

            await sendEmail({
              to: recipient.email,
              subject,
              html: emailHtml,
              template: 'admin-manual-email',
              skipValidation: true, // Admin emails bypass rate limiting
            });

            sentCount++;
          } catch (error) {
            console.error(`Failed to send email to ${recipient.email}:`, error);
            failedCount++;
          }
        })
      );

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Log the email campaign
    await prisma.auditLog.create({
      data: {
        action: 'email_sent',
        adminId: session.user.id,
        adminEmail: user.email || '',
        affectedModel: 'Email',
        beforeData: JSON.stringify({
          recipientType,
          recipientCount: recipients.length,
          subject,
        }),
        afterData: JSON.stringify({
          sentCount,
          failedCount,
        }),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      recipientCount: recipients.length,
      sentCount,
      failedCount,
    });
  } catch (error: any) {
    console.error('[Admin Email Send] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
