import { prisma } from '@/lib/prisma';
import { logAuditEvent } from './audit';

export interface BulkOperation {
  type: 'update_status' | 'delete' | 'export' | 'assign_points';
  userIds: string[];
  data?: Record<string, any>;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
  details?: {
    successfulIds: string[];
    failedIds: string[];
  };
}

/**
 * Execute a bulk operation on multiple users
 * Supports: status updates, deletion, point assignment
 * Includes comprehensive error handling and audit logging
 */
export async function executeBulkOperation(
  operation: BulkOperation,
  adminId: string,
  adminEmail: string,
  ipAddress?: string,
  userAgent?: string
): Promise<BulkOperationResult> {
  const results: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
    details: {
      successfulIds: [],
      failedIds: [],
    },
  };

  // Validate operation
  if (!operation.userIds || operation.userIds.length === 0) {
    throw new Error('No user IDs provided for bulk operation');
  }

  // Validate operation type
  const validTypes = ['update_status', 'delete', 'assign_points'];
  if (!validTypes.includes(operation.type)) {
    throw new Error(`Invalid operation type: ${operation.type}`);
  }

  // Process each user
  for (const userId of operation.userIds) {
    try {
      // Fetch user before operation for audit trail
      const userBefore = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          status: true,
          totalPoints: true,
          role: true,
        },
      });

      if (!userBefore) {
        results.failed++;
        results.errors.push(`User ${userId}: User not found`);
        results.details?.failedIds.push(userId);
        continue;
      }

      let userAfter: any = null;

      switch (operation.type) {
        case 'update_status':
          if (!operation.data?.status) {
            throw new Error('Status value is required');
          }
          
          // Validate status value
          const validStatuses = ['ACTIVE', 'BLOCKED', 'DELETED'];
          if (!validStatuses.includes(operation.data.status)) {
            throw new Error(`Invalid status: ${operation.data.status}`);
          }

          userAfter = await prisma.user.update({
            where: { id: userId },
            data: { status: operation.data.status },
            select: {
              id: true,
              email: true,
              username: true,
              status: true,
              totalPoints: true,
              role: true,
            },
          });

          // Log individual status change
          await logAuditEvent({
            action: 'user_status_updated',
            adminId,
            adminEmail,
            affectedModel: 'User',
            affectedId: userId,
            beforeData: { status: userBefore.status },
            afterData: { status: userAfter.status },
            ipAddress,
            userAgent,
          });
          break;

        case 'delete':
          // Delete user (cascade will handle related records)
          await prisma.user.delete({ where: { id: userId } });

          // Log individual deletion
          await logAuditEvent({
            action: 'user_deleted',
            adminId,
            adminEmail,
            affectedModel: 'User',
            affectedId: userId,
            beforeData: userBefore,
            ipAddress,
            userAgent,
          });
          break;

        case 'assign_points':
          if (typeof operation.data?.points !== 'number') {
            throw new Error('Points value is required and must be a number');
          }

          userAfter = await prisma.user.update({
            where: { id: userId },
            data: {
              totalPoints: {
                increment: operation.data.points,
              },
            },
            select: {
              id: true,
              email: true,
              username: true,
              status: true,
              totalPoints: true,
              role: true,
            },
          });

          // Log individual point assignment
          await logAuditEvent({
            action: 'points_assigned',
            adminId,
            adminEmail,
            affectedModel: 'User',
            affectedId: userId,
            beforeData: { totalPoints: userBefore.totalPoints },
            afterData: { totalPoints: userAfter.totalPoints },
            ipAddress,
            userAgent,
          });
          break;
      }

      results.success++;
      results.details?.successfulIds.push(userId);
    } catch (error: any) {
      results.failed++;
      const errorMessage = error.message || 'Unknown error';
      results.errors.push(`User ${userId}: ${errorMessage}`);
      results.details?.failedIds.push(userId);

      // Log failed operation
      await logAuditEvent({
        action: `bulk_${operation.type}_failed`,
        adminId,
        adminEmail,
        affectedModel: 'User',
        affectedId: userId,
        afterData: { error: errorMessage },
        ipAddress,
        userAgent,
      });
    }
  }

  // Log bulk operation summary
  await logAuditEvent({
    action: `bulk_${operation.type}`,
    adminId,
    adminEmail,
    affectedModel: 'User',
    beforeData: {
      totalUsers: operation.userIds.length,
      operationType: operation.type,
      operationData: operation.data,
    },
    afterData: {
      successful: results.success,
      failed: results.failed,
      successfulIds: results.details?.successfulIds,
      failedIds: results.details?.failedIds,
    },
    ipAddress,
    userAgent,
  });

  return results;
}

/**
 * Bulk update user status
 * Convenience function for status updates
 */
export async function bulkUpdateStatus(
  userIds: string[],
  status: 'ACTIVE' | 'BLOCKED' | 'DELETED',
  adminId: string,
  adminEmail: string,
  ipAddress?: string,
  userAgent?: string
): Promise<BulkOperationResult> {
  return executeBulkOperation(
    {
      type: 'update_status',
      userIds,
      data: { status },
    },
    adminId,
    adminEmail,
    ipAddress,
    userAgent
  );
}

/**
 * Bulk delete users
 * Convenience function for user deletion
 */
export async function bulkDeleteUsers(
  userIds: string[],
  adminId: string,
  adminEmail: string,
  ipAddress?: string,
  userAgent?: string
): Promise<BulkOperationResult> {
  return executeBulkOperation(
    {
      type: 'delete',
      userIds,
    },
    adminId,
    adminEmail,
    ipAddress,
    userAgent
  );
}

/**
 * Bulk assign points to users
 * Convenience function for point assignment
 */
export async function bulkAssignPoints(
  userIds: string[],
  points: number,
  adminId: string,
  adminEmail: string,
  ipAddress?: string,
  userAgent?: string
): Promise<BulkOperationResult> {
  return executeBulkOperation(
    {
      type: 'assign_points',
      userIds,
      data: { points },
    },
    adminId,
    adminEmail,
    ipAddress,
    userAgent
  );
}
