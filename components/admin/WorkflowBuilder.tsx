'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  X,
  Trash2,
  Zap,
  Mail,
  UserCheck,
  Award,
  Bell,
  Calendar,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { type Workflow, type WorkflowCondition } from '@/lib/admin/workflows'

interface WorkflowBuilderProps {
  workflow?: Workflow
  onSave: (workflow: Omit<Workflow, 'id'>) => void
  onCancel: () => void
  isSaving?: boolean
}

export default function WorkflowBuilder({
  workflow,
  onSave,
  onCancel,
  isSaving = false,
}: WorkflowBuilderProps) {
  const [name, setName] = useState(workflow?.name || '')
  const [triggerType, setTriggerType] = useState<Workflow['trigger']['type']>(
    workflow?.trigger.type || 'user_registered'
  )
  const [conditions, setConditions] = useState<WorkflowCondition[]>(
    workflow?.trigger.conditions || []
  )
  const [scheduleConfig, setScheduleConfig] = useState(
    workflow?.trigger.scheduleConfig || { interval: 60 }
  )
  const [actions, setActions] = useState<Workflow['actions']>(
    workflow?.actions || []
  )
  const [isActive, setIsActive] = useState(workflow?.isActive ?? true)
  const [showConditions, setShowConditions] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const workflowData: Omit<Workflow, 'id'> = {
      name,
      trigger: {
        type: triggerType,
        conditions: conditions.length > 0 ? conditions : undefined,
        scheduleConfig: triggerType === 'schedule' ? scheduleConfig : undefined,
      },
      actions,
      isActive,
    }

    onSave(workflowData)
  }

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        field: 'userStatus',
        operator: 'equals',
        value: '',
        logic: conditions.length > 0 ? 'AND' : undefined,
      },
    ])
  }

  const updateCondition = (
    index: number,
    updates: Partial<WorkflowCondition>
  ) => {
    const newConditions = [...conditions]
    newConditions[index] = { ...newConditions[index], ...updates }
    setConditions(newConditions)
  }

  const removeCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index)
    if (newConditions.length > 0 && newConditions[0].logic) {
      newConditions[0] = { ...newConditions[0], logic: undefined }
    }
    setConditions(newConditions)
  }

  const addAction = (type: Workflow['actions'][0]['type']) => {
    const defaultConfig: Record<string, any> = {}
    
    switch (type) {
      case 'send_email':
        defaultConfig.template = 'welcome'
        defaultConfig.subject = 'Welcome!'
        break
      case 'update_status':
        defaultConfig.status = 'ACTIVE'
        break
      case 'assign_points':
        defaultConfig.points = 10
        break
      case 'create_notification':
        defaultConfig.message = 'You have a new notification'
        defaultConfig.type = 'info'
        break
    }

    setActions([...actions, { type, config: defaultConfig }])
  }

  const updateAction = (
    index: number,
    updates: Partial<Workflow['actions'][0]>
  ) => {
    const newActions = [...actions]
    newActions[index] = { ...newActions[index], ...updates }
    setActions(newActions)
  }

  const updateActionConfig = (
    index: number,
    key: string,
    value: any
  ) => {
    const newActions = [...actions]
    newActions[index] = {
      ...newActions[index],
      config: {
        ...newActions[index].config,
        [key]: value,
      },
    }
    setActions(newActions)
  }

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index))
  }

  const getTriggerIcon = (type: Workflow['trigger']['type']) => {
    switch (type) {
      case 'user_registered':
        return <UserCheck className="h-4 w-4" />
      case 'task_completed':
        return <Award className="h-4 w-4" />
      case 'schedule':
        return <Clock className="h-4 w-4" />
    }
  }

  const getActionIcon = (type: Workflow['actions'][0]['type']) => {
    switch (type) {
      case 'send_email':
        return <Mail className="h-4 w-4" />
      case 'update_status':
        return <UserCheck className="h-4 w-4" />
      case 'assign_points':
        return <Award className="h-4 w-4" />
      case 'create_notification':
        return <Bell className="h-4 w-4" />
    }
  }

  const getActionLabel = (type: Workflow['actions'][0]['type']) => {
    switch (type) {
      case 'send_email':
        return 'Send Email'
      case 'update_status':
        return 'Update Status'
      case 'assign_points':
        return 'Assign Points'
      case 'create_notification':
        return 'Create Notification'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Workflow Name */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Details</CardTitle>
          <CardDescription>
            Give your workflow a descriptive name
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workflow Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Welcome new users"
              required
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable this workflow
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trigger Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-eco-leaf" />
            Trigger
          </CardTitle>
          <CardDescription>
            When should this workflow execute?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trigger-type">Trigger Type</Label>
            <Select
              value={triggerType}
              onValueChange={(value) =>
                setTriggerType(value as Workflow['trigger']['type'])
              }
              disabled={isSaving}
            >
              <SelectTrigger id="trigger-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user_registered">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    User Registered
                  </div>
                </SelectItem>
                <SelectItem value="task_completed">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Task Completed
                  </div>
                </SelectItem>
                <SelectItem value="schedule">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Scheduled
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Schedule Configuration */}
          {triggerType === 'schedule' && (
            <div className="space-y-2">
              <Label htmlFor="interval">Interval (minutes)</Label>
              <Input
                id="interval"
                type="number"
                min="1"
                value={scheduleConfig.interval}
                onChange={(e) =>
                  setScheduleConfig({
                    ...scheduleConfig,
                    interval: parseInt(e.target.value) || 60,
                  })
                }
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                How often should this workflow run?
              </p>
            </div>
          )}

          {/* Conditions */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowConditions(!showConditions)}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Conditions
                {conditions.length > 0 && (
                  <Badge variant="secondary">{conditions.length}</Badge>
                )}
              </span>
              {showConditions ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showConditions && (
              <div className="space-y-3 pt-2">
                {conditions.map((condition, index) => (
                  <div key={index} className="space-y-2">
                    {index > 0 && (
                      <Select
                        value={condition.logic || 'AND'}
                        onValueChange={(value) =>
                          updateCondition(index, {
                            logic: value as 'AND' | 'OR',
                          })
                        }
                        disabled={isSaving}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    <div className="flex items-start gap-2 p-3 rounded-lg border bg-card">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Field</Label>
                          <Input
                            value={condition.field}
                            onChange={(e) =>
                              updateCondition(index, { field: e.target.value })
                            }
                            placeholder="e.g., userStatus"
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Operator</Label>
                          <Select
                            value={condition.operator}
                            onValueChange={(value) =>
                              updateCondition(index, {
                                operator: value as WorkflowCondition['operator'],
                              })
                            }
                            disabled={isSaving}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="not_equals">Not Equals</SelectItem>
                              <SelectItem value="greater_than">Greater Than</SelectItem>
                              <SelectItem value="less_than">Less Than</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="in">In</SelectItem>
                              <SelectItem value="not_in">Not In</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Value</Label>
                          <Input
                            value={condition.value}
                            onChange={(e) =>
                              updateCondition(index, { value: e.target.value })
                            }
                            placeholder="Value"
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCondition(index)}
                        className="mt-5 text-muted-foreground hover:text-destructive"
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCondition}
                  className="w-full border-dashed"
                  disabled={isSaving}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            What should happen when the workflow triggers?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {actions.map((action, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border bg-card space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getActionIcon(action.type)}
                  <span className="font-medium">{getActionLabel(action.type)}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAction(index)}
                  className="text-muted-foreground hover:text-destructive"
                  disabled={isSaving}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Action-specific configuration */}
              {action.type === 'send_email' && (
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Email Template</Label>
                    <Input
                      value={action.config.template || ''}
                      onChange={(e) =>
                        updateActionConfig(index, 'template', e.target.value)
                      }
                      placeholder="welcome"
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subject</Label>
                    <Input
                      value={action.config.subject || ''}
                      onChange={(e) =>
                        updateActionConfig(index, 'subject', e.target.value)
                      }
                      placeholder="Welcome to Sylvan Token!"
                      disabled={isSaving}
                    />
                  </div>
                </div>
              )}

              {action.type === 'update_status' && (
                <div>
                  <Label className="text-xs">New Status</Label>
                  <Select
                    value={action.config.status || 'ACTIVE'}
                    onValueChange={(value) =>
                      updateActionConfig(index, 'status', value)
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="BLOCKED">Blocked</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {action.type === 'assign_points' && (
                <div>
                  <Label className="text-xs">Points</Label>
                  <Input
                    type="number"
                    value={action.config.points || 0}
                    onChange={(e) =>
                      updateActionConfig(
                        index,
                        'points',
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="10"
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use negative numbers to deduct points
                  </p>
                </div>
              )}

              {action.type === 'create_notification' && (
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Message</Label>
                    <Textarea
                      value={action.config.message || ''}
                      onChange={(e) =>
                        updateActionConfig(index, 'message', e.target.value)
                      }
                      placeholder="You have a new notification"
                      disabled={isSaving}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={action.config.type || 'info'}
                      onValueChange={(value) =>
                        updateActionConfig(index, 'type', value)
                      }
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addAction('send_email')}
              className="justify-start"
              disabled={isSaving}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addAction('update_status')}
              className="justify-start"
              disabled={isSaving}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Update Status
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addAction('assign_points')}
              className="justify-start"
              disabled={isSaving}
            >
              <Award className="h-4 w-4 mr-2" />
              Assign Points
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addAction('create_notification')}
              className="justify-start"
              disabled={isSaving}
            >
              <Bell className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </div>

          {actions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Add at least one action to your workflow
            </p>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving || !name || actions.length === 0}
          className="bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-leaf/90 hover:to-eco-forest/90"
        >
          {isSaving ? 'Saving...' : workflow ? 'Update Workflow' : 'Create Workflow'}
        </Button>
      </div>
    </form>
  )
}
