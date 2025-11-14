import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email/client';

/**
 * POST /api/admin/email/send-test
 * 
 * Send test email to admin (admin only)
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
      select: { role: true, email: true, username: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: 'Admin email address not found. Please update your profile.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { senderAddress, subject, body: emailBody } = body;

    // Validation
    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
      );
    }

    // Replace variables with admin's data
    const personalizedBody = emailBody
      .replace(/\{\{username\}\}/g, user.username)
      .replace(/\{\{email\}\}/g, user.email || '');

    // Render email template
    const { render } = await import('@react-email/components');
    const AdminCustomMessageEmail = (await import('@/emails/admin-custom-message')).default;
    
    const emailHtml = await render(
      AdminCustomMessageEmail({
        subject: `[TEST] ${subject}`,
        message: personalizedBody,
        username: user.username,
        userEmail: user.email || '',
      })
    );

    // Send test email to admin
    await sendEmail({
      to: user.email || '',
      subject: `[TEST] ${subject}`,
      html: emailHtml,
      template: 'admin-test-email',
      skipValidation: true, // Admin test emails bypass rate limiting
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      sentTo: user.email,
    });
  } catch (error: any) {
    console.error('[Admin Email Send Test] Error:', error);
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
