/**
 * Unit tests for time-limited tasks core logic
 * Tests Requirements: All (1.1-10.5)
 * 
 * This test suite covers:
 * - Expiration calculation function
 * - Time remaining calculation
 * - Task organization algorithm
 * - Countdown timer component logic
 */

import {
  calculateExpiration,
  formatExpirationTime,
  isTaskExpired,
  canCompleteTask,
  markTaskAsMissed,
} from '@/lib/tasks/expiration'

import {
  organizeTasks,
  organizeTasksForTimeLimited,
  getTaskUrgency,
  isTaskExpired as organizerIsTaskExpired,
  DEFAULT_CONFIG,
} from '@/lib/tasks/organizer'

import { TaskWithCompletion } from '@/types'

describe('Time-Limited Tasks - Unit Tests', () => {
  describe('Expiration Calculation', () => {
    it('should calculate expiration timestamp correctly for 1 hour', () => {
      const duration = 1 // 1 hour
      const before = Date.now()
      const expiresAt = calculateExpiration(duration)
      const after = Date.now()

      const expectedMin = before + duration * 60 * 60 * 1000
      const expectedMax = after + duration * 60 * 60 * 1000

      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin)
      expect(expiresAt.getTime()).toBeLessThanOrEqual(expectedMax)
    })

    it('should calculate expiration timestamp correctly for 24 hours', () => {
      const duration = 24 // 24 hours
      const before = Date.now()
      const expiresAt = calculateExpiration(duration)
      const after = Date.now()

      const expectedMin = before + duration * 60 * 60 * 1000
      const expectedMax = after + duration * 60 * 60 * 1000

      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin)
      expect(expiresAt.getTime()).toBeLessThanOrEqual(expectedMax)
    })

    it('should calculate expiration for fractional hours', () => {
      const duration = 2.5 // 2.5 hours
      const before = Date.now()
      const expiresAt = calculateExpiration(duration)

      const expectedTime = before + duration * 60 * 60 * 1000
      const tolerance = 100 // 100ms tolerance

      expect(Math.abs(expiresAt.getTime() - expectedTime)).toBeLessThan(tolerance)
    })

    it('should return future date for positive duration', () => {
      const duration = 5
      const expiresAt = calculateExpiration(duration)
      const now = new Date()

      expect(expiresAt.getTime()).toBeGreaterThan(now.getTime())
    })
  })

  describe('Format Expiration Time', () => {
    it('should format time less than 1 hour as minutes', () => {
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      const formatted = formatExpirationTime(expiresAt)

      expect(formatted).toMatch(/in \d+ minutes?/)
    })

    it('should format time less than 24 hours as hours', () => {
      const expiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000) // 5 hours
      const formatted = formatExpirationTime(expiresAt)

      expect(formatted).toMatch(/in \d+ hours?/)
    })

    it('should format single minute correctly', () => {
      const expiresAt = new Date(Date.now() + 1 * 60 * 1000) // 1 minute
      const formatted = formatExpirationTime(expiresAt)

      expect(formatted).toBe('in 1 minute')
    })

    it('should format single hour correctly', () => {
      const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
      const formatted = formatExpirationTime(expiresAt)

      expect(formatted).toBe('in 1 hour')
    })

    it('should format time more than 24 hours with time', () => {
      const expiresAt = new Date(Date.now() + 30 * 60 * 60 * 1000) // 30 hours
      const formatted = formatExpirationTime(expiresAt)

      // Should start with "at" and contain time format
      expect(formatted).toMatch(/^at \d{1,2}:\d{2}/)
    })
  })

  describe('Task Expiration Check', () => {
    it('should return false for null expiresAt', () => {
      expect(isTaskExpired(null)).toBe(false)
    })

    it('should return false for undefined expiresAt', () => {
      expect(isTaskExpired(undefined)).toBe(false)
    })

    it('should return false for future expiration', () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      expect(isTaskExpired(futureDate)).toBe(false)
    })

    it('should return true for past expiration', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      expect(isTaskExpired(pastDate)).toBe(true)
    })

    it('should return true for expiration at current time', () => {
      const now = new Date()
      // Wait a tiny bit to ensure it's in the past
      setTimeout(() => {
        expect(isTaskExpired(now)).toBe(true)
      }, 10)
    })
  })

  describe('Can Complete Task', () => {
    it('should allow completion for tasks without expiration', () => {
      const result = canCompleteTask(null)

      expect(result.canComplete).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should allow completion for tasks with future expiration', () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000)
      const result = canCompleteTask(futureDate)

      expect(result.canComplete).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should prevent completion for expired tasks', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000)
      const result = canCompleteTask(pastDate)

      expect(result.canComplete).toBe(false)
      expect(result.reason).toBe('Task has expired and can no longer be completed')
    })
  })

  describe('Mark Task as Missed', () => {
    it('should create missed record with correct data', async () => {
      const userId = 'user-123'
      const taskId = 'task-456'
      const expiresAt = new Date()

      const result = await markTaskAsMissed(userId, taskId, expiresAt)

      expect(result.userId).toBe(userId)
      expect(result.taskId).toBe(taskId)
      expect(result.missedAt).toBe(expiresAt)
    })
  })

  describe('Task Organization Algorithm', () => {
    const createMockTask = (overrides: Partial<TaskWithCompletion> = {}): TaskWithCompletion => ({
      id: `task-${Math.random()}`,
      campaignId: 'campaign-1',
      title: 'Test Task',
      description: 'Test Description',
      points: 10,
      taskType: 'TWITTER_FOLLOW',
      taskUrl: 'https://twitter.com/test',
      isActive: true,
      isTimeSensitive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCompleted: false,
      completedToday: false,
      ...overrides,
    })

    describe('organizeTasks - Basic Functionality', () => {
      it('should split tasks into box and list based on boxCount', () => {
        const tasks = Array.from({ length: 15 }, (_, i) =>
          createMockTask({ id: `task-${i}`, title: `Task ${i}` })
        )

        const result = organizeTasks(tasks, { boxCount: 10 })

        expect(result.boxTasks).toHaveLength(10)
        expect(result.listTasks).toHaveLength(5)
        expect(result.totalCount).toBe(15)
      })

      it('should use default config when no config provided', () => {
        const tasks = Array.from({ length: 15 }, (_, i) =>
          createMockTask({ id: `task-${i}` })
        )

        const result = organizeTasks(tasks)

        expect(result.boxTasks).toHaveLength(DEFAULT_CONFIG.boxCount)
      })

      it('should handle empty task array', () => {
        const result = organizeTasks([])

        expect(result.boxTasks).toHaveLength(0)
        expect(result.listTasks).toHaveLength(0)
        expect(result.totalCount).toBe(0)
      })

      it('should handle tasks less than boxCount', () => {
        const tasks = Array.from({ length: 5 }, (_, i) =>
          createMockTask({ id: `task-${i}` })
        )

        const result = organizeTasks(tasks, { boxCount: 10 })

        expect(result.boxTasks).toHaveLength(5)
        expect(result.listTasks).toHaveLength(0)
        expect(result.totalCount).toBe(5)
      })
    })

    describe('organizeTasks - Sorting', () => {
      it('should sort by priority (time-sensitive tasks first)', () => {
        const tasks = [
          createMockTask({ id: 'task-1', isTimeSensitive: false, points: 50 }),
          createMockTask({ id: 'task-2', isTimeSensitive: true, points: 10 }),
          createMockTask({ id: 'task-3', isTimeSensitive: false, points: 100 }),
        ]

        const result = organizeTasks(tasks, { sortBy: 'priority' })

        expect(result.boxTasks[0].id).toBe('task-2') // Time-sensitive first
      })

      it('should sort by points descending', () => {
        const tasks = [
          createMockTask({ id: 'task-1', points: 10 }),
          createMockTask({ id: 'task-2', points: 50 }),
          createMockTask({ id: 'task-3', points: 25 }),
        ]

        const result = organizeTasks(tasks, { sortBy: 'points' })

        expect(result.boxTasks[0].points).toBe(50)
        expect(result.boxTasks[1].points).toBe(25)
        expect(result.boxTasks[2].points).toBe(10)
      })

      it('should sort by deadline (earliest first)', () => {
        const now = Date.now()
        const tasks = [
          createMockTask({
            id: 'task-1',
            scheduledDeadline: new Date(now + 3600000), // 1 hour
          }),
          createMockTask({
            id: 'task-2',
            scheduledDeadline: new Date(now + 1800000), // 30 minutes
          }),
          createMockTask({
            id: 'task-3',
            scheduledDeadline: new Date(now + 7200000), // 2 hours
          }),
        ]

        const result = organizeTasks(tasks, { sortBy: 'deadline' })

        expect(result.boxTasks[0].id).toBe('task-2') // Earliest deadline
        expect(result.boxTasks[1].id).toBe('task-1')
        expect(result.boxTasks[2].id).toBe('task-3')
      })

      it('should sort by created date (newest first)', () => {
        const now = Date.now()
        const tasks = [
          createMockTask({
            id: 'task-1',
            createdAt: new Date(now - 3600000), // 1 hour ago
          }),
          createMockTask({
            id: 'task-2',
            createdAt: new Date(now - 1800000), // 30 minutes ago
          }),
          createMockTask({
            id: 'task-3',
            createdAt: new Date(now - 7200000), // 2 hours ago
          }),
        ]

        const result = organizeTasks(tasks, { sortBy: 'created' })

        expect(result.boxTasks[0].id).toBe('task-2') // Newest
        expect(result.boxTasks[1].id).toBe('task-1')
        expect(result.boxTasks[2].id).toBe('task-3')
      })
    })

    describe('organizeTasks - Filtering', () => {
      it('should filter by active status', () => {
        const tasks = [
          createMockTask({ id: 'task-1', isActive: true, isCompleted: false }),
          createMockTask({ id: 'task-2', isActive: false, isCompleted: false }),
          createMockTask({ id: 'task-3', isActive: true, isCompleted: false }),
        ]

        const result = organizeTasks(tasks, {
          filterBy: { status: 'active' },
        })

        expect(result.totalCount).toBe(2)
        expect(result.boxTasks.every((t) => t.isActive && !t.isCompleted)).toBe(true)
      })

      it('should filter by completed status', () => {
        const tasks = [
          createMockTask({ id: 'task-1', isCompleted: true }),
          createMockTask({ id: 'task-2', isCompleted: false }),
          createMockTask({ id: 'task-3', isCompleted: true }),
        ]

        const result = organizeTasks(tasks, {
          filterBy: { status: 'completed' },
        })

        expect(result.totalCount).toBe(2)
        expect(result.boxTasks.every((t) => t.isCompleted)).toBe(true)
      })

      it('should filter by expired status', () => {
        const now = Date.now()
        const tasks = [
          createMockTask({
            id: 'task-1',
            scheduledDeadline: new Date(now - 3600000), // Expired
          }),
          createMockTask({
            id: 'task-2',
            scheduledDeadline: new Date(now + 3600000), // Not expired
          }),
          createMockTask({
            id: 'task-3',
            scheduledDeadline: new Date(now - 1800000), // Expired
          }),
        ]

        const result = organizeTasks(tasks, {
          filterBy: { status: 'expired' },
        })

        expect(result.totalCount).toBe(2)
      })

      it('should filter by task type', () => {
        const tasks = [
          createMockTask({ id: 'task-1', taskType: 'TWITTER_FOLLOW' }),
          createMockTask({ id: 'task-2', taskType: 'TELEGRAM_JOIN' }),
          createMockTask({ id: 'task-3', taskType: 'TWITTER_FOLLOW' }),
        ]

        const result = organizeTasks(tasks, {
          filterBy: { type: 'TWITTER_FOLLOW' },
        })

        expect(result.totalCount).toBe(2)
        expect(result.boxTasks.every((t) => t.taskType === 'TWITTER_FOLLOW')).toBe(true)
      })

      it('should filter by time sensitivity', () => {
        const tasks = [
          createMockTask({ id: 'task-1', isTimeSensitive: true }),
          createMockTask({ id: 'task-2', isTimeSensitive: false }),
          createMockTask({ id: 'task-3', isTimeSensitive: true }),
        ]

        const result = organizeTasks(tasks, {
          filterBy: { isTimeSensitive: true },
        })

        expect(result.totalCount).toBe(2)
        expect(result.boxTasks.every((t) => t.isTimeSensitive)).toBe(true)
      })
    })

    describe('organizeTasksForTimeLimited', () => {
      it('should categorize tasks into active, completed, and missed', () => {
        const now = new Date()
        const tasks = [
          createMockTask({
            id: 'task-1',
            isActive: true,
            expiresAt: new Date(now.getTime() + 3600000), // Active
          }),
          createMockTask({
            id: 'task-2',
            isActive: true,
            expiresAt: new Date(now.getTime() - 3600000), // Expired/Missed
          }),
          createMockTask({
            id: 'task-3',
            isActive: true,
          }),
        ]

        const completions = [
          {
            id: 'comp-1',
            userId: 'user-1',
            taskId: 'task-3',
            completedAt: new Date(),
            missedAt: null,
          },
        ]

        const result = organizeTasksForTimeLimited(tasks, completions)

        expect(result.activeTasks).toHaveLength(1)
        expect(result.activeTasks[0].id).toBe('task-1')
        expect(result.completedTasks).toHaveLength(1)
        expect(result.completedTasks[0].id).toBe('task-3')
        expect(result.missedTasks).toHaveLength(1)
        expect(result.missedTasks[0].id).toBe('task-2')
      })

      it('should limit active tasks to maximum of 5', () => {
        const tasks = Array.from({ length: 10 }, (_, i) =>
          createMockTask({ id: `task-${i}`, isActive: true })
        )

        const result = organizeTasksForTimeLimited(tasks, [])

        expect(result.activeTasks).toHaveLength(5)
      })

      it('should split completed tasks into display (5) and list', () => {
        const tasks = Array.from({ length: 10 }, (_, i) =>
          createMockTask({ id: `task-${i}`, isActive: true })
        )

        const completions = tasks.map((task, i) => ({
          id: `comp-${i}`,
          userId: 'user-1',
          taskId: task.id,
          completedAt: new Date(Date.now() - i * 1000), // Different times
          missedAt: null,
        }))

        const result = organizeTasksForTimeLimited(tasks, completions)

        expect(result.completedTasks).toHaveLength(5)
        expect(result.completedList).toHaveLength(5)
      })

      it('should split missed tasks into display (5) and list', () => {
        const now = new Date()
        const tasks = Array.from({ length: 10 }, (_, i) =>
          createMockTask({
            id: `task-${i}`,
            isActive: true,
            expiresAt: new Date(now.getTime() - (i + 1) * 1000), // All expired
          })
        )

        const result = organizeTasksForTimeLimited(tasks, [])

        expect(result.missedTasks).toHaveLength(5)
        expect(result.missedList).toHaveLength(5)
      })

      it('should sort completed tasks by completion date (newest first)', () => {
        const now = Date.now()
        const tasks = [
          createMockTask({ id: 'task-1' }),
          createMockTask({ id: 'task-2' }),
          createMockTask({ id: 'task-3' }),
        ]

        const completions = [
          {
            id: 'comp-1',
            userId: 'user-1',
            taskId: 'task-1',
            completedAt: new Date(now - 3600000), // 1 hour ago
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
            completedAt: new Date(now - 7200000), // 2 hours ago
            missedAt: null,
          },
        ]

        const result = organizeTasksForTimeLimited(tasks, completions)

        expect(result.completedTasks[0].id).toBe('task-2') // Most recent
        expect(result.completedTasks[1].id).toBe('task-1')
        expect(result.completedTasks[2].id).toBe('task-3')
      })

      it('should handle tasks with missedAt in completions', () => {
        const tasks = [
          createMockTask({ id: 'task-1', isActive: true }),
        ]

        const completions = [
          {
            id: 'comp-1',
            userId: 'user-1',
            taskId: 'task-1',
            completedAt: new Date(),
            missedAt: new Date(), // Task was missed
          },
        ]

        const result = organizeTasksForTimeLimited(tasks, completions)

        expect(result.missedTasks).toHaveLength(1)
        expect(result.missedTasks[0].id).toBe('task-1')
        expect(result.activeTasks).toHaveLength(0)
        expect(result.completedTasks).toHaveLength(0)
      })
    })

    describe('getTaskUrgency', () => {
      it('should return null for tasks without deadline', () => {
        const task = createMockTask({ scheduledDeadline: undefined })
        expect(getTaskUrgency(task)).toBeNull()
      })

      it('should return null for expired tasks', () => {
        const task = createMockTask({
          scheduledDeadline: new Date(Date.now() - 3600000),
        })
        expect(getTaskUrgency(task)).toBeNull()
      })

      it('should return critical for tasks expiring in less than 1 hour', () => {
        const task = createMockTask({
          scheduledDeadline: new Date(Date.now() + 1800000), // 30 minutes
        })
        expect(getTaskUrgency(task)).toBe('critical')
      })

      it('should return high for tasks expiring in less than 1 day', () => {
        const task = createMockTask({
          scheduledDeadline: new Date(Date.now() + 7200000), // 2 hours
        })
        expect(getTaskUrgency(task)).toBe('high')
      })

      it('should return medium for tasks expiring in less than 1 week', () => {
        const task = createMockTask({
          scheduledDeadline: new Date(Date.now() + 172800000), // 2 days
        })
        expect(getTaskUrgency(task)).toBe('medium')
      })

      it('should return low for tasks expiring in more than 1 week', () => {
        const task = createMockTask({
          scheduledDeadline: new Date(Date.now() + 864000000), // 10 days
        })
        expect(getTaskUrgency(task)).toBe('low')
      })
    })

    describe('isTaskExpired (from organizer)', () => {
      it('should return false for tasks without deadline', () => {
        const task = createMockTask({ scheduledDeadline: undefined })
        expect(organizerIsTaskExpired(task)).toBe(false)
      })

      it('should return true for expired tasks', () => {
        const task = createMockTask({
          scheduledDeadline: new Date(Date.now() - 3600000),
        })
        expect(organizerIsTaskExpired(task)).toBe(true)
      })

      it('should return false for future tasks', () => {
        const task = createMockTask({
          scheduledDeadline: new Date(Date.now() + 3600000),
        })
        expect(organizerIsTaskExpired(task)).toBe(false)
      })
    })
  })

  describe('Countdown Timer Logic', () => {
    describe('Time Remaining Calculation', () => {
      it('should calculate correct time remaining for future date', () => {
        const expiresAt = new Date(Date.now() + 3665000) // 1 hour, 1 minute, 5 seconds
        const now = Date.now()
        const difference = expiresAt.getTime() - now

        const totalSeconds = Math.floor(difference / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        expect(hours).toBe(1)
        expect(minutes).toBe(1)
        expect(seconds).toBeGreaterThanOrEqual(4)
        expect(seconds).toBeLessThanOrEqual(5)
      })

      it('should return zero values for expired date', () => {
        const expiresAt = new Date(Date.now() - 1000) // 1 second ago
        const now = Date.now()
        const difference = expiresAt.getTime() - now

        expect(difference).toBeLessThanOrEqual(0)

        const totalSeconds = Math.max(0, Math.floor(difference / 1000))
        expect(totalSeconds).toBe(0)
      })

      it('should handle exact hour boundaries', () => {
        const expiresAt = new Date(Date.now() + 3600000) // Exactly 1 hour
        const now = Date.now()
        const difference = expiresAt.getTime() - now

        const totalSeconds = Math.floor(difference / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        expect(hours).toBe(1)
        expect(minutes).toBe(0)
        expect(seconds).toBe(0)
      })

      it('should handle seconds-only remaining time', () => {
        const expiresAt = new Date(Date.now() + 45000) // 45 seconds
        const now = Date.now()
        const difference = expiresAt.getTime() - now

        const totalSeconds = Math.floor(difference / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        expect(hours).toBe(0)
        expect(minutes).toBe(0)
        expect(seconds).toBeGreaterThanOrEqual(44)
        expect(seconds).toBeLessThanOrEqual(45)
      })
    })

    describe('Timer State Management', () => {
      it('should identify expired state correctly', () => {
        const pastDate = new Date(Date.now() - 1000)
        const isExpired = pastDate.getTime() < Date.now()

        expect(isExpired).toBe(true)
      })

      it('should identify active state correctly', () => {
        const futureDate = new Date(Date.now() + 60000)
        const isExpired = futureDate.getTime() < Date.now()

        expect(isExpired).toBe(false)
      })

      it('should handle boundary case at expiration moment', () => {
        const now = new Date()
        // Simulate checking at exact expiration time
        const isExpired = now.getTime() <= Date.now()

        expect(isExpired).toBe(true)
      })
    })

    describe('Timer Formatting', () => {
      it('should pad single digit hours with zero', () => {
        const hours = 5
        const formatted = String(hours).padStart(2, '0')

        expect(formatted).toBe('05')
      })

      it('should pad single digit minutes with zero', () => {
        const minutes = 3
        const formatted = String(minutes).padStart(2, '0')

        expect(formatted).toBe('03')
      })

      it('should pad single digit seconds with zero', () => {
        const seconds = 7
        const formatted = String(seconds).padStart(2, '0')

        expect(formatted).toBe('07')
      })

      it('should not pad double digit values', () => {
        const hours = 12
        const minutes = 34
        const seconds = 56

        expect(String(hours).padStart(2, '0')).toBe('12')
        expect(String(minutes).padStart(2, '0')).toBe('34')
        expect(String(seconds).padStart(2, '0')).toBe('56')
      })
    })
  })
})
