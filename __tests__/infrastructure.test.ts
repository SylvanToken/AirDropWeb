/**
 * Test Infrastructure Verification
 * Tests to ensure test utilities and database setup work correctly
 */

import {
  createTestUser,
  createTestCampaign,
  createTestTask,
  createTestCompletion,
  createAuthSession,
  cleanDatabase,
  getTodayMidnight,
  getYesterdayMidnight,
  createTestUsers,
  createTestScenario,
} from './utils/test-helpers'
import { prisma } from '@/lib/prisma'

describe('Test Infrastructure', () => {
  describe('Test Utilities', () => {
    it('should create a test user', async () => {
      const user = await createTestUser()
      
      expect(user).toBeDefined()
      expect(user.id).toBeDefined()
      expect(user.email).toContain('@example.com')
      expect(user.username).toBeDefined()
      expect(user.role).toBe('USER')
    })

    it('should create a test user with overrides', async () => {
      const user = await createTestUser({
        email: 'custom@test.com',
        role: 'ADMIN',
        totalPoints: 100,
      })
      
      expect(user.email).toBe('custom@test.com')
      expect(user.role).toBe('ADMIN')
      expect(user.totalPoints).toBe(100)
    })

    it('should create a test campaign', async () => {
      const campaign = await createTestCampaign()
      
      expect(campaign).toBeDefined()
      expect(campaign.id).toBeDefined()
      expect(campaign.title).toContain('Test Campaign')
      expect(campaign.isActive).toBe(true)
      expect(campaign.startDate).toBeInstanceOf(Date)
      expect(campaign.endDate).toBeInstanceOf(Date)
    })

    it('should create a test task', async () => {
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)
      
      expect(task).toBeDefined()
      expect(task.id).toBeDefined()
      expect(task.campaignId).toBe(campaign.id)
      expect(task.title).toContain('Test Task')
      expect(task.points).toBe(10)
      expect(task.isActive).toBe(true)
    })

    it('should create a test completion', async () => {
      const user = await createTestUser()
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)
      const completion = await createTestCompletion(user.id, task.id)
      
      expect(completion).toBeDefined()
      expect(completion.id).toBeDefined()
      expect(completion.userId).toBe(user.id)
      expect(completion.taskId).toBe(task.id)
      expect(completion.status).toBe('PENDING')
    })

    it('should create an auth session token', async () => {
      const user = await createTestUser()
      const token = createAuthSession(user)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should create multiple test users', async () => {
      const users = await createTestUsers(3)
      
      expect(users).toHaveLength(3)
      expect(users[0].email).not.toBe(users[1].email)
      expect(users[1].email).not.toBe(users[2].email)
    })

    it('should create a complete test scenario', async () => {
      const scenario = await createTestScenario()
      
      expect(scenario.campaign).toBeDefined()
      expect(scenario.tasks).toHaveLength(2)
      expect(scenario.user).toBeDefined()
      expect(scenario.admin).toBeDefined()
      expect(scenario.admin.role).toBe('ADMIN')
    })
  })

  describe('Database Operations', () => {
    it('should clean database successfully', async () => {
      // Create some test data
      await createTestUser()
      await createTestCampaign()
      
      // Verify data exists
      const usersBefore = await prisma.user.count()
      const campaignsBefore = await prisma.campaign.count()
      expect(usersBefore).toBeGreaterThan(0)
      expect(campaignsBefore).toBeGreaterThan(0)
      
      // Clean database
      await cleanDatabase()
      
      // Verify data is cleaned
      const usersAfter = await prisma.user.count()
      const campaignsAfter = await prisma.campaign.count()
      expect(usersAfter).toBe(0)
      expect(campaignsAfter).toBe(0)
    })

    it('should maintain foreign key constraints', async () => {
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)
      
      // Verify task is linked to campaign
      const taskWithCampaign = await prisma.task.findUnique({
        where: { id: task.id },
        include: { campaign: true },
      })
      
      expect(taskWithCampaign?.campaign.id).toBe(campaign.id)
    })

    it('should cascade delete tasks when campaign is deleted', async () => {
      const campaign = await createTestCampaign()
      const task = await createTestTask(campaign.id)
      
      // Delete campaign
      await prisma.campaign.delete({ where: { id: campaign.id } })
      
      // Verify task is also deleted
      const deletedTask = await prisma.task.findUnique({
        where: { id: task.id },
      })
      
      expect(deletedTask).toBeNull()
    })
  })

  describe('Date Utilities', () => {
    it('should get today at midnight', () => {
      const today = getTodayMidnight()
      
      expect(today).toBeInstanceOf(Date)
      expect(today.getHours()).toBe(0)
      expect(today.getMinutes()).toBe(0)
      expect(today.getSeconds()).toBe(0)
      expect(today.getMilliseconds()).toBe(0)
    })

    it('should get yesterday at midnight', () => {
      const yesterday = getYesterdayMidnight()
      const today = getTodayMidnight()
      
      expect(yesterday).toBeInstanceOf(Date)
      expect(yesterday.getTime()).toBeLessThan(today.getTime())
      expect(yesterday.getHours()).toBe(0)
      expect(yesterday.getMinutes()).toBe(0)
    })
  })

  describe('Test Isolation', () => {
    it('should have clean database at start of test', async () => {
      const userCount = await prisma.user.count()
      const campaignCount = await prisma.campaign.count()
      
      expect(userCount).toBe(0)
      expect(campaignCount).toBe(0)
    })

    it('should not see data from previous test', async () => {
      // This test should not see any data from the previous test
      const userCount = await prisma.user.count()
      expect(userCount).toBe(0)
      
      // Create data for this test
      await createTestUser()
      const userCountAfter = await prisma.user.count()
      expect(userCountAfter).toBe(1)
    })
  })
})
