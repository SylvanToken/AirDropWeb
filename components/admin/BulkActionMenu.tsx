'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ChevronDown, 
  Trash2, 
  Ban, 
  CheckCircle, 
  Coins,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { UserWithStats } from '@/types'

interface BulkActionMenuProps {
  selectedUsers: string[]
  users: UserWithStats[]
  onSelectionChange: (userIds: string[]) => void
  onOperationComplete: () => void
}

interface OperationResult {
  success: number
  failed: number
  errors: string[]
}

export default function BulkActionMenu({
  selectedUsers,
  users,
  onSelectionChange,
  onOperationComplete,
}: BulkActionMenuProps) {
  const t = useTranslations('admin.bulkActions')
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showPointsDialog, setShowPointsDialog] = useState(false)
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [pointsToAssign, setPointsToAssign] = useState('')
  const [operationResult, setOperationResult] = useState<OperationResult | null>(null)

  const allSelected = users.length > 0 && selectedUsers.length === users.length
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < users.length

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(users.map(u => u.id))
    }
  }

  const handleBulkOperation = async (
    operation: 'delete' | 'block' | 'activate' | 'assign_points',
    data?: any
  ) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/bulk-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: operation === 'block' ? 'update_status' : 
                operation === 'activate' ? 'update_status' : operation,
          userIds: selectedUsers,
          data: operation === 'block' ? { status: 'BLOCKED' } :
                operation === 'activate' ? { status: 'ACTIVE' } :
                data,
        }),
      })

      if (!response.ok) {
        throw new Error('Operation failed')
      }

      const result = await response.json()
      setOperationResult(result)
      setShowResultDialog(true)
      
      // Clear selection and refresh
      onSelectionChange([])
      onOperationComplete()
    } catch (error) {
      console.error('Bulk operation error:', error)
      setOperationResult({
        success: 0,
        failed: selectedUsers.length,
        errors: ['Operation failed. Please try again.'],
      })
      setShowResultDialog(true)
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
      setShowBlockDialog(false)
      setShowPointsDialog(false)
    }
  }

  const handleAssignPoints = () => {
    const points = parseInt(pointsToAssign)
    if (isNaN(points) || points === 0) {
      return
    }
    handleBulkOperation('assign_points', { points })
  }

  const handleExport = () => {
    const selectedUserData = users.filter(u => selectedUsers.includes(u.id))
    
    // Create CSV content
    const headers = ['Username', 'Email', 'Points', 'Completions', 'Role', 'Status']
    const rows = selectedUserData.map(user => [
      user.username,
      user.email,
      user.totalPoints,
      user.completionCount,
      user.role,
      user.status || 'ACTIVE'
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `selected-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-eco-leaf/10 to-eco-forest/10 border border-eco-leaf/20 rounded-lg">
        {/* Select All Checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={allSelected}
            ref={(el: any) => {
              if (el) {
                el.indeterminate = someSelected
              }
            }}
            onCheckedChange={handleSelectAll}
            className="border-eco-leaf data-[state=checked]:bg-eco-leaf data-[state=checked]:border-eco-leaf"
          />
          <Label 
            htmlFor="select-all" 
            className="text-sm font-medium cursor-pointer"
          >
            {t('selectAll')}
          </Label>
        </div>

        {/* Selected Count */}
        {selectedUsers.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {t('selectedCount', { count: selectedUsers.length })}
          </div>
        )}

        {/* Bulk Actions Dropdown */}
        {selectedUsers.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                disabled={isLoading}
                className="ml-auto bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-leaf/90 hover:to-eco-forest/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('processing')}
                  </>
                ) : (
                  <>
                    {t('bulkActions')}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => setShowPointsDialog(true)}
                className="cursor-pointer"
              >
                <Coins className="h-4 w-4 mr-2 text-amber-600" />
                {t('assignPoints')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleBulkOperation('activate')}
                className="cursor-pointer"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                {t('activate')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowBlockDialog(true)}
                className="cursor-pointer"
              >
                <Ban className="h-4 w-4 mr-2 text-orange-600" />
                {t('block')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleExport}
                className="cursor-pointer"
              >
                <Download className="h-4 w-4 mr-2 text-blue-600" />
                {t('export')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              {t('deleteDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialog.description', { count: selectedUsers.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              {t('deleteDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkOperation('delete')}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('deleteDialog.deleting')}
                </>
              ) : (
                t('deleteDialog.confirm')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block Confirmation Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-orange-600" />
              {t('blockDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('blockDialog.description', { count: selectedUsers.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              {t('blockDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkOperation('block')}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('blockDialog.blocking')}
                </>
              ) : (
                t('blockDialog.confirm')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Points Dialog */}
      <Dialog open={showPointsDialog} onOpenChange={setShowPointsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-600" />
              {t('pointsDialog.title')}
            </DialogTitle>
            <DialogDescription>
              {t('pointsDialog.description', { count: selectedUsers.length })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="points">{t('pointsDialog.label')}</Label>
            <Input
              id="points"
              type="number"
              placeholder="100"
              value={pointsToAssign}
              onChange={(e) => setPointsToAssign(e.target.value)}
              className="mt-2"
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground mt-2">
              {t('pointsDialog.hint')}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPointsDialog(false)}
              disabled={isLoading}
            >
              {t('pointsDialog.cancel')}
            </Button>
            <Button
              onClick={handleAssignPoints}
              disabled={isLoading || !pointsToAssign || parseInt(pointsToAssign) === 0}
              className="bg-gradient-to-r from-eco-leaf to-eco-forest"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('pointsDialog.assigning')}
                </>
              ) : (
                t('pointsDialog.confirm')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Operation Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {operationResult && operationResult.failed === 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  {t('resultDialog.successTitle')}
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  {t('resultDialog.partialTitle')}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {operationResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900 dark:text-green-100">
                      {t('resultDialog.successful')}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {operationResult.success}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900 dark:text-red-100">
                      {t('resultDialog.failed')}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {operationResult.failed}
                  </div>
                </div>
              </div>

              {operationResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-900 dark:text-red-100">
                    {t('resultDialog.errors')}
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {operationResult.errors.map((error, index) => (
                      <div
                        key={index}
                        className="text-sm text-red-600 dark:text-red-400 p-2 rounded bg-red-50 dark:bg-red-900/20"
                      >
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>
              {t('resultDialog.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
