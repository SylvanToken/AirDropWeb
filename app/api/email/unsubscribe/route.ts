import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseUnsubscribeToken } from '@/lib/email/utils';
import { sendEmailTemplate } from '@/lib/email/client';
import UnsubscribeConfirmationEmail from '@/emails/unsubscribe-confirmation';

/**
 * GET /api/email/unsubscribe
 * Handle unsubscribe requests via token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const emailType = searchParams.get('type') || 'all';

    if (!token) {
      return NextResponse.json(
        { error: 'Missing unsubscribe token' },
        { status: 400 }
      );
    }

    // Parse and validate token
    const parsed = parseUnsubscribeToken(token);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 400 }
      );
    }

    const { userId, emailType: tokenEmailType } = parsed;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get or create email preferences
    let preferences = await prisma.emailPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await prisma.emailPreference.create({
        data: {
          userId,
          taskCompletions: true,
          walletVerifications: true,
          adminNotifications: true,
          marketingEmails: false,
        },
      });
    }

    // Determine which email type to unsubscribe from
    const typeToUnsubscribe = emailType !== 'all' ? emailType : tokenEmailType;

    // Update preferences based on email type
    const updateData: any = {};
    
    if (typeToUnsubscribe === 'all') {
      // Unsubscribe from all non-transactional emails
      updateData.taskCompletions = false;
      updateData.marketingEmails = false;
      updateData.unsubscribedAt = new Date();
    } else if (typeToUnsubscribe === 'taskCompletions') {
      updateData.taskCompletions = false;
    } else if (typeToUnsubscribe === 'marketingEmails') {
      updateData.marketingEmails = false;
    }

    // Update email preferences
    await prisma.emailPreference.update({
      where: { userId },
      data: updateData,
    });

    // Return success response with redirect info
    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
      emailType: typeToUnsubscribe,
      userId,
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/email/unsubscribe
 * Handle unsubscribe requests via form submission
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, emailType = 'all', sendConfirmation = true } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get or create email preferences
    let preferences = await prisma.emailPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await prisma.emailPreference.create({
        data: {
          userId,
          taskCompletions: true,
          walletVerifications: true,
          adminNotifications: true,
          marketingEmails: false,
        },
      });
    }

    // Update preferences based on email type
    const updateData: any = {};
    
    if (emailType === 'all') {
      updateData.taskCompletions = false;
      updateData.marketingEmails = false;
      updateData.unsubscribedAt = new Date();
    } else if (emailType === 'taskCompletions') {
      updateData.taskCompletions = false;
    } else if (emailType === 'marketingEmails') {
      updateData.marketingEmails = false;
    }

    // Update email preferences
    const updated = await prisma.emailPreference.update({
      where: { userId },
      data: updateData,
    });

    // Send confirmation email if requested
    if (sendConfirmation) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005';
        const resubscribeUrl = `${baseUrl}/profile`;
        
        await sendEmailTemplate(
          UnsubscribeConfirmationEmail,
          {
            username: user.username,
            emailType,
            resubscribeUrl,
            locale: 'en', // NOTE: User locale detection not implemented yet
          },
          {
            to: user.email,
            subject: 'Unsubscribe Confirmation - Sylvan Token',
            templateName: 'unsubscribe-confirmation',
          }
        );
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email preferences updated successfully',
      preferences: {
        taskCompletions: updated.taskCompletions,
        walletVerifications: updated.walletVerifications,
        adminNotifications: updated.adminNotifications,
        marketingEmails: updated.marketingEmails,
        unsubscribedAt: updated.unsubscribedAt,
      },
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to update email preferences' },
      { status: 500 }
    );
  }
}
