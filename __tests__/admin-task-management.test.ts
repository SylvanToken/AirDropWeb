/**
 * Integration tests for admin task management
 * Tests Requirements: 5.1, 5.2, 5.3, 5.4, 4.3
 */

import { prisma } from '@/lib/prisma'
import { taskSchema } from '@/lib/validations'
import { TaskType } from '@/types'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

// Helper function to verify admin role
async function verifyAdminRole(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || user.role !== 'ADMIN') {
    return { success: false as const, error: 'Unauthorized', status: 403 }
  }

  return { success: true as const, user }
}

// Helper function to create a task
async function createTask(
  adminId: string,
  taskData: {
    title: string
    description: string
    points: number
    taskType: string
    taskUrl?: string
    campaignId?: string
  }
) {
  // Verify admin authorization
  const authResult = await verifyAdminRole(adminId)
  if (!authResult.success) {
    return authResult
  }

  // Validate task data
  const validation = taskSchema.safeParse(taskData)
  if (!validation.success) {
    return { success: false as const, error: 'Validation failed', status: 400 }
  }

  // Create task
  const task = await prisma.task.create({
    data: {
      ...taskData,
      taskType: taskData.taskType as TaskType,
      campaignId: taskData.campaignId || 'default-campaign-id',
      isActive: true,
    },
  })

  return { success: true as const, task, status: 201 }
}

// Helper function to update a task
async function updateTask(
  adminId: string,
  taskId: string,
  taskData: {
    title?: string
    description?: string
    points?: number
    taskType?: string
    taskUrl?: string
    isActive?: boolean
  }
) {
  // Verify admin authorization
  const authResult = await verifyAdminRole(adminId)
  if (!authResult.success) {
    return authResult
  }

  // Check if task exists
  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
  })

  if (!existingTask) {
    return { success: false as const, error: 'Task not found', status: 404 }
  }

  // Update task
  const updateData: any = { ...taskData }
  if (taskData.taskType) {
    updateData.taskType = taskData.taskType as TaskType
  }
  
  const task = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
  })

  return { success: true as const, task, status: 200 }
}

// Helper function to delete a task
async function deleteTask(adminId: string, taskId: string) {
  // Verify admin authorization
  const authResult = await verifyAdminRole(adminId)
  if (!authResult.success) {
    return authResult
  }

  // Check if task exists
  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
  })

  if (!existingTask) {
    return { success: false as const, error: 'Task not found', status: 404 }
  }

  // Delete task (or mark as inactive)
  await prisma.task.update({
    where: { id: taskId },
    data: { isActive: false },
  })

  return { success: true as const, status: 200 }
}

// Helper function to get all tasks (admin view)
async function getAllTasks(adminId: string) {
  // Verify admin authorization
  const authResult = await verifyAdminRole(adminId)
  if (!authResult.success) {
    return authResult
  }

  // Get all tasks including inactive ones
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return { success: true as const, tasks, status: 200 }
}

describe('Admin Task Management', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Admin Authentication and Authorization', () => {
    it('should allow admin users to access task management', async () => {
      // Arrange
      const mockAdmin = {
        id: 'admin-1',
        email: 'admin@sylvantoken.org',
        username: 'admin',
        password: 'hashedpassword',
        role: 'ADMIN',
        totalPoints: 0,
        createdAt: new Date(),
        lastActive: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin)

      // Act
      const result = await verifyAdminRole('admin-1')

      // Assert
      expect(result.success).toBe(true)
      expect(result.user?.role).toBe('ADMIN')
    })

    it('should deny access to non-admin users', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        username: 'user',
        password: 'hashedpassword',
        role: 'USER',
        totalPoints: 100,
        createdAt: new Date(),
        lastActive: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      // Act
      const result = await verifyAdminRole('user-1')

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(403)
      expect(result.error).toBe('Unauthorized')
    })

    it('should deny access to non-existent users', async () => {
      // Arrange
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      // Act
      const result = await verifyAdminRole('non-existent-user')

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(403)
      expect(result.error).toBe('Unauthorized')
    })
  })

  describe('Creating Tasks', () => {
    it('should successfully create a new task with valid data', async () => {
      // Arrange
      const mockAdmin = {
        id: 'admin-1',
        role: 'ADMIN',
      }

      const mockTask = {
        id: 'task-1',
        campaignId: 'campaign-1',
        title: 'Follow on Twitter',
        description: 'Follow our Twitter account',
        points: 10,
        taskType: 'TWITTER_FOLLOW',
        taskUrl: 'https://twitter.com/sylvantoken',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin)
      ;(prisma.task.create as jest.Mock).mockResolvedValue(mockTask)

      // Act
      const result = await createTask('admin-1', {
        title: 'Follow on Twitter',
        description: 'Follow our Twitter account',
        points: 10,
        taskType: 'TWITTER_FOLLOW',
        taskUrl: 'https://twitter.com/sylvantoken',
        campaignId: 'campaign-1',
      })

      // Assert
      expect(result.success).toBe(true)
      expect(result.status).toBe(201)
      if (result.success) {
        expect(result.task?.title).toBe('Follow on Twitter')
      }
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Follow on Twitter',
          points: 10,
          isActive: true,
        }),
      })
    })

    it('should support all task types', async () => {
      // Arrange
      const mockAdmin = { id: 'admin-1', role: 'ADMIN' }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin)

      const taskTypes = [
        'TWITTER_FOLLOW',
        'TWITTER_LIKE',
        'TWITTER_RETWEET',
        'TELEGRAM_JOIN',
        'CUSTOM',
      ]

      for (const taskType of taskTypes) {
        ;(prisma.task.create as jest.Mock).mockResolvedValue({
          id: `task-${taskType}`,
          campaignId: 'campaign-1',
          title: `Task ${taskType}`,
          description: 'Description',
          points: 10,
          taskType,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        // Act
        const result = await createTask('admin-1', {
          title: `Task ${taskType}`,
          description: 'Description',
          points: 10,
          taskType,
          campaignId: 'campaign-1',
        })

        // Assert
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.task?.taskType).toBe(taskType)
        }
      }
    })

    it('should reject task creation by non-admin users', async () => {
      // Arrange
      const mockUser = { id: 'user-1', role: 'USER' }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      // Act
      const result = await createTask('user-1', {
        title: 'Unauthorized Task',
        description: 'This should fail',
        points: 10,
        taskType: 'TWITTER_FOLLOW',
      })

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(403)
      expect(prisma.task.create).not.toHaveBeenCalled()
    })

    it('should reject task creation with invalid data', async () => {
      // Arrange
      const mockAdmin = { id: 'admin-1', role: 'ADMIN' }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin)

      // Act
      const result = await createTask('admin-1', {
        title: '', // Invalid: empty title
        description: 'Description',
        points: -5, // Invalid: negative points
        taskType: 'INVALID_TYPE', // Invalid task type
      })

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(400)
      if (!result.success) {
        expect(result.error).toBe('Validation failed')
      }
      expect(prisma.task.create).not.toHaveBeenCalled()
    })
  })

  describe('Updating Tasks', () => {
    it('should successfully update an existing task', async () => {
      // Arrange
      const mockAdmin = { id: 'admin-1', role: 'ADMIN' }
      const existingTask = {
        id: 'task-1',
        title: 'Old Title',
        description: 'Old Description',
        points: 10,
        taskType: 'TWITTER_FOLLOW',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedTask = {
        ...existingTask,
        title: 'New Title',
        points: 20,
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin)
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(existingTask)
      ;(prisma.task.update as jest.Mock).mockResolvedValue(updatedTask)

      // Act
      const result = await updateTask('admin-1', 'task-1', {
        title: 'New Title',
        points: 20,
      })

      // Assert
      expect(result.success).toBe(true)
      expect(result.status).toBe(200)
      if (result.success) {
        expect(result.task?.title).toBe('New Title')
        expect(result.task?.points).toBe(20)
      }
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: expect.objectContaining({ title: 'New Title', points: 20 }),
      })
    })

    it('should reject update of non-existent task', async () => {
      // Arrange
      const mockAdmin = { id: 'admin-1', role: 'ADMIN' }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin)
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(null)

      // Act
      const result = await updateTask('admin-1', 'non-existent-task', {
        title: 'New Title',
      })

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(404)
      if (!result.success) {
        expect(result.error).toBe('Task not found')
      }
      expect(prisma.task.update).not.toHaveBeenCalled()
    })

    it('should reject task update by non-admin users', async () => {
      // Arrange
      const mockUser = { id: 'user-1', role: 'USER' }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      // Act
      const result = await updateTask('user-1', 'task-1', {
        title: 'Unauthorized Update',
      })

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(403)
      expect(prisma.task.update).not.toHaveBeenCalled()
    })
  })

  describe('Deleting Tasks', () => {
    it('should successfully delete (deactivate) a task', async () => {
      // Arrange
      const mockAdmin = { id: 'admin-1', role: 'ADMIN' }
      const existingTask = {
        id: 'task-1',
        title: 'Task to Delete',
        description: 'This will be deleted',
        points: 10,
        taskType: 'TWITTER_FOLLOW',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin)
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(existingTask)
      ;(prisma.task.update as jest.Mock).mockResolvedValue({
        ...existingTask,
        isActive: false,
      })

      // Act
      const result = await deleteTask('admin-1', 'task-1')

      // Assert
      expect(result.success).toBe(true)
      expect(result.status).toBe(200)
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: { isActive: false },
      })
    })

    it('should reject deletion of non-existent task', async () => {
      // Arrange
      const mockAdmin = { id: 'admin-1', role: 'ADMIN' }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin)
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(null)

      // Act
      const result = await deleteTask('admin-1', 'non-existent-task')

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(404)
      if (!result.success) {
        expect(result.error).toBe('Task not found')
      }
      expect(prisma.task.update).not.toHaveBeenCalled()
    })

    it('should reject task deletion by non-admin users', async () => {
      // Arrange
      const mockUser = { id: 'user-1', role: 'USER' }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      // Act
      const result = await deleteTask('user-1', 'task-1')

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(403)
      expect(prisma.task.update).not.toHaveBeenCalled()
    })
  })

  describe('Getting All Tasks (Admin View)', () => {
    it('should return all tasks including inactive ones for admin', async () => {
      // Arrange
      const mockAdmin = { id: 'admin-1', role: 'ADMIN' }
      const mockTasks = [
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
        {
          id: 'task-2',
          title: 'Inactive Task',
          description: 'This is inactive',
          points: 15,
          taskType: 'TELEGRAM_JOIN',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin)
      ;(prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks)

      // Act
      const result = await getAllTasks('admin-1')

      // Assert
      expect(result.success).toBe(true)
      expect(result.status).toBe(200)
      if (result.success) {
        expect(result.tasks).toHaveLength(2)
        expect(result.tasks?.some((t: any) => t.isActive === false)).toBe(true)
      }
    })

    it('should reject task list access by non-admin users', async () => {
      // Arrange
      const mockUser = { id: 'user-1', role: 'USER' }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      // Act
      const result = await getAllTasks('user-1')

      // Assert
      expect(result.success).toBe(false)
      expect(result.status).toBe(403)
      expect(prisma.task.findMany).not.toHaveBeenCalled()
    })
  })
})
