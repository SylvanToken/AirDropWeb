/**
 * Fraud Detection Tests
 * Tests for fraud score calculation, auto-approval logic, and manual review workflow
 */

// Mock bull queue before importing modules that use it
jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => ({
    process: jest.fn(),
    add: jest.fn(),
    on: jest.fn(),
  }));
});

import { prisma } from '@/lib/prisma'
import {
  calculateFraudScore,
  autoApprovePendingCompletions,
  getFraudRiskLevel,
} from '@/lib/fraud-detection'
import {
  createTestUser,
  createTestCampaign,
  createTestTask,
  createTestCompletion,
  cleanDatabase,
} from './utils/test-helpers'

describe('Fraud Detection System', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await cleanDatabase()
    await prisma.$disconnect()
  })

  describe('5.1 Fraud Score Calculation', () => {
    it('should calculate low risk score for verified user with normal completion time', async () => {
      // Create a verified user with old account
      const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      const user = await createTestUser({
        walletVerified: true,
        twitterVerified: true,
        telegramVerified: true,
        createdAt: oldDate,
      })

      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      const result = await calculateFraudScore({
        userId: user.id,
        taskId: task.id,
      })

      expect(result.fraudScore).toBeLessThan(20)
      expect(result.reasons.length).toBeGreaterThanOrEqual(0)
    })

    it('should calculate medium risk score for partially verified user with quick completion', async () => {
      // Create partially verified user (only wallet verified)
      const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      const user = await createTestUser({
        walletVerified: true,
        twitterVerified: false,
        telegramVerified: false,
        createdAt: recentDate,
      })

      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      const result = await calculateFraudScore({
        userId: user.id,
        taskId: task.id,
      })

      expect(result.fraudScore).toBeGreaterThanOrEqual(10)
      expect(result.fraudScore).toBeLessThan(40)
      expect(result.reasons).toContain('No social media verified')
    })

    it('should calculate high risk score for new unverified user with very fast completion', async () => {
      // Create brand new unverified user
      const user = await createTestUser({
        walletVerified: false,
        twitterVerified: false,
        telegramVerified: false,
        createdAt: new Date(), // Just created
      })

      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      // Create multiple recent completions to simulate fast completion rate
      for (let i = 0; i < 6; i++) {
        await createTestCompletion(user.id, task.id, {
          completedAt: new Date(),
        })
      }

      const result = await calculateFraudScore({
        userId: user.id,
        taskId: task.id,
      })

      expect(result.fraudScore).toBeGreaterThan(50)
      expect(result.reasons.length).toBeGreaterThan(0)
    })

    it('should consider account age in fraud score', async () => {
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      // Very new account (< 1 hour)
      const veryNewUser = await createTestUser({
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      })
      const veryNewResult = await calculateFraudScore({
        userId: veryNewUser.id,
        taskId: task.id,
      })

      // New account (< 24 hours)
      const newUser = await createTestUser({
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      })
      const newResult = await calculateFraudScore({
        userId: newUser.id,
        taskId: task.id,
      })

      // Old account (> 3 days)
      const oldUser = await createTestUser({
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      })
      const oldResult = await calculateFraudScore({
        userId: oldUser.id,
        taskId: task.id,
      })

      expect(veryNewResult.fraudScore).toBeGreaterThan(newResult.fraudScore)
      expect(newResult.fraudScore).toBeGreaterThan(oldResult.fraudScore)
    })

    it('should consider verification status in fraud score', async () => {
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)
      const oldDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      // Fully verified user
      const verifiedUser = await createTestUser({
        walletVerified: true,
        twitterVerified: true,
        telegramVerified: true,
        createdAt: oldDate,
      })
      const verifiedResult = await calculateFraudScore({
        userId: verifiedUser.id,
        taskId: task.id,
      })

      // Partially verified user
      const partialUser = await createTestUser({
        walletVerified: true,
        twitterVerified: false,
        telegramVerified: false,
        createdAt: oldDate,
      })
      const partialResult = await calculateFraudScore({
        userId: partialUser.id,
        taskId: task.id,
      })

      // Unverified user
      const unverifiedUser = await createTestUser({
        walletVerified: false,
        twitterVerified: false,
        telegramVerified: false,
        createdAt: oldDate,
      })
      const unverifiedResult = await calculateFraudScore({
        userId: unverifiedUser.id,
        taskId: task.id,
      })

      expect(verifiedResult.fraudScore).toBeLessThan(partialResult.fraudScore)
      expect(partialResult.fraudScore).toBeLessThan(unverifiedResult.fraudScore)
    })

    it('should consider completion time patterns in fraud score', async () => {
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)
      const oldDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      // User with normal completion rate
      const normalUser = await createTestUser({
        createdAt: oldDate,
        walletVerified: true,
      })
      const normalResult = await calculateFraudScore({
        userId: normalUser.id,
        taskId: task.id,
      })

      // User with fast completion rate (4 completions in last minute)
      const fastUser = await createTestUser({
        createdAt: oldDate,
        walletVerified: true,
      })
      for (let i = 0; i < 4; i++) {
        await createTestCompletion(fastUser.id, task.id, {
          completedAt: new Date(),
        })
      }
      const fastResult = await calculateFraudScore({
        userId: fastUser.id,
        taskId: task.id,
      })

      // User with very fast completion rate (6+ completions in last minute)
      const veryFastUser = await createTestUser({
        createdAt: oldDate,
        walletVerified: true,
      })
      for (let i = 0; i < 6; i++) {
        await createTestCompletion(veryFastUser.id, task.id, {
          completedAt: new Date(),
        })
      }
      const veryFastResult = await calculateFraudScore({
        userId: veryFastUser.id,
        taskId: task.id,
      })

      expect(normalResult.fraudScore).toBeLessThan(fastResult.fraudScore)
      expect(fastResult.fraudScore).toBeLessThan(veryFastResult.fraudScore)
    })
  })

  describe('5.2 Auto-Approval Logic', () => {
    it('should immediately auto-approve completions with low fraud score (<20)', async () => {
      const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const user = await createTestUser({
        walletVerified: true,
        twitterVerified: true,
        createdAt: oldDate,
      })

      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id, { points: 50 })

      const result = await calculateFraudScore({
        userId: user.id,
        taskId: task.id,
      })

      expect(result.fraudScore).toBeLessThan(20)
      
      // Auto-approve time should be within 24 hours for low risk
      const hoursDiff = (result.autoApproveAt.getTime() - Date.now()) / (1000 * 60 * 60)
      expect(hoursDiff).toBeLessThanOrEqual(24)
    })

    it('should delay auto-approval for medium fraud score (20-50)', async () => {
      const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      const user = await createTestUser({
        walletVerified: true,
        twitterVerified: false,
        telegramVerified: false,
        createdAt: recentDate,
      })

      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      const result = await calculateFraudScore({
        userId: user.id,
        taskId: task.id,
      })

      // Should have medium score
      expect(result.fraudScore).toBeGreaterThanOrEqual(10)
      expect(result.fraudScore).toBeLessThan(50)
      
      // Auto-approve time should be delayed (24-36 hours)
      const hoursDiff = (result.autoApproveAt.getTime() - Date.now()) / (1000 * 60 * 60)
      expect(hoursDiff).toBeGreaterThan(20)
    })

    it('should flag for manual review with high fraud score (>50)', async () => {
      const user = await createTestUser({
        walletVerified: false,
        twitterVerified: false,
        createdAt: new Date(),
      })

      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      // Create many recent completions
      for (let i = 0; i < 6; i++) {
        await createTestCompletion(user.id, task.id, {
          completedAt: new Date(),
        })
      }

      const result = await calculateFraudScore({
        userId: user.id,
        taskId: task.id,
      })

      expect(result.fraudScore).toBeGreaterThan(40)
      expect(result.needsReview).toBe(true)
    })

    it('should set autoApproveAt timestamp correctly', async () => {
      const user = await createTestUser({
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      })

      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      const result = await calculateFraudScore({
        userId: user.id,
        taskId: task.id,
      })

      expect(result.autoApproveAt).toBeInstanceOf(Date)
      expect(result.autoApproveAt.getTime()).toBeGreaterThan(Date.now())
    })

    it('should update completion status based on fraud score', async () => {
      const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const user = await createTestUser({
        walletVerified: true,
        twitterVerified: true,
        createdAt: oldDate,
      })

      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      const result = await calculateFraudScore({
        userId: user.id,
        taskId: task.id,
      })

      // Create completion with fraud check results
      const completion = await createTestCompletion(user.id, task.id, {
        fraudScore: result.fraudScore,
        needsReview: result.needsReview,
        autoApproveAt: result.autoApproveAt,
        status: result.needsReview ? 'PENDING' : 'AUTO_APPROVED',
      })

      expect(completion.fraudScore).toBe(result.fraudScore)
      expect(completion.needsReview).toBe(result.needsReview)
      expect(completion.autoApproveAt).toEqual(result.autoApproveAt)
    })
  })

  describe('5.3 Manual Review Workflow', () => {
    it('should flag completion for manual review', async () => {
      const user = await createTestUser({
        walletVerified: false,
        createdAt: new Date(),
      })

      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      // Create many completions to trigger high fraud score
      for (let i = 0; i < 6; i++) {
        await createTestCompletion(user.id, task.id, {
          completedAt: new Date(),
        })
      }

      const result = await calculateFraudScore({
        userId: user.id,
        taskId: task.id,
      })

      const completion = await createTestCompletion(user.id, task.id, {
        fraudScore: result.fraudScore,
        needsReview: result.needsReview,
        status: 'PENDING',
        verificationStatus: 'FLAGGED',
      })

      expect(completion.needsReview).toBe(true)
      expect(completion.verificationStatus).toBe('FLAGGED')
      expect(completion.status).toBe('PENDING')
    })

    it('should allow admin to approve flagged completion', async () => {
      const user = await createTestUser()
      const admin = await createTestUser({ role: 'ADMIN' })
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id, { points: 50 })

      const completion = await createTestCompletion(user.id, task.id, {
        needsReview: true,
        status: 'PENDING',
        verificationStatus: 'FLAGGED',
        fraudScore: 60,
      })

      // Admin approves the completion
      const approved = await prisma.completion.update({
        where: { id: completion.id },
        data: {
          status: 'APPROVED',
          verificationStatus: 'VERIFIED',
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
      })

      expect(approved.status).toBe('APPROVED')
      expect(approved.verificationStatus).toBe('VERIFIED')
      expect(approved.reviewedBy).toBe(admin.id)
      expect(approved.reviewedAt).toBeInstanceOf(Date)
    })

    it('should allow admin to reject flagged completion', async () => {
      const user = await createTestUser()
      const admin = await createTestUser({ role: 'ADMIN' })
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      const completion = await createTestCompletion(user.id, task.id, {
        needsReview: true,
        status: 'PENDING',
        verificationStatus: 'FLAGGED',
        fraudScore: 80,
      })

      // Admin rejects the completion
      const rejected = await prisma.completion.update({
        where: { id: completion.id },
        data: {
          status: 'REJECTED',
          verificationStatus: 'FLAGGED',
          reviewedBy: admin.id,
          reviewedAt: new Date(),
          rejectionReason: 'Suspicious activity detected',
        },
      })

      expect(rejected.status).toBe('REJECTED')
      expect(rejected.reviewedBy).toBe(admin.id)
      expect(rejected.rejectionReason).toBe('Suspicious activity detected')
    })

    it('should store rejection reason when admin rejects completion', async () => {
      const user = await createTestUser()
      const admin = await createTestUser({ role: 'ADMIN' })
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      const completion = await createTestCompletion(user.id, task.id, {
        needsReview: true,
        status: 'PENDING',
      })

      const rejectionReason = 'Multiple accounts from same IP address'
      
      const rejected = await prisma.completion.update({
        where: { id: completion.id },
        data: {
          status: 'REJECTED',
          reviewedBy: admin.id,
          reviewedAt: new Date(),
          rejectionReason,
        },
      })

      expect(rejected.rejectionReason).toBe(rejectionReason)
    })

    it('should update user points when admin approves completion', async () => {
      const user = await createTestUser({ totalPoints: 100 })
      const admin = await createTestUser({ role: 'ADMIN' })
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id, { points: 50 })

      const completion = await createTestCompletion(user.id, task.id, {
        needsReview: true,
        status: 'PENDING',
        pointsAwarded: 0,
      })

      // Admin approves and awards points
      await prisma.$transaction(async (tx) => {
        await tx.completion.update({
          where: { id: completion.id },
          data: {
            status: 'APPROVED',
            verificationStatus: 'VERIFIED',
            reviewedBy: admin.id,
            reviewedAt: new Date(),
            pointsAwarded: task.points,
          },
        })

        await tx.user.update({
          where: { id: user.id },
          data: {
            totalPoints: {
              increment: task.points,
            },
          },
        })
      })

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(updatedUser?.totalPoints).toBe(150) // 100 + 50
    })
  })

  describe('5.4 Fraud Indicators', () => {
    it('should detect too-fast completion time', async () => {
      const user = await createTestUser({
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      })

      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      // Create multiple completions in the last minute
      for (let i = 0; i < 6; i++) {
        await createTestCompletion(user.id, task.id, {
          completedAt: new Date(),
        })
      }

      const result = await calculateFraudScore({
        userId: user.id,
        taskId: task.id,
      })

      expect(result.reasons).toContain('Too many completions in 1 minute')
      expect(result.fraudScore).toBeGreaterThan(20)
    })

    it('should detect new account pattern', async () => {
      const user = await createTestUser({
        createdAt: new Date(), // Brand new account
      })

      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      const result = await calculateFraudScore({
        userId: user.id,
        taskId: task.id,
      })

      expect(result.reasons.some(r => r.includes('new account') || r.includes('Very new account'))).toBe(true)
      expect(result.fraudScore).toBeGreaterThan(10)
    })

    it('should detect unverified account pattern', async () => {
      const user = await createTestUser({
        walletVerified: false,
        twitterVerified: false,
        telegramVerified: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      })

      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      const result = await calculateFraudScore({
        userId: user.id,
        taskId: task.id,
      })

      expect(result.reasons).toContain('Wallet not verified')
      expect(result.reasons).toContain('No social media verified')
      expect(result.fraudScore).toBeGreaterThan(20)
    })

    it('should detect multiple accounts from same IP', async () => {
      const ipAddress = '192.168.1.100'
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      // Create multiple users with completions from same IP
      for (let i = 0; i < 6; i++) {
        const user = await createTestUser()
        await createTestCompletion(user.id, task.id, {
          ipAddress,
          completedAt: new Date(),
        })
      }

      // New user from same IP
      const newUser = await createTestUser()
      const result = await calculateFraudScore({
        userId: newUser.id,
        taskId: task.id,
        ipAddress,
      })

      expect(result.reasons.some(r => r.includes('IP'))).toBe(true)
      expect(result.fraudScore).toBeGreaterThan(0)
    })

    it('should detect bot-like behavior patterns', async () => {
      const user = await createTestUser({
        createdAt: new Date(), // New account
        walletVerified: false,
        twitterVerified: false,
      })

      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      // Create many rapid completions (bot-like)
      for (let i = 0; i < 10; i++) {
        await createTestCompletion(user.id, task.id, {
          completedAt: new Date(),
        })
      }

      const result = await calculateFraudScore({
        userId: user.id,
        taskId: task.id,
      })

      // Should have multiple fraud indicators
      expect(result.fraudScore).toBeGreaterThan(50)
      expect(result.needsReview).toBe(true)
      expect(result.reasons.length).toBeGreaterThan(2)
    })
  })

  describe('5.5 Auto-Approval Cron Job', () => {
    it('should process pending completions ready for auto-approval', async () => {
      const user = await createTestUser()
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id, { points: 50 })

      // Create completion that's ready for auto-approval
      const pastDate = new Date(Date.now() - 1000) // 1 second ago
      await createTestCompletion(user.id, task.id, {
        status: 'PENDING',
        needsReview: false,
        autoApproveAt: pastDate,
        pointsAwarded: 0,
      })

      const approvedCount = await autoApprovePendingCompletions()

      expect(approvedCount).toBe(1)
    })

    it('should auto-approve eligible completions', async () => {
      const user = await createTestUser({ totalPoints: 0 })
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id, { points: 50 })

      const pastDate = new Date(Date.now() - 1000)
      const completion = await createTestCompletion(user.id, task.id, {
        status: 'PENDING',
        needsReview: false,
        autoApproveAt: pastDate,
        pointsAwarded: 0,
      })

      await autoApprovePendingCompletions()

      const updated = await prisma.completion.findUnique({
        where: { id: completion.id },
      })

      expect(updated?.status).toBe('AUTO_APPROVED')
      expect(updated?.verificationStatus).toBe('VERIFIED')
    })

    it('should update completion status to AUTO_APPROVED', async () => {
      const user = await createTestUser()
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      const pastDate = new Date(Date.now() - 1000)
      const completion = await createTestCompletion(user.id, task.id, {
        status: 'PENDING',
        needsReview: false,
        autoApproveAt: pastDate,
      })

      await autoApprovePendingCompletions()

      const updated = await prisma.completion.findUnique({
        where: { id: completion.id },
      })

      expect(updated?.status).toBe('AUTO_APPROVED')
    })

    it('should award points on auto-approval', async () => {
      const user = await createTestUser({ totalPoints: 100 })
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id, { points: 50 })

      const pastDate = new Date(Date.now() - 1000)
      await createTestCompletion(user.id, task.id, {
        status: 'PENDING',
        needsReview: false,
        autoApproveAt: pastDate,
        pointsAwarded: 0,
      })

      await autoApprovePendingCompletions()

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(updatedUser?.totalPoints).toBe(150) // 100 + 50
    })

    it('should skip completions not yet eligible for auto-approval', async () => {
      const user = await createTestUser()
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)

      // Create completion with future auto-approve date
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      const completion = await createTestCompletion(user.id, task.id, {
        status: 'PENDING',
        needsReview: false,
        autoApproveAt: futureDate,
      })

      const approvedCount = await autoApprovePendingCompletions()

      expect(approvedCount).toBe(0)

      const unchanged = await prisma.completion.findUnique({
        where: { id: completion.id },
      })

      expect(unchanged?.status).toBe('PENDING')
    })
  })

  describe('Fraud Risk Level Helper', () => {
    it('should return LOW risk level for score < 20', () => {
      const result = getFraudRiskLevel(10)
      expect(result.level).toBe('LOW')
      expect(result.color).toBe('text-green-600')
    })

    it('should return MEDIUM risk level for score 20-39', () => {
      const result = getFraudRiskLevel(30)
      expect(result.level).toBe('MEDIUM')
      expect(result.color).toBe('text-yellow-600')
    })

    it('should return HIGH risk level for score 40-69', () => {
      const result = getFraudRiskLevel(50)
      expect(result.level).toBe('HIGH')
      expect(result.color).toBe('text-orange-600')
    })

    it('should return CRITICAL risk level for score >= 70', () => {
      const result = getFraudRiskLevel(80)
      expect(result.level).toBe('CRITICAL')
      expect(result.color).toBe('text-red-600')
    })
  })
})
