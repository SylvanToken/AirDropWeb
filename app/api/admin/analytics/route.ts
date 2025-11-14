import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calculatePlatformMetrics } from '@/lib/admin/analytics';
import { createErrorResponse, handleApiError } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        'Forbidden',
        'Admin access required',
        403
      );
    }

    // Parse query parameters for date range
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    let dateRange: { start: Date; end: Date } | undefined;
    
    if (startParam && endParam) {
      dateRange = {
        start: new Date(startParam),
        end: new Date(endParam),
      };
    }

    const metrics = await calculatePlatformMetrics(dateRange);

    return NextResponse.json(metrics);
  } catch (error) {
    return handleApiError(error);
  }
}
