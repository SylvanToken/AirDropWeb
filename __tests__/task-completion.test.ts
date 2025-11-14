/**
 * Integration tests for task completion flow
 * Tests Requirements: 2.1, 2.2, 2.3, 2.4, 7.3
 */

import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    completion: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  },
}))

// Helper function to simulate fetching tasks with completion status
async function getTasksWithCompletionStatus(userId: string) {
  const tasks = await prisma.task.findMany({
    where: { isActive: true },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tasksWithStatus = await Promise.all(
    tasks.map(async (task: any) => {
      const completion = await prisma.completion.findFirst({
        where: {
          userId,
          taskId: task.id,
          completedAt: {
            gte: today,
          },
        },
      })

      return {
        ...task,
        isCompleted: !!completion,
        completedToday: !!completion,
      }
    })
  )

  return tasksWithStatus
}

// Helper function to simulate task completion
async function completeTask(userId: string, taskId: string) {
  // Check if task exists and is active
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  })

  if (!task || !task.isActive) {
    return { success: false, error: 'Task not found or inactive', status: 404 }
  }

  // Check if already completed today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existingCompletion = await prisma.completion.findFirst({
    where: {
      userId,
      taskId,
      completedAt: {
        gte: today,
      },
    },
  })

  if (existingCompletion) {
    return { success: false, error: 'Task already completed today', status: 409 }
  }

  // Create completion and update user points
  const completion = await prisma.completion.create({
    data: {
      userId,
      taskId,
      pointsAwarded: task.points,
    },
  })

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalPoints: {
        increment: task.points,
      },
      lastActive: new Date(),
    },
  })

  return { success: true, completion, pointsAwarded: task.points, status: 201 }
}

describe('Task Completion Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Fetching Tasks with Completion Status', () => {
    it('should fetch all active tasks with user completion status', async () => {
      // Arrange
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Follow on Twitter',
          description: 'Follow our Twitter account',
          points: 10,
          taskType: 'TWITTER_FOLLOW',
          taskUrl: 'https://twitter.com/sylvantoken',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-2',
          title: 'Join Telegram',
          description: 'Join our Telegram group',
          points: 15,
          taskType: 'TELEGRAM_JOIN',
          taskUrl: 'https://t.me/sylvantoken',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      ;(prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks)
      ;(prisma.completion.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // Task 1 not completed
        .mockResolvedValueOnce({ id: 'completion-1' }) // Task 2 completed

      // Act
      const tasks = await getTasksWithCompletionStatus('user-1')

      // Assert
      expect(tasks).toHaveLength(2)
      expect(tasks[0].isCompleted).toBe(false)
      expect(tasks[0].completedToday).toBe(false)
      expect(tasks[1].isCompleted).toBe(true)
      expect(tasks[1].completedToday).toBe(true)
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      })
    })

    it('should only show active tasks', async () => {
      // Arrange
      const mockActiveTasks = [
        {
          id: 'task-1',
          title: 'Active Task',
          description: 'This is active',
          points: 10,
          taskType: 'TWITTER_FOLLOW',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      ;(prisma.task.findMany as jest.Mock).mockResolvedValue(mockActiveTasks)
      ;(prisma.completion.findFirst as jest.Mock).mockResolvedValue(null)

      // Act
      const tasks = await getTasksWithCompletionStatus('user-1')

      // Assert
      expect(tasks).toHaveLength(1)
      expect(tasks[0].isActive).toBe(true)
    })
  })

  describe('Marking Task as Complete', () => {
    it('should successfully complete a task and award points', async () => {
      // Arrange
      const mockTask = {
        id: 'task-1',
        title: 'Follow on Twitter',
        description: 'Follow our Twitter account',
        points: 10,
        taskType: 'TWITTER_FOLLOW',
        taskUrl: 'https://twitter.com/sylvantoken',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockCompletion = {
        id: 'completion-1',
        userId: 'user-1',
        taskId: 'task-1',
        completedAt: new Date(),
        pointsAwarded: 10,
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask)
      ;(prisma.completion.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.completion.create as jest.Mock).mockResolvedValue(mockCompletion)
      ;(prisma.user.update as jest.Mock).mockResolvedValue({})

      // Act
      const result = await completeTask('user-1', 'task-1')

      // Assert
      expect(result.success).toBe(true)
      expect(result.status).toBe(201)
      expect(result.pointsAwarded).toBe(10)
      expect(prisma.completion.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          taskId: 'task-1',
          pointsAwarded: 10,
        },
      })
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          totalPoints: {
            increment: 10,
          },
          lastActive: expect.any(Date),
        },
      })
    })

    it('should prevent duplicate daily completions', async () => {
      // Arrange
      const mockTask = {
        id: 'task-1',
        title: 'Follow on Twitter',
        description: 'Follow our Twitter account',
        points: 10,
        taskType: 'TWITTER_FOLLOW',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const existingCompletion = {
        id: 'completion-1',
        userId: 'user-1',
        taskId: 'task-1',
        completedAt: new Date(),
        pointsAwarded: 10,
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask)
      ;(prisma.completion.findFirst as jest.Mock).mockResolvedValue(existingCompletion)

      // Act
      const result = await completeTask('user-1', 'task-1')

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(409)
      expect(result.error).toBe('Task already completed today')
      expect(prisma.completion.create).not.toHaveBeenCalled()
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    it('should reject completion of inactive task', async () => {
      // Arrange
      const mockTask = {
        id: 'task-1',
        title: 'Inactive Task',
        description: 'This task is inactive',
        points: 10,
        taskType: 'TWITTER_FOLLOW',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask)

      // Act
      const result = await completeTask('user-1', 'task-1')

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(404)
      expect(result.error).toBe('Task not found or inactive')
      expect(prisma.completion.create).not.toHaveBeenCalled()
    })

    it('should reject completion of non-existent task', async () => {
      // Arrange
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(null)

      // Act
      const result = await completeTask('user-1', 'non-existent-task')

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(404)
      expect(result.error).toBe('Task not found or inactive')
      expect(prisma.completion.create).not.toHaveBeenCalled()
    })
  })

  describe('Points Award on Completion', () => {
    it('should award correct points based on task value', async () => {
      // Arrange
      const mockTask = {
        id: 'task-1',
        title: 'High Value Task',
        description: 'Complete this for many points',
        points: 50,
        taskType: 'CUSTOM',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask)
      ;(prisma.completion.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.completion.create as jest.Mock).mockResolvedValue({
        id: 'completion-1',
        userId: 'user-1',
        taskId: 'task-1',
        completedAt: new Date(),
        pointsAwarded: 50,
      })
      ;(prisma.user.update as jest.Mock).mockResolvedValue({})

      // Act
      const result = await completeTask('user-1', 'task-1')

      // Assert
      expect(result.success).toBe(true)
      expect(result.pointsAwarded).toBe(50)
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          totalPoints: {
            increment: 50,
          },
          lastActive: expect.any(Date),
        },
      })
    })

    it('should update user lastActive timestamp on completion', async () => {
      // Arrange
      const mockTask = {
        id: 'task-1',
        title: 'Task',
        points: 10,
        taskType: 'TWITTER_FOLLOW',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask)
      ;(prisma.completion.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.completion.create as jest.Mock).mockResolvedValue({})
      ;(prisma.user.update as jest.Mock).mockResolvedValue({})

      // Act
      await completeTask('user-1', 'task-1')

      // Assert
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          lastActive: expect.any(Date),
        }),
      })
    })
  })
})
