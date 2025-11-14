import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/twitter/connections
 * 
 * Get all Twitter connections (admin only)
 * Requirements: 11.1, 11.4
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get all Twitter connections with user info
    const connections = await prisma.twitterConnection.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        connectedAt: 'desc',
      },
    });

    const formattedConnections = connections.map(conn => ({
      id: conn.id,
      userId: conn.userId,
      username: conn.user.username || conn.user.email,
      twitterUsername: conn.username, // Twitter username from TwitterConnection model
      twitterId: conn.twitterId,
      tokenExpired: conn.tokenExpiresAt ? new Date(conn.tokenExpiresAt) < new Date() : false,
      connectedAt: conn.connectedAt.toISOString(),
      lastUsedAt: conn.lastVerifiedAt?.toISOString() || null, // Changed from lastUsedAt to lastVerifiedAt
    }));

    return NextResponse.json({
      connections: formattedConnections,
      total: formattedConnections.length,
    });
  } catch (error) {
    console.error('[Admin Twitter Connections] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
