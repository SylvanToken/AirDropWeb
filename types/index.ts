// User types
export interface User {
  id: string
  email: string
  username: string
  role: 'USER' | 'ADMIN'
  status?: string
  walletAddress?: string | null
  walletVerified: boolean
  twitterUsername?: string | null
  twitterVerified: boolean
  telegramUsername?: string | null
  telegramVerified: boolean
  totalPoints: number
  createdAt: Date
  lastActive: Date
}

export interface UserWithStats extends User {
  completionCount: number
  streak: number
  rank: number
}

// Task types
export type TaskType = 'TWITTER_FOLLOW' | 'TWITTER_LIKE' | 'TWITTER_RETWEET' | 'TELEGRAM_JOIN' | 'REFERRAL' | 'CUSTOM'

export interface Task {
  id: string
  campaignId: string
  title: string
  description: string
  titleTr?: string | null
  descriptionTr?: string | null
  titleDe?: string | null
  descriptionDe?: string | null
  titleZh?: string | null
  descriptionZh?: string | null
  titleRu?: string | null
  descriptionRu?: string | null
  points: number
  taskType: TaskType
  taskUrl?: string | null
  isActive: boolean
  // Timer fields
  scheduledDeadline?: Date | null
  estimatedDuration?: number | null
  isTimeSensitive?: boolean
  // Time-limited task fields
  duration?: number | null
  expiresAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Campaign {
  id: string
  title: string
  description: string
  titleTr?: string | null
  descriptionTr?: string | null
  titleDe?: string | null
  descriptionDe?: string | null
  titleZh?: string | null
  descriptionZh?: string | null
  titleRu?: string | null
  descriptionRu?: string | null
  startDate: Date
  endDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  tasks?: Task[]
}

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TaskWithCompletion extends Task {
  isCompleted: boolean
  completedToday: boolean
  lastCompletedAt?: Date
  completionId?: string
  completionStatus?: VerificationStatus | 'AUTO_APPROVED'
  rejectionReason?: string | null
  fraudScore?: number
  needsReview?: boolean
  estimatedApprovalTime?: string
  // Time-limited task completion fields
  missedAt?: Date | null
}

// Completion types
export interface Completion {
  id: string
  userId: string
  taskId: string
  completedAt: Date
  pointsAwarded: number
  // Timer fields
  scheduledFor?: Date | null
  actualDeadline?: Date | null
  isExpired?: boolean
  // Time-limited task fields
  missedAt?: Date | null
}

// API response types
export interface ApiError {
  error: string
  message: string
  statusCode: number
}

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
}

// Stats types
export interface PlatformStats {
  totalUsers: number
  activeUsers: number
  totalCompletions: number
  totalPointsAwarded: number
}

// Email types
export type EmailStatus = 'sent' | 'delivered' | 'failed' | 'bounced' | 'opened' | 'clicked'

export interface EmailLog {
  id: string
  to: string
  subject: string
  template: string
  status: EmailStatus
  error?: string | null
  sentAt: Date
  openedAt?: Date | null
  clickedAt?: Date | null
}

export interface EmailPreference {
  id: string
  userId: string
  taskCompletions: boolean
  walletVerifications: boolean
  adminNotifications: boolean
  marketingEmails: boolean
  unsubscribedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}
