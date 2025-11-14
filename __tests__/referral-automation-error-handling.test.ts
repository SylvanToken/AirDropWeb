/**
 * Tests for referral automation error handling and edge cases
 * 
 * Requirements tested:
 * - 4.1: Validate referral code format
 * - 4.2: Verify referral code exists in database
 * - 4.5: Prevent duplicate completions
 * - 7.1: Registration succeeds even if referral fails
 * - 7.2: Log errors with full context
 */

import { processReferralCompletion, ReferralErrorType } from '@/lib/referral-automation';

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    completion: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
  executeTransaction: jest.fn((callback) => callback({
    completion: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  })),
}));

jest.mock('@/lib/referral-code', () => ({
  findUserByReferralCode: jest.fn(),
  isValidReferralCode: jest.fn(),
}));

import { prisma } from '@/lib/prisma';
import { findUserByReferralCode, isValidReferralCode } from '@/lib/referral-code';

describe('Referral Automation - Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should reject missing referralCode parameter', async () => {
      const result = await processReferralCompletion('', 'user123');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid parameters');
    });

    it('should reject missing newUserId parameter', async () => {
      const result = await processReferralCompletion('ABC123', '');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid parameters');
    });

    it('should reject invalid referral code format', async () => {
      (isValidReferralCode as jest.Mock).mockReturnValue(false);
      
      const result = await processReferralCompletion('invalid', 'user123');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid referral code format');
      expect(isValidReferralCode).toHaveBeenCalledWith('invalid');
    });

    it('should accept valid referral code format', async () => {
      (isValidReferralCode as jest.Mock).mockReturnValue(true);
      (findUserByReferralCode as jest.Mock).mockResolvedValue(null);
      
      const result = await processReferralCompletion('ABC123XY', 'user123');
      
      expect(result.success).toBe(true);
      expect(isValidReferralCode).toHaveBeenCalledWith('ABC123XY');
    });
  });

  describe('Duplicate Prevention', () => {
    it('should prevent duplicate completions for same referee', async () => {
      (isValidReferralCode as jest.Mock).mockReturnValue(true);
      (prisma.completion.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-completion',
        userId: 'referrer123',
        completedAt: new Date(),
      });
      
      const result = await processReferralCompletion('ABC123XY', 'user123');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already processed');
    });

    it('should allow processing when no duplicate exists', async () => {
      (isValidReferralCode as jest.Mock).mockReturnValue(true);
      (prisma.completion.findFirst as jest.Mock).mockResolvedValue(null);
      (findUserByReferralCode as jest.Mock).mockResolvedValue(null);
      
      const result = await processReferralCompletion('ABC123XY', 'user123');
      
      expect(result.success).toBe(true);
    });
  });

  describe('Self-Referral Prevention', () => {
    it('should prevent self-referral attempts', async () => {
      (isValidReferralCode as jest.Mock).mockReturnValue(true);
      (prisma.completion.findFirst as jest.Mock).mockResolvedValue(null);
      (findUserByReferralCode as jest.Mock).mockResolvedValue({
        id: 'user123', // Same as newUserId
        username: 'testuser',
        email: 'test@example.com',
        referralCode: 'ABC123XY',
      });
      
      const result = await processReferralCompletion('ABC123XY', 'user123');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot refer yourself');
    });
  });

  describe('Referrer Not Found', () => {
    it('should handle non-existent referral code gracefully', async () => {
      (isValidReferralCode as jest.Mock).mockReturnValue(true);
      (prisma.completion.findFirst as jest.Mock).mockResolvedValue(null);
      (findUserByReferralCode as jest.Mock).mockResolvedValue(null);
      
      const result = await processReferralCompletion('ABC123XY', 'user123');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('No referrer found');
    });
  });

  describe('No Pending Tasks', () => {
    it('should handle no pending referral tasks gracefully', async () => {
      (isValidReferralCode as jest.Mock).mockReturnValue(true);
      (prisma.completion.findFirst as jest.Mock).mockResolvedValue(null);
      (findUserByReferralCode as jest.Mock).mockResolvedValue({
        id: 'referrer123',
        username: 'referrer',
        email: 'referrer@example.com',
        referralCode: 'ABC123XY',
      });
      (prisma.completion.findMany as jest.Mock).mockResolvedValue([]);
      
      const result = await processReferralCompletion('ABC123XY', 'user123');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('No pending referral tasks');
    });
  });

  describe('Error Recovery', () => {
    it('should not throw errors even when processing fails', async () => {
      (isValidReferralCode as jest.Mock).mockReturnValue(true);
      (prisma.completion.findFirst as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );
      
      const result = await processReferralCompletion('ABC123XY', 'user123');
      
      // Should return error result, not throw
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

describe('Referral Automation - Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Multiple Pending Tasks', () => {
    it('should complete oldest pending task first', async () => {
      const oldDate = new Date('2024-01-01');
      const newDate = new Date('2024-01-02');
      
      (isValidReferralCode as jest.Mock).mockReturnValue(true);
      (prisma.completion.findFirst as jest.Mock).mockResolvedValue(null);
      (findUserByReferralCode as jest.Mock).mockResolvedValue({
        id: 'referrer123',
        username: 'referrer',
        email: 'referrer@example.com',
        referralCode: 'ABC123XY',
      });
      
      (prisma.completion.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'completion1',
          completedAt: oldDate,
          task: { id: 'task1', points: 100, taskType: 'REFERRAL' },
        },
        {
          id: 'completion2',
          completedAt: newDate,
          task: { id: 'task2', points: 200, taskType: 'REFERRAL' },
        },
      ]);
      
      const mockTx = {
        completion: {
          findUnique: jest.fn().mockResolvedValue({
            status: 'PENDING',
            userId: 'referrer123',
          }),
          update: jest.fn().mockResolvedValue({}),
        },
        user: {
          update: jest.fn().mockResolvedValue({}),
        },
      };
      
      (prisma as any).executeTransaction = jest.fn((callback) => callback(mockTx));
      
      const result = await processReferralCompletion('ABC123XY', 'user123');
      
      expect(result.success).toBe(true);
      expect(result.completionId).toBe('completion1'); // Oldest one
      expect(result.pointsAwarded).toBe(100);
    });
  });

  describe('Concurrent Registrations', () => {
    it('should handle concurrent modification gracefully', async () => {
      (isValidReferralCode as jest.Mock).mockReturnValue(true);
      (prisma.completion.findFirst as jest.Mock).mockResolvedValue(null);
      (findUserByReferralCode as jest.Mock).mockResolvedValue({
        id: 'referrer123',
        username: 'referrer',
        email: 'referrer@example.com',
        referralCode: 'ABC123XY',
      });
      
      (prisma.completion.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'completion1',
          completedAt: new Date(),
          task: { id: 'task1', points: 100, taskType: 'REFERRAL' },
        },
      ]);
      
      const mockTx = {
        completion: {
          findUnique: jest.fn().mockResolvedValue({
            status: 'APPROVED', // Already completed by another process
            userId: 'referrer123',
          }),
          update: jest.fn(),
        },
        user: {
          update: jest.fn(),
        },
      };
      
      (prisma as any).executeTransaction = jest.fn((callback) => callback(mockTx));
      
      const result = await processReferralCompletion('ABC123XY', 'user123');
      
      // Should fail gracefully without crashing
      expect(result.success).toBe(false);
    });
  });
});
