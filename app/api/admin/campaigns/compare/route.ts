import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { compareCampaigns } from '@/lib/admin/campaign-analytics';
import { logAuditEvent } from '@/lib/admin/audit';

/**
 * POST /api/admin/campaigns/compare
 * Compare multiple campaigns
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { campaignIds } = body;

    if (!Array.isArray(campaignIds) || campaignIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 campaign IDs are required for comparison' },
        { status: 400 }
      );
    }

    const comparison = await compareCampaigns(campaignIds);

    // Log audit event
    await logAuditEvent({
      action: 'compare_campaigns',
      adminId: session.user.id,
      adminEmail: session.user.email || '',
      affectedModel: 'Campaign',
      afterData: { campaignIds },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json(comparison);
  } catch (error: any) {
    console.error('Error comparing campaigns:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to compare campaigns' },
      { status: 500 }
    );
  }
}
