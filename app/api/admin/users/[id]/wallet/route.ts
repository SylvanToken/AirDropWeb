import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, handleApiError } from '@/lib/utils';
import { logAuditEventFromRequest } from '@/lib/admin/audit';
import { queueWalletApprovedEmail, queueWalletRejectedEmail } from '@/lib/email/queue';

/**
 * PUT /api/admin/users/[id]/wallet
 * Approve or reject user's wallet address
 */
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
      return createErrorResponse('Bad Request', 'Invalid action. Must be "approve" or "reject"', 400);
    }

    if (action === 'reject' && !reason) {
      return createErrorResponse('Bad Request', 'Rejection reason is required', 400);
    }

    // Get user with wallet info
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        username: true,
        walletAddress: true,
        walletVerified: true,
      },
    });

    if (!user) {
      return createErrorResponse('Not Found', 'User not found', 404);
    }

    if (!user.walletAddress) {
      return createErrorResponse('Bad Request', 'User has no wallet address to verify', 400);
    }

    if (user.walletVerified && action === 'approve') {
      return createErrorResponse('Bad Request', 'Wallet is already verified', 400);
    }

    // Process approval or rejection
    if (action === 'approve') {
      // Approve wallet
      const updatedUser = await prisma.user.update({
        where: { id: params.id },
        data: {
          walletVerified: true,
        },
        select: {
          id: true,
          email: true,
          username: true,
          walletAddress: true,
          walletVerified: true,
        },
      });

      // Queue wallet approved email
      // Use default locale 'en' since we don't store user locale preference
      try {
        await queueWalletApprovedEmail(
          updatedUser.id,
          updatedUser.email,
          updatedUser.username,
          updatedUser.walletAddress!,
          'en'
        );
      } catch (emailError) {
        console.error('Failed to queue wallet approved email:', emailError);
        // Don't fail the request if email queueing fails
      }

      // Log audit event
      await logAuditEventFromRequest(request, {
        action: 'wallet_approved',
        affectedModel: 'User',
        affectedId: params.id,
        beforeData: {
          walletVerified: false,
        },
        afterData: {
          walletVerified: true,
          walletAddress: updatedUser.walletAddress,
        },
      });

      return NextResponse.json({
        message: 'Wallet approved successfully',
        user: updatedUser,
      });
    } else {
      // Reject wallet - reset wallet address and verification status
      const updatedUser = await prisma.user.update({
        where: { id: params.id },
        data: {
          walletAddress: null,
          walletVerified: false,
        },
        select: {
          id: true,
          email: true,
          username: true,
          walletAddress: true,
          walletVerified: true,
        },
      });

      // Queue wallet rejected email
      // Use default locale 'en' since we don't store user locale preference
      try {
        await queueWalletRejectedEmail(
          updatedUser.id,
          updatedUser.email,
          updatedUser.username,
          user.walletAddress!, // Use the old wallet address
          reason || 'Wallet address verification failed',
          'en'
        );
      } catch (emailError) {
        console.error('Failed to queue wallet rejected email:', emailError);
        // Don't fail the request if email queueing fails
      }

      // Log audit event
      await logAuditEventFromRequest(request, {
        action: 'wallet_rejected',
        affectedModel: 'User',
        affectedId: params.id,
        beforeData: {
          walletAddress: user.walletAddress,
          walletVerified: false,
        },
        afterData: {
          walletAddress: null,
          walletVerified: false,
          rejectionReason: reason,
        },
      });

      return NextResponse.json({
        message: 'Wallet rejected successfully',
        user: updatedUser,
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
