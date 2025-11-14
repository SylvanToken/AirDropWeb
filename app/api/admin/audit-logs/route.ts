import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAuditLogs, getSecurityEvents, getAuditStats } from '@/lib/admin/audit';

/**
 * GET /api/admin/audit-logs - Get audit logs with filtering
 * Query params:
 * - adminId: Filter by admin user ID
 * - action: Filter by action type
 * - affectedModel: Filter by affected model
 * - startDate: Start of date range (ISO string)
 * - endDate: End of date range (ISO string)
 * - search: Search term
 * - limit: Number of records to return (default 100)
 * - offset: Number of records to skip (default 0)
 * - type: 'all' | 'security' | 'stats' (default 'all')
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    // Handle stats request
    if (type === 'stats') {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      const dateRange =
        startDate && endDate
          ? {
              start: new Date(startDate),
              end: new Date(endDate),
            }
          : undefined;

      const stats = await getAuditStats(dateRange);
      return NextResponse.json(stats);
    }

    // Build filters
    const filters: any = {
      adminId: searchParams.get('adminId') || undefined,
      action: searchParams.get('action') || undefined,
      affectedModel: searchParams.get('affectedModel') || undefined,
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '100'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      filters.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    // Get logs based on type
    const result =
      type === 'security'
        ? await getSecurityEvents(filters)
        : await getAuditLogs(filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
