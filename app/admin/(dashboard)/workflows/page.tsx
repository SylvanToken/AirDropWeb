'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Plus,
  Zap,
  Edit,
  Trash2,
  Play,
  Loader2,
  UserCheck,
  Award,
  Clock,
  Mail,
  Bell,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import WorkflowBuilder from '@/components/admin/WorkflowBuilder'
import { type Workflow } from '@/lib/admin/workflows'

interface WorkflowStats {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  lastExecution?: string
}

export default function WorkflowsPage() {
  const { toast } = useToast()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [workflowStats, setWorkflowStats] = useState<Record<string, WorkflowStats>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
  const [deletingWorkflow, setDeletingWorkflow] = useState<Workflow | null>(null)
  const [testingWorkflow, setTestingWorkflow] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadWorkflows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadWorkflows = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/workflows')
      if (response.ok) {
        const data = await response.json()
        setWorkflows(data)
        
        // Load stats for each workflow
        data.forEach((workflow: Workflow) => {
          loadWorkflowStats(workflow.id)
        })
      }
    } catch (error) {
      console.error('Failed to load workflows:', error)
      toast({
        title: 'Error',
        description: 'Failed to load workflows',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadWorkflowStats = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/admin/workflows/${workflowId}`)
      if (response.ok) {
        const stats = await response.json()
        setWorkflowStats(prev => ({ ...prev, [workflowId]: stats }))
      }
    } catch (error) {
      console.error('Failed to load workflow stats:', error)
    }
  }

  const handleCreateWorkflow = async (workflowData: Omit<Workflow, 'id'>) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      })

      if (response.ok) {
        const newWorkflow = await response.json()
        setWorkflows([...workflows, newWorkflow])
        setShowCreateDialog(false)
        toast({
          title: 'Success',
          description: 'Workflow created successfully',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.errors?.join(', ') || 'Failed to create workflow',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to create workflow:', error)
      toast({
        title: 'Error',
        description: 'Failed to create workflow',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateWorkflow = async (workflowData: Omit<Workflow, 'id'>) => {
    if (!editingWorkflow) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/workflows/${editingWorkflow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      })

      if (response.ok) {
        const updatedWorkflow = await response.json()
        setWorkflows(
          workflows.map(w => (w.id === updatedWorkflow.id ? updatedWorkflow : w))
        )
        setEditingWorkflow(null)
        toast({
          title: 'Success',
          description: 'Workflow updated successfully',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.errors?.join(', ') || 'Failed to update workflow',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to update workflow:', error)
      toast({
        title: 'Error',
        description: 'Failed to update workflow',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async (workflow: Workflow) => {
    try {
      const response = await fetch(`/api/admin/workflows/${workflow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !workflow.isActive }),
      })

      if (response.ok) {
        const updatedWorkflow = await response.json()
        setWorkflows(
          workflows.map(w => (w.id === updatedWorkflow.id ? updatedWorkflow : w))
        )
        toast({
          title: 'Success',
          description: `Workflow ${updatedWorkflow.isActive ? 'enabled' : 'disabled'}`,
        })
      }
    } catch (error) {
      console.error('Failed to toggle workflow:', error)
      toast({
        title: 'Error',
        description: 'Failed to update workflow',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteWorkflow = async () => {
    if (!deletingWorkflow) return

    try {
      const response = await fetch(`/api/admin/workflows/${deletingWorkflow.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setWorkflows(workflows.filter(w => w.id !== deletingWorkflow.id))
        setDeletingWorkflow(null)
        toast({
          title: 'Success',
          description: 'Workflow deleted successfully',
        })
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete workflow',
        variant: 'destructive',
      })
    }
  }

  const handleTestWorkflow = async (workflowId: string) => {
    setTestingWorkflow(workflowId)
    try {
      const response = await fetch(`/api/admin/workflows/${workflowId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            userId: 'test-user',
            userEmail: 'test@example.com',
            username: 'testuser',
          },
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.success) {
          toast({
            title: 'Test Successful',
            description: `Executed ${result.actionsExecuted} action(s) in ${result.executionTime}ms`,
          })
        } else {
          toast({
            title: 'Test Failed',
            description: result.errors.join(', '),
            variant: 'destructive',
          })
        }
      }
    } catch (error) {
      console.error('Failed to test workflow:', error)
      toast({
        title: 'Error',
        description: 'Failed to test workflow',
        variant: 'destructive',
      })
    } finally {
      setTestingWorkflow(null)
    }
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

  const getTriggerLabel = (type: Workflow['trigger']['type']) => {
    switch (type) {
      case 'user_registered':
        return 'User Registered'
      case 'task_completed':
        return 'Task Completed'
      case 'schedule':
        return 'Scheduled'
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-eco-leaf" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Management</h1>
          <p className="text-muted-foreground mt-1">
            Automate tasks with custom workflows
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-leaf/90 hover:to-eco-forest/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Workflows List */}
      {workflows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first workflow to automate tasks
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-eco-leaf to-eco-forest"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {workflows.map((workflow) => {
            const stats = workflowStats[workflow.id]
            const successRate = stats
              ? stats.totalExecutions > 0
                ? Math.round(
                    (stats.successfulExecutions / stats.totalExecutions) * 100
                  )
                : 0
              : 0

            return (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{workflow.name}</CardTitle>
                        {workflow.isActive ? (
                          <Badge variant="default" className="bg-eco-leaf">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        {getTriggerIcon(workflow.trigger.type)}
                        {getTriggerLabel(workflow.trigger.type)}
                        {workflow.trigger.conditions &&
                          workflow.trigger.conditions.length > 0 && (
                            <Badge variant="outline" className="ml-2">
                              {workflow.trigger.conditions.length} condition(s)
                            </Badge>
                          )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={workflow.isActive}
                        onCheckedChange={() => handleToggleActive(workflow)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Actions */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      {workflow.actions.map((action, index) => (
                        <Badge key={index} variant="outline" className="gap-1">
                          {getActionIcon(action.type)}
                          {action.type.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  {stats && stats.totalExecutions > 0 && (
                    <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Runs</p>
                        <p className="text-lg font-semibold">
                          {stats.totalExecutions}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                        <div className="flex items-center gap-1">
                          <p className="text-lg font-semibold">{successRate}%</p>
                          {successRate >= 90 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : successRate >= 70 ? (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Successful</p>
                        <p className="text-lg font-semibold text-green-600">
                          {stats.successfulExecutions}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Failed</p>
                        <p className="text-lg font-semibold text-red-600">
                          {stats.failedExecutions}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestWorkflow(workflow.id)}
                      disabled={testingWorkflow === workflow.id}
                    >
                      {testingWorkflow === workflow.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Test
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingWorkflow(workflow)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingWorkflow(workflow)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Workflow</DialogTitle>
            <DialogDescription>
              Set up a new automated workflow
            </DialogDescription>
          </DialogHeader>
          <WorkflowBuilder
            onSave={handleCreateWorkflow}
            onCancel={() => setShowCreateDialog(false)}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog
        open={!!editingWorkflow}
        onOpenChange={(open) => !open && setEditingWorkflow(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
            <DialogDescription>
              Update your workflow configuration
            </DialogDescription>
          </DialogHeader>
          {editingWorkflow && (
            <WorkflowBuilder
              workflow={editingWorkflow}
              onSave={handleUpdateWorkflow}
              onCancel={() => setEditingWorkflow(null)}
              isSaving={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingWorkflow}
        onOpenChange={(open) => !open && setDeletingWorkflow(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingWorkflow?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkflow}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
