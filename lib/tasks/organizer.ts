import { TaskWithCompletion } from '@/types'

// Extended Completion type with missedAt field and status
interface CompletionWithMissed {
  id: string
  userId: string
  taskId: string
  completedAt: Date
  missedAt?: Date | null
  status?: string
}

/**
 * Configuration for task display organization
 */
export interface TaskDisplayConfig {
  boxCount: number // Number of tasks to show as boxes (default: 10)
  sortBy: 'priority' | 'deadline' | 'points' | 'created'
  filterBy?: {
    status?: 'active' | 'completed' | 'expired'
    type?: string
    isTimeSensitive?: boolean
  }
}

/**
 * Organized tasks split into box and list views
 */
export interface OrganizedTasks {
  boxTasks: TaskWithCompletion[] // First N tasks for card display
  listTasks: TaskWithCompletion[] // Remaining tasks for list display
  totalCount: number
}

/**
 * Categorized tasks for time-limited task feature
 */
export interface CategorizedTasks {
  activeTasks: TaskWithCompletion[]      // Max 5 active tasks
  pendingTasks: TaskWithCompletion[]     // 5 most recent pending (awaiting approval)
  pendingList: TaskWithCompletion[]      // Remaining pending
  completedTasks: TaskWithCompletion[]   // 5 most recent completed
  completedList: TaskWithCompletion[]    // Remaining completed
  missedTasks: TaskWithCompletion[]      // 5 most recent missed
  missedList: TaskWithCompletion[]       // Remaining missed
}

/**
 * Default configuration for task organization
 */
export const DEFAULT_CONFIG: TaskDisplayConfig = {
  boxCount: 10,
  sortBy: 'priority',
}

/**
 * Calculate priority score for a task
 * Higher score = higher priority
 */
function calculatePriority(task: TaskWithCompletion): number {
  let score = 0

  // Time-sensitive tasks get highest priority
  if (task.isTimeSensitive) {
    score += 1000
  }

  // Tasks with deadlines get priority based on urgency
  if (task.scheduledDeadline) {
    const now = Date.now()
    const deadline = new Date(task.scheduledDeadline).getTime()
    const timeRemaining = deadline - now

    if (timeRemaining < 0) {
      // Expired tasks get lower priority
      score -= 500
    } else if (timeRemaining < 3600000) {
      // Less than 1 hour
      score += 500
    } else if (timeRemaining < 86400000) {
      // Less than 1 day
      score += 300
    } else if (timeRemaining < 604800000) {
      // Less than 1 week
      score += 100
    }
  }

  // Points contribute to priority
  score += task.points

  return score
}

/**
 * Sort tasks based on the specified criteria
 */
function sortTasks(
  tasks: TaskWithCompletion[],
  sortBy: TaskDisplayConfig['sortBy']
): TaskWithCompletion[] {
  const sorted = [...tasks]

  switch (sortBy) {
    case 'priority':
      sorted.sort((a, b) => calculatePriority(b) - calculatePriority(a))
      break

    case 'deadline':
      sorted.sort((a, b) => {
        // Tasks without deadlines go to the end
        if (!a.scheduledDeadline && !b.scheduledDeadline) return 0
        if (!a.scheduledDeadline) return 1
        if (!b.scheduledDeadline) return -1

        return (
          new Date(a.scheduledDeadline).getTime() -
          new Date(b.scheduledDeadline).getTime()
        )
      })
      break

    case 'points':
      sorted.sort((a, b) => b.points - a.points)
      break

    case 'created':
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      break

    default:
      break
  }

  return sorted
}

/**
 * Filter tasks based on the specified criteria
 */
function filterTasks(
  tasks: TaskWithCompletion[],
  filterBy?: TaskDisplayConfig['filterBy']
): TaskWithCompletion[] {
  if (!filterBy) return tasks

  let filtered = [...tasks]

  // Filter by status
  if (filterBy.status) {
    filtered = filtered.filter((task) => {
      switch (filterBy.status) {
        case 'active':
          return task.isActive && !task.isCompleted
        case 'completed':
          return task.isCompleted
        case 'expired':
          return (
            task.scheduledDeadline &&
            new Date(task.scheduledDeadline).getTime() < Date.now()
          )
        default:
          return true
      }
    })
  }

  // Filter by type
  if (filterBy.type) {
    filtered = filtered.filter((task) => task.taskType === filterBy.type)
  }

  // Filter by time sensitivity
  if (filterBy.isTimeSensitive !== undefined) {
    filtered = filtered.filter(
      (task) => task.isTimeSensitive === filterBy.isTimeSensitive
    )
  }

  return filtered
}

/**
 * Organize tasks into box and list views
 *
 * @param tasks - Array of tasks to organize
 * @param config - Configuration for organization (optional)
 * @returns Organized tasks split into boxTasks and listTasks
 *
 * @example
 * ```typescript
 * const organized = organizeTasks(allTasks, {
 *   boxCount: 10,
 *   sortBy: 'priority',
 *   filterBy: { status: 'active' }
 * })
 * ```
 */
export function organizeTasks(
  tasks: TaskWithCompletion[],
  config: Partial<TaskDisplayConfig> = {}
): OrganizedTasks {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  // Apply filters
  let processedTasks = filterTasks(tasks, finalConfig.filterBy)

  // Apply sorting
  processedTasks = sortTasks(processedTasks, finalConfig.sortBy)

  // Split into box and list
  const boxTasks = processedTasks.slice(0, finalConfig.boxCount)
  const listTasks = processedTasks.slice(finalConfig.boxCount)

  return {
    boxTasks,
    listTasks,
    totalCount: processedTasks.length,
  }
}

/**
 * Get urgency level for a task based on deadline
 */
export function getTaskUrgency(
  task: TaskWithCompletion
): 'low' | 'medium' | 'high' | 'critical' | null {
  if (!task.scheduledDeadline) return null

  const now = Date.now()
  const deadline = new Date(task.scheduledDeadline).getTime()
  const timeRemaining = deadline - now

  if (timeRemaining < 0) return null // Expired
  if (timeRemaining < 3600000) return 'critical' // Less than 1 hour
  if (timeRemaining < 86400000) return 'high' // Less than 1 day
  if (timeRemaining < 604800000) return 'medium' // Less than 1 week
  return 'low'
}

/**
 * Check if a task is expired
 */
export function isTaskExpired(task: TaskWithCompletion): boolean {
  if (!task.scheduledDeadline) return false
  return new Date(task.scheduledDeadline).getTime() < Date.now()
}

/**
 * Organize tasks into active, pending, completed, and missed categories
 * for the time-limited task feature
 *
 * @param tasks - Array of all tasks
 * @param completions - Array of user's completions
 * @returns Categorized tasks (active, pending, completed, missed)
 *
 * @example
 * ```typescript
 * const categorized = organizeTasksForTimeLimited(allTasks, userCompletions)
 * // Returns: { activeTasks, pendingTasks, pendingList, completedTasks, completedList, missedTasks, missedList }
 * ```
 */
export function organizeTasksForTimeLimited(
  tasks: TaskWithCompletion[],
  completions: CompletionWithMissed[]
): CategorizedTasks {
  const now = new Date()
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

  // Create a map of completions by taskId for quick lookup
  const completionMap = new Map<string, CompletionWithMissed>()
  completions.forEach((completion) => {
    completionMap.set(completion.taskId, completion)
  })

  // Categorize tasks
  const active: TaskWithCompletion[] = []
  const pending: TaskWithCompletion[] = []
  const completed: TaskWithCompletion[] = []
  const missed: TaskWithCompletion[] = []

  tasks.forEach((task) => {
    const completion = completionMap.get(task.id)

    // Check if task is expired (time-limited tasks only)
    const isExpired = task.expiresAt && new Date(task.expiresAt) < now

    if (completion) {
      // Task has a completion record
      if (completion.missedAt) {
        // Task was missed (expired before completion)
        missed.push({
          ...task,
          isCompleted: false,
          completedToday: false,
          lastCompletedAt: undefined,
        })
      } else if (completion.completedAt) {
        // Check completion status
        const completionStatus = completion.status || 'PENDING'
        
        if (completionStatus === 'PENDING') {
          // Check if pending for more than 48 hours
          const completionDate = new Date(completion.completedAt)
          
          if (completionDate < fortyEightHoursAgo) {
            // Pending for more than 48 hours - move to missed
            missed.push({
              ...task,
              isCompleted: false,
              completedToday: false,
              lastCompletedAt: completion.completedAt,
              completionStatus: 'REJECTED' as any,
            })
          } else {
            // Still within 48 hours - show as pending
            const taskWithCompletion: TaskWithCompletion = {
              ...task,
              isCompleted: false,
              completedToday: false,
              lastCompletedAt: completion.completedAt,
              completionStatus: 'PENDING' as any,
            }
            pending.push(taskWithCompletion)
          }
        } else if (completionStatus === 'APPROVED' || completionStatus === 'AUTO_APPROVED') {
          // Task was completed successfully
          const taskWithCompletion: TaskWithCompletion = {
            ...task,
            isCompleted: true,
            completedToday: true,
            lastCompletedAt: completion.completedAt,
            completionStatus: completionStatus as any,
          }
          completed.push(taskWithCompletion)
        } else if (completionStatus === 'REJECTED') {
          // Task was rejected - move to missed
          missed.push({
            ...task,
            isCompleted: false,
            completedToday: false,
            lastCompletedAt: completion.completedAt,
            completionStatus: 'REJECTED' as any,
          })
        }
      }
    } else if (!isExpired && task.isActive) {
      // Task is active and not expired
      active.push({
        ...task,
        isCompleted: false,
        completedToday: false,
      })
    } else if (isExpired && task.isActive) {
      // Task expired but no completion record yet - treat as missed
      missed.push({
        ...task,
        isCompleted: false,
        completedToday: false,
      })
    }
  })

  // Sort pending tasks by completion date (oldest first - most urgent)
  pending.sort((a, b) => {
    const dateA = a.lastCompletedAt ? new Date(a.lastCompletedAt).getTime() : 0
    const dateB = b.lastCompletedAt ? new Date(b.lastCompletedAt).getTime() : 0
    return dateA - dateB
  })

  // Sort completed tasks by completion date (newest first)
  completed.sort((a, b) => {
    const dateA = a.lastCompletedAt ? new Date(a.lastCompletedAt).getTime() : 0
    const dateB = b.lastCompletedAt ? new Date(b.lastCompletedAt).getTime() : 0
    return dateB - dateA
  })

  // Sort missed tasks by expiration/completion date (newest first)
  missed.sort((a, b) => {
    const dateA = a.lastCompletedAt ? new Date(a.lastCompletedAt).getTime() : (a.expiresAt ? new Date(a.expiresAt).getTime() : 0)
    const dateB = b.lastCompletedAt ? new Date(b.lastCompletedAt).getTime() : (b.expiresAt ? new Date(b.expiresAt).getTime() : 0)
    return dateB - dateA
  })

  // Limit active tasks to maximum of 5
  const activeTasks = active.slice(0, 5)

  // Split pending, completed and missed into display (5) and list (remaining)
  const pendingTasks = pending.slice(0, 5)
  const pendingList = pending.slice(5)
  const completedTasks = completed.slice(0, 5)
  const completedList = completed.slice(5)
  const missedTasks = missed.slice(0, 5)
  const missedList = missed.slice(5)

  return {
    activeTasks,
    pendingTasks,
    pendingList,
    completedTasks,
    completedList,
    missedTasks,
    missedList,
  }
}
