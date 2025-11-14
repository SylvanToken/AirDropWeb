import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { detectSuspiciousActivity } from '@/lib/admin/activity';

/**
 * GET /api/admin/users/[id]/activity/suspicious
 * Detect suspicious activity patterns
 * Requirements: 5.5
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

    const suspicious = await detectSuspiciousActivity(params.id);

    return NextResponse.json({
      suspicious,
      count: suspicious.length,
    });
  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
    return NextResponse.json(
      { error: 'Failed to detect suspicious activity' },
      { status: 500 }
    );
  }
}
