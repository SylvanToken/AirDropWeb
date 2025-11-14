import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/email-analytics
 * 
 * Fetch email analytics data including:
 * - Total emails sent
 * - Delivery rate, open rate, click rate
 * - Bounce rate by type
 * - Email performance by template
 * - Date range filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter = startDate || endDate ? {
      sentAt: {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      },
    } : {};

    // Get overall statistics
    const [
      totalSent,
      totalDelivered,
      totalFailed,
      totalBounced,
      totalOpened,
      totalClicked,
    ] = await Promise.all([
      prisma.emailLog.count({
        where: { 
          ...dateFilter,
          status: { in: ['sent', 'delivered', 'opened', 'clicked'] },
        },
      }),
      prisma.emailLog.count({
        where: { ...dateFilter, status: 'delivered' },
      }),
      prisma.emailLog.count({
        where: { ...dateFilter, status: 'failed' },
      }),
      prisma.emailLog.count({
        where: { ...dateFilter, status: 'bounced' },
      }),
      prisma.emailLog.count({
        where: { ...dateFilter, openedAt: { not: null } },
      }),
      prisma.emailLog.count({
        where: { ...dateFilter, clickedAt: { not: null } },
      }),
    ]);

    // Calculate rates
    const deliveryRate = totalSent > 0 
      ? ((totalDelivered / totalSent) * 100) 
      : 0;
    
    const openRate = totalDelivered > 0 
      ? ((totalOpened / totalDelivered) * 100) 
      : 0;
    
    const clickRate = totalOpened > 0 
      ? ((totalClicked / totalOpened) * 100) 
      : 0;
    
    const bounceRate = totalSent > 0 
      ? ((totalBounced / totalSent) * 100) 
      : 0;
    
    const failureRate = totalSent > 0 
      ? ((totalFailed / totalSent) * 100) 
      : 0;

    // Get template statistics
    const templates = await prisma.emailLog.findMany({
      where: dateFilter,
      select: { template: true },
      distinct: ['template'],
    });

    const templateStats = await Promise.all(
      templates.map(async ({ template }) => {
        const [
          sent,
          delivered,
          failed,
          bounced,
          opened,
          clicked,
        ] = await Promise.all([
          prisma.emailLog.count({
            where: { 
              ...dateFilter, 
              template,
              status: { in: ['sent', 'delivered', 'opened', 'clicked'] },
            },
          }),
          prisma.emailLog.count({
            where: { ...dateFilter, template, status: 'delivered' },
          }),
          prisma.emailLog.count({
            where: { ...dateFilter, template, status: 'failed' },
          }),
          prisma.emailLog.count({
            where: { ...dateFilter, template, status: 'bounced' },
          }),
          prisma.emailLog.count({
            where: { ...dateFilter, template, openedAt: { not: null } },
          }),
          prisma.emailLog.count({
            where: { ...dateFilter, template, clickedAt: { not: null } },
          }),
        ]);

        const templateDeliveryRate = sent > 0 ? ((delivered / sent) * 100) : 0;
        const templateOpenRate = delivered > 0 ? ((opened / delivered) * 100) : 0;
        const templateClickRate = opened > 0 ? ((clicked / opened) * 100) : 0;

        return {
          template,
          sent,
          delivered,
          failed,
          bounced,
          opened,
          clicked,
          deliveryRate: templateDeliveryRate,
          openRate: templateOpenRate,
          clickRate: templateClickRate,
        };
      })
    );

    // Get bounce breakdown
    const hardBounces = await prisma.emailLog.count({
      where: {
        ...dateFilter,
        status: 'bounced',
        error: { contains: 'hard' },
      },
    });

    const softBounces = await prisma.emailLog.count({
      where: {
        ...dateFilter,
        status: 'bounced',
        error: { contains: 'soft' },
      },
    });

    const spamBounces = await prisma.emailLog.count({
      where: {
        ...dateFilter,
        status: 'bounced',
        error: { contains: 'spam' },
      },
    });

    const otherBounces = totalBounced - hardBounces - softBounces - spamBounces;

    // Get recent failed emails
    const recentFailures = await prisma.emailLog.findMany({
      where: {
        ...dateFilter,
        status: 'failed',
      },
      orderBy: { sentAt: 'desc' },
      take: 10,
      select: {
        id: true,
        to: true,
        subject: true,
        template: true,
        error: true,
        sentAt: true,
      },
    });

    return NextResponse.json({
      overview: {
        totalSent,
        totalDelivered,
        totalFailed,
        totalBounced,
        totalOpened,
        totalClicked,
        deliveryRate,
        openRate,
        clickRate,
        bounceRate,
        failureRate,
      },
      templateStats,
      bounceBreakdown: {
        hard: hardBounces,
        soft: softBounces,
        spam: spamBounces,
        other: otherBounces,
      },
      recentFailures,
    });
  } catch (error) {
    console.error('Failed to fetch email analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email analytics' },
      { status: 500 }
    );
  }
}
