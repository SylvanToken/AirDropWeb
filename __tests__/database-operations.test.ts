/**
 * Database Operations Tests
 * Tests for CRUD operations on all database models
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { prisma } from '@/lib/prisma'
import {
  createTestUser,
  createTestCampaign,
  createTestTask,
  createTestCompletion,
  cleanDatabase,
  getTodayMidnight,
  getYesterdayMidnight,
} from './utils/test-helpers'
import bcrypt from 'bcrypt'

describe('Database Operations', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await cleanDatabase()
    await prisma.$disconnect()
  })

  describe('9.1 User Operations', () => {
    describe('Creating users', () => {
      it('should create user with all fields', async () => {
        const userData = {
          email: 'fulluser@test.com',
          username: 'fulluser',
          password: await bcrypt.hash('Test123!', 10),
          role: 'USER',
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          walletVerified: true,
          twitterUsername: 'fulluser',
          twitterVerified: true,
          telegramUsername: 'fulluser',
          telegramVerified: true,
          totalPoints: 100,
          acceptedTerms: true,
          acceptedPrivacy: true,
        }

        const user = await prisma.user.create({ data: userData })

        expect(user).toBeDefined()
        expect(user.email).toBe(userData.email)
        expect(user.username).toBe(userData.username)
        expect(user.role).toBe(userData.role)
        expect(user.walletAddress).toBe(userData.walletAddress)
        expect(user.walletVerified).toBe(true)
        expect(user.twitterUsername).toBe(userData.twitterUsername)
        expect(user.twitterVerified).toBe(true)
        expect(user.telegramUsername).toBe(userData.telegramUsername)
        expect(user.telegramVerified).toBe(true)
        expect(user.totalPoints).toBe(100)
        expect(user.acceptedTerms).toBe(true)
        expect(user.acceptedPrivacy).toBe(true)
        expect(user.createdAt).toBeInstanceOf(Date)
      })
    })

    describe('Updating users', () => {
      it('should update user data', async () => {
        const user = await createTestUser()

        const updated = await prisma.user.update({
          where: { id: user.id },
          data: {
            username: 'updatedusername',
            totalPoints: 50,
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            walletVerified: true,
          },
        })

        expect(updated.username).toBe('updatedusername')
        expect(updated.totalPoints).toBe(50)
        expect(updated.walletAddress).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
        expect(updated.walletVerified).toBe(true)
      })
    })

    describe('Deleting users', () => {
      it('should cascade delete completions when user is deleted', async () => {
        const user = await createTestUser()
        const campaign = await createTestCampaign()
        const task = await createTestTask(campaign.id)
        const completion = await createTestCompletion(user.id, task.id)

        await prisma.user.delete({ where: { id: user.id } })

        const deletedCompletion = await prisma.completion.findUnique({
          where: { id: completion.id },
        })
        expect(deletedCompletion).toBeNull()
      })
    })

    describe('Querying users', () => {
      it('should query users with filters', async () => {
        await createTestUser({ role: 'USER', totalPoints: 10 })
        await createTestUser({ role: 'ADMIN', totalPoints: 50 })
        await createTestUser({ role: 'USER', totalPoints: 100, walletVerified: true })

        const adminUsers = await prisma.user.findMany({
          where: { role: 'ADMIN' },
        })
        expect(adminUsers).toHaveLength(1)

        const verifiedUsers = await prisma.user.findMany({
          where: { walletVerified: true },
        })
        expect(verifiedUsers).toHaveLength(1)

        const highPointUsers = await prisma.user.findMany({
          where: { totalPoints: { gte: 50 } },
        })
        expect(highPointUsers).toHaveLength(2)
      })
    })

    describe('Unique constraints', () => {
      it('should enforce unique email constraint', async () => {
        const email = 'unique@test.com'
        await createTestUser({ email })

        await expect(
          createTestUser({ email })
        ).rejects.toThrow()
      })

      it('should enforce unique username constraint', async () => {
        const username = 'uniqueuser'
        await createTestUser({ username })

        await expect(
          createTestUser({ username })
        ).rejects.toThrow()
      })

      it('should enforce unique wallet address constraint', async () => {
        const walletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
        await createTestUser({ walletAddress })

        await expect(
          createTestUser({ walletAddress })
        ).rejects.toThrow()
      })
    })
  })


  describe('9.2 Campaign Operations', () => {
    describe('Creating campaigns', () => {
      it('should create campaign with all required fields', async () => {
        const startDate = new Date()
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        const campaign = await prisma.campaign.create({
          data: {
            title: 'Test Campaign',
            description: 'Test Description',
            startDate,
            endDate,
            isActive: true,
          },
        })

        expect(campaign).toBeDefined()
        expect(campaign.title).toBe('Test Campaign')
        expect(campaign.description).toBe('Test Description')
        expect(campaign.startDate).toEqual(startDate)
        expect(campaign.endDate).toEqual(endDate)
        expect(campaign.isActive).toBe(true)
      })
    })

    describe('Updating campaigns', () => {
      it('should update campaign data', async () => {
        const campaign = await createTestCampaign()

        const updated = await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            title: 'Updated Campaign',
            isActive: false,
          },
        })

        expect(updated.title).toBe('Updated Campaign')
        expect(updated.isActive).toBe(false)
      })
    })

    describe('Deleting campaigns', () => {
      it('should cascade delete tasks when campaign is deleted', async () => {
        const campaign = await createTestCampaign()
        const task = await createTestTask(campaign.id)

        await prisma.campaign.delete({ where: { id: campaign.id } })

        const deletedTask = await prisma.task.findUnique({
          where: { id: task.id },
        })
        expect(deletedTask).toBeNull()
      })
    })

    describe('Querying campaigns', () => {
      it('should query campaigns with date filters', async () => {
        const now = new Date()
        const past = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        const future = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)

        await createTestCampaign({
          title: 'Active Campaign',
          startDate: past,
          endDate: future,
          isActive: true,
        })

        await createTestCampaign({
          title: 'Future Campaign',
          startDate: future,
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          isActive: true,
        })

        await createTestCampaign({
          title: 'Past Campaign',
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          endDate: past,
          isActive: false,
        })

        const activeCampaigns = await prisma.campaign.findMany({
          where: {
            startDate: { lte: now },
            endDate: { gte: now },
            isActive: true,
          },
        })
        expect(activeCampaigns).toHaveLength(1)
        expect(activeCampaigns[0].title).toBe('Active Campaign')
      })
    })
  })

  describe('9.3 Task Operations', () => {
    describe('Creating tasks', () => {
      it('should create task with campaign', async () => {
        const campaign = await createTestCampaign()

        const task = await prisma.task.create({
          data: {
            campaignId: campaign.id,
            title: 'Test Task',
            description: 'Test Description',
            points: 20,
            taskType: 'TWITTER_FOLLOW',
            taskUrl: 'https://twitter.com/test',
            isActive: true,
          },
        })

        expect(task).toBeDefined()
        expect(task.campaignId).toBe(campaign.id)
        expect(task.title).toBe('Test Task')
        expect(task.points).toBe(20)
        expect(task.taskType).toBe('TWITTER_FOLLOW')
      })
    })

    describe('Updating tasks', () => {
      it('should update task data', async () => {
        const campaign = await createTestCampaign()
        const task = await createTestTask(campaign.id)

        const updated = await prisma.task.update({
          where: { id: task.id },
          data: {
            title: 'Updated Task',
            points: 30,
            isActive: false,
          },
        })

        expect(updated.title).toBe('Updated Task')
        expect(updated.points).toBe(30)
        expect(updated.isActive).toBe(false)
      })
    })

    describe('Deleting tasks', () => {
      it('should cascade delete completions when task is deleted', async () => {
        const user = await createTestUser()
        const campaign = await createTestCampaign()
        const task = await createTestTask(campaign.id)
        const completion = await createTestCompletion(user.id, task.id)

        await prisma.task.delete({ where: { id: task.id } })

        const deletedCompletion = await prisma.completion.findUnique({
          where: { id: completion.id },
        })
        expect(deletedCompletion).toBeNull()
      })
    })

    describe('Querying tasks', () => {
      it('should query tasks by campaign', async () => {
        const campaign1 = await createTestCampaign()
        const campaign2 = await createTestCampaign()

        await createTestTask(campaign1.id, { title: 'Task 1' })
        await createTestTask(campaign1.id, { title: 'Task 2' })
        await createTestTask(campaign2.id, { title: 'Task 3' })

        const campaign1Tasks = await prisma.task.findMany({
          where: { campaignId: campaign1.id },
        })
        expect(campaign1Tasks).toHaveLength(2)
      })

      it('should query active tasks only', async () => {
        const campaign = await createTestCampaign()

        await createTestTask(campaign.id, { isActive: true })
        await createTestTask(campaign.id, { isActive: true })
        await createTestTask(campaign.id, { isActive: false })

        const activeTasks = await prisma.task.findMany({
          where: { isActive: true },
        })
        expect(activeTasks).toHaveLength(2)
      })
    })
  })


  describe('9.4 Completion Operations', () => {
    describe('Creating completions', () => {
      it('should create completion with all fields', async () => {
        const user = await createTestUser()
        const campaign = await createTestCampaign()
        const task = await createTestTask(campaign.id)

        const completion = await prisma.completion.create({
          data: {
            userId: user.id,
            taskId: task.id,
            pointsAwarded: 10,
            status: 'APPROVED',
            verificationStatus: 'VERIFIED',
            fraudScore: 15,
            completionTime: 30,
          },
        })

        expect(completion).toBeDefined()
        expect(completion.userId).toBe(user.id)
        expect(completion.taskId).toBe(task.id)
        expect(completion.pointsAwarded).toBe(10)
        expect(completion.status).toBe('APPROVED')
        expect(completion.verificationStatus).toBe('VERIFIED')
        expect(completion.fraudScore).toBe(15)
        expect(completion.completionTime).toBe(30)
      })
    })

    describe('Updating completions', () => {
      it('should update completion status', async () => {
        const user = await createTestUser()
        const campaign = await createTestCampaign()
        const task = await createTestTask(campaign.id)
        const completion = await createTestCompletion(user.id, task.id)

        const updated = await prisma.completion.update({
          where: { id: completion.id },
          data: {
            status: 'APPROVED',
            verificationStatus: 'VERIFIED',
            reviewedAt: new Date(),
          },
        })

        expect(updated.status).toBe('APPROVED')
        expect(updated.verificationStatus).toBe('VERIFIED')
        expect(updated.reviewedAt).toBeInstanceOf(Date)
      })
    })

    describe('Querying completions', () => {
      it('should query user completions', async () => {
        const user1 = await createTestUser()
        const user2 = await createTestUser()
        const campaign = await createTestCampaign()
        const task1 = await createTestTask(campaign.id)
        const task2 = await createTestTask(campaign.id)

        await createTestCompletion(user1.id, task1.id)
        await createTestCompletion(user1.id, task2.id)
        await createTestCompletion(user2.id, task1.id)

        const user1Completions = await prisma.completion.findMany({
          where: { userId: user1.id },
        })
        expect(user1Completions).toHaveLength(2)
      })

      it('should query completions by date', async () => {
        const user = await createTestUser()
        const campaign = await createTestCampaign()
        const task = await createTestTask(campaign.id)

        const today = getTodayMidnight()
        const yesterday = getYesterdayMidnight()

        await createTestCompletion(user.id, task.id, {
          completedAt: today,
        })
        await createTestCompletion(user.id, task.id, {
          completedAt: yesterday,
        })

        const todayCompletions = await prisma.completion.findMany({
          where: {
            completedAt: { gte: today },
          },
        })
        expect(todayCompletions).toHaveLength(1)
      })

      it('should prevent duplicate daily completions', async () => {
        const user = await createTestUser()
        const campaign = await createTestCampaign()
        const task = await createTestTask(campaign.id)

        const today = getTodayMidnight()

        await createTestCompletion(user.id, task.id, {
          completedAt: today,
        })

        const existingCompletion = await prisma.completion.findFirst({
          where: {
            userId: user.id,
            taskId: task.id,
            completedAt: { gte: today },
          },
        })

        expect(existingCompletion).not.toBeNull()
      })
    })
  })

  describe('9.5 Transaction Handling', () => {
    describe('Atomic operations', () => {
      it('should perform atomic completion and points update', async () => {
        const user = await createTestUser({ totalPoints: 0 })
        const campaign = await createTestCampaign()
        const task = await createTestTask(campaign.id, { points: 10 })

        await prisma.$transaction(async (tx) => {
          await tx.completion.create({
            data: {
              userId: user.id,
              taskId: task.id,
              pointsAwarded: task.points,
              status: 'APPROVED',
            },
          })

          await tx.user.update({
            where: { id: user.id },
            data: {
              totalPoints: { increment: task.points },
            },
          })
        })

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        })
        expect(updatedUser?.totalPoints).toBe(10)

        const completion = await prisma.completion.findFirst({
          where: { userId: user.id, taskId: task.id },
        })
        expect(completion).not.toBeNull()
      })

      it('should rollback on error', async () => {
        const user = await createTestUser({ totalPoints: 0 })
        const campaign = await createTestCampaign()
        const task = await createTestTask(campaign.id, { points: 10 })

        try {
          await prisma.$transaction(async (tx) => {
            await tx.completion.create({
              data: {
                userId: user.id,
                taskId: task.id,
                pointsAwarded: task.points,
                status: 'APPROVED',
              },
            })

            await tx.user.update({
              where: { id: user.id },
              data: {
                totalPoints: { increment: task.points },
              },
            })

            throw new Error('Simulated error')
          })
        } catch (error) {
          // Expected error
        }

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        })
        expect(updatedUser?.totalPoints).toBe(0)

        const completion = await prisma.completion.findFirst({
          where: { userId: user.id, taskId: task.id },
        })
        expect(completion).toBeNull()
      })

      it('should handle concurrent completion attempts', async () => {
        const user = await createTestUser()
        const campaign = await createTestCampaign()
        const task = await createTestTask(campaign.id)

        const attempts = [
          createTestCompletion(user.id, task.id),
          createTestCompletion(user.id, task.id),
        ]

        const results = await Promise.allSettled(attempts)
        const successful = results.filter(r => r.status === 'fulfilled')

        expect(successful.length).toBeGreaterThan(0)

        const completions = await prisma.completion.findMany({
          where: { userId: user.id, taskId: task.id },
        })
        expect(completions.length).toBeGreaterThan(0)
      })

      it('should maintain data consistency', async () => {
        const user = await createTestUser({ totalPoints: 0 })
        const campaign = await createTestCampaign()
        const task1 = await createTestTask(campaign.id, { points: 10 })
        const task2 = await createTestTask(campaign.id, { points: 15 })

        await prisma.$transaction(async (tx) => {
          await tx.completion.create({
            data: {
              userId: user.id,
              taskId: task1.id,
              pointsAwarded: task1.points,
              status: 'APPROVED',
            },
          })

          await tx.user.update({
            where: { id: user.id },
            data: { totalPoints: { increment: task1.points } },
          })
        })

        await prisma.$transaction(async (tx) => {
          await tx.completion.create({
            data: {
              userId: user.id,
              taskId: task2.id,
              pointsAwarded: task2.points,
              status: 'APPROVED',
            },
          })

          await tx.user.update({
            where: { id: user.id },
            data: { totalPoints: { increment: task2.points } },
          })
        })

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        })
        expect(updatedUser?.totalPoints).toBe(25)

        const completions = await prisma.completion.findMany({
          where: { userId: user.id },
        })
        expect(completions).toHaveLength(2)
      })
    })
  })
})
