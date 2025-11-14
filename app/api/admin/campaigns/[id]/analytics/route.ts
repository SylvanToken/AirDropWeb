import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  calculateCampaignAnalytics,
  generatePerformanceReport,
} from '@/lib/admin/campaign-analytics';
import { logAuditEvent } from '@/lib/admin/audit';

/**
 * GET /api/admin/campaigns/[id]/analytics
 * Get comprehensive analytics for a campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeReport = searchParams.get('includeReport') === 'true';

    const analytics = await calculateCampaignAnalytics(params.id);

    // Log audit event
    await logAuditEvent({
      action: 'view_campaign_analytics',
      adminId: session.user.id,
      adminEmail: session.user.email || '',
      affectedModel: 'Campaign',
      affectedId: params.id,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Error fetching campaign analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaign analytics' },
      { status: 500 }
    );
  }
}
