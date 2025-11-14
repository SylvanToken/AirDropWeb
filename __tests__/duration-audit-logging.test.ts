/**
 * Unit tests for duration audit logging system
 * Tests Requirement: 10.5
 * 
 * This test suite covers:
 * - Logging duration changes on task creation
 * - Logging duration changes on task updates
 * - Recording old and new values
 * - Storing admin user information
 * - Including timestamps
 * - Querying duration change logs
 * - Duration change statistics
 */

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import {
  getDurationChangeLogs,
  getTaskDurationHistory,
  getDurationChangeStats,
  getRecentDurationChanges,
  formatDurationChange,
  DurationChangeLog,
} from '@/lib/admin/duration-audit';

describe('Duration Audit Logging System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Duration Change Logging', () => {
    test('should log task creation with time limit', async () => {
      const mockLogs = [
        {
          id: 'audit-1',
          action: 'taskduration_create',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
          timestamp: new Date('2024-01-15T10:00:00Z'),
          affectedModel: 'TaskDuration',
          affectedId: 'task-1',
          beforeData: null,
          afterData: JSON.stringify({
            taskId: 'task-1',
            taskTitle: 'Complete Twitter Follow',
            duration: 2,
            expiresAt: '2024-01-15T12:00:00Z',
            isTimeLimited: true,
            changeType: 'CREATED_WITH_TIME_LIMIT',
          }),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const { logs } = await getDurationChangeLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].changeType).toBe('CREATED_WITH_TIME_LIMIT');
      expect(logs[0].newDuration).toBe(2);
      expect(logs[0].oldDuration).toBeNull();
    });

    test('should log adding time limit to existing task', async () => {
      const mockLogs = [
        {
          id: 'audit-2',
          action: 'taskduration_update',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
          timestamp: new Date('2024-01-15T11:00:00Z'),
          affectedModel: 'TaskDuration',
          affectedId: 'task-2',
          beforeData: JSON.stringify({
            taskId: 'task-2',
            taskTitle: 'Join Telegram',
            oldDuration: null,
            oldExpiresAt: null,
            wasTimeLimited: false,
          }),
          afterData: JSON.stringify({
            taskId: 'task-2',
            taskTitle: 'Join Telegram',
            newDuration: 3,
            newExpiresAt: '2024-01-15T14:00:00Z',
            isTimeLimited: true,
            changeType: 'ADDED_TIME_LIMIT',
          }),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const { logs } = await getDurationChangeLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].changeType).toBe('ADDED_TIME_LIMIT');
      expect(logs[0].oldDuration).toBeNull();
      expect(logs[0].newDuration).toBe(3);
    });

    test('should log removing time limit from task', async () => {
      const mockLogs = [
        {
          id: 'audit-3',
          action: 'taskduration_update',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
          timestamp: new Date('2024-01-15T12:00:00Z'),
          affectedModel: 'TaskDuration',
          affectedId: 'task-3',
          beforeData: JSON.stringify({
            taskId: 'task-3',
            taskTitle: 'Complete Survey',
            oldDuration: 4,
            oldExpiresAt: '2024-01-15T16:00:00Z',
            wasTimeLimited: true,
          }),
          afterData: JSON.stringify({
            taskId: 'task-3',
            taskTitle: 'Complete Survey',
            newDuration: null,
            newExpiresAt: null,
            isTimeLimited: false,
            changeType: 'REMOVED_TIME_LIMIT',
          }),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const { logs } = await getDurationChangeLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].changeType).toBe('REMOVED_TIME_LIMIT');
      expect(logs[0].oldDuration).toBe(4);
      expect(logs[0].newDuration).toBeNull();
    });

    test('should log increasing duration', async () => {
      const mockLogs = [
        {
          id: 'audit-4',
          action: 'taskduration_update',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
          timestamp: new Date('2024-01-15T13:00:00Z'),
          affectedModel: 'TaskDuration',
          affectedId: 'task-4',
          beforeData: JSON.stringify({
            taskId: 'task-4',
            taskTitle: 'Watch Video',
            oldDuration: 1,
            oldExpiresAt: '2024-01-15T14:00:00Z',
            wasTimeLimited: true,
          }),
          afterData: JSON.stringify({
            taskId: 'task-4',
            taskTitle: 'Watch Video',
            newDuration: 3,
            newExpiresAt: '2024-01-15T16:00:00Z',
            isTimeLimited: true,
            changeType: 'INCREASED_DURATION',
          }),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const { logs } = await getDurationChangeLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].changeType).toBe('INCREASED_DURATION');
      expect(logs[0].oldDuration).toBe(1);
      expect(logs[0].newDuration).toBe(3);
    });

    test('should log decreasing duration', async () => {
      const mockLogs = [
        {
          id: 'audit-5',
          action: 'taskduration_update',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
          timestamp: new Date('2024-01-15T14:00:00Z'),
          affectedModel: 'TaskDuration',
          affectedId: 'task-5',
          beforeData: JSON.stringify({
            taskId: 'task-5',
            taskTitle: 'Complete Quiz',
            oldDuration: 6,
            oldExpiresAt: '2024-01-15T20:00:00Z',
            wasTimeLimited: true,
          }),
          afterData: JSON.stringify({
            taskId: 'task-5',
            taskTitle: 'Complete Quiz',
            newDuration: 2,
            newExpiresAt: '2024-01-15T16:00:00Z',
            isTimeLimited: true,
            changeType: 'DECREASED_DURATION',
          }),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const { logs } = await getDurationChangeLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].changeType).toBe('DECREASED_DURATION');
      expect(logs[0].oldDuration).toBe(6);
      expect(logs[0].newDuration).toBe(2);
    });
  });

  describe('Admin User Information', () => {
    test('should record admin ID and email', async () => {
      const mockLogs = [
        {
          id: 'audit-1',
          action: 'taskduration_update',
          adminId: 'admin-123',
          adminEmail: 'admin@example.com',
          timestamp: new Date(),
          affectedModel: 'TaskDuration',
          affectedId: 'task-1',
          beforeData: null,
          afterData: JSON.stringify({
            taskId: 'task-1',
            taskTitle: 'Test Task',
            newDuration: 2,
            changeType: 'ADDED_TIME_LIMIT',
          }),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const { logs } = await getDurationChangeLogs();

      expect(logs[0].adminId).toBe('admin-123');
      expect(logs[0].adminEmail).toBe('admin@example.com');
    });

    test('should record IP address', async () => {
      const mockLogs = [
        {
          id: 'audit-1',
          action: 'taskduration_update',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
          timestamp: new Date(),
          affectedModel: 'TaskDuration',
          affectedId: 'task-1',
          beforeData: null,
          afterData: JSON.stringify({
            taskId: 'task-1',
            taskTitle: 'Test Task',
            newDuration: 2,
            changeType: 'ADDED_TIME_LIMIT',
          }),
          ipAddress: '203.0.113.42',
          userAgent: 'Mozilla/5.0',
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const { logs } = await getDurationChangeLogs();

      expect(logs[0].ipAddress).toBe('203.0.113.42');
    });

    test('should record user agent', async () => {
      const mockLogs = [
        {
          id: 'audit-1',
          action: 'taskduration_update',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
          timestamp: new Date(),
          affectedModel: 'TaskDuration',
          affectedId: 'task-1',
          beforeData: null,
          afterData: JSON.stringify({
            taskId: 'task-1',
            taskTitle: 'Test Task',
            newDuration: 2,
            changeType: 'ADDED_TIME_LIMIT',
          }),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const { logs } = await getDurationChangeLogs();

      expect(logs[0].userAgent).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    });
  });

  describe('Timestamp Recording', () => {
    test('should include timestamp for each change', async () => {
      const timestamp = new Date('2024-01-15T10:30:00Z');
      const mockLogs = [
        {
          id: 'audit-1',
          action: 'taskduration_update',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
          timestamp,
          affectedModel: 'TaskDuration',
          affectedId: 'task-1',
          beforeData: null,
          afterData: JSON.stringify({
            taskId: 'task-1',
            taskTitle: 'Test Task',
            newDuration: 2,
            changeType: 'ADDED_TIME_LIMIT',
          }),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const { logs } = await getDurationChangeLogs();

      expect(logs[0].timestamp).toEqual(timestamp);
    });
  });

  describe('Querying Duration Change Logs', () => {
    test('should filter by task ID', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await getDurationChangeLogs({ taskId: 'task-123' });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          affectedModel: 'TaskDuration',
          affectedId: 'task-123',
        }),
        orderBy: { timestamp: 'desc' },
        take: 100,
        skip: 0,
      });
    });

    test('should filter by admin ID', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await getDurationChangeLogs({ adminId: 'admin-456' });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          affectedModel: 'TaskDuration',
          adminId: 'admin-456',
        }),
        orderBy: { timestamp: 'desc' },
        take: 100,
        skip: 0,
      });
    });

    test('should filter by date range', async () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await getDurationChangeLogs({
        dateRange: { start, end },
      });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          affectedModel: 'TaskDuration',
          timestamp: { gte: start, lte: end },
        }),
        orderBy: { timestamp: 'desc' },
        take: 100,
        skip: 0,
      });
    });

    test('should support pagination', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await getDurationChangeLogs({ limit: 50, offset: 100 });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          affectedModel: 'TaskDuration',
        }),
        orderBy: { timestamp: 'desc' },
        take: 50,
        skip: 100,
      });
    });

    test('should get task duration history', async () => {
      const mockLogs = [
        {
          id: 'audit-1',
          action: 'taskduration_create',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
          timestamp: new Date('2024-01-15T10:00:00Z'),
          affectedModel: 'TaskDuration',
          affectedId: 'task-1',
          beforeData: null,
          afterData: JSON.stringify({
            taskId: 'task-1',
            taskTitle: 'Test Task',
            duration: 2,
            changeType: 'CREATED_WITH_TIME_LIMIT',
          }),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
        {
          id: 'audit-2',
          action: 'taskduration_update',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
          timestamp: new Date('2024-01-15T11:00:00Z'),
          affectedModel: 'TaskDuration',
          affectedId: 'task-1',
          beforeData: JSON.stringify({ oldDuration: 2 }),
          afterData: JSON.stringify({
            taskId: 'task-1',
            taskTitle: 'Test Task',
            newDuration: 4,
            changeType: 'INCREASED_DURATION',
          }),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(2);

      const history = await getTaskDurationHistory('task-1');

      expect(history).toHaveLength(2);
      expect(history[0].changeType).toBe('CREATED_WITH_TIME_LIMIT');
      expect(history[1].changeType).toBe('INCREASED_DURATION');
    });

    test('should get recent duration changes', async () => {
      const mockLogs = [
        {
          id: 'audit-1',
          action: 'taskduration_update',
          adminId: 'admin-1',
          adminEmail: 'admin@test.com',
          timestamp: new Date(),
          affectedModel: 'TaskDuration',
          affectedId: 'task-1',
          beforeData: null,
          afterData: JSON.stringify({
            taskId: 'task-1',
            taskTitle: 'Test Task',
            newDuration: 2,
            changeType: 'ADDED_TIME_LIMIT',
          }),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const recent = await getRecentDurationChanges(24);

      expect(recent).toHaveLength(1);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          affectedModel: 'TaskDuration',
          timestamp: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
        orderBy: { timestamp: 'desc' },
        take: 50,
        skip: 0,
      });
    });
  });

  describe('Duration Change Statistics', () => {
    test('should calculate total changes', async () => {
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(150);
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

      const stats = await getDurationChangeStats();

      expect(stats.totalChanges).toBe(150);
    });

    test('should group changes by type', async () => {
      const mockLogs = [
        {
          adminEmail: 'admin@test.com',
          afterData: JSON.stringify({ changeType: 'ADDED_TIME_LIMIT' }),
        },
        {
          adminEmail: 'admin@test.com',
          afterData: JSON.stringify({ changeType: 'ADDED_TIME_LIMIT' }),
        },
        {
          adminEmail: 'admin@test.com',
          afterData: JSON.stringify({ changeType: 'INCREASED_DURATION' }),
        },
      ];

      (prisma.auditLog.count as jest.Mock).mockResolvedValue(3);
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

      const stats = await getDurationChangeStats();

      expect(stats.changesByType).toContainEqual({
        changeType: 'ADDED_TIME_LIMIT',
        count: 2,
      });
      expect(stats.changesByType).toContainEqual({
        changeType: 'INCREASED_DURATION',
        count: 1,
      });
    });

    test('should group changes by admin', async () => {
      const mockLogs = [
        {
          adminEmail: 'admin1@test.com',
          afterData: JSON.stringify({ changeType: 'ADDED_TIME_LIMIT' }),
        },
        {
          adminEmail: 'admin1@test.com',
          afterData: JSON.stringify({ changeType: 'INCREASED_DURATION' }),
        },
        {
          adminEmail: 'admin2@test.com',
          afterData: JSON.stringify({ changeType: 'REMOVED_TIME_LIMIT' }),
        },
      ];

      (prisma.auditLog.count as jest.Mock).mockResolvedValue(3);
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

      const stats = await getDurationChangeStats();

      expect(stats.changesByAdmin).toContainEqual({
        adminEmail: 'admin1@test.com',
        count: 2,
      });
      expect(stats.changesByAdmin).toContainEqual({
        adminEmail: 'admin2@test.com',
        count: 1,
      });
    });

    test('should count tasks with and without time limits', async () => {
      const mockTasks = [
        { duration: 2 },
        { duration: 3 },
        { duration: null },
        { duration: null },
        { duration: 4 },
      ];

      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const stats = await getDurationChangeStats();

      expect(stats.tasksWithTimeLimit).toBe(3);
      expect(stats.tasksWithoutTimeLimit).toBe(2);
    });
  });

  describe('Format Duration Change', () => {
    test('should format CREATED_WITH_TIME_LIMIT', () => {
      const log: DurationChangeLog = {
        id: '1',
        timestamp: new Date(),
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        taskId: 'task-1',
        taskTitle: 'Test Task',
        changeType: 'CREATED_WITH_TIME_LIMIT',
        oldDuration: null,
        newDuration: 2,
        oldExpiresAt: null,
        newExpiresAt: new Date(),
      };

      const formatted = formatDurationChange(log);
      expect(formatted).toBe('Created task "Test Task" with 2h time limit');
    });

    test('should format ADDED_TIME_LIMIT', () => {
      const log: DurationChangeLog = {
        id: '1',
        timestamp: new Date(),
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        taskId: 'task-1',
        taskTitle: 'Test Task',
        changeType: 'ADDED_TIME_LIMIT',
        oldDuration: null,
        newDuration: 3,
        oldExpiresAt: null,
        newExpiresAt: new Date(),
      };

      const formatted = formatDurationChange(log);
      expect(formatted).toBe('Added 3h time limit to task "Test Task"');
    });

    test('should format REMOVED_TIME_LIMIT', () => {
      const log: DurationChangeLog = {
        id: '1',
        timestamp: new Date(),
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        taskId: 'task-1',
        taskTitle: 'Test Task',
        changeType: 'REMOVED_TIME_LIMIT',
        oldDuration: 4,
        newDuration: null,
        oldExpiresAt: new Date(),
        newExpiresAt: null,
      };

      const formatted = formatDurationChange(log);
      expect(formatted).toBe('Removed time limit from task "Test Task" (was 4h)');
    });

    test('should format INCREASED_DURATION', () => {
      const log: DurationChangeLog = {
        id: '1',
        timestamp: new Date(),
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        taskId: 'task-1',
        taskTitle: 'Test Task',
        changeType: 'INCREASED_DURATION',
        oldDuration: 2,
        newDuration: 5,
        oldExpiresAt: new Date(),
        newExpiresAt: new Date(),
      };

      const formatted = formatDurationChange(log);
      expect(formatted).toBe('Increased duration for task "Test Task" from 2h to 5h');
    });

    test('should format DECREASED_DURATION', () => {
      const log: DurationChangeLog = {
        id: '1',
        timestamp: new Date(),
        adminId: 'admin-1',
        adminEmail: 'admin@test.com',
        taskId: 'task-1',
        taskTitle: 'Test Task',
        changeType: 'DECREASED_DURATION',
        oldDuration: 6,
        newDuration: 2,
        oldExpiresAt: new Date(),
        newExpiresAt: new Date(),
      };

      const formatted = formatDurationChange(log);
      expect(formatted).toBe('Decreased duration for task "Test Task" from 6h to 2h');
    });
  });
});
