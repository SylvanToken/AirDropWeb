/**
 * Task Timer Manager
 * 
 * Manages task timers with persistent state across sessions.
 * Handles timer lifecycle, localStorage persistence, and server sync.
 */

export interface TaskTimer {
  taskId: string;
  userId: string;
  startTime: number;        // Unix timestamp (ms)
  deadline: number;         // Unix timestamp (ms)
  duration: number;         // Duration in seconds
  remainingTime: number;    // Remaining time in seconds
  status: 'active' | 'paused' | 'expired' | 'completed';
  lastSync: number;         // Unix timestamp (ms)
}

export interface TimerUpdate {
  id: string;
  remainingTime: number;
  status: TaskTimer['status'];
}

const STORAGE_KEY = 'task_timers';
const SYNC_INTERVAL = 30000; // Sync every 30 seconds
const UPDATE_INTERVAL = 1000; // Update every second

/**
 * Timer Store - Manages all active timers
 */
export class TimerStore {
  private timers: Map<string, TaskTimer>;
  private updateInterval: NodeJS.Timeout | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(timers: TaskTimer[]) => void> = new Set();

  constructor() {
    this.timers = new Map();
    this.loadFromStorage();
    this.startUpdateLoop();
    this.startSyncLoop();
  }

  /**
   * Start a new timer for a task
   */
  startTimer(taskId: string, userId: string, duration: number): TaskTimer {
    const now = Date.now();
    const timer: TaskTimer = {
      taskId,
      userId,
      startTime: now,
      deadline: now + duration * 1000,
      duration,
      remainingTime: duration,
      status: 'active',
      lastSync: now,
    };

    this.timers.set(taskId, timer);
    this.saveToStorage();
    this.notifyListeners();
    
    return timer;
  }

  /**
   * Pause an active timer
   */
  pauseTimer(taskId: string): void {
    const timer = this.timers.get(taskId);
    if (!timer || timer.status !== 'active') {
      return;
    }

    timer.status = 'paused';
    timer.remainingTime = this.calculateRemainingTime(timer);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Resume a paused timer
   */
  resumeTimer(taskId: string): void {
    const timer = this.timers.get(taskId);
    if (!timer || timer.status !== 'paused') {
      return;
    }

    const now = Date.now();
    timer.status = 'active';
    timer.startTime = now;
    timer.deadline = now + timer.remainingTime * 1000;
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Complete a timer
   */
  completeTimer(taskId: string): void {
    const timer = this.timers.get(taskId);
    if (!timer) {
      return;
    }

    timer.status = 'completed';
    timer.remainingTime = 0;
    this.timers.delete(taskId);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Mark a timer as expired
   */
  expireTimer(taskId: string): void {
    const timer = this.timers.get(taskId);
    if (!timer) {
      return;
    }

    timer.status = 'expired';
    timer.remainingTime = 0;
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Get a specific timer
   */
  getTimer(taskId: string): TaskTimer | undefined {
    return this.timers.get(taskId);
  }

  /**
   * Get all active timers for a user
   */
  getActiveTimers(userId: string): TaskTimer[] {
    return Array.from(this.timers.values()).filter(
      (timer) => timer.userId === userId && timer.status === 'active'
    );
  }

  /**
   * Get all expired timers for a user
   */
  getExpiredTimers(userId: string): TaskTimer[] {
    return Array.from(this.timers.values()).filter(
      (timer) => timer.userId === userId && timer.status === 'expired'
    );
  }

  /**
   * Get remaining time for a timer in seconds
   */
  getRemainingTime(taskId: string): number {
    const timer = this.timers.get(taskId);
    if (!timer) {
      return 0;
    }

    if (timer.status === 'expired' || timer.status === 'completed') {
      return 0;
    }

    if (timer.status === 'paused') {
      return timer.remainingTime;
    }

    return this.calculateRemainingTime(timer);
  }

  /**
   * Calculate remaining time for an active timer
   */
  private calculateRemainingTime(timer: TaskTimer): number {
    if (timer.status !== 'active') {
      return timer.remainingTime;
    }

    const now = Date.now();
    const remaining = Math.max(0, Math.floor((timer.deadline - now) / 1000));
    return remaining;
  }

  /**
   * Update all active timers
   * Optimized to batch updates and minimize notifications
   */
  private updateAllTimers(): void {
    const updates: Array<{ taskId: string; remaining: number; expired: boolean }> = [];

    for (const [taskId, timer] of this.timers) {
      if (timer.status !== 'active') {
        continue;
      }

      const remaining = this.calculateRemainingTime(timer);
      
      // Only update if there's a change
      if (remaining !== timer.remainingTime) {
        timer.remainingTime = remaining;
        
        // Check if timer expired
        const expired = remaining === 0;
        updates.push({ taskId, remaining, expired });
      }
    }

    // Batch process all updates
    if (updates.length > 0) {
      // Process expirations
      for (const update of updates) {
        if (update.expired) {
          this.expireTimer(update.taskId);
        }
      }
      
      // Single notification for all changes
      this.notifyListeners();
    }
  }

  /**
   * Start the update loop
   */
  private startUpdateLoop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updateAllTimers();
    }, UPDATE_INTERVAL);
  }

  /**
   * Start the sync loop
   */
  private startSyncLoop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.syncWithServer();
    }, SYNC_INTERVAL);
  }

  /**
   * Stop all intervals
   */
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.listeners.clear();
  }

  /**
   * Save timers to localStorage
   */
  saveToStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const timersArray = Array.from(this.timers.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timersArray));
    } catch (error) {
      console.error('Failed to save timers to storage:', error);
    }
  }

  /**
   * Load timers from localStorage
   */
  loadFromStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }

      const timersArray: TaskTimer[] = JSON.parse(stored);
      const now = Date.now();

      for (const timer of timersArray) {
        // Check if timer expired while offline
        if (timer.status === 'active' && timer.deadline < now) {
          timer.status = 'expired';
          timer.remainingTime = 0;
        } else if (timer.status === 'active') {
          // Recalculate remaining time
          timer.remainingTime = Math.max(
            0,
            Math.floor((timer.deadline - now) / 1000)
          );
        }

        // Only restore active and paused timers
        if (timer.status === 'active' || timer.status === 'paused') {
          this.timers.set(timer.taskId, timer);
        }
      }

      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load timers from storage:', error);
    }
  }

  /**
   * Sync timers with server
   */
  async syncWithServer(): Promise<void> {
    if (typeof window === 'undefined' || this.timers.size === 0) {
      return;
    }

    try {
      const timersToSync = Array.from(this.timers.values()).filter(
        (timer) => Date.now() - timer.lastSync > SYNC_INTERVAL
      );

      if (timersToSync.length === 0) {
        return;
      }

      // Sync each timer with the server
      for (const timer of timersToSync) {
        await this.syncTimerWithServer(timer);
        timer.lastSync = Date.now();
      }

      this.saveToStorage();
    } catch (error) {
      console.error('Failed to sync timers with server:', error);
    }
  }

  /**
   * Sync a single timer with the server
   */
  private async syncTimerWithServer(timer: TaskTimer): Promise<void> {
    try {
      const response = await fetch(`/api/tasks/${timer.taskId}/timer`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: timer.status,
          remainingTime: timer.remainingTime,
          deadline: new Date(timer.deadline).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync timer: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to sync timer ${timer.taskId}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to timer updates
   */
  subscribe(listener: (timers: TaskTimer[]) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of timer updates
   */
  private notifyListeners(): void {
    const timers = Array.from(this.timers.values());
    this.listeners.forEach((listener) => {
      try {
        listener(timers);
      } catch (error) {
        console.error('Error in timer listener:', error);
      }
    });
  }

  /**
   * Clear all timers
   */
  clear(): void {
    this.timers.clear();
    this.saveToStorage();
    this.notifyListeners();
  }
}

// Singleton instance
let timerStoreInstance: TimerStore | null = null;

/**
 * Get the global timer store instance
 */
export function getTimerStore(): TimerStore {
  if (!timerStoreInstance) {
    timerStoreInstance = new TimerStore();
  }
  return timerStoreInstance;
}

/**
 * Format time in seconds to human-readable format
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) {
    return 'Expired';
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }

  return `${secs}s`;
}

/**
 * Get urgency level based on remaining time
 */
export function getUrgencyLevel(
  remainingSeconds: number,
  totalDuration: number
): 'low' | 'medium' | 'high' | 'critical' {
  const percentage = (remainingSeconds / totalDuration) * 100;

  if (percentage <= 10) {
    return 'critical';
  }

  if (percentage <= 25) {
    return 'high';
  }

  if (percentage <= 50) {
    return 'medium';
  }

  return 'low';
}
