'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft } from 'lucide-react'

interface Campaign {
  id: string
  title: string
}

interface Task {
  id: string
  title: string
  description: string
  points: number
  taskType: string
  taskUrl: string | null
  isActive: boolean
  campaignId: string
  isTimeLimited: boolean
  duration: number | null
}

export default function EditTaskPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const taskId = params.id as string

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [task, setTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    campaignId: '',
    title: '',
    description: '',
    points: 10,
    taskType: 'TWITTER_FOLLOW',
    taskUrl: '',
    isActive: true,
    isTimeLimited: false,
    duration: 1,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCampaigns()
    fetchTask()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/campaigns')
      if (!res.ok) throw new Error('Failed to fetch campaigns')
      const data = await res.json()
      setCampaigns(data.campaigns)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    }
  }

  const fetchTask = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/tasks/${taskId}`)
      if (!res.ok) throw new Error('Failed to fetch task')
      const data = await res.json()
      
      setTask(data.task)
      setFormData({
        campaignId: data.task.campaignId,
        title: data.task.title,
        description: data.task.description,
        points: data.task.points,
        taskType: data.task.taskType,
        taskUrl: data.task.taskUrl || '',
        isActive: data.task.isActive,
        isTimeLimited: data.task.isTimeLimited || false,
        duration: data.task.duration || 1,
      })
    } catch (error) {
      console.error('Error fetching task:', error)
      setError('Failed to load task')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to update task')
      }

      toast({
        title: 'Success',
        description: 'Task updated successfully',
        variant: 'default',
      })

      router.push('/admin/tasks')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update task',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/tasks')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">Loading...</CardContent>
        </Card>
      </div>
    )
  }

  if (error && !task) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/tasks')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/tasks')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Task</h1>
          <p className="text-muted-foreground mt-2">
            Update task details and settings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Campaign *</label>
              <select
                value={formData.campaignId}
                onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="">Select a campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Points *</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Task Type *</label>
                <select
                  value={formData.taskType}
                  onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  required
                >
                  <option value="TWITTER_FOLLOW">Twitter Follow</option>
                  <option value="TWITTER_LIKE">Twitter Like</option>
                  <option value="TWITTER_RETWEET">Twitter Retweet</option>
                  <option value="TELEGRAM_JOIN">Telegram Join</option>
                  <option value="REFERRAL">Referral Task</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Task URL (Optional)</label>
              <input
                type="url"
                value={formData.taskUrl}
                onChange={(e) => setFormData({ ...formData, taskUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="https://twitter.com/..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active
              </label>
            </div>

            {/* Time-Limited Section */}
            <div className="space-y-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isTimeLimited"
                  checked={formData.isTimeLimited}
                  onChange={(e) => setFormData({ ...formData, isTimeLimited: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isTimeLimited" className="text-sm font-medium">
                  Enable Time Limit
                </label>
              </div>

              {formData.isTimeLimited && (
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    min="1"
                    max="24"
                    placeholder="Enter duration in hours (1-24)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Task duration must be between 1 and 24 hours
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/admin/tasks')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
