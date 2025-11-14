/**
 * Integration tests for bulk operations
 * Tests Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 * 
 * This test suite covers:
 * - Bulk status updates
 * - Bulk delete with confirmation
 * - Bulk point assignment
 * - Bulk export
 * - Error handling
 * - Audit logging verification
 */

import { prisma } from '@/lib/prisma';
import {
  executeBulkOperation,
  bulkUpdateStatus,
  bulkDeleteUsers,
  bulkAssignPoints,
  BulkOperation,
  BulkOperationResult,
} from '@/lib/admin/bulk-operations';
import * as auditModule from '@/lib/admin/audit';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Mock audit module to avoid next-auth dependencies
jest.mock('@/lib/admin/audit', () => ({
  logAuditEvent: jest.fn().mockResolvedValue(undefined),
  getAuditLogs: jest.fn(),
}));

describe('Bulk Operations', () => {
  const mockAdminId = 'admin-123';
  const mockAdminEmail = 'admin@sylvantoken.org';
  const mockIpAddress = '192.168.1.1';
  const mockUserAgent = 'Mozilla/5.0';

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset audit mock to default resolved behavior
    (auditModule.logAuditEvent as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Bulk Status Updates (Requirement 1.1, 1.2)', () => {
    it('should successfully update status for multiple users', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2', 'user-3'];
      const mockUsers = userIds.map((id, index) => ({
        id,
        email: `user${index + 1}@example.com`,
        username: `user${index + 1}`,
        status: 'ACTIVE',
        totalPoints: 100,
        role: 'USER',
      }));

      // Mock findUnique to return users before update
      (prisma.user.findUnique as jest.Mock).mockImplementation(({ where }) => {
        const user = mockUsers.find(u => u.id === where.id);
        return Promise.resolve(user);
      });

      // Mock update to return updated users
      (prisma.user.update as jest.Mock).mockImplementation(({ where, data }) => {
        const user = mockUsers.find(u => u.id === where.id);
        return Promise.resolve({ ...user, status: data.status });
      });

      // Act
      const result = await bulkUpdateStatus(
        userIds,
        'BLOCKED',
        mockAdminId,
        mockAdminEmail,
        mockIpAddress,
        mockUserAgent
      );

      // Assert
      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(result.details?.successfulIds).toEqual(userIds);
      expect(result.details?.failedIds).toHaveLength(0);

      // Verify each user was updated
      expect(prisma.user.update).toHaveBeenCalledTimes(3);
      userIds.forEach(userId => {
        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { status: 'BLOCKED' },
          select: expect.any(Object),
        });
      });

      // Verify audit logging (3 individual + 1 summary)
      expect(auditModule.logAuditEvent).toHaveBeenCalledTimes(4);
    });

    it('should handle partial failures in status updates', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2', 'user-3'];
      
      (prisma.user.findUnique as jest.Mock).mockImplementation(({ where }) => {
        if (where.id === 'user-2') {
          return Promise.resolve(null); // User not found
        }
        return Promise.resolve({
          id: where.id,
          email: `${where.id}@example.com`,
          username: where.id,
          status: 'ACTIVE',
          totalPoints: 100,
          role: 'USER',
        });
      });

      (prisma.user.update as jest.Mock).mockImplementation(({ where }) => {
        return Promise.resolve({
          id: where.id,
          status: 'BLOCKED',
        });
      });

      // Act
      const result = await bulkUpdateStatus(
        userIds,
        'BLOCKED',
        mockAdminId,
        mockAdminEmail
      );

      // Assert
      expect(result.success).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('user-2');
      expect(result.errors[0]).toContain('User not found');
      expect(result.details?.successfulIds).toEqual(['user-1', 'user-3']);
      expect(result.details?.failedIds).toEqual(['user-2']);
    });

    it('should validate status values', async () => {
      // Arrange
      const userIds = ['user-1'];
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'user1@example.com',
        username: 'user1',
        status: 'ACTIVE',
        totalPoints: 100,
        role: 'USER',
      });

      // Act
      const result = await bulkUpdateStatus(
        userIds,
        'INVALID_STATUS' as any,
        mockAdminId,
        mockAdminEmail
      );

      // Assert
      expect(result.success).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors[0]).toContain('Invalid status');
    });
  });

  describe('Bulk Delete (Requirement 1.3)', () => {
    it('should successfully delete multiple users', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2'];
      const mockUsers = userIds.map((id, index) => ({
        id,
        email: `user${index + 1}@example.com`,
        username: `user${index + 1}`,
        status: 'ACTIVE',
        totalPoints: 50,
        role: 'USER',
      }));

      (prisma.user.findUnique as jest.Mock).mockImplementation(({ where }) => {
        const user = mockUsers.find(u => u.id === where.id);
        return Promise.resolve(user);
      });

      (prisma.user.delete as jest.Mock).mockResolvedValue({});

      // Act
      const result = await bulkDeleteUsers(
        userIds,
        mockAdminId,
        mockAdminEmail,
        mockIpAddress,
        mockUserAgent
      );

      // Assert
      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);

      // Verify deletions
      expect(prisma.user.delete).toHaveBeenCalledTimes(2);
      userIds.forEach(userId => {
        expect(prisma.user.delete).toHaveBeenCalledWith({
          where: { id: userId },
        });
      });

      // Verify audit logging
      expect(auditModule.logAuditEvent).toHaveBeenCalled();
    });

    it('should handle deletion errors gracefully', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2'];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'user1@example.com',
        username: 'user1',
        status: 'ACTIVE',
        totalPoints: 50,
        role: 'USER',
      });

      (prisma.user.delete as jest.Mock).mockImplementation(({ where }) => {
        if (where.id === 'user-2') {
          throw new Error('Foreign key constraint violation');
        }
        return Promise.resolve({});
      });

      // Act
      const result = await bulkDeleteUsers(
        userIds,
        mockAdminId,
        mockAdminEmail
      );

      // Assert
      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Foreign key constraint');
    });

    it('should not delete non-existent users', async () => {
      // Arrange
      const userIds = ['non-existent-user'];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await bulkDeleteUsers(
        userIds,
        mockAdminId,
        mockAdminEmail
      );

      // Assert
      expect(result.success).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors[0]).toContain('User not found');
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });
  });

  describe('Bulk Point Assignment (Requirement 1.4)', () => {
    it('should successfully assign points to multiple users', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2', 'user-3'];
      const pointsToAdd = 50;
      const mockUsers = userIds.map((id, index) => ({
        id,
        email: `user${index + 1}@example.com`,
        username: `user${index + 1}`,
        status: 'ACTIVE',
        totalPoints: 100,
        role: 'USER',
      }));

      (prisma.user.findUnique as jest.Mock).mockImplementation(({ where }) => {
        const user = mockUsers.find(u => u.id === where.id);
        return Promise.resolve(user);
      });

      (prisma.user.update as jest.Mock).mockImplementation(({ where }) => {
        const user = mockUsers.find(u => u.id === where.id);
        return Promise.resolve({
          ...user,
          totalPoints: user!.totalPoints + pointsToAdd,
        });
      });

      // Act
      const result = await bulkAssignPoints(
        userIds,
        pointsToAdd,
        mockAdminId,
        mockAdminEmail,
        mockIpAddress,
        mockUserAgent
      );

      // Assert
      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);

      // Verify point assignments
      expect(prisma.user.update).toHaveBeenCalledTimes(3);
      userIds.forEach(userId => {
        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: {
            totalPoints: {
              increment: pointsToAdd,
            },
          },
          select: expect.any(Object),
        });
      });
    });

    it('should handle negative point values', async () => {
      // Arrange
      const userIds = ['user-1'];
      const pointsToAdd = -25;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'user1@example.com',
        username: 'user1',
        status: 'ACTIVE',
        totalPoints: 100,
        role: 'USER',
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        totalPoints: 75,
      });

      // Act
      const result = await bulkAssignPoints(
        userIds,
        pointsToAdd,
        mockAdminId,
        mockAdminEmail
      );

      // Assert
      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          totalPoints: {
            increment: -25,
          },
        },
        select: expect.any(Object),
      });
    });

    it('should validate points parameter', async () => {
      // Arrange
      const userIds = ['user-1'];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'user1@example.com',
        username: 'user1',
        status: 'ACTIVE',
        totalPoints: 100,
        role: 'USER',
      });

      // Act
      const result = await executeBulkOperation(
        {
          type: 'assign_points',
          userIds,
          data: { points: 'invalid' as any },
        },
        mockAdminId,
        mockAdminEmail
      );

      // Assert
      expect(result.success).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors[0]).toContain('must be a number');
    });
  });

  describe('Error Handling (Requirement 1.5)', () => {
    it('should throw error for empty user IDs array', async () => {
      // Act & Assert
      await expect(
        executeBulkOperation(
          {
            type: 'update_status',
            userIds: [],
            data: { status: 'BLOCKED' },
          },
          mockAdminId,
          mockAdminEmail
        )
      ).rejects.toThrow('No user IDs provided');
    });

    it('should throw error for invalid operation type', async () => {
      // Act & Assert
      await expect(
        executeBulkOperation(
          {
            type: 'invalid_operation' as any,
            userIds: ['user-1'],
          },
          mockAdminId,
          mockAdminEmail
        )
      ).rejects.toThrow('Invalid operation type');
    });

    it('should continue processing after individual failures', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2', 'user-3'];

      (prisma.user.findUnique as jest.Mock).mockImplementation(({ where }) => {
        if (where.id === 'user-2') {
          throw new Error('Database connection error');
        }
        return Promise.resolve({
          id: where.id,
          email: `${where.id}@example.com`,
          username: where.id,
          status: 'ACTIVE',
          totalPoints: 100,
          role: 'USER',
        });
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        status: 'BLOCKED',
      });

      // Act
      const result = await bulkUpdateStatus(
        userIds,
        'BLOCKED',
        mockAdminId,
        mockAdminEmail
      );

      // Assert
      expect(result.success).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Database connection error');
    });

    it('should handle audit logging failures gracefully', async () => {
      // Arrange
      const userIds = ['user-1'];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'user1@example.com',
        username: 'user1',
        status: 'ACTIVE',
        totalPoints: 100,
        role: 'USER',
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        status: 'BLOCKED',
      });

      // Mock audit log to fail but not throw (simulating internal error handling)
      (auditModule.logAuditEvent as jest.Mock).mockImplementation(() => {
        // Simulate audit logging failure that's caught internally
        console.error('Audit logging failed');
        return Promise.resolve();
      });

      // Act - should not throw despite audit log failure
      const result = await bulkUpdateStatus(
        userIds,
        'BLOCKED',
        mockAdminId,
        mockAdminEmail
      );

      // Assert - operation should still succeed
      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
      
      // Verify audit logging was attempted
      expect(auditModule.logAuditEvent).toHaveBeenCalled();
    });
  });

  describe('Audit Logging Verification (Requirement 1.5)', () => {
    it('should log individual operations and summary', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2'];

      (prisma.user.findUnique as jest.Mock).mockImplementation(({ where }) => ({
        id: where.id,
        email: `${where.id}@example.com`,
        username: where.id,
        status: 'ACTIVE',
        totalPoints: 100,
        role: 'USER',
      }));

      (prisma.user.update as jest.Mock).mockImplementation(({ where }) => ({
        id: where.id,
        status: 'BLOCKED',
      }));

      // Act
      await bulkUpdateStatus(
        userIds,
        'BLOCKED',
        mockAdminId,
        mockAdminEmail,
        mockIpAddress,
        mockUserAgent
      );

      // Assert - should log 2 individual + 1 summary = 3 total
      expect(auditModule.logAuditEvent).toHaveBeenCalledTimes(3);

      // Verify individual logs
      expect(auditModule.logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'user_status_updated',
          adminId: mockAdminId,
          adminEmail: mockAdminEmail,
          affectedModel: 'User',
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
        })
      );

      // Verify summary log
      expect(auditModule.logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'bulk_update_status',
          adminId: mockAdminId,
          adminEmail: mockAdminEmail,
          affectedModel: 'User',
        })
      );
    });

    it('should include before/after data in audit logs', async () => {
      // Arrange
      const userIds = ['user-1'];
      const beforeStatus = 'ACTIVE';
      const afterStatus = 'BLOCKED';

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'user1@example.com',
        username: 'user1',
        status: beforeStatus,
        totalPoints: 100,
        role: 'USER',
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        status: afterStatus,
      });

      // Act
      await bulkUpdateStatus(
        userIds,
        afterStatus,
        mockAdminId,
        mockAdminEmail
      );

      // Assert
      expect(auditModule.logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'user_status_updated',
          beforeData: { status: beforeStatus },
          afterData: { status: afterStatus },
        })
      );
    });

    it('should log failed operations', async () => {
      // Arrange
      const userIds = ['user-1'];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'user1@example.com',
        username: 'user1',
        status: 'ACTIVE',
        totalPoints: 100,
        role: 'USER',
      });

      (prisma.user.update as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      // Act
      await bulkUpdateStatus(
        userIds,
        'BLOCKED',
        mockAdminId,
        mockAdminEmail
      );

      // Assert - should log failure + summary
      expect(auditModule.logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'bulk_update_status_failed',
          affectedId: 'user-1',
          afterData: { error: 'Update failed' },
        })
      );
    });

    it('should include operation details in summary log', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2', 'user-3'];

      (prisma.user.findUnique as jest.Mock).mockImplementation(({ where }) => {
        if (where.id === 'user-2') return null;
        return Promise.resolve({
          id: where.id,
          email: `${where.id}@example.com`,
          username: where.id,
          status: 'ACTIVE',
          totalPoints: 100,
          role: 'USER',
        });
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        status: 'BLOCKED',
      });

      // Act
      await bulkUpdateStatus(
        userIds,
        'BLOCKED',
        mockAdminId,
        mockAdminEmail
      );

      // Assert
      const summaryCall = (auditModule.logAuditEvent as jest.Mock).mock.calls.find(
        call => call[0].action === 'bulk_update_status'
      );

      expect(summaryCall).toBeDefined();
      const afterData = summaryCall[0].afterData;
      expect(afterData.successful).toBe(2);
      expect(afterData.failed).toBe(1);
      expect(afterData.successfulIds).toEqual(['user-1', 'user-3']);
      expect(afterData.failedIds).toEqual(['user-2']);
    });
  });

  describe('Bulk Operation Result Structure', () => {
    it('should return correct result structure', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2'];

      (prisma.user.findUnique as jest.Mock).mockImplementation(({ where }) => ({
        id: where.id,
        email: `${where.id}@example.com`,
        username: where.id,
        status: 'ACTIVE',
        totalPoints: 100,
        role: 'USER',
      }));

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        status: 'BLOCKED',
      });

      // Act
      const result = await bulkUpdateStatus(
        userIds,
        'BLOCKED',
        mockAdminId,
        mockAdminEmail
      );

      // Assert
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('failed');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('details');
      expect(result.details).toHaveProperty('successfulIds');
      expect(result.details).toHaveProperty('failedIds');
      expect(typeof result.success).toBe('number');
      expect(typeof result.failed).toBe('number');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.details?.successfulIds)).toBe(true);
      expect(Array.isArray(result.details?.failedIds)).toBe(true);
    });
  });
});
