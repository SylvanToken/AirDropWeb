import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, executeTransaction } from '@/lib/prisma';
import { createErrorResponse, handleApiError } from '@/lib/utils';
import { logAuditEventFromRequest } from '@/lib/admin/audit';

// PUT /api/admin/verifications/[id] - Approve or reject completion
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return createErrorResponse('Forbidden', 'Admin access required', 403);
    }

    const body = await request.json();
    const { action, reason } = body; // action: 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return createErrorResponse('Bad Request', 'Invalid action', 400);
    }

    const completion = await prisma.completion.findUnique({
      where: { id: params.id },
      include: {
        task: true,
        user: true,
      },
    });

    if (!completion) {
      return createErrorResponse('Not Found', 'Completion not found', 404);
    }

    if (completion.status !== 'PENDING') {
      return createErrorResponse(
        'Bad Request',
        'This completion has already been processed',
        400
      );
    }

    // Process approval or rejection
    const result = await executeTransaction(async (tx) => {
      if (action === 'approve') {
        // Approve completion and award points
        const updatedCompletion = await tx.completion.update({
          where: { id: params.id },
          data: {
            status: 'APPROVED',
            verificationStatus: 'VERIFIED',
            reviewedBy: session.user.id,
            reviewedAt: new Date(),
          },
        });

        // Award points to user
        const updatedUser = await tx.user.update({
          where: { id: completion.userId },
          data: {
            totalPoints: {
              increment: completion.pointsAwarded,
            },
          },
        });

        return { completion: updatedCompletion, user: updatedUser };
      } else {
        // Reject completion
        const updatedCompletion = await tx.completion.update({
          where: { id: params.id },
          data: {
            status: 'REJECTED',
            verificationStatus: 'FLAGGED',
            reviewedBy: session.user.id,
            reviewedAt: new Date(),
            rejectionReason: reason || 'Task not completed properly',
          },
        });

        return { completion: updatedCompletion, user: completion.user };
      }
    });

    // Log audit event
    await logAuditEventFromRequest(request, {
      action: action === 'approve' ? 'completion_approved' : 'completion_rejected',
      affectedModel: 'Completion',
      affectedId: params.id,
      beforeData: {
        status: completion.status,
        verificationStatus: completion.verificationStatus,
      },
      afterData: {
        status: result.completion.status,
        verificationStatus: result.completion.verificationStatus,
        reason: action === 'reject' ? reason : undefined,
        userId: completion.userId,
        taskId: completion.taskId,
        pointsAwarded: completion.pointsAwarded,
      },
    });

    return NextResponse.json({
      message: action === 'approve' ? 'Completion approved' : 'Completion rejected',
      data: result.completion,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
