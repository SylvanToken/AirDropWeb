import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse, handleApiError } from '@/lib/utils';
import {
  getDurationChangeLogs,
  getTaskDurationHistory,
  getDurationChangeStats,
  getRecentDurationChanges,
} from '@/lib/admin/duration-audit';

/**
 * GET /api/admin/audit/duration-changes
 * Retrieve duration change audit logs with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return createErrorResponse('Forbidden', 'Admin access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const adminId = searchParams.get('adminId');
    const changeType = searchParams.get('changeType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const view = searchParams.get('view'); // 'logs', 'stats', 'recent', 'history'

    // Handle different views
    if (view === 'stats') {
      const dateRange =
        startDate && endDate
          ? { start: new Date(startDate), end: new Date(endDate) }
          : undefined;
      const stats = await getDurationChangeStats(dateRange);
      return NextResponse.json({ data: stats }, { status: 200 });
    }

    if (view === 'recent') {
      const hours = searchParams.get('hours');
      const logs = await getRecentDurationChanges(
        hours ? parseInt(hours) : 24
      );
      return NextResponse.json({ data: logs, total: logs.length }, { status: 200 });
    }

    if (view === 'history' && taskId) {
      const logs = await getTaskDurationHistory(taskId);
      return NextResponse.json({ data: logs, total: logs.length }, { status: 200 });
    }

    // Default: Get filtered logs
    const filters: any = {};

    if (taskId) filters.taskId = taskId;
    if (adminId) filters.adminId = adminId;
    if (changeType) filters.changeType = changeType;
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);

    if (startDate && endDate) {
      filters.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    const { logs, total } = await getDurationChangeLogs(filters);

    return NextResponse.json(
      {
        data: logs,
        total,
        filters,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
