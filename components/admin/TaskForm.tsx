'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Task, TaskType } from '@/types'
import { useTranslations } from 'next-intl'
import { calculateExpiration, formatExpirationTime } from '@/lib/tasks/expiration'
import { Clock } from 'lucide-react'

interface TaskFormProps {
  task?: Task
  onSuccess: () => void
  onCancel: () => void
}

export default function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const t = useTranslations('admin.tasks.form')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTimeLimited, setIsTimeLimited] = useState(false)
  const [duration, setDuration] = useState<number>(1)
  const [expirationPreview, setExpirationPreview] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          points: task.points,
          taskType: task.taskType,
          taskUrl: task.taskUrl || '',
          isActive: task.isActive,
          isTimeLimited: !!task.duration,
          duration: task.duration || 1,
        }
      : {
          title: '',
          description: '',
          points: 10,
          taskType: 'TWITTER_FOLLOW' as TaskType,
          taskUrl: '',
          isActive: true,
          isTimeLimited: false,
          duration: 1,
        },
  })

  // Initialize state from task if editing
  useEffect(() => {
    if (task?.duration) {
      setIsTimeLimited(true)
      setDuration(task.duration)
    } else {
      setIsTimeLimited(false)
      setDuration(1)
    }
  }, [task])

  // Update expiration preview when duration changes
  useEffect(() => {
    if (isTimeLimited && duration) {
      const expiresAt = calculateExpiration(duration)
      setExpirationPreview(formatExpirationTime(expiresAt))
    } else {
      setExpirationPreview('')
    }
  }, [isTimeLimited, duration])

  const onSubmit = async (data: TaskInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const url = task ? `/api/admin/tasks/${task.id}` : '/api/admin/tasks'
      const method = task ? 'PUT' : 'POST'

      // Prepare data with time-limited fields
      const submitData = {
        ...data,
        isTimeLimited,
        duration: isTimeLimited ? duration : null,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || t('saveError'))
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <span className="text-red-600 dark:text-red-400 text-xs">!</span>
          </div>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {t('title')}
        </label>
        <Input
          id="title"
          {...register('title')}
          placeholder={t('titlePlaceholder')}
          className={errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-eco-leaf/20 focus:border-eco-leaf focus:ring-eco-leaf/20'}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
            <span className="text-xs">⚠</span> {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {t('description')}
        </label>
        <textarea
          id="description"
          {...register('description')}
          placeholder={t('descriptionPlaceholder')}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.description 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-eco-leaf/20 focus:border-eco-leaf focus:ring-eco-leaf/20'
          } bg-white dark:bg-slate-950 text-slate-900 dark:text-white`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
            <span className="text-xs">⚠</span> {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="points" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('points')}
          </label>
          <Input
            id="points"
            type="number"
            {...register('points', { valueAsNumber: true })}
            placeholder={t('pointsPlaceholder')}
            className={errors.points ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-eco-leaf/20 focus:border-eco-leaf focus:ring-eco-leaf/20'}
          />
          {errors.points && (
            <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
              <span className="text-xs">⚠</span> {errors.points.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="taskType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('taskType')}
          </label>
          <select
            id="taskType"
            {...register('taskType')}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.taskType 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-eco-leaf/20 focus:border-eco-leaf focus:ring-eco-leaf/20'
            } bg-white dark:bg-slate-950 text-slate-900 dark:text-white`}
          >
            <option value="TWITTER_FOLLOW">{t('types.TWITTER_FOLLOW')}</option>
            <option value="TWITTER_LIKE">{t('types.TWITTER_LIKE')}</option>
            <option value="TWITTER_RETWEET">{t('types.TWITTER_RETWEET')}</option>
            <option value="TELEGRAM_JOIN">{t('types.TELEGRAM_JOIN')}</option>
            <option value="REFERRAL">{t('types.REFERRAL')}</option>
            <option value="CUSTOM">{t('types.CUSTOM')}</option>
          </select>
          {errors.taskType && (
            <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
              <span className="text-xs">⚠</span> {errors.taskType.message}
            </p>
          )}
        </div>
      </div>

      {/* Referral Task Help Text */}
      {watch('taskType') === 'REFERRAL' && (
        <div className="space-y-3 p-4 rounded-lg bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/30">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-purple-600 dark:text-purple-400 text-sm">ℹ</span>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                {t('referralTask.title')}
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {t('referralTask.description')}
              </p>
              <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-1 ml-4 list-disc">
                <li>{t('referralTask.howItWorks.step1')}</li>
                <li>{t('referralTask.howItWorks.step2')}</li>
                <li>{t('referralTask.howItWorks.step3')}</li>
                <li>{t('referralTask.howItWorks.step4')}</li>
              </ul>
              <p className="text-xs text-purple-600 dark:text-purple-400 italic mt-2">
                💡 {t('referralTask.tip')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="taskUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {t('taskUrl')}
        </label>
        <Input
          id="taskUrl"
          {...register('taskUrl')}
          placeholder={t('taskUrlPlaceholder')}
          className={errors.taskUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-eco-leaf/20 focus:border-eco-leaf focus:ring-eco-leaf/20'}
        />
        {errors.taskUrl && (
          <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
            <span className="text-xs">⚠</span> {errors.taskUrl.message}
          </p>
        )}
      </div>

      {/* Time-Limited Task Section */}
      <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/30">
        <div className="flex items-center gap-3">
          <input
            id="isTimeLimited"
            type="checkbox"
            checked={isTimeLimited}
            onChange={(e) => setIsTimeLimited(e.target.checked)}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500/20 border-blue-300 rounded transition-colors cursor-pointer"
          />
          <label htmlFor="isTimeLimited" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t('timeLimited.enable')}
          </label>
        </div>

        {isTimeLimited && (
          <div className="space-y-3 pl-8">
            {/* Show current expiration time if editing existing task */}
            {task?.expiresAt && (
              <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/20 px-3 py-2 rounded border border-amber-200 dark:border-amber-800">
                <Clock className="w-4 h-4" />
                <div>
                  <div className="font-medium">{t('timeLimited.currentExpiration')}</div>
                  <div className="text-xs">
                    {new Date(task.expiresAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('timeLimited.duration')}
              </label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="24"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                placeholder={t('timeLimited.durationPlaceholder')}
                className="border-blue-300 dark:border-blue-700 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('timeLimited.durationHelp')}
              </p>
            </div>

            {expirationPreview && (
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-900/20 px-3 py-2 rounded">
                <Clock className="w-4 h-4" />
                <span>
                  {task ? t('timeLimited.newExpiration') : t('timeLimited.willExpire')}
                  {' '}
                  {expirationPreview} 
                  {task ? ' from now' : ' after creation'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-eco-leaf/5 to-eco-forest/5 border border-eco-leaf/20">
        <input
          id="isActive"
          type="checkbox"
          {...register('isActive')}
          className="h-5 w-5 text-eco-leaf focus:ring-eco-leaf/20 border-eco-leaf/30 rounded transition-colors cursor-pointer"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
          {t('isActive')}
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="flex-1 bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-leaf/90 hover:to-eco-forest/90"
        >
          {isSubmitting ? t('saving') : task ? t('update') : t('submit')}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSubmitting}
          className="border-eco-leaf/20 hover:bg-eco-leaf/10"
        >
          {t('cancel')}
        </Button>
      </div>
    </form>
  )
}
