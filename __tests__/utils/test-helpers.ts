/**
 * Test Helper Utilities
 * Provides reusable functions for creating test data and managing test database
 */

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { User, Campaign, Task, Completion } from '@prisma/client'

/**
 * Create test user with optional overrides
 */
export async function createTestUser(
  overrides?: Partial<User>
): Promise<User> {
  const defaultPassword = 'Test123!'
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  return await prisma.user.create({
    data: {
      email: `test-${Date.now()}-${Math.random()}@example.com`,
      username: `testuser-${Date.now()}-${Math.random()}`,
      password: hashedPassword,
      role: 'USER',
      totalPoints: 0,
      acceptedTerms: true,
      acceptedPrivacy: true,
      ...overrides,
    },
  })
}

/**
 * Create test campaign with optional overrides
 */
export async function createTestCampaign(
  overrides?: Partial<Campaign>
): Promise<Campaign> {
  const now = new Date()
  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

  return await prisma.campaign.create({
    data: {
      title: `Test Campaign ${Date.now()}`,
      description: 'Test campaign description',
      startDate: now,
      endDate: futureDate,
      isActive: true,
      ...overrides,
    },
  })
}

/**
 * Create test task with optional overrides
 */
export async function createTestTask(
  campaignId: string,
  overrides?: Partial<Task>
): Promise<Task> {
  return await prisma.task.create({
    data: {
      campaignId,
      title: `Test Task ${Date.now()}`,
      description: 'Test task description',
      points: 10,
      taskType: 'TWITTER_FOLLOW',
      taskUrl: 'https://twitter.com/test',
      isActive: true,
      ...overrides,
    },
  })
}

/**
 * Create test completion with optional overrides
 */
export async function createTestCompletion(
  userId: string,
  taskId: string,
  overrides?: Partial<Completion>
): Promise<Completion> {
  return await prisma.completion.create({
    data: {
      userId,
      taskId,
      pointsAwarded: 10,
      status: 'PENDING',
      verificationStatus: 'UNVERIFIED',
      fraudScore: 0,
      ...overrides,
    },
  })
}

/**
 * Create authenticated session token for testing
 */
export function createAuthSession(user: User): string {
  const secret = process.env.NEXTAUTH_SECRET || 'test-secret'
  
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: '7d' }
  )
  
  return token
}

/**
 * Clean database between tests
 * Deletes all records in the correct order to respect foreign key constraints
 */
export async function cleanDatabase(): Promise<void> {
  // Delete in order to respect foreign key constraints
  await prisma.completion.deleteMany()
  await prisma.task.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.loginLog.deleteMany()
  await prisma.searchHistory.deleteMany()
  await prisma.filterPreset.deleteMany()
  await prisma.workflow.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()
}

/**
 * Mock authenticated API request
 * Simulates an authenticated request with proper headers
 */
export function mockAuthenticatedRequest(
  method: string,
  url: string,
  token: string,
  body?: any
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Cookie: `next-auth.session-token=${token}`,
  }

  const options: RequestInit = {
    method,
    headers,
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  return fetch(url, options)
}

/**
 * Wait for a specified amount of time (for testing async operations)
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get today's date at midnight (for testing daily completions)
 */
export function getTodayMidnight(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

/**
 * Get yesterday's date at midnight
 */
export function getYesterdayMidnight(): Date {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  return yesterday
}

/**
 * Create multiple test users at once
 */
export async function createTestUsers(count: number): Promise<User[]> {
  const users: User[] = []
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      email: `test-${i}-${Date.now()}@example.com`,
      username: `testuser-${i}-${Date.now()}`,
    })
    users.push(user)
  }
  return users
}

/**
 * Create a complete test scenario with campaign, tasks, and users
 */
export async function createTestScenario() {
  const campaign = await createTestCampaign()
  const task1 = await createTestTask(campaign.id, {
    title: 'Twitter Follow Task',
    taskType: 'TWITTER_FOLLOW',
    points: 10,
  })
  const task2 = await createTestTask(campaign.id, {
    title: 'Telegram Join Task',
    taskType: 'TELEGRAM_JOIN',
    points: 15,
  })
  const user = await createTestUser()
  const admin = await createTestUser({ role: 'ADMIN' })

  return {
    campaign,
    tasks: [task1, task2],
    user,
    admin,
  }
}
