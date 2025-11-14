import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/admin/audit';

/**
 * POST /api/admin/reset-database
 * Reset database for testing (Admin only)
 * WARNING: This will delete all data except admin users!
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete data in correct order (respecting foreign key constraints)
    await prisma.$transaction([
      // Delete completions first (has foreign keys to users and tasks)
      prisma.completion.deleteMany({}),
      
      // Delete tasks
      prisma.task.deleteMany({}),
      
      // Delete campaigns
      prisma.campaign.deleteMany({}),
      
      // Delete non-admin users
      prisma.user.deleteMany({
        where: {
          role: 'USER',
        },
      }),
      
      // Reset admin user points
      prisma.user.updateMany({
        where: {
          role: 'ADMIN',
        },
        data: {
          totalPoints: 0,
          walletAddress: null,
          walletVerified: false,
          twitterUsername: null,
          twitterVerified: false,
          telegramUsername: null,
          telegramVerified: false,
        },
      }),
    ]);

    // Log audit event (security-sensitive)
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logAuditEvent({
      action: 'database_reset',
      adminId: session.user.id,
      adminEmail: session.user.email || 'unknown',
      affectedModel: 'Database',
      ipAddress,
      userAgent,
      afterData: {
        warning: 'All user data, tasks, campaigns, and completions deleted',
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Database reset successfully. All user data, tasks, and completions have been deleted.',
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json(
      { error: 'Failed to reset database' },
      { status: 500 }
    );
  }
}
