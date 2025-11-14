/**
 * Integration tests for task display organization
 * Tests Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { organizeTasks } from '@/lib/tasks/organizer'
import type { TaskWithCompletion } from '@/types'

describe('Task Display Organization', () => {
  // Helper to create mock tasks
  const createMockTask = (id: string, overrides?: Partial<TaskWithCompletion>): TaskWithCompletion => ({
    id,
    campaignId: 'campaign-1',
    title: `Task ${id}`,
    description: `Description for task ${id}`,
    points: 10,
    taskType: 'TWITTER_FOLLOW',
    taskUrl: 'https://example.com',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    scheduledDeadline: null,
    estimatedDuration: null,
    isTimeSensitive: false,
    isCompleted: false,
    completedToday: false,
    ...overrides,
  })

  describe('Load page with 15+ tasks', () => {
    it('should handle 15 tasks correctly', () => {
      // Arrange
      const tasks = Array.from({ length: 15 }, (_, i) =>
        createMockTask(`task-${i + 1}`, { points: 10 + i })
      )

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'points',
      })

      // Assert
      expect(organized.totalCount).toBe(15)
      expect(organized.boxTasks.length + organized.listTasks.length).toBe(15)
    })

    it('should handle 20+ tasks correctly', () => {
      // Arrange
      const tasks = Array.from({ length: 25 }, (_, i) =>
        createMockTask(`task-${i + 1}`)
      )

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'created',
      })

      // Assert
      expect(organized.totalCount).toBe(25)
      expect(organized.boxTasks).toHaveLength(10)
      expect(organized.listTasks).toHaveLength(15)
    })
  })

  describe('Verify first 10 shown as boxes', () => {
    it('should place first 10 tasks in boxTasks array', () => {
      // Arrange
      const tasks = Array.from({ length: 15 }, (_, i) =>
        createMockTask(`task-${i + 1}`, { points: 100 - i })
      )

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'points',
      })

      // Assert
      expect(organized.boxTasks).toHaveLength(10)
      expect(organized.boxTasks[0].id).toBe('task-1') // Highest points
      expect(organized.boxTasks[9].id).toBe('task-10')
    })

    it('should respect boxCount configuration', () => {
      // Arrange
      const tasks = Array.from({ length: 20 }, (_, i) =>
        createMockTask(`task-${i + 1}`)
      )

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 8,
        sortBy: 'created',
      })

      // Assert
      expect(organized.boxTasks).toHaveLength(8)
      expect(organized.listTasks).toHaveLength(12)
    })

    it('should handle fewer than 10 tasks', () => {
      // Arrange
      const tasks = Array.from({ length: 5 }, (_, i) =>
        createMockTask(`task-${i + 1}`)
      )

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'created',
      })

      // Assert
      expect(organized.boxTasks).toHaveLength(5)
      expect(organized.listTasks).toHaveLength(0)
    })
  })

  describe('Verify remaining shown as list', () => {
    it('should place remaining tasks in listTasks array', () => {
      // Arrange
      const tasks = Array.from({ length: 15 }, (_, i) =>
        createMockTask(`task-${i + 1}`)
      )

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'created',
      })

      // Assert
      expect(organized.listTasks).toHaveLength(5)
      expect(organized.listTasks[0].id).toBe('task-11')
      expect(organized.listTasks[4].id).toBe('task-15')
    })

    it('should have empty listTasks when total is less than boxCount', () => {
      // Arrange
      const tasks = Array.from({ length: 7 }, (_, i) =>
        createMockTask(`task-${i + 1}`)
      )

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'created',
      })

      // Assert
      expect(organized.listTasks).toHaveLength(0)
    })
  })

  describe('Test sorting and filtering', () => {
    it('should sort by points (highest first)', () => {
      // Arrange
      const tasks = [
        createMockTask('task-1', { points: 10 }),
        createMockTask('task-2', { points: 50 }),
        createMockTask('task-3', { points: 30 }),
        createMockTask('task-4', { points: 20 }),
      ]

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'points',
      })

      // Assert
      expect(organized.boxTasks[0].points).toBe(50)
      expect(organized.boxTasks[1].points).toBe(30)
      expect(organized.boxTasks[2].points).toBe(20)
      expect(organized.boxTasks[3].points).toBe(10)
    })

    it('should sort by deadline (earliest first)', () => {
      // Arrange
      const now = new Date()
      const tasks = [
        createMockTask('task-1', {
          scheduledDeadline: new Date(now.getTime() + 7200000), // 2 hours
        }),
        createMockTask('task-2', {
          scheduledDeadline: new Date(now.getTime() + 3600000), // 1 hour
        }),
        createMockTask('task-3', {
          scheduledDeadline: new Date(now.getTime() + 10800000), // 3 hours
        }),
      ]

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'deadline',
      })

      // Assert
      expect(organized.boxTasks[0].id).toBe('task-2') // Earliest deadline
      expect(organized.boxTasks[1].id).toBe('task-1')
      expect(organized.boxTasks[2].id).toBe('task-3')
    })

    it('should sort by priority (time-sensitive first)', () => {
      // Arrange
      const tasks = [
        createMockTask('task-1', { isTimeSensitive: false }),
        createMockTask('task-2', { isTimeSensitive: true }),
        createMockTask('task-3', { isTimeSensitive: false }),
        createMockTask('task-4', { isTimeSensitive: true }),
      ]

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'priority',
      })

      // Assert
      expect(organized.boxTasks[0].isTimeSensitive).toBe(true)
      expect(organized.boxTasks[1].isTimeSensitive).toBe(true)
      expect(organized.boxTasks[2].isTimeSensitive).toBe(false)
      expect(organized.boxTasks[3].isTimeSensitive).toBe(false)
    })

    it('should sort by created date (newest first)', () => {
      // Arrange
      const now = new Date()
      const tasks = [
        createMockTask('task-1', { createdAt: new Date(now.getTime() - 86400000) }), // 1 day ago
        createMockTask('task-2', { createdAt: new Date(now.getTime() - 3600000) }), // 1 hour ago
        createMockTask('task-3', { createdAt: new Date(now.getTime() - 172800000) }), // 2 days ago
      ]

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'created',
      })

      // Assert
      expect(organized.boxTasks[0].id).toBe('task-2') // Newest
      expect(organized.boxTasks[1].id).toBe('task-1')
      expect(organized.boxTasks[2].id).toBe('task-3')
    })

    it('should filter by task type', () => {
      // Arrange
      const tasks = [
        createMockTask('task-1', { taskType: 'TWITTER_FOLLOW' }),
        createMockTask('task-2', { taskType: 'TELEGRAM_JOIN' }),
        createMockTask('task-3', { taskType: 'TWITTER_FOLLOW' }),
        createMockTask('task-4', { taskType: 'CUSTOM' }),
      ]

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'created',
        filterBy: { type: 'TWITTER_FOLLOW' },
      })

      // Assert
      expect(organized.totalCount).toBe(2)
      expect(organized.boxTasks.every((t) => t.taskType === 'TWITTER_FOLLOW')).toBe(true)
    })

    it('should filter by time-sensitive status', () => {
      // Arrange
      const tasks = [
        createMockTask('task-1', { isTimeSensitive: true }),
        createMockTask('task-2', { isTimeSensitive: false }),
        createMockTask('task-3', { isTimeSensitive: true }),
        createMockTask('task-4', { isTimeSensitive: false }),
      ]

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'created',
        filterBy: { isTimeSensitive: true },
      })

      // Assert
      expect(organized.totalCount).toBe(2)
      expect(organized.boxTasks.every((t) => t.isTimeSensitive)).toBe(true)
    })
  })

  describe('Test responsive grid layout', () => {
    it('should organize tasks for mobile view (2 columns)', () => {
      // Arrange
      const tasks = Array.from({ length: 12 }, (_, i) =>
        createMockTask(`task-${i + 1}`)
      )

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 6, // Fewer boxes for mobile
        sortBy: 'created',
      })

      // Assert
      expect(organized.boxTasks).toHaveLength(6)
      expect(organized.listTasks).toHaveLength(6)
    })

    it('should organize tasks for tablet view (3 columns)', () => {
      // Arrange
      const tasks = Array.from({ length: 15 }, (_, i) =>
        createMockTask(`task-${i + 1}`)
      )

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 9, // 3x3 grid for tablet
        sortBy: 'created',
      })

      // Assert
      expect(organized.boxTasks).toHaveLength(9)
      expect(organized.listTasks).toHaveLength(6)
    })

    it('should organize tasks for desktop view (4 columns)', () => {
      // Arrange
      const tasks = Array.from({ length: 20 }, (_, i) =>
        createMockTask(`task-${i + 1}`)
      )

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 12, // 3x4 grid for desktop
        sortBy: 'created',
      })

      // Assert
      expect(organized.boxTasks).toHaveLength(12)
      expect(organized.listTasks).toHaveLength(8)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty task array', () => {
      // Arrange
      const tasks: TaskWithCompletion[] = []

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'created',
      })

      // Assert
      expect(organized.totalCount).toBe(0)
      expect(organized.boxTasks).toHaveLength(0)
      expect(organized.listTasks).toHaveLength(0)
    })

    it('should handle exactly 10 tasks', () => {
      // Arrange
      const tasks = Array.from({ length: 10 }, (_, i) =>
        createMockTask(`task-${i + 1}`)
      )

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'created',
      })

      // Assert
      expect(organized.totalCount).toBe(10)
      expect(organized.boxTasks).toHaveLength(10)
      expect(organized.listTasks).toHaveLength(0)
    })

    it('should handle single task', () => {
      // Arrange
      const tasks = [createMockTask('task-1')]

      // Act
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'created',
      })

      // Assert
      expect(organized.totalCount).toBe(1)
      expect(organized.boxTasks).toHaveLength(1)
      expect(organized.listTasks).toHaveLength(0)
    })

    it('should handle 100+ tasks efficiently', () => {
      // Arrange
      const tasks = Array.from({ length: 150 }, (_, i) =>
        createMockTask(`task-${i + 1}`)
      )

      // Act
      const startTime = performance.now()
      const organized = organizeTasks(tasks, {
        boxCount: 10,
        sortBy: 'created',
      })
      const endTime = performance.now()

      // Assert
      expect(organized.totalCount).toBe(150)
      expect(organized.boxTasks).toHaveLength(10)
      expect(organized.listTasks).toHaveLength(140)
      expect(endTime - startTime).toBeLessThan(100) // Should complete in < 100ms
    })
  })
})
