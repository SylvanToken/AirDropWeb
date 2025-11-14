import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePerformanceReport } from '@/lib/admin/campaign-analytics';
import { logAuditEvent } from '@/lib/admin/audit';

/**
 * GET /api/admin/campaigns/[id]/report
 * Generate automatic performance report for a campaign
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

    const report = await generatePerformanceReport(params.id);

    // Log audit event
    await logAuditEvent({
      action: 'generate_campaign_report',
      adminId: session.user.id,
      adminEmail: session.user.email || '',
      affectedModel: 'Campaign',
      affectedId: params.id,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Error generating campaign report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate campaign report' },
      { status: 500 }
    );
  }
}
