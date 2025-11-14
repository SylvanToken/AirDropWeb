'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Trash2 } from 'lucide-react'

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
  isActive: boolean
  campaign: {
    id: string
    title: string
  }
  _count: {
    completions: number
  }
}

export default function TasksPage() {
  const t = useTranslations()
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchCampaigns()
    fetchTasks()
  }, [])

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

  const fetchTasks = async (campaignId?: string) => {
    try {
      setLoading(true)
      const url = campaignId 
        ? `/api/admin/tasks?campaignId=${campaignId}`
        : '/api/admin/tasks'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      const data = await res.json()
      setTasks(data.data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCampaignChange = (campaignId: string) => {
    setSelectedCampaign(campaignId)
    if (campaignId) {
      fetchTasks(campaignId)
    } else {
      fetchTasks()
    }
  }

  const handleDeleteTask = async () => {
    if (!taskToDelete) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/tasks/${taskToDelete.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to delete task')
      }

      // Remove task from displayed list
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskToDelete.id))

      // Show success toast
      toast({
        title: 'Task deleted',
        description: `"${taskToDelete.title}" has been successfully deleted.`,
        variant: 'default',
      })

      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    } catch (error) {
      console.error('Error deleting task:', error)
      
      // Show error toast
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete task. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage tasks for campaigns
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <label className="text-sm font-medium">Filter by Campaign:</label>
        <select
          value={selectedCampaign}
          onChange={(e) => handleCampaignChange(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Campaigns</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.title}
            </option>
          ))}
        </select>
      </div>

      {showCreateForm && (
        <CreateTaskForm
          campaigns={campaigns}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            fetchTasks(selectedCampaign || undefined)
          }}
        />
      )}

      <div className="task-grid">
        {loading ? (
          <Card>
            <CardContent className="pt-6 text-center">{t("admin.common.loading")}</CardContent>
          </Card>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No tasks found. Create your first task to get started.
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} variant="neon" className="depth-4k-2 opacity-90 hover:opacity-100">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-lg flex-wrap">
                      <span className="truncate">{task.title}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          task.isActive
                            ? 'bg-eco-leaf/20 text-eco-forest border border-eco-leaf/30'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        {task.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {task.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="shrink-0 shadow-[0_0_10px_hsla(var(--destructive),0.3)] hover:shadow-[0_0_15px_hsla(var(--destructive),0.5),0_0_30px_hsla(var(--destructive),0.3)]"
                    onClick={() => {
                      setTaskToDelete(task)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <div className="text-eco-leaf font-medium flex items-center gap-1">
                      <span className="text-lg">💰</span>
                      {task.points} pts
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <span className="text-lg">✓</span>
                      {task._count.completions}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 truncate">
                      <span className="text-base">📋</span>
                      <span className="truncate">{task.campaign.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-base">🏷️</span>
                      {task.taskType.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full hover:bg-eco-leaf/10 hover:border-eco-leaf/50"
                      onClick={() => window.location.href = `/admin/tasks/${task.id}`}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          // Reset taskToDelete when dialog is closed (cancelled)
          if (!open) {
            setTaskToDelete(null)
          }
        }}
      >
        <AlertDialogContent className="bg-gradient-to-br from-card/90 via-card/90 to-eco-leaf/5 border border-eco-leaf/30 backdrop-blur-[10px] shadow-[0_0_20px_hsla(var(--eco-leaf),0.2)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-eco-forest dark:text-eco-leaf">
              Delete Task
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone and will permanently remove the task and all associated completions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-eco-leaf/10 hover:border-eco-leaf/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_0_10px_hsla(var(--destructive),0.3)] hover:shadow-[0_0_15px_hsla(var(--destructive),0.5)]"
              onClick={handleDeleteTask}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CreateTaskForm({
  campaigns,
  onClose,
  onSuccess,
}: {
  campaigns: Campaign[]
  onClose: () => void
  onSuccess: () => void
}) {
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to create task')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
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
              className="w-full px-3 py-2 border rounded-md"
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
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
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
                className="w-full px-3 py-2 border rounded-md"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Task Type *</label>
              <select
                value={formData.taskType}
                onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
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
              className="w-full px-3 py-2 border rounded-md"
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
                  className="w-full px-3 py-2 border rounded-md"
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

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
