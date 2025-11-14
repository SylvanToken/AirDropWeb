'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Download, 
  Loader2, 
  FileText, 
  FileSpreadsheet, 
  FileJson,
  CheckCircle2,
  AlertCircle,
  Mail
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FilterCriteria } from '@/lib/admin/filters'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  model: 'users' | 'tasks' | 'completions' | 'campaigns'
  filters?: FilterCriteria[]
  availableFields: Array<{
    value: string
    label: string
  }>
}

type ExportFormat = 'csv' | 'excel' | 'json'

interface ExportStatus {
  type: 'success' | 'error' | 'async'
  message: string
}

export default function ExportDialog({
  open,
  onOpenChange,
  model,
  filters = [],
  availableFields,
}: ExportDialogProps) {
  const t = useTranslations('admin.export')
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [selectedFields, setSelectedFields] = useState<string[]>(
    availableFields.map(f => f.value)
  )
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null)

  const allFieldsSelected = selectedFields.length === availableFields.length
  const someFieldsSelected = selectedFields.length > 0 && selectedFields.length < availableFields.length

  const handleSelectAllFields = () => {
    if (allFieldsSelected) {
      setSelectedFields([])
    } else {
      setSelectedFields(availableFields.map(f => f.value))
    }
  }

  const handleFieldToggle = (fieldValue: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldValue)
        ? prev.filter(f => f !== fieldValue)
        : [...prev, fieldValue]
    )
  }

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      setExportStatus({
        type: 'error',
        message: t('errors.noFields')
      })
      return
    }

    setIsExporting(true)
    setExportStatus(null)

    try {
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          model,
          filters,
          fields: selectedFields,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }

      // Check if this is an async export (large dataset)
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const result = await response.json()
        if (result.async) {
          setExportStatus({
            type: 'async',
            message: t('status.asyncExport')
          })
          return
        }
      }

      // Handle direct download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Get filename from Content-Disposition header or generate one
      const disposition = response.headers.get('content-disposition')
      const filenameMatch = disposition?.match(/filename="?(.+)"?/)
      a.download = filenameMatch?.[1] || `${model}_export.${format}`
      
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setExportStatus({
        type: 'success',
        message: t('status.success')
      })

      // Close dialog after successful export
      setTimeout(() => {
        onOpenChange(false)
        setExportStatus(null)
      }, 2000)
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus({
        type: 'error',
        message: error instanceof Error ? error.message : t('errors.failed')
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getFormatIcon = (fmt: ExportFormat) => {
    switch (fmt) {
      case 'csv':
        return <FileText className="h-4 w-4" />
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />
      case 'json':
        return <FileJson className="h-4 w-4" />
    }
  }

  const getFormatDescription = (fmt: ExportFormat) => {
    switch (fmt) {
      case 'csv':
        return t('formats.csvDesc')
      case 'excel':
        return t('formats.excelDesc')
      case 'json':
        return t('formats.jsonDesc')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-eco-leaf" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description', { model: t(`models.${model}`) })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('formatLabel')}</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['csv', 'excel', 'json'] as ExportFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                    ${format === fmt
                      ? 'border-eco-leaf bg-eco-leaf/10'
                      : 'border-border hover:border-eco-leaf/50'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-full
                    ${format === fmt ? 'bg-eco-leaf text-white' : 'bg-muted text-muted-foreground'}
                  `}>
                    {getFormatIcon(fmt)}
                  </div>
                  <div className="text-center">
                    <div className="font-medium uppercase text-sm">{fmt}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getFormatDescription(fmt)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Field Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">{t('fieldsLabel')}</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAllFields}
                className="h-8 text-xs"
              >
                {allFieldsSelected ? t('deselectAll') : t('selectAll')}
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
              {/* Select All Checkbox */}
              <div className="flex items-center gap-2 pb-3 mb-3 border-b">
                <Checkbox
                  id="select-all-fields"
                  checked={allFieldsSelected}
                  ref={(el) => {
                    if (el) {
                      (el as any).indeterminate = someFieldsSelected
                    }
                  }}
                  onCheckedChange={handleSelectAllFields}
                  className="border-eco-leaf data-[state=checked]:bg-eco-leaf data-[state=checked]:border-eco-leaf"
                />
                <Label
                  htmlFor="select-all-fields"
                  className="text-sm font-medium cursor-pointer"
                >
                  {t('allFields')} ({selectedFields.length}/{availableFields.length})
                </Label>
              </div>

              {/* Individual Field Checkboxes */}
              <div className="grid grid-cols-2 gap-3">
                {availableFields.map((field) => (
                  <div key={field.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`field-${field.value}`}
                      checked={selectedFields.includes(field.value)}
                      onCheckedChange={() => handleFieldToggle(field.value)}
                      className="border-eco-leaf data-[state=checked]:bg-eco-leaf data-[state=checked]:border-eco-leaf"
                    />
                    <Label
                      htmlFor={`field-${field.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters Info */}
          {filters && filters.length > 0 && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-blue-900 dark:text-blue-100">
                    {t('filtersApplied')}
                  </div>
                  <div className="text-blue-700 dark:text-blue-300 mt-1">
                    {t('filtersCount', { count: filters.length })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Status */}
          {exportStatus && (
            <div className={`
              p-3 rounded-lg border flex items-start gap-2
              ${exportStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}
              ${exportStatus.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : ''}
              ${exportStatus.type === 'async' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : ''}
            `}>
              {exportStatus.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />}
              {exportStatus.type === 'error' && <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />}
              {exportStatus.type === 'async' && <Mail className="h-4 w-4 text-amber-600 mt-0.5" />}
              <div className="text-sm">
                <div className={`
                  font-medium
                  ${exportStatus.type === 'success' ? 'text-green-900 dark:text-green-100' : ''}
                  ${exportStatus.type === 'error' ? 'text-red-900 dark:text-red-100' : ''}
                  ${exportStatus.type === 'async' ? 'text-amber-900 dark:text-amber-100' : ''}
                `}>
                  {exportStatus.type === 'success' && t('status.successTitle')}
                  {exportStatus.type === 'error' && t('status.errorTitle')}
                  {exportStatus.type === 'async' && t('status.asyncTitle')}
                </div>
                <div className={`
                  mt-1
                  ${exportStatus.type === 'success' ? 'text-green-700 dark:text-green-300' : ''}
                  ${exportStatus.type === 'error' ? 'text-red-700 dark:text-red-300' : ''}
                  ${exportStatus.type === 'async' ? 'text-amber-700 dark:text-amber-300' : ''}
                `}>
                  {exportStatus.message}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedFields.length === 0}
            className="bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-leaf/90 hover:to-eco-forest/90"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('exporting')}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {t('export')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
