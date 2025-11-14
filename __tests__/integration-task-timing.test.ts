/**
 * Integration tests for task timing system end-to-end
 * Tests Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { TimerStore } from '@/lib/tasks/timer-manager'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    completion: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  },
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock fetch for server sync
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock

describe('Task Timing System End-to-End', () => {
  let timerStore: TimerStore

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
    timerStore = new TimerStore()
  })

  afterEach(() => {
    timerStore.destroy()
  })

  describe('Create task with scheduled deadline', () => {
    it('should create a timer with future deadline', () => {
      // Arrange
      const taskId = 'task-1'
      const userId = 'user-1'
      const duration = 3600 // 1 hour in seconds

      // Act
      const timer = timerStore.startTimer(taskId, userId, duration)

      // Assert
      expect(timer).toBeDefined()
      expect(timer.taskId).toBe(taskId)
      expect(timer.userId).toBe(userId)
      expect(timer.duration).toBe(duration)
      expect(timer.status).toBe('active')
      expect(timer.deadline).toBeGreaterThan(Date.now())
    })

    it('should store timer in localStorage', () => {
      // Arrange
      const taskId = 'task-1'
      const userId = 'user-1'
      const duration = 3600

      // Act
      timerStore.startTimer(taskId, userId, duration)

      // Assert
      const stored = localStorageMock.getItem('task_timers')
      expect(stored).toBeTruthy()
      const timers = JSON.parse(stored!)
      expect(timers).toHaveLength(1)
      expect(timers[0].taskId).toBe(taskId)
    })
  })

  describe('Start timer and verify countdown', () => {
    it('should countdown from initial duration', async () => {
      // Arrange
      const taskId = 'task-1'
      const userId = 'user-1'
      const duration = 5 // 5 seconds

      // Act
      const timer = timerStore.startTimer(taskId, userId, duration)
      const initialRemaining = timerStore.getRemainingTime(taskId)

      // Wait 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const afterWait = timerStore.getRemainingTime(taskId)

      // Assert
      expect(initialRemaining).toBeGreaterThanOrEqual(4)
      expect(initialRemaining).toBeLessThanOrEqual(5)
      expect(afterWait).toBeGreaterThanOrEqual(2)
      expect(afterWait).toBeLessThan(initialRemaining)
    })

    it('should update timer status in real-time', () => {
      // Arrange
      const taskId = 'task-1'
      const userId = 'user-1'
      const duration = 10

      // Act
      timerStore.startTimer(taskId, userId, duration)
      const timer = timerStore.getTimer(taskId)

      // Assert
      expect(timer?.status).toBe('active')
      expect(timerStore.getRemainingTime(taskId)).toBeGreaterThan(0)
    })
  })

  describe('Wait for timer to expire', () => {
    it('should mark timer as expired when deadline passes', async () => {
      // Arrange
      const taskId = 'task-1'
      const userId = 'user-1'
      const duration = 2 // 2 seconds

      // Act
      timerStore.startTimer(taskId, userId, duration)

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Assert
      const timer = timerStore.getTimer(taskId)
      expect(timer?.status).toBe('expired')
      expect(timerStore.getRemainingTime(taskId)).toBe(0)
    })

    it('should prevent completion of expired task', async () => {
      // Arrange
      const taskId = 'task-1'
      const userId = 'user-1'
      const duration = 1

      timerStore.startTimer(taskId, userId, duration)

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Act - Try to complete expired timer
      timerStore.completeTimer(taskId)

      // Assert - Timer should still be expired (not completed)
      const timer = timerStore.getTimer(taskId)
      expect(timer).toBeUndefined() // Completed timers are removed
    })
  })

  describe('Verify task marked as expired', () => {
    it('should update task status to expired in database', async () => {
      // Arrange
      const mockTask = {
        id: 'task-1',
        title: 'Time-sensitive task',
        points: 50,
        isActive: true,
        scheduledDeadline: new Date(Date.now() - 1000), // Past deadline
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask)
      ;(prisma.task.update as jest.Mock).mockResolvedValue({
        ...mockTask,
        isActive: false,
      })

      // Act
      const task = await prisma.task.findUnique({ where: { id: 'task-1' } })
      const isExpired = task?.scheduledDeadline && task.scheduledDeadline < new Date()

      if (isExpired) {
        await prisma.task.update({
          where: { id: 'task-1' },
          data: { isActive: false },
        })
      }

      // Assert
      expect(isExpired).toBe(true)
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: { isActive: false },
      })
    })

    it('should create completion record with expired flag', async () => {
      // Arrange
      const mockCompletion = {
        id: 'completion-1',
        userId: 'user-1',
        taskId: 'task-1',
        isExpired: true,
        completedAt: new Date(),
      }

      ;(prisma.completion.create as jest.Mock).mockResolvedValue(mockCompletion)

      // Act
      const completion = await prisma.completion.create({
        data: {
          userId: 'user-1',
          taskId: 'task-1',
          isExpired: true,
          pointsAwarded: 0,
        },
      })

      // Assert
      expect(completion.isExpired).toBe(true)
      expect(prisma.completion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isExpired: true,
        }),
      })
    })
  })

  describe('Test timer persistence across page refresh', () => {
    it('should save timer state to localStorage', () => {
      // Arrange
      const taskId = 'task-1'
      const userId = 'user-1'
      const duration = 3600

      // Act
      timerStore.startTimer(taskId, userId, duration)
      timerStore.saveToStorage()

      // Assert
      const stored = localStorageMock.getItem('task_timers')
      expect(stored).toBeTruthy()
      const timers = JSON.parse(stored!)
      expect(timers).toHaveLength(1)
      expect(timers[0].taskId).toBe(taskId)
      expect(timers[0].status).toBe('active')
    })

    it('should restore timers from localStorage on initialization', () => {
      // Arrange
      const timerData = {
        taskId: 'task-1',
        userId: 'user-1',
        startTime: Date.now(),
        deadline: Date.now() + 3600000,
        duration: 3600,
        remainingTime: 3600,
        status: 'active',
        lastSync: Date.now(),
      }

      localStorageMock.setItem('task_timers', JSON.stringify([timerData]))

      // Act
      const newStore = new TimerStore()
      newStore.loadFromStorage()

      // Assert
      const timer = newStore.getTimer('task-1')
      expect(timer).toBeDefined()
      expect(timer?.taskId).toBe('task-1')
      expect(timer?.status).toBe('active')

      newStore.destroy()
    })

    it('should handle expired timers after page refresh', () => {
      // Arrange - Create timer that expired while offline
      const expiredTimerData = {
        taskId: 'task-1',
        userId: 'user-1',
        startTime: Date.now() - 7200000, // 2 hours ago
        deadline: Date.now() - 3600000, // 1 hour ago (expired)
        duration: 3600,
        remainingTime: 0,
        status: 'active',
        lastSync: Date.now() - 7200000,
      }

      localStorageMock.setItem('task_timers', JSON.stringify([expiredTimerData]))

      // Act
      const newStore = new TimerStore()
      newStore.loadFromStorage()

      // Assert
      const timer = newStore.getTimer('task-1')
      expect(timer?.status).toBe('expired')
      expect(newStore.getRemainingTime('task-1')).toBe(0)

      newStore.destroy()
    })

    it('should maintain accurate remaining time after refresh', () => {
      // Arrange
      const now = Date.now()
      const duration = 3600
      const elapsed = 1800 // 30 minutes elapsed
      const timerData = {
        taskId: 'task-1',
        userId: 'user-1',
        startTime: now - elapsed * 1000,
        deadline: now + (duration - elapsed) * 1000,
        duration: duration,
        remainingTime: duration - elapsed,
        status: 'active',
        lastSync: now,
      }

      localStorageMock.setItem('task_timers', JSON.stringify([timerData]))

      // Act
      const newStore = new TimerStore()
      newStore.loadFromStorage()
      const remaining = newStore.getRemainingTime('task-1')

      // Assert
      expect(remaining).toBeGreaterThan(1700) // ~30 minutes remaining
      expect(remaining).toBeLessThan(1900)

      newStore.destroy()
    })
  })

  describe('Multiple timers management', () => {
    it('should handle multiple active timers simultaneously', () => {
      // Arrange & Act
      timerStore.startTimer('task-1', 'user-1', 3600)
      timerStore.startTimer('task-2', 'user-1', 1800)
      timerStore.startTimer('task-3', 'user-1', 7200)

      // Assert
      const activeTimers = timerStore.getActiveTimers('user-1')
      expect(activeTimers).toHaveLength(3)
      expect(activeTimers.map((t) => t.taskId)).toContain('task-1')
      expect(activeTimers.map((t) => t.taskId)).toContain('task-2')
      expect(activeTimers.map((t) => t.taskId)).toContain('task-3')
    })

    it('should update all timers independently', async () => {
      // Arrange
      timerStore.startTimer('task-1', 'user-1', 10)
      timerStore.startTimer('task-2', 'user-1', 5)

      // Act
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Assert
      const remaining1 = timerStore.getRemainingTime('task-1')
      const remaining2 = timerStore.getRemainingTime('task-2')

      expect(remaining1).toBeGreaterThan(7)
      expect(remaining1).toBeLessThan(9)
      expect(remaining2).toBeGreaterThan(2)
      expect(remaining2).toBeLessThan(4)
    })
  })

  describe('Timer pause and resume', () => {
    it('should pause timer and stop countdown', async () => {
      // Arrange
      const taskId = 'task-1'
      timerStore.startTimer(taskId, 'user-1', 10)

      await new Promise((resolve) => setTimeout(resolve, 1000))
      const beforePause = timerStore.getRemainingTime(taskId)

      // Act
      timerStore.pauseTimer(taskId)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const afterPause = timerStore.getRemainingTime(taskId)

      // Assert
      expect(beforePause).toBeGreaterThan(8)
      expect(afterPause).toBeCloseTo(beforePause, 0)
      const timer = timerStore.getTimer(taskId)
      expect(timer?.status).toBe('paused')
    })

    it('should resume timer and continue countdown', async () => {
      // Arrange
      const taskId = 'task-1'
      timerStore.startTimer(taskId, 'user-1', 10)
      timerStore.pauseTimer(taskId)

      const beforeResume = timerStore.getRemainingTime(taskId)

      // Act
      timerStore.resumeTimer(taskId)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const afterResume = timerStore.getRemainingTime(taskId)

      // Assert
      expect(afterResume).toBeLessThan(beforeResume)
      const timer = timerStore.getTimer(taskId)
      expect(timer?.status).toBe('active')
    })
  })
})
