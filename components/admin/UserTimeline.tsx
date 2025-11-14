'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LogIn,
  CheckCircle,
  Wallet,
  User,
  AlertTriangle,
  Monitor,
  MapPin,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  XCircle,
  Twitter,
  MessageCircle,
} from 'lucide-react'
import type { ActivityEvent, ActivityType } from '@/lib/admin/activity'
import { formatDistanceToNow } from 'date-fns'

interface UserTimelineProps {
  userId: string
  initialActivities?: ActivityEvent[]
  showStats?: boolean
}

interface SuspiciousActivity {
  type: string
  severity: 'low' | 'medium' | 'high'
  description: string
  timestamp: Date
}

interface ActivityStats {
  totalLogins: number
  successfulLogins: number
  failedLogins: number
  totalCompletions: number
  approvedCompletions: number
  pendingCompletions: number
  rejectedCompletions: number
  walletUpdates: number
  profileUpdates: number
}

/**
 * UserTimeline Component
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 * 
 * Displays chronological user activity with filtering and suspicious activity detection
 */
export function UserTimeline({ 
  userId, 
  initialActivities = [],
  showStats = true 
}: UserTimelineProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>(initialActivities)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all')
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([])
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<ActivityStats | null>(null)

  useEffect(() => {
    fetchActivities()
    if (showStats) {
      fetchStats()
      fetchSuspiciousActivities()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filterType, showStats])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        limit: '50',
        offset: '0',
      })
      
      if (filterType !== 'all') {
        params.append('type', filterType)
      }

      const res = await fetch(`/api/admin/users/${userId}/activity?${params}`)
      
      if (!res.ok) {
        throw new Error('Failed to fetch activities')
      }

      const data = await res.json()
      setActivities(data.activities || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/activity/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const fetchSuspiciousActivities = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/activity/suspicious`)
      if (res.ok) {
        const data = await res.json()
        setSuspiciousActivities(data.suspicious || [])
      }
    } catch (err) {
      console.error('Failed to fetch suspicious activities:', err)
    }
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  // Requirement 5.3: Activity type icons
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'login':
        return <LogIn className="h-5 w-5" />
      case 'task_completion':
        return <CheckCircle className="h-5 w-5" />
      case 'wallet_update':
        return <Wallet className="h-5 w-5" />
      case 'profile_update':
        return <User className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'login':
        return 'text-blue-500 bg-blue-50'
      case 'task_completion':
        return 'text-green-500 bg-green-50'
      case 'wallet_update':
        return 'text-purple-500 bg-purple-50'
      case 'profile_update':
        return 'text-orange-500 bg-orange-50'
      default:
        return 'text-gray-500 bg-gray-50'
    }
  }

  // Requirement 5.5: Check if activity is suspicious
  const isSuspicious = (activity: ActivityEvent): boolean => {
    if (activity.type === 'login' && !activity.details.success) {
      return true
    }
    if (activity.type === 'task_completion') {
      const fraudScore = activity.details.fraudScore || 0
      return fraudScore >= 70 || activity.details.needsReview
    }
    return false
  }

  const formatActivityTitle = (activity: ActivityEvent): string => {
    switch (activity.type) {
      case 'login':
        return activity.details.success ? 'Successful Login' : 'Failed Login Attempt'
      case 'task_completion':
        return `Completed: ${activity.details.taskName}`
      case 'wallet_update':
        return `Wallet ${activity.details.action?.replace('wallet_', '') || 'Updated'}`
      case 'profile_update':
        return `Profile ${activity.details.action?.replace('_', ' ') || 'Updated'}`
      default:
        return 'Activity'
    }
  }

  const formatActivityDetails = (activity: ActivityEvent): React.ReactNode => {
    const isExpanded = expandedItems.has(activity.id)

    switch (activity.type) {
      case 'login':
        return (
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2">
              {activity.details.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>{activity.details.status}</span>
            </div>
          </div>
        )

      case 'task_completion':
        return (
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={
                activity.details.status === 'APPROVED' || activity.details.status === 'AUTO_APPROVED' 
                  ? 'default' 
                  : activity.details.status === 'PENDING' 
                  ? 'secondary' 
                  : 'destructive'
              }>
                {activity.details.status}
              </Badge>
              {activity.details.verificationStatus && (
                <Badge variant="outline">{activity.details.verificationStatus}</Badge>
              )}
              <span className="text-gray-600">+{activity.details.points} points</span>
              {activity.details.fraudScore >= 70 && (
                <Badge variant="destructive">High Fraud Score: {activity.details.fraudScore}</Badge>
              )}
            </div>
            {isExpanded && (
              <div className="mt-2 space-y-1 text-gray-600">
                <div>Task Type: {activity.details.taskType}</div>
                {activity.details.completionTime && (
                  <div>Completion Time: {activity.details.completionTime}s</div>
                )}
                {activity.details.fraudScore !== undefined && (
                  <div>Fraud Score: {activity.details.fraudScore}/100</div>
                )}
              </div>
            )}
          </div>
        )

      case 'wallet_update':
        return (
          <div className="text-sm text-gray-600">
            <div>Address: {activity.details.walletAddress?.slice(0, 10)}...{activity.details.walletAddress?.slice(-8)}</div>
            {activity.details.verified && (
              <Badge variant="default" className="mt-1">Verified</Badge>
            )}
            {isExpanded && activity.details.previousAddress && (
              <div className="mt-2">
                Previous: {activity.details.previousAddress.slice(0, 10)}...{activity.details.previousAddress.slice(-8)}
              </div>
            )}
          </div>
        )

      case 'profile_update':
        return (
          <div className="text-sm text-gray-600">
            {activity.details.changes && Object.keys(activity.details.changes).length > 0 ? (
              <div className="space-y-1">
                {Object.entries(activity.details.changes).map(([field, change]: [string, any]) => (
                  <div key={field}>
                    <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    {isExpanded ? (
                      <div className="ml-2">
                        <div className="text-red-600">- {change.from || '(empty)'}</div>
                        <div className="text-green-600">+ {change.to || '(empty)'}</div>
                      </div>
                    ) : (
                      <span className="ml-1">{change.to}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div>{activity.details.action?.replace(/_/g, ' ')}</div>
            )}
            {activity.details.adminId && (
              <div className="mt-1 text-xs text-orange-600">
                Modified by admin: {activity.details.adminEmail}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Requirement 5.5: Suspicious Activity Alerts */}
      {suspiciousActivities.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Suspicious Activity Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suspiciousActivities.map((activity, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    activity.severity === 'high'
                      ? 'bg-red-100 border border-red-300'
                      : activity.severity === 'medium'
                      ? 'bg-orange-100 border border-orange-300'
                      : 'bg-yellow-100 border border-yellow-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {activity.type.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-700">{activity.description}</div>
                    </div>
                    <Badge
                      variant={
                        activity.severity === 'high'
                          ? 'destructive'
                          : activity.severity === 'medium'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {activity.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Statistics */}
      {showStats && stats && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalLogins}</div>
                <div className="text-sm text-gray-600">Total Logins</div>
                <div className="text-xs text-gray-500">
                  {stats.successfulLogins} successful, {stats.failedLogins} failed
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.totalCompletions}</div>
                <div className="text-sm text-gray-600">Task Completions</div>
                <div className="text-xs text-gray-500">
                  {stats.approvedCompletions} approved
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.walletUpdates}</div>
                <div className="text-sm text-gray-600">Wallet Updates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.profileUpdates}</div>
                <div className="text-sm text-gray-600">Profile Updates</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirement 5.3: Activity Type Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Timeline</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterType} onValueChange={(value) => setFilterType(value as ActivityType | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="login">Logins</SelectItem>
                  <SelectItem value="task_completion">Task Completions</SelectItem>
                  <SelectItem value="wallet_update">Wallet Updates</SelectItem>
                  <SelectItem value="profile_update">Profile Updates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-8 text-gray-500">Loading activities...</div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              {error}
            </div>
          )}

          {!loading && !error && activities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No activities found
            </div>
          )}

          {/* Requirement 5.1: Chronological activity list */}
          {!loading && !error && activities.length > 0 && (
            <div className="space-y-4">
              {activities.map((activity) => {
                const suspicious = isSuspicious(activity)
                const isExpanded = expandedItems.has(activity.id)

                return (
                  <div
                    key={activity.id}
                    className={`border rounded-lg p-4 transition-all ${
                      suspicious
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Requirement 5.3: Activity type icon */}
                      <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium text-gray-900">
                                {formatActivityTitle(activity)}
                              </h4>
                              {/* Requirement 5.5: Highlight suspicious activities */}
                              {suspicious && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Suspicious
                                </Badge>
                              )}
                            </div>

                            {/* Requirement 5.4: Display timestamps */}
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                              </div>
                              <div>{new Date(activity.timestamp).toLocaleString()}</div>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(activity.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {/* Activity details */}
                        <div className="mt-3">
                          {formatActivityDetails(activity)}
                        </div>

                        {/* Requirement 5.4: IP address and user agent info */}
                        {isExpanded && (activity.ipAddress || activity.userAgent) && (
                          <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs text-gray-600">
                            {activity.ipAddress && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                <span>IP Address: {activity.ipAddress}</span>
                              </div>
                            )}
                            {activity.userAgent && (
                              <div className="flex items-center gap-2">
                                <Monitor className="h-3 w-3" />
                                <span className="truncate">User Agent: {activity.userAgent}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default UserTimeline
