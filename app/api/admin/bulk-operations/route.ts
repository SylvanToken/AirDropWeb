import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  executeBulkOperation,
  bulkUpdateStatus,
  bulkDeleteUsers,
  bulkAssignPoints,
  BulkOperation,
} from '@/lib/admin/bulk-operations';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { operation, userIds, data } = body;

    // Validate input
    if (!operation || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'Invalid request. Operation and userIds array are required.' },
        { status: 400 }
      );
    }

    // Get IP address and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    let result;

    // Execute the appropriate bulk operation
    switch (operation) {
      case 'update_status':
        if (!data?.status) {
          return NextResponse.json(
            { error: 'Status is required for update_status operation' },
            { status: 400 }
          );
        }
        result = await bulkUpdateStatus(
          userIds,
          data.status,
          session.user.id,
          session.user.email || '',
          ipAddress,
          userAgent
        );
        break;

      case 'delete':
        result = await bulkDeleteUsers(
          userIds,
          session.user.id,
          session.user.email || '',
          ipAddress,
          userAgent
        );
        break;

      case 'assign_points':
        if (typeof data?.points !== 'number') {
          return NextResponse.json(
            { error: 'Points value is required for assign_points operation' },
            { status: 400 }
          );
        }
        result = await bulkAssignPoints(
          userIds,
          data.points,
          session.user.id,
          session.user.email || '',
          ipAddress,
          userAgent
        );
        break;

      default:
        return NextResponse.json(
          { error: `Invalid operation type: ${operation}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
      message: `Bulk operation completed. ${result.success} successful, ${result.failed} failed.`,
    });
  } catch (error: any) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
