'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Target, 
  Download,
  Calendar,
  BarChart3
} from 'lucide-react'
import AnalyticsChart from './AnalyticsChart'

interface CampaignAnalyticsProps {
  campaignId: string
}

interface Analytics {
  campaignId: string
  campaignTitle: string
  startDate: string
  endDate: string
  isActive: boolean
  totalUsers: number
  participatingUsers: number
  participationRate: number
  totalTasks: number
  totalCompletions: number
  averageCompletionsPerUser: number
  completionRate: number
  engagementScore: number
  averageTimeToComplete: number
  dailyActiveUsers: number
  taskPerformance: TaskPerformance[]
  dailyParticipation: DailyPattern[]
  weeklyParticipation: WeeklyPattern[]
}

interface TaskPerformance {
  taskId: string
  taskTitle: string
  taskType: string
  points: number
  totalCompletions: number
  uniqueUsers: number
  completionRate: number
  averageCompletionTime: number
  approvalRate: number
}

interface DailyPattern {
  date: string
  participants: number
  completions: number
  newUsers: number
}

interface WeeklyPattern {
  week: string
  participants: number
  completions: number
  averageEngagement: number
}

export function CampaignAnalytics({ campaignId }: CampaignAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/campaigns/${campaignId}/analytics`)
      if (!res.ok) throw new Error('Failed to fetch analytics')
      const data = await res.json()
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async () => {
    try {
      setExporting(true)
      const res = await fetch(`/api/admin/campaigns/${campaignId}/report`)
      if (!res.ok) throw new Error('Failed to generate report')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `campaign-report-${campaignId}-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export report')
    } finally {
      setExporting(false)
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    return `${Math.round(seconds / 3600)}h`
  }

  const getEngagementColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading analytics...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-600">{error || 'Failed to load analytics'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Campaign Analytics</h2>
        <Button onClick={handleExportReport} disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />
          {exporting ? 'Exporting...' : 'Export Report'}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participation Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.participationRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.participatingUsers} of {analytics.totalUsers} users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalCompletions} total completions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getEngagementColor(analytics.engagementScore)}`}>
              {analytics.engagementScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageCompletionsPerUser.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per participating user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.dailyActiveUsers}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(analytics.averageTimeToComplete)}
            </div>
            <p className="text-xs text-muted-foreground">Per task</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTasks}</div>
            <p className="text-xs text-muted-foreground">In this campaign</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Participation Chart */}
      {analytics.dailyParticipation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Participation Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              data={analytics.dailyParticipation.map(d => ({
                date: d.date,
                participants: d.participants,
                completions: d.completions,
              }))}
              type="line"
              dataKey="participants"
              xAxisKey="date"
              height={300}
              color="#3b82f6"
            />
          </CardContent>
        </Card>
      )}

      {/* Weekly Participation Chart */}
      {analytics.weeklyParticipation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Participation Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              data={analytics.weeklyParticipation.map(w => ({
                week: w.week,
                participants: w.participants,
                engagement: w.averageEngagement,
              }))}
              type="bar"
              dataKey="participants"
              xAxisKey="week"
              height={300}
              color="#10b981"
            />
          </CardContent>
        </Card>
      )}

      {/* Task Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Task Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.taskPerformance.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No task data available
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Task</th>
                      <th className="text-right py-2 px-4">Points</th>
                      <th className="text-right py-2 px-4">Completions</th>
                      <th className="text-right py-2 px-4">Unique Users</th>
                      <th className="text-right py-2 px-4">Completion Rate</th>
                      <th className="text-right py-2 px-4">Approval Rate</th>
                      <th className="text-right py-2 px-4">Avg. Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.taskPerformance.map((task) => (
                      <tr key={task.taskId} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{task.taskTitle}</div>
                            <div className="text-xs text-muted-foreground">{task.taskType}</div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-yellow-600 font-medium">
                          {task.points}
                        </td>
                        <td className="text-right py-3 px-4">{task.totalCompletions}</td>
                        <td className="text-right py-3 px-4">{task.uniqueUsers}</td>
                        <td className="text-right py-3 px-4">
                          <span className={`font-medium ${
                            task.completionRate >= 70 ? 'text-green-600' :
                            task.completionRate >= 40 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {task.completionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={`font-medium ${
                            task.approvalRate >= 80 ? 'text-green-600' :
                            task.approvalRate >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {task.approvalRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          {formatTime(task.averageCompletionTime)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
