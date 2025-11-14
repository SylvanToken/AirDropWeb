import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, handleApiError } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        'Unauthorized',
        'Admin access required',
        403
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'PENDING';
    const needsReview = searchParams.get('needsReview') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status !== 'ALL') {
      where.status = status;
    }

    if (needsReview) {
      where.needsReview = true;
    }

    // Fetch completions with user and task data
    const [completions, total] = await Promise.all([
      prisma.completion.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              createdAt: true,
              walletVerified: true,
              twitterVerified: true,
              telegramVerified: true,
              totalPoints: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              description: true,
              points: true,
              taskType: true,
              taskUrl: true,
            },
          },
        },
        orderBy: {
          completedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.completion.count({ where }),
    ]);

    // Calculate fraud risk level for each completion
    const completionsWithRisk = completions.map((completion) => {
      let fraudRisk = {
        level: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        color: 'green',
        description: 'Low risk',
      };

      if (completion.fraudScore >= 80) {
        fraudRisk = {
          level: 'CRITICAL',
          color: 'red',
          description: 'Critical risk - immediate review required',
        };
      } else if (completion.fraudScore >= 60) {
        fraudRisk = {
          level: 'HIGH',
          color: 'orange',
          description: 'High risk - manual review recommended',
        };
      } else if (completion.fraudScore >= 40) {
        fraudRisk = {
          level: 'MEDIUM',
          color: 'yellow',
          description: 'Medium risk - monitor closely',
        };
      }

      return {
        ...completion,
        fraudRisk,
      };
    });

    return NextResponse.json({
      completions: completionsWithRisk,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        'Unauthorized',
        'Admin access required',
        403
      );
    }

    const body = await request.json();
    const { completionId, action, reason } = body;

    if (!completionId || !action) {
      return createErrorResponse(
        'Bad Request',
        'completionId and action are required',
        400
      );
    }

    // Get completion
    const completion = await prisma.completion.findUnique({
      where: { id: completionId },
      include: {
        task: true,
        user: true,
      },
    });

    if (!completion) {
      return createErrorResponse(
        'Not Found',
        'Completion not found',
        404
      );
    }

    // Handle action
    if (action === 'approve') {
      // Approve completion and award points
      await prisma.$transaction(async (tx) => {
        // Update completion
        await tx.completion.update({
          where: { id: completionId },
          data: {
            status: 'APPROVED',
            verificationStatus: 'VERIFIED',
            needsReview: false,
          },
        });

        // Award points if not already awarded
        if (completion.status === 'PENDING') {
          await tx.user.update({
            where: { id: completion.userId },
            data: {
              totalPoints: {
                increment: completion.task.points,
              },
            },
          });
        }
      });

      return NextResponse.json({
        message: 'Completion approved successfully',
        pointsAwarded: completion.task.points,
      });
    } else if (action === 'reject') {
      // Reject completion
      await prisma.completion.update({
        where: { id: completionId },
        data: {
          status: 'REJECTED',
          verificationStatus: 'REJECTED',
          needsReview: false,
          rejectionReason: reason || 'Rejected by admin',
        },
      });

      return NextResponse.json({
        message: 'Completion rejected successfully',
      });
    } else {
      return createErrorResponse(
        'Bad Request',
        'Invalid action. Must be "approve" or "reject"',
        400
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}
