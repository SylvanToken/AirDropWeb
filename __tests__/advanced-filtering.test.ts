/**
 * Integration tests for advanced filtering system
 * Tests Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 * 
 * This test suite covers:
 * - All filter operators (equals, contains, gt, lt, between, in)
 * - AND/OR logic for combining filters
 * - Date range filters
 * - Numeric range filters
 * - Filter preset saving/loading
 */

import { prisma } from '@/lib/prisma';
import {
  buildPrismaFilter,
  validateFilterCriteria,
  saveFilterPreset,
  getFilterPresets,
  getFilterPresetById,
  updateFilterPreset,
  deleteFilterPreset,
  applyFiltersToQuery,
  FilterCriteria,
  FilterPreset,
} from '@/lib/admin/filters';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
    filterPreset: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe('Advanced Filtering System', () => {
  const mockAdminId = 'admin-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Filter Operators (Requirement 2.1)', () => {
    it('should build equals filter correctly', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'status', operator: 'equals', value: 'ACTIVE' },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({ status: 'ACTIVE' });
    });

    it('should build contains filter with case insensitive', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'email', operator: 'contains', value: 'test@example.com' },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        email: { contains: 'test@example.com', mode: 'insensitive' },
      });
    });

    it('should build greater than (gt) filter', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'totalPoints', operator: 'gt', value: 100 },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({ totalPoints: { gt: 100 } });
    });

    it('should build less than (lt) filter', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'totalPoints', operator: 'lt', value: 500 },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({ totalPoints: { lt: 500 } });
    });

    it('should build between filter for ranges', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'totalPoints', operator: 'between', value: [100, 500] },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        totalPoints: { gte: 100, lte: 500 },
      });
    });

    it('should build in filter for multiple values', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'status', operator: 'in', value: ['ACTIVE', 'PENDING', 'BLOCKED'] },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        status: { in: ['ACTIVE', 'PENDING', 'BLOCKED'] },
      });
    });
  });

  describe('AND/OR Logic (Requirement 2.2)', () => {
    it('should combine multiple filters with AND logic by default', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'status', operator: 'equals', value: 'ACTIVE' },
        { field: 'totalPoints', operator: 'gt', value: 100 },
        { field: 'email', operator: 'contains', value: 'test' },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        AND: [
          { status: 'ACTIVE' },
          { totalPoints: { gt: 100 } },
          { email: { contains: 'test', mode: 'insensitive' } },
        ],
      });
    });

    it('should combine multiple filters with OR logic', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'status', operator: 'equals', value: 'ACTIVE', logic: 'OR' },
        { field: 'status', operator: 'equals', value: 'PENDING', logic: 'OR' },
        { field: 'status', operator: 'equals', value: 'BLOCKED', logic: 'OR' },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        OR: [
          { status: 'ACTIVE' },
          { status: 'PENDING' },
          { status: 'BLOCKED' },
        ],
      });
    });

    it('should combine AND and OR logic together', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'totalPoints', operator: 'gt', value: 100 },
        { field: 'status', operator: 'equals', value: 'ACTIVE', logic: 'OR' },
        { field: 'status', operator: 'equals', value: 'PENDING', logic: 'OR' },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      // When there's a single AND criterion and multiple OR criteria,
      // they get combined at the top level with OR wrapping
      expect(result).toEqual({
        OR: [
          { totalPoints: { gt: 100 } },
          { status: 'ACTIVE' },
          { status: 'PENDING' },
        ],
      });
    });

    it('should handle complex nested AND/OR logic', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'totalPoints', operator: 'between', value: [100, 500] },
        { field: 'email', operator: 'contains', value: '@example.com' },
        { field: 'status', operator: 'equals', value: 'ACTIVE', logic: 'OR' },
        { field: 'status', operator: 'equals', value: 'PENDING', logic: 'OR' },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        AND: [
          { totalPoints: { gte: 100, lte: 500 } },
          { email: { contains: '@example.com', mode: 'insensitive' } },
          {
            OR: [
              { status: 'ACTIVE' },
              { status: 'PENDING' },
            ],
          },
        ],
      });
    });
  });

  describe('Date Range Filters (Requirement 2.3)', () => {
    it('should filter by date range using between operator', () => {
      // Arrange
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');
      const criteria: FilterCriteria[] = [
        { field: 'createdAt', operator: 'between', value: [startDate, endDate] },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        createdAt: { gte: startDate, lte: endDate },
      });
    });

    it('should filter by date greater than', () => {
      // Arrange
      const date = new Date('2025-01-01');
      const criteria: FilterCriteria[] = [
        { field: 'createdAt', operator: 'gt', value: date },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        createdAt: { gt: date },
      });
    });

    it('should filter by date less than', () => {
      // Arrange
      const date = new Date('2025-12-31');
      const criteria: FilterCriteria[] = [
        { field: 'lastActive', operator: 'lt', value: date },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        lastActive: { lt: date },
      });
    });

    it('should combine date filters with other filters', () => {
      // Arrange
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');
      const criteria: FilterCriteria[] = [
        { field: 'createdAt', operator: 'between', value: [startDate, endDate] },
        { field: 'status', operator: 'equals', value: 'ACTIVE' },
        { field: 'totalPoints', operator: 'gt', value: 100 },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        AND: [
          { createdAt: { gte: startDate, lte: endDate } },
          { status: 'ACTIVE' },
          { totalPoints: { gt: 100 } },
        ],
      });
    });
  });

  describe('Numeric Range Filters (Requirement 2.4)', () => {
    it('should filter by numeric range using between operator', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'totalPoints', operator: 'between', value: [100, 1000] },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        totalPoints: { gte: 100, lte: 1000 },
      });
    });

    it('should filter by minimum value using gt operator', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'totalPoints', operator: 'gt', value: 500 },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        totalPoints: { gt: 500 },
      });
    });

    it('should filter by maximum value using lt operator', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'totalPoints', operator: 'lt', value: 200 },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        totalPoints: { lt: 200 },
      });
    });

    it('should combine multiple numeric range filters', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'totalPoints', operator: 'between', value: [100, 1000] },
        { field: 'completedTasks', operator: 'gt', value: 5 },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        AND: [
          { totalPoints: { gte: 100, lte: 1000 } },
          { completedTasks: { gt: 5 } },
        ],
      });
    });

    it('should handle zero and negative numeric values', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'totalPoints', operator: 'between', value: [-100, 0] },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        totalPoints: { gte: -100, lte: 0 },
      });
    });
  });

  describe('Filter Preset Saving/Loading (Requirement 2.5)', () => {
    it('should save a filter preset', async () => {
      // Arrange
      const preset = {
        name: 'Active High-Value Users',
        criteria: [
          { field: 'status', operator: 'equals' as const, value: 'ACTIVE' },
          { field: 'totalPoints', operator: 'gt' as const, value: 1000 },
        ],
        createdBy: mockAdminId,
      };

      (prisma.filterPreset.create as jest.Mock).mockResolvedValue({
        id: 'preset-123',
        name: preset.name,
        criteria: JSON.stringify(preset.criteria),
        createdBy: preset.createdBy,
        createdAt: new Date(),
      });

      // Act
      const result = await saveFilterPreset(preset);

      // Assert
      expect(result).toEqual({
        id: 'preset-123',
        name: preset.name,
        criteria: preset.criteria,
        createdBy: preset.createdBy,
      });

      expect(prisma.filterPreset.create).toHaveBeenCalledWith({
        data: {
          name: preset.name,
          criteria: JSON.stringify(preset.criteria),
          createdBy: preset.createdBy,
        },
      });
    });

    it('should load all filter presets for a user', async () => {
      // Arrange
      const mockPresets = [
        {
          id: 'preset-1',
          name: 'Active Users',
          criteria: JSON.stringify([
            { field: 'status', operator: 'equals', value: 'ACTIVE' },
          ]),
          createdBy: mockAdminId,
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 'preset-2',
          name: 'High Value Users',
          criteria: JSON.stringify([
            { field: 'totalPoints', operator: 'gt', value: 1000 },
          ]),
          createdBy: mockAdminId,
          createdAt: new Date('2025-01-02'),
        },
      ];

      (prisma.filterPreset.findMany as jest.Mock).mockResolvedValue(mockPresets);

      // Act
      const result = await getFilterPresets(mockAdminId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Active Users');
      expect(result[1].name).toBe('High Value Users');
      expect(Array.isArray(result[0].criteria)).toBe(true);

      expect(prisma.filterPreset.findMany).toHaveBeenCalledWith({
        where: { createdBy: mockAdminId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should load a specific filter preset by ID', async () => {
      // Arrange
      const presetId = 'preset-123';
      const mockPreset = {
        id: presetId,
        name: 'My Filter',
        criteria: JSON.stringify([
          { field: 'status', operator: 'equals', value: 'ACTIVE' },
          { field: 'totalPoints', operator: 'gt', value: 500 },
        ]),
        createdBy: mockAdminId,
        createdAt: new Date(),
      };

      (prisma.filterPreset.findFirst as jest.Mock).mockResolvedValue(mockPreset);

      // Act
      const result = await getFilterPresetById(presetId, mockAdminId);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(presetId);
      expect(result?.name).toBe('My Filter');
      expect(result?.criteria).toHaveLength(2);

      expect(prisma.filterPreset.findFirst).toHaveBeenCalledWith({
        where: {
          id: presetId,
          createdBy: mockAdminId,
        },
      });
    });

    it('should return null when loading non-existent preset', async () => {
      // Arrange
      (prisma.filterPreset.findFirst as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await getFilterPresetById('non-existent', mockAdminId);

      // Assert
      expect(result).toBeNull();
    });

    it('should update a filter preset', async () => {
      // Arrange
      const presetId = 'preset-123';
      const existingPreset = {
        id: presetId,
        name: 'Old Name',
        criteria: JSON.stringify([]),
        createdBy: mockAdminId,
        createdAt: new Date(),
      };

      const updates = {
        name: 'New Name',
        criteria: [
          { field: 'status', operator: 'equals' as const, value: 'BLOCKED' },
        ],
      };

      (prisma.filterPreset.findFirst as jest.Mock).mockResolvedValue(existingPreset);
      (prisma.filterPreset.update as jest.Mock).mockResolvedValue({
        ...existingPreset,
        name: updates.name,
        criteria: JSON.stringify(updates.criteria),
      });

      // Act
      const result = await updateFilterPreset(presetId, mockAdminId, updates);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.name).toBe('New Name');
      expect(result?.criteria).toEqual(updates.criteria);

      expect(prisma.filterPreset.update).toHaveBeenCalledWith({
        where: { id: presetId },
        data: {
          name: updates.name,
          criteria: JSON.stringify(updates.criteria),
        },
      });
    });

    it('should delete a filter preset', async () => {
      // Arrange
      const presetId = 'preset-123';

      (prisma.filterPreset.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      // Act
      const result = await deleteFilterPreset(presetId, mockAdminId);

      // Assert
      expect(result).toBe(true);

      expect(prisma.filterPreset.deleteMany).toHaveBeenCalledWith({
        where: {
          id: presetId,
          createdBy: mockAdminId,
        },
      });
    });

    it('should handle errors when deleting preset', async () => {
      // Arrange
      const presetId = 'preset-123';

      (prisma.filterPreset.deleteMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      // Act
      const result = await deleteFilterPreset(presetId, mockAdminId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Filter Validation', () => {
    it('should validate correct filter criteria', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'status', operator: 'equals', value: 'ACTIVE' },
        { field: 'totalPoints', operator: 'between', value: [100, 500] },
      ];

      // Act
      const result = validateFilterCriteria(criteria);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing field', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: '', operator: 'equals', value: 'ACTIVE' },
      ];

      // Act
      const result = validateFilterCriteria(criteria);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Criterion 1: field is required');
    });

    it('should detect missing operator', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'status', operator: '' as any, value: 'ACTIVE' },
      ];

      // Act
      const result = validateFilterCriteria(criteria);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Criterion 1: operator is required');
    });

    it('should detect missing value', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'status', operator: 'equals', value: null },
      ];

      // Act
      const result = validateFilterCriteria(criteria);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Criterion 1: value is required');
    });

    it('should validate between operator requires array of two values', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'totalPoints', operator: 'between', value: 100 },
      ];

      // Act
      const result = validateFilterCriteria(criteria);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('between');
      expect(result.errors[0]).toContain('array of two values');
    });

    it('should validate in operator requires array', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'status', operator: 'in', value: 'ACTIVE' },
      ];

      // Act
      const result = validateFilterCriteria(criteria);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('in');
      expect(result.errors[0]).toContain('array of values');
    });

    it('should validate logic operator values', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'status', operator: 'equals', value: 'ACTIVE', logic: 'INVALID' as any },
      ];

      // Act
      const result = validateFilterCriteria(criteria);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('logic must be either');
    });

    it('should collect multiple validation errors', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: '', operator: 'equals', value: null },
        { field: 'points', operator: 'between', value: 100 },
      ];

      // Act
      const result = validateFilterCriteria(criteria);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
    });
  });

  describe('Apply Filters to Query', () => {
    it('should apply filters to Prisma query', async () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'status', operator: 'equals', value: 'ACTIVE' },
        { field: 'totalPoints', operator: 'gt', value: 100 },
      ];

      const mockUsers = [
        { id: 'user-1', status: 'ACTIVE', totalPoints: 150 },
        { id: 'user-2', status: 'ACTIVE', totalPoints: 200 },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      // Act
      const result = await applyFiltersToQuery(prisma.user, criteria);

      // Assert
      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { status: 'ACTIVE' },
            { totalPoints: { gt: 100 } },
          ],
        },
      });
    });

    it('should apply filters with additional where conditions', async () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'totalPoints', operator: 'gt', value: 100 },
      ];

      const additionalWhere = { role: 'USER' };

      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      await applyFiltersToQuery(prisma.user, criteria, additionalWhere);

      // Assert
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { totalPoints: { gt: 100 } },
            { role: 'USER' },
          ],
        },
      });
    });

    it('should handle empty criteria', async () => {
      // Arrange
      const criteria: FilterCriteria[] = [];

      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      await applyFiltersToQuery(prisma.user, criteria);

      // Assert
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
      });
    });
  });

  describe('Complex Filter Scenarios', () => {
    it('should handle complex multi-field filter with mixed logic', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'totalPoints', operator: 'between', value: [100, 1000] },
        { field: 'email', operator: 'contains', value: '@example.com' },
        { field: 'createdAt', operator: 'gt', value: new Date('2025-01-01') },
        { field: 'status', operator: 'equals', value: 'ACTIVE', logic: 'OR' },
        { field: 'status', operator: 'equals', value: 'PENDING', logic: 'OR' },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        AND: [
          { totalPoints: { gte: 100, lte: 1000 } },
          { email: { contains: '@example.com', mode: 'insensitive' } },
          { createdAt: { gt: new Date('2025-01-01') } },
          {
            OR: [
              { status: 'ACTIVE' },
              { status: 'PENDING' },
            ],
          },
        ],
      });
    });

    it('should handle filter with all operator types', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'username', operator: 'equals', value: 'testuser' },
        { field: 'email', operator: 'contains', value: 'test' },
        { field: 'totalPoints', operator: 'gt', value: 50 },
        { field: 'completedTasks', operator: 'lt', value: 100 },
        { field: 'createdAt', operator: 'between', value: [new Date('2025-01-01'), new Date('2025-12-31')] },
        { field: 'status', operator: 'in', value: ['ACTIVE', 'PENDING'] },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result.AND).toHaveLength(6);
      expect(result.AND[0]).toEqual({ username: 'testuser' });
      expect(result.AND[1]).toEqual({ email: { contains: 'test', mode: 'insensitive' } });
      expect(result.AND[2]).toEqual({ totalPoints: { gt: 50 } });
      expect(result.AND[3]).toEqual({ completedTasks: { lt: 100 } });
      expect(result.AND[4]).toHaveProperty('createdAt');
      expect(result.AND[5]).toEqual({ status: { in: ['ACTIVE', 'PENDING'] } });
    });

    it('should preserve filter preset through save and load cycle', async () => {
      // Arrange
      const originalCriteria: FilterCriteria[] = [
        { field: 'status', operator: 'equals', value: 'ACTIVE' },
        { field: 'totalPoints', operator: 'between', value: [100, 500] },
        { field: 'email', operator: 'contains', value: '@test.com' },
      ];

      const preset = {
        name: 'Test Preset',
        criteria: originalCriteria,
        createdBy: mockAdminId,
      };

      (prisma.filterPreset.create as jest.Mock).mockResolvedValue({
        id: 'preset-123',
        name: preset.name,
        criteria: JSON.stringify(preset.criteria),
        createdBy: preset.createdBy,
        createdAt: new Date(),
      });

      (prisma.filterPreset.findFirst as jest.Mock).mockResolvedValue({
        id: 'preset-123',
        name: preset.name,
        criteria: JSON.stringify(preset.criteria),
        createdBy: preset.createdBy,
        createdAt: new Date(),
      });

      // Act
      const saved = await saveFilterPreset(preset);
      const loaded = await getFilterPresetById(saved.id, mockAdminId);

      // Assert
      expect(loaded).not.toBeNull();
      expect(loaded?.criteria).toEqual(originalCriteria);
      expect(JSON.stringify(loaded?.criteria)).toBe(JSON.stringify(originalCriteria));
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty filter criteria array', () => {
      // Arrange
      const criteria: FilterCriteria[] = [];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({});
    });

    it('should handle single criterion without wrapping in AND', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'status', operator: 'equals', value: 'ACTIVE' },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({ status: 'ACTIVE' });
      expect(result.AND).toBeUndefined();
    });

    it('should handle special characters in string values', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'email', operator: 'contains', value: 'test+user@example.com' },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        email: { contains: 'test+user@example.com', mode: 'insensitive' },
      });
    });

    it('should handle very large numeric ranges', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'totalPoints', operator: 'between', value: [0, 999999999] },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        totalPoints: { gte: 0, lte: 999999999 },
      });
    });

    it('should handle empty arrays in in operator', () => {
      // Arrange
      const criteria: FilterCriteria[] = [
        { field: 'status', operator: 'in', value: [] },
      ];

      // Act
      const result = buildPrismaFilter(criteria);

      // Assert
      expect(result).toEqual({
        status: { in: [] },
      });
    });
  });
});
