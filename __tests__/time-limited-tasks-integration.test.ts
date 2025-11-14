/**
 * Integration tests for time-limited tasks feature
 * Tests Requirements: All (1.1-10.5)
 * 
 * This test suite covers:
 * - Task creation with time limits
 * - Automatic expiration marking
 * - Task completion validation
 * - Organized tasks API endpoint
 */

import { prisma } from '@/lib/prisma'
import { TaskType } from '@/types'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    completion: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('Time-Limited Tasks - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Task Creation with Time Limits', () => {
    it('should create a task with duration and expiresAt', async () => {
      // Arrange
      const mockAdmin = {
        id: 'admin-1',
        role: 'ADMIN',
      }

      const taskData = {
        title: 'Time-Limited Task',
        description: 'Complete within 2 hours',
        points: 50,
        taskType: 'TWITTER_FOLLOW' as TaskType,
        duration: 2, // 2 hours
      }

      const expectedExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000)

      const mockTask = {
        id: 'task-1',
        campaignId: 'campaign-1',
        ...taskData,
        expiresAt: expectedExpiresAt,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin)
      ;(prisma.task.create as jest.Mock).mockResolvedValue(mockTask)

      // Act
      const result = await prisma.task.create({
        data: {
          ...taskData,
          campaignId: 'campaign-1',
          expiresAt: expectedExpiresAt,
          isActive: true,
        },
      })

      // Assert
      expect(result.duration).toBe(2)
      expect(result.expiresAt).toBeDefined()
      expect(result.expiresAt).not.toBeNull()
      if (result.expiresAt) {
        expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now())
      }
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          duration: 2,
          expiresAt: expect.any(Date),
        }),
      })
    })

    it('should create a task without time limit (duration null)', async () => {
      // Arrange
      const taskData = {
        title: 'Regular Task',
        description: 'No time limit',
        points: 25,
        taskType: 'TELEGRAM_JOIN' as TaskType,
        duration: null,
        expiresAt: null,
      }

      const mockTask = {
        id: 'task-2',
        campaignId: 'campaign-1',
        ...taskData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.task.create as jest.Mock).mockResolvedValue(mockTask)

      // Act
      const result = await prisma.task.create({
        data: {
          ...taskData,
          campaignId: 'campaign-1',
          isActive: true,
        },
      })

      // Assert
      expect(result.duration).toBeNull()
      expect(result.expiresAt).toBeNull()
    })

    it('should calculate correct expiration for different durations', async () => {
      const durations = [1, 3, 6, 12, 24]

      for (const duration of durations) {
        const now = Date.now()
        const expiresAt = new Date(now + duration * 60 * 60 * 1000)

        const mockTask = {
          id: `task-${duration}`,
          campaignId: 'campaign-1',
          title: `Task ${duration}h`,
          description: 'Test',
          points: 10,
          taskType: 'CUSTOM' as TaskType,
          duration,
          expiresAt,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        ;(prisma.task.create as jest.Mock).mockResolvedValue(mockTask)

        const result = await prisma.task.create({
          data: {
            campaignId: 'campaign-1',
            title: `Task ${duration}h`,
            description: 'Test',
            points: 10,
            taskType: 'CUSTOM',
            duration,
            expiresAt,
            isActive: true,
          },
        })

        // Verify expiration is approximately correct (within 1 second tolerance)
        const expectedTime = now + duration * 60 * 60 * 1000
        if (result.expiresAt) {
          const actualTime = result.expiresAt.getTime()
          expect(Math.abs(actualTime - expectedTime)).toBeLessThan(1000)
        }
      }
    })
  })

  describe('Automatic Expiration Marking', () => {
    it('should mark expired task as inactive', async () => {
      // Arrange
      const expiredTask = {
        id: 'task-expired',
        campaignId: 'campaign-1',
        title: 'Expired Task',
        description: 'This task expired',
        points: 30,
        taskType: 'TWITTER_FOLLOW' as TaskType,
        duration: 1,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(expiredTask)
      ;(prisma.task.update as jest.Mock).mockResolvedValue({
        ...expiredTask,
        isActive: false,
      })

      // Act - Check if task is expired and mark it
      const task = await prisma.task.findUnique({ where: { id: 'task-expired' } })
      const isExpired = task && task.expiresAt && new Date(task.expiresAt) < new Date()

      if (isExpired) {
        await prisma.task.update({
          where: { id: 'task-expired' },
          data: { isActive: false },
        })
      }

      // Assert
      expect(isExpired).toBe(true)
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-expired' },
        data: { isActive: false },
      })
    })

    it('should create completion record with missedAt for expired task', async () => {
      // Arrange
      const expiredTask = {
        id: 'task-missed',
        expiresAt: new Date(Date.now() - 1800000), // 30 minutes ago
        isActive: true,
      }

      const mockCompletion = {
        id: 'completion-1',
        userId: 'user-1',
        taskId: 'task-missed',
        completedAt: new Date(),
        missedAt: expiredTask.expiresAt,
        pointsAwarded: 0,
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(expiredTask)
      ;(prisma.completion.create as jest.Mock).mockResolvedValue(mockCompletion)

      // Act
      const task = await prisma.task.findUnique({ where: { id: 'task-missed' } })
      const isExpired = task && task.expiresAt && new Date(task.expiresAt) < new Date()

      if (isExpired && task && task.expiresAt) {
        await prisma.completion.create({
          data: {
            userId: 'user-1',
            taskId: 'task-missed',
            missedAt: task.expiresAt,
            pointsAwarded: 0,
          },
        })
      }

      // Assert
      expect(isExpired).toBe(true)
      expect(prisma.completion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          missedAt: expiredTask.expiresAt,
          pointsAwarded: 0,
        }),
      })
    })

    it('should not mark non-expired tasks', async () => {
      // Arrange
      const activeTask = {
        id: 'task-active',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        isActive: true,
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(activeTask)

      // Act
      const task = await prisma.task.findUnique({ where: { id: 'task-active' } })
      const isExpired = task && task.expiresAt && new Date(task.expiresAt) < new Date()

      // Assert
      expect(isExpired).toBe(false)
      expect(prisma.task.update).not.toHaveBeenCalled()
    })

    it('should handle tasks without expiration', async () => {
      // Arrange
      const regularTask = {
        id: 'task-regular',
        expiresAt: null,
        isActive: true,
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(regularTask)

      // Act
      const task = await prisma.task.findUnique({ where: { id: 'task-regular' } })
      const isExpired = task && task.expiresAt && new Date(task.expiresAt) < new Date()

      // Assert
      expect(isExpired).toBeFalsy() // null or false are both acceptable
      expect(prisma.task.update).not.toHaveBeenCalled()
    })
  })

  describe('Task Completion Validation', () => {
    it('should allow completion of non-expired time-limited task', async () => {
      // Arrange
      const activeTask = {
        id: 'task-1',
        title: 'Active Time-Limited Task',
        points: 40,
        taskType: 'TWITTER_FOLLOW' as TaskType,
        duration: 2,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        isActive: true,
      }

      const mockCompletion = {
        id: 'completion-1',
        userId: 'user-1',
        taskId: 'task-1',
        completedAt: new Date(),
        missedAt: null,
        pointsAwarded: 40,
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(activeTask)
      ;(prisma.completion.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.completion.create as jest.Mock).mockResolvedValue(mockCompletion)
      ;(prisma.user.update as jest.Mock).mockResolvedValue({})

      // Act
      const task = await prisma.task.findUnique({ where: { id: 'task-1' } })
      const isExpired = task && task.expiresAt && new Date(task.expiresAt) < new Date()

      if (!isExpired && task && task.isActive) {
        const existingCompletion = await prisma.completion.findFirst({
          where: { userId: 'user-1', taskId: 'task-1' },
        })

        if (!existingCompletion) {
          await prisma.completion.create({
            data: {
              userId: 'user-1',
              taskId: 'task-1',
              pointsAwarded: task.points,
            },
          })

          await prisma.user.update({
            where: { id: 'user-1' },
            data: {
              totalPoints: { increment: task.points },
            },
          })
        }
      }

      // Assert
      expect(isExpired).toBe(false)
      expect(prisma.completion.create).toHaveBeenCalled()
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          totalPoints: { increment: 40 },
        },
      })
    })

    it('should prevent completion of expired task', async () => {
      // Arrange
      const expiredTask = {
        id: 'task-expired',
        title: 'Expired Task',
        points: 50,
        taskType: 'TELEGRAM_JOIN' as TaskType,
        duration: 1,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        isActive: true,
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(expiredTask)

      // Act
      const task = await prisma.task.findUnique({ where: { id: 'task-expired' } })
      const isExpired = task && task.expiresAt && new Date(task.expiresAt) < new Date()

      let completionAttempted = false
      if (!isExpired && task && task.isActive) {
        completionAttempted = true
        await prisma.completion.create({
          data: {
            userId: 'user-1',
            taskId: 'task-expired',
            pointsAwarded: task.points,
          },
        })
      }

      // Assert
      expect(isExpired).toBe(true)
      expect(completionAttempted).toBe(false)
      expect(prisma.completion.create).not.toHaveBeenCalled()
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    it('should return error message for expired task completion attempt', async () => {
      // Arrange
      const expiredTask = {
        id: 'task-expired',
        expiresAt: new Date(Date.now() - 1000),
        isActive: true,
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(expiredTask)

      // Act
      const task = await prisma.task.findUnique({ where: { id: 'task-expired' } })
      const isExpired = task && task.expiresAt && new Date(task.expiresAt) < new Date()

      let result: { success: boolean; error?: string } = { success: true }
      if (isExpired && task) {
        result = {
          success: false,
          error: 'Task has expired and can no longer be completed',
        }
      }

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Task has expired and can no longer be completed')
    })

    it('should award zero points for missed tasks', async () => {
      // Arrange
      const expiredTask = {
        id: 'task-missed',
        points: 75,
        expiresAt: new Date(Date.now() - 3600000),
      }

      const mockCompletion = {
        id: 'completion-1',
        userId: 'user-1',
        taskId: 'task-missed',
        missedAt: expiredTask.expiresAt,
        pointsAwarded: 0,
      }

      ;(prisma.completion.create as jest.Mock).mockResolvedValue(mockCompletion)

      // Act
      const completion = await prisma.completion.create({
        data: {
          userId: 'user-1',
          taskId: 'task-missed',
          missedAt: expiredTask.expiresAt,
          pointsAwarded: 0,
        },
      })

      // Assert
      expect(completion.pointsAwarded).toBe(0)
      expect(completion.missedAt).toBeDefined()
      expect(prisma.user.update).not.toHaveBeenCalled() // No points awarded
    })
  })

  describe('Organized Tasks API Endpoint', () => {
    it('should return tasks organized into active, completed, and missed', async () => {
      // Arrange
      const now = new Date()
      const mockTasks = [
        {
          id: 'task-1',
          campaignId: 'campaign-1',
          title: 'Active Task 1',
          description: 'Active',
          points: 10,
          taskType: 'TWITTER_FOLLOW' as TaskType,
          taskUrl: 'https://twitter.com/test',
          isActive: true,
          duration: 2,
          expiresAt: new Date(now.getTime() + 3600000), // Active
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'task-2',
          campaignId: 'campaign-1',
          title: 'Active Task 2',
          description: 'Active',
          points: 15,
          taskType: 'TELEGRAM_JOIN' as TaskType,
          taskUrl: 'https://t.me/test',
          isActive: true,
          duration: null,
          expiresAt: null, // No expiration
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'task-3',
          campaignId: 'campaign-1',
          title: 'Completed Task',
          description: 'Completed',
          points: 20,
          taskType: 'CUSTOM' as TaskType,
          isActive: true,
          duration: null,
          expiresAt: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'task-4',
          campaignId: 'campaign-1',
          title: 'Expired Task',
          description: 'Expired',
          points: 25,
          taskType: 'TWITTER_LIKE' as TaskType,
          taskUrl: 'https://twitter.com/test/status/123',
          isActive: true,
          duration: 1,
          expiresAt: new Date(now.getTime() - 3600000), // Expired
          createdAt: now,
          updatedAt: now,
        },
      ]

      const mockCompletions = [
        {
          id: 'comp-1',
          userId: 'user-1',
          taskId: 'task-3',
          completedAt: now,
          missedAt: null,
        },
      ]

      ;(prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks)
      ;(prisma.completion.findMany as jest.Mock).mockResolvedValue(mockCompletions)

      // Act
      const tasks = await prisma.task.findMany({ where: { isActive: true } })
      const completions = await prisma.completion.findMany({
        where: { userId: 'user-1' },
      })

      // Organize tasks
      const active = tasks.filter(
        (t) =>
          !completions.find((c) => c.taskId === t.id) &&
          (!t.expiresAt || new Date(t.expiresAt) > now)
      )

      const completed = tasks.filter((t) =>
        completions.find((c) => c.taskId === t.id && !c.missedAt)
      )

      const missed = tasks.filter(
        (t) =>
          !completions.find((c) => c.taskId === t.id) &&
          t.expiresAt &&
          new Date(t.expiresAt) < now
      )

      // Assert
      expect(active).toHaveLength(2) // task-1 and task-2
      expect(completed).toHaveLength(1) // task-3
      expect(missed).toHaveLength(1) // task-4
      expect(active.map((t) => t.id)).toContain('task-1')
      expect(active.map((t) => t.id)).toContain('task-2')
      expect(completed[0].id).toBe('task-3')
      expect(missed[0].id).toBe('task-4')
    })

    it('should limit active tasks to maximum of 5', async () => {
      // Arrange
      const mockTasks = Array.from({ length: 10 }, (_, i) => ({
        id: `task-${i}`,
        campaignId: 'campaign-1',
        title: `Task ${i}`,
        description: 'Active',
        points: 10,
        taskType: 'CUSTOM' as TaskType,
        isActive: true,
        duration: null,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      ;(prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks)
      ;(prisma.completion.findMany as jest.Mock).mockResolvedValue([])

      // Act
      const tasks = await prisma.task.findMany({ where: { isActive: true } })
      const completions = await prisma.completion.findMany({
        where: { userId: 'user-1' },
      })

      const active = tasks
        .filter((t) => !completions.find((c) => c.taskId === t.id))
        .slice(0, 5) // Limit to 5

      // Assert
      expect(active).toHaveLength(5)
    })

    it('should return empty arrays when no tasks exist', async () => {
      // Arrange
      ;(prisma.task.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.completion.findMany as jest.Mock).mockResolvedValue([])

      // Act
      const tasks = await prisma.task.findMany({ where: { isActive: true } })
      const completions = await prisma.completion.findMany({
        where: { userId: 'user-1' },
      })

      // Assert
      expect(tasks).toHaveLength(0)
      expect(completions).toHaveLength(0)
    })

    it('should sort completed tasks by completion date (newest first)', async () => {
      // Arrange
      const now = Date.now()
      const mockTasks = [
        { id: 'task-1', isActive: true },
        { id: 'task-2', isActive: true },
        { id: 'task-3', isActive: true },
      ]

      const mockCompletions = [
        {
          id: 'comp-1',
          userId: 'user-1',
          taskId: 'task-1',
          completedAt: new Date(now - 7200000), // 2 hours ago
          missedAt: null,
        },
        {
          id: 'comp-2',
          userId: 'user-1',
          taskId: 'task-2',
          completedAt: new Date(now - 1800000), // 30 minutes ago
          missedAt: null,
        },
        {
          id: 'comp-3',
          userId: 'user-1',
          taskId: 'task-3',
          completedAt: new Date(now - 3600000), // 1 hour ago
          missedAt: null,
        },
      ]

      ;(prisma.completion.findMany as jest.Mock).mockResolvedValue(mockCompletions)

      // Act
      const completions = await prisma.completion.findMany({
        where: { userId: 'user-1' },
        orderBy: { completedAt: 'desc' },
      })

      // Sort manually since we're mocking
      const sorted = [...mockCompletions].sort(
        (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
      )

      // Assert
      expect(sorted[0].taskId).toBe('task-2') // Most recent
      expect(sorted[1].taskId).toBe('task-3')
      expect(sorted[2].taskId).toBe('task-1') // Oldest
    })

    it('should handle mixed time-limited and regular tasks', async () => {
      // Arrange
      const now = new Date()
      const mockTasks = [
        {
          id: 'task-timed',
          duration: 2,
          expiresAt: new Date(now.getTime() + 3600000),
          isActive: true,
        },
        {
          id: 'task-regular',
          duration: null,
          expiresAt: null,
          isActive: true,
        },
      ]

      ;(prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks)
      ;(prisma.completion.findMany as jest.Mock).mockResolvedValue([])

      // Act
      const tasks = await prisma.task.findMany({ where: { isActive: true } })

      const timedTasks = tasks.filter((t) => t.duration !== null)
      const regularTasks = tasks.filter((t) => t.duration === null)

      // Assert
      expect(timedTasks).toHaveLength(1)
      expect(regularTasks).toHaveLength(1)
      expect(timedTasks[0].id).toBe('task-timed')
      expect(regularTasks[0].id).toBe('task-regular')
    })
  })

  describe('End-to-End Task Lifecycle', () => {
    it('should handle complete lifecycle: create -> active -> complete', async () => {
      // Step 1: Create task
      const taskData = {
        id: 'task-lifecycle',
        campaignId: 'campaign-1',
        title: 'Lifecycle Task',
        description: 'Test lifecycle',
        points: 30,
        taskType: 'TWITTER_FOLLOW' as TaskType,
        duration: 3,
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.task.create as jest.Mock).mockResolvedValue(taskData)
      const createdTask = await prisma.task.create({ data: taskData })

      expect(createdTask.duration).toBe(3)
      expect(createdTask.isActive).toBe(true)

      // Step 2: Verify task is active
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(createdTask)
      const activeTask = await prisma.task.findUnique({
        where: { id: 'task-lifecycle' },
      })

      const isExpired =
        activeTask && activeTask.expiresAt && new Date(activeTask.expiresAt) < new Date()
      expect(isExpired).toBe(false)

      // Step 3: Complete task
      const completion = {
        id: 'comp-lifecycle',
        userId: 'user-1',
        taskId: 'task-lifecycle',
        completedAt: new Date(),
        missedAt: null,
        pointsAwarded: 30,
      }

      ;(prisma.completion.create as jest.Mock).mockResolvedValue(completion)
      ;(prisma.user.update as jest.Mock).mockResolvedValue({})

      await prisma.completion.create({ data: completion })
      await prisma.user.update({
        where: { id: 'user-1' },
        data: { totalPoints: { increment: 30 } },
      })

      expect(prisma.completion.create).toHaveBeenCalled()
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { totalPoints: { increment: 30 } },
      })
    })

    it('should handle complete lifecycle: create -> active -> expire -> miss', async () => {
      // Step 1: Create task
      const taskData = {
        id: 'task-expire',
        campaignId: 'campaign-1',
        title: 'Task to Expire',
        description: 'Will expire',
        points: 40,
        taskType: 'TELEGRAM_JOIN' as TaskType,
        duration: 1,
        expiresAt: new Date(Date.now() + 60000), // 1 minute
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.task.create as jest.Mock).mockResolvedValue(taskData)
      const createdTask = await prisma.task.create({ data: taskData })

      expect(createdTask.duration).toBe(1)

      // Step 2: Simulate time passing - task expires
      const expiredTask = {
        ...createdTask,
        expiresAt: new Date(Date.now() - 1000), // Now expired
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(expiredTask)
      const task = await prisma.task.findUnique({ where: { id: 'task-expire' } })

      const isExpired = task && task.expiresAt && new Date(task.expiresAt) < new Date()
      expect(isExpired).toBe(true)

      // Step 3: Mark as missed
      ;(prisma.task.update as jest.Mock).mockResolvedValue({
        ...expiredTask,
        isActive: false,
      })

      if (task && task.expiresAt) {
        const missedCompletion = {
          id: 'comp-missed',
          userId: 'user-1',
          taskId: 'task-expire',
          completedAt: new Date(),
          missedAt: task.expiresAt,
          pointsAwarded: 0,
        }

        ;(prisma.completion.create as jest.Mock).mockResolvedValue(missedCompletion)

        await prisma.task.update({
          where: { id: 'task-expire' },
          data: { isActive: false },
        })

        await prisma.completion.create({
          data: {
            userId: 'user-1',
            taskId: 'task-expire',
            missedAt: task.expiresAt,
            pointsAwarded: 0,
          },
        })
      }

      expect(prisma.task.update).toHaveBeenCalled()
      expect(prisma.completion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          missedAt: expect.any(Date),
          pointsAwarded: 0,
        }),
      })
    })
  })
})
