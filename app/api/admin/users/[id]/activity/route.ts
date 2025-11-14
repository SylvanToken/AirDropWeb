import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserActivityTimeline } from '@/lib/admin/activity';
import type { ActivityType } from '@/lib/admin/activity';

/**
 * GET /api/admin/users/[id]/activity
 * Fetch user activity timeline
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export async function GET(
  req: NextRequest,
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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type') as ActivityType | null;

    const activities = await getUserActivityTimeline(params.id, {
      limit,
      offset,
      type: type || undefined,
    });

    return NextResponse.json({
      activities,
      count: activities.length,
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user activity' },
      { status: 500 }
    );
  }
}
