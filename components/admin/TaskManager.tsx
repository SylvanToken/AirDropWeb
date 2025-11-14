'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import TaskForm from './TaskForm'
import { Pencil, Trash2, Plus, CheckCircle, XCircle, ExternalLink, Users, Award, Sparkles } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/loading'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { TaskGenerator } from './TaskGenerator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TaskManager() {
  const t = useTranslations('admin.tasks')
  const [tasks, setTasks] = useState<(Task & { _count?: { completions: number } })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [activeTab, setActiveTab] = useState<'manage' | 'generate'>('manage')
  const [defaultCampaignId, setDefaultCampaignId] = useState<string>('')

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/tasks')
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }

      const result = await response.json()
      setTasks(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchDefaultCampaign()
  }, [])

  const fetchDefaultCampaign = async () => {
    try {
      const response = await fetch('/api/admin/campaigns')
      if (response.ok) {
        const data = await response.json()
        if (data.campaigns && data.campaigns.length > 0) {
          setDefaultCampaignId(data.campaigns[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm(t('deleteConfirm'))) {
      return
    }

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(t('deleteError'))
      }

      await fetchTasks()
    } catch (err) {
      alert(err instanceof Error ? err.message : t('deleteError'))
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleFormSuccess = async () => {
    setShowForm(false)
    setEditingTask(null)
    await fetchTasks()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  const getTaskTypeLabel = (type: string) => {
    return t(`form.types.${type}`)
  }

  const getTaskTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      TWITTER_FOLLOW: 'from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300',
      TWITTER_LIKE: 'from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 text-pink-700 dark:text-pink-300',
      TWITTER_RETWEET: 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300',
      TELEGRAM_JOIN: 'from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 text-sky-700 dark:text-sky-300',
      CUSTOM: 'from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 text-purple-700 dark:text-purple-300',
    }
    return colors[type] || colors.CUSTOM
  }

  const filteredTasks = tasks.filter(task => {
    if (filterActive === 'active') return task.isActive
    if (filterActive === 'inactive') return !task.isActive
    return true
  })

  if (isLoading) {
    return <TableSkeleton rows={5} columns={3} />
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950/20">
        <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
          <XCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        {!showForm && activeTab === 'manage' && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-leaf/90 hover:to-eco-forest/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('createButton')}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'manage' | 'generate')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Manage Tasks
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4 mt-6">

      {/* Filters */}
      {!showForm && (
        <div className="flex gap-2">
          <Button
            variant={filterActive === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterActive('all')}
            className={cn(
              filterActive === 'all' && "bg-gradient-to-r from-eco-leaf to-eco-forest"
            )}
          >
            {t('filters.all')}
          </Button>
          <Button
            variant={filterActive === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterActive('active')}
            className={cn(
              filterActive === 'active' && "bg-gradient-to-r from-eco-leaf to-eco-forest"
            )}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            {t('filters.active')}
          </Button>
          <Button
            variant={filterActive === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterActive('inactive')}
            className={cn(
              filterActive === 'inactive' && "bg-gradient-to-r from-eco-leaf to-eco-forest"
            )}
          >
            <XCircle className="h-4 w-4 mr-1" />
            {t('filters.inactive')}
          </Button>
        </div>
      )}

      {/* Task Form */}
      {showForm && (
        <Card className="p-6 border-eco-leaf/20 bg-gradient-to-br from-eco-leaf/5 to-eco-forest/5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-eco-leaf to-eco-forest flex items-center justify-center">
              {editingTask ? <Pencil className="h-4 w-4 text-white" /> : <Plus className="h-4 w-4 text-white" />}
            </div>
            {editingTask ? t('editTitle') : t('createTitle')}
          </h3>
          <TaskForm
            task={editingTask || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </Card>
      )}

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card className="p-12 text-center border-eco-leaf/20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-eco-leaf/20 to-eco-forest/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-eco-leaf" />
              </div>
              <p className="text-muted-foreground">{t('empty')}</p>
            </div>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="p-4 sm:p-6 border-eco-leaf/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 w-full sm:w-auto">
                  {/* Task Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md',
                        task.isActive
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-900/30 dark:to-gray-900/30 text-slate-700 dark:text-slate-300'
                      )}
                    >
                      {task.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {task.isActive ? t('active') : t('inactive')}
                    </span>
                    <span className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-md bg-gradient-to-r',
                      getTaskTypeColor(task.taskType)
                    )}>
                      {getTaskTypeLabel(task.taskType)}
                    </span>
                  </div>

                  {/* Task Description */}
                  <p className="text-slate-600 dark:text-slate-400 mb-4">{task.description}</p>

                  {/* Task Stats */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                      <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                        {task.points} {t('points')}
                      </span>
                    </div>
                    {task._count && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {task._count.completions} {t('completions')}
                        </span>
                      </div>
                    )}
                    {task.taskUrl && (
                      <a
                        href={task.taskUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-eco-leaf hover:text-eco-forest transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t('viewUrl')}
                      </a>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full sm:w-auto sm:ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(task)}
                    className="border-eco-leaf/20 hover:bg-eco-leaf/10 hover:border-eco-leaf"
                  >
                    <Pencil className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t('edit')}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/30 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t('delete')}</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Results Count */}
      {!showForm && (
        <div className="text-sm text-muted-foreground">
          {t('resultsCount', { count: filteredTasks.length, total: tasks.length })}
        </div>
      )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-4 mt-6">
          {defaultCampaignId ? (
            <TaskGenerator 
              campaignId={defaultCampaignId} 
              onTasksGenerated={() => {
                fetchTasks()
                setActiveTab('manage')
              }}
            />
          ) : (
            <Card className="p-6">
              <p className="text-muted-foreground">No campaign found. Please create a campaign first.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
