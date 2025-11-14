/**
 * Unit tests for audit logging system
 * Tests Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 * 
 * This test suite covers:
 * - Automatic logging of admin actions
 * - Before/after data capture
 * - Audit log filtering
 * - Audit log export
 * - Security event flagging
 */

// Mock next-auth before importing anything else
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import {
  logAuditEvent,
  getAuditLogs,
  getSecurityEvents,
  getAuditStats,
  isSecurityEvent,
  AuditEvent,
} from '@/lib/admin/audit';

describe('Audit Logging System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Automatic Logging of Admin Actions', () => {
    test('should log user creation action', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        id: 'audit-1',
        action: 'user_create',
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        timestamp: new Date(),
      });
      (prisma.auditLog.create as jest.Mock) = mockCreate;

      await logAuditEvent({
        action: 'user_create',
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        affectedModel: 'User',
        affectedId: 'user-1',
        afterData: { email: 'test@example.com', name: 'Test User' },
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'user_create',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
          affectedModel: 'User',
          affectedId: 'user-1',
        }),
      });
    });

    test('should log user update action', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock) = mockCreate;

      await logAuditEvent({
        action: 'user_update',
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        affectedModel: 'User',
        affectedId: 'user-1',
        beforeData: { name: 'Old Name' },
        afterData: { name: 'New Name' },
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'user_update',
          affectedModel: 'User',
          affectedId: 'user-1',
        }),
      });
    });

    test('should log user deletion action', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock) = mockCreate;

      await logAuditEvent({
        action: 'user_delete',
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        affectedModel: 'User',
        affectedId: 'user-1',
        beforeData: { email: 'deleted@example.com' },
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'user_delete',
          affectedModel: 'User',
          affectedId: 'user-1',
        }),
      });
    });

    test('should log bulk operations', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock) = mockCreate;

      await logAuditEvent({
        action: 'bulk_update_status',
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        affectedModel: 'User',
        afterData: { userIds: ['user-1', 'user-2'], status: 'ACTIVE' },
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'bulk_update_status',
          affectedModel: 'User',
        }),
      });
    });

    test('should log task creation', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock) = mockCreate;

      await logAuditEvent({
        action: 'task_create',
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        affectedModel: 'Task',
        affectedId: 'task-1',
        afterData: { title: 'New Task', points: 10 },
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'task_create',
          affectedModel: 'Task',
          affectedId: 'task-1',
        }),
      });
    });

    test('should log workflow execution', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock) = mockCreate;

      await logAuditEvent({
        action: 'workflow_executed',
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        afterData: { workflowId: 'workflow-1', success: true },
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'workflow_executed',
        }),
      });
    });

    test('should not throw error if logging fails', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('Database error'));
      (prisma.auditLog.create as jest.Mock) = mockCreate;

      // Should not throw
      await expect(
        logAuditEvent({
          action: 'test_action',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
        })
      ).resolves.not.toThrow();
    });
  });

  describe('Before/After Data Capture', () => {
    test('should capture before and after data for updates', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock) = mockCreate;

      const beforeData = { name: 'Original Name', totalPoints: 100 };
      const afterData = { name: 'Updated Name', totalPoints: 200 };

      await logAuditEvent({
        action: 'user_update',
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        affectedModel: 'User',
        affectedId: 'user-1',
        beforeData,
        afterData,
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          beforeData: JSON.stringify(beforeData),
          afterData: JSON.stringify(afterData),
        }),
      });
    });

    test('should capture before data for deletions', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock) = mockCreate;

      const beforeData = { email: 'deleted@example.com', name: 'Deleted User' };

      await logAuditEvent({
        action: 'user_delete',
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        affectedModel: 'User',
        affectedId: 'user-1',
        beforeData,
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          beforeData: JSON.stringify(beforeData),
          afterData: null,
        }),
      });
    });

    test('should capture after data for creations', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock) = mockCreate;

      const afterData = { email: 'new@example.com', name: 'New User' };

      await logAuditEvent({
        action: 'user_create',
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        affectedModel: 'User',
        affectedId: 'user-1',
        afterData,
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          beforeData: null,
          afterData: JSON.stringify(afterData),
        }),
      });
    });

    test('should handle complex nested data structures', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock) = mockCreate;

      const complexData = {
        user: { id: 'user-1', email: 'test@example.com' },
        settings: { notifications: true, theme: 'dark' },
        metadata: { lastLogin: new Date().toISOString() },
      };

      await logAuditEvent({
        action: 'settings_update',
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        afterData: complexData,
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          afterData: JSON.stringify(complexData),
        }),
      });
    });
  });

  describe('Audit Log Filtering', () => {
    test('should filter logs by action type', async () => {
      const mockLogs = [
        {
          id: '1',
          action: 'user_create',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
          timestamp: new Date(),
          affectedModel: 'User',
          affectedId: 'user-1',
          beforeData: null,
          afterData: null,
          ipAddress: null,
          userAgent: null,
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const result = await getAuditLogs({ action: 'user_create' });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          action: 'user_create',
        }),
        orderBy: { timestamp: 'desc' },
        take: 100,
        skip: 0,
      });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].action).toBe('user_create');
    });

    test('should filter logs by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await getAuditLogs({
        dateRange: { start: startDate, end: endDate },
      });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        }),
        orderBy: { timestamp: 'desc' },
        take: 100,
        skip: 0,
      });
    });

    test('should filter logs by admin ID', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await getAuditLogs({ adminId: 'admin-1' });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          adminId: 'admin-1',
        }),
        orderBy: { timestamp: 'desc' },
        take: 100,
        skip: 0,
      });
    });

    test('should filter logs by affected model', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await getAuditLogs({ affectedModel: 'User' });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          affectedModel: 'User',
        }),
        orderBy: { timestamp: 'desc' },
        take: 100,
        skip: 0,
      });
    });

    test('should support search across multiple fields', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await getAuditLogs({ search: 'test' });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { action: { contains: 'test', mode: 'insensitive' } },
            { adminEmail: { contains: 'test', mode: 'insensitive' } },
            { affectedModel: { contains: 'test', mode: 'insensitive' } },
            { affectedId: { contains: 'test', mode: 'insensitive' } },
          ]),
        }),
        orderBy: { timestamp: 'desc' },
        take: 100,
        skip: 0,
      });
    });

    test('should support pagination', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await getAuditLogs({ limit: 50, offset: 100 });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { timestamp: 'desc' },
        take: 50,
        skip: 100,
      });
    });

    test('should combine multiple filters', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await getAuditLogs({
        action: 'user_update',
        adminId: 'admin-1',
        affectedModel: 'User',
        dateRange: { start: startDate, end: endDate },
      });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          action: 'user_update',
          adminId: 'admin-1',
          affectedModel: 'User',
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        }),
        orderBy: { timestamp: 'desc' },
        take: 100,
        skip: 0,
      });
    });
  });

  describe('Security Event Flagging', () => {
    test('should identify user deletion as security event', () => {
      expect(isSecurityEvent('user_delete')).toBe(true);
    });

    test('should identify bulk delete as security event', () => {
      expect(isSecurityEvent('bulk_delete')).toBe(true);
    });

    test('should identify role change as security event', () => {
      expect(isSecurityEvent('role_change')).toBe(true);
    });

    test('should identify permission change as security event', () => {
      expect(isSecurityEvent('permission_change')).toBe(true);
    });

    test('should identify data export as security event', () => {
      expect(isSecurityEvent('data_export')).toBe(true);
    });

    test('should identify database reset as security event', () => {
      expect(isSecurityEvent('database_reset')).toBe(true);
    });

    test('should identify unauthorized access as security event', () => {
      expect(isSecurityEvent('unauthorized_access')).toBe(true);
    });

    test('should not flag regular actions as security events', () => {
      expect(isSecurityEvent('user_view')).toBe(false);
      expect(isSecurityEvent('task_view')).toBe(false);
      expect(isSecurityEvent('dashboard_view')).toBe(false);
    });

    test('should retrieve only security events', async () => {
      const mockSecurityLogs = [
        {
          id: '1',
          action: 'user_delete',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
          timestamp: new Date(),
          affectedModel: 'User',
          affectedId: 'user-1',
          beforeData: null,
          afterData: null,
          ipAddress: null,
          userAgent: null,
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockSecurityLogs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const result = await getSecurityEvents();

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { action: { contains: 'user_delete' } },
            { action: { contains: 'bulk_delete' } },
            { action: { contains: 'role_change' } },
            { action: { contains: 'permission_change' } },
            { action: { contains: 'data_export' } },
            { action: { contains: 'database_reset' } },
          ]),
        }),
        orderBy: { timestamp: 'desc' },
        take: 100,
        skip: 0,
      });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].action).toBe('user_delete');
    });
  });

  describe('Audit Log Statistics', () => {
    test('should calculate total events', async () => {
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(150);
      (prisma.auditLog.groupBy as jest.Mock).mockResolvedValue([]);

      const stats = await getAuditStats();

      expect(stats.totalEvents).toBe(150);
    });

    test('should group events by action', async () => {
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.auditLog.groupBy as jest.Mock)
        .mockResolvedValueOnce([
          { action: 'user_create', _count: 30 },
          { action: 'user_update', _count: 50 },
          { action: 'user_delete', _count: 20 },
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValue(0);

      const stats = await getAuditStats();

      expect(stats.eventsByAction).toHaveLength(3);
      expect(stats.eventsByAction[0]).toEqual({ action: 'user_create', count: 30 });
    });

    test('should group events by admin', async () => {
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.auditLog.groupBy as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { adminEmail: 'admin1@test.com', _count: 60 },
          { adminEmail: 'admin2@test.com', _count: 40 },
        ])
        .mockResolvedValue(0);

      const stats = await getAuditStats();

      expect(stats.eventsByAdmin).toHaveLength(2);
      expect(stats.eventsByAdmin[0]).toEqual({ adminEmail: 'admin1@test.com', count: 60 });
    });

    test('should count security events', async () => {
      (prisma.auditLog.count as jest.Mock)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(25);
      (prisma.auditLog.groupBy as jest.Mock).mockResolvedValue([]);

      const stats = await getAuditStats();

      expect(stats.securityEventCount).toBe(25);
    });

    test('should filter stats by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      (prisma.auditLog.count as jest.Mock).mockResolvedValue(50);
      (prisma.auditLog.groupBy as jest.Mock).mockResolvedValue([]);

      await getAuditStats({ start: startDate, end: endDate });

      expect(prisma.auditLog.count).toHaveBeenCalledWith({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
    });
  });

  describe('Audit Log Data Integrity', () => {
    test('should include timestamp automatically', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock) = mockCreate;

      await logAuditEvent({
        action: 'test_action',
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          timestamp: expect.any(Date),
        }),
      });
    });

    test('should serialize JSON data correctly', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock) = mockCreate;

      const complexData = {
        nested: { value: 'test' },
        array: [1, 2, 3],
        boolean: true,
      };

      await logAuditEvent({
        action: 'test_action',
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        afterData: complexData,
      });

      const call = mockCreate.mock.calls[0][0];
      const serialized = call.data.afterData;
      
      expect(typeof serialized).toBe('string');
      expect(JSON.parse(serialized)).toEqual(complexData);
    });

    test('should handle null values correctly', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock) = mockCreate;

      await logAuditEvent({
        action: 'test_action',
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        beforeData: undefined,
        afterData: undefined,
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          beforeData: null,
          afterData: null,
        }),
      });
    });

    test('should parse JSON data when retrieving logs', async () => {
      const mockLogs = [
        {
          id: '1',
          action: 'user_update',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
          timestamp: new Date(),
          affectedModel: 'User',
          affectedId: 'user-1',
          beforeData: JSON.stringify({ name: 'Old' }),
          afterData: JSON.stringify({ name: 'New' }),
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const result = await getAuditLogs();

      expect(result.logs[0].beforeData).toEqual({ name: 'Old' });
      expect(result.logs[0].afterData).toEqual({ name: 'New' });
    });
  });
});
