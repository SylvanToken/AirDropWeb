'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Filter,
  Plus,
  X,
  Save,
  Loader2,
  Calendar,
  Hash,
  Type,
  ChevronDown,
  Trash2,
  Check,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FilterCriteria, FilterPreset } from '@/lib/admin/filters'

interface AdvancedFiltersProps {
  onFilterChange: (criteria: FilterCriteria[]) => void
  availableFields: Array<{
    value: string
    label: string
    type: 'text' | 'number' | 'date' | 'select'
    options?: Array<{ value: string; label: string }>
  }>
}

export default function AdvancedFilters({
  onFilterChange,
  availableFields,
}: AdvancedFiltersProps) {
  const t = useTranslations('admin.filters')
  const [criteria, setCriteria] = useState<FilterCriteria[]>([])
  const [presets, setPresets] = useState<FilterPreset[]>([])
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Load filter presets on mount
  useEffect(() => {
    loadPresets()
  }, [])

  const loadPresets = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/filter-presets')
      if (response.ok) {
        const data = await response.json()
        setPresets(data)
      }
    } catch (error) {
      console.error('Failed to load filter presets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addCriterion = () => {
    const newCriterion: FilterCriteria = {
      field: availableFields[0]?.value || '',
      operator: 'equals',
      value: '',
      logic: criteria.length > 0 ? 'AND' : undefined,
    }
    const newCriteria = [...criteria, newCriterion]
    setCriteria(newCriteria)
  }

  const removeCriterion = (index: number) => {
    const newCriteria = criteria.filter((_, i) => i !== index)
    // Remove logic from first criterion if it exists
    if (newCriteria.length > 0 && newCriteria[0].logic) {
      newCriteria[0] = { ...newCriteria[0], logic: undefined }
    }
    setCriteria(newCriteria)
    onFilterChange(newCriteria)
  }

  const updateCriterion = (
    index: number,
    updates: Partial<FilterCriteria>
  ) => {
    const newCriteria = [...criteria]
    newCriteria[index] = { ...newCriteria[index], ...updates }
    
    // Reset value when field or operator changes
    if (updates.field || updates.operator) {
      newCriteria[index].value = updates.operator === 'between' ? ['', ''] : ''
    }
    
    setCriteria(newCriteria)
  }

  const applyFilters = () => {
    // Validate criteria before applying
    const validCriteria = criteria.filter(
      c => c.field && c.operator && c.value !== '' && c.value !== null
    )
    onFilterChange(validCriteria)
  }

  const clearFilters = () => {
    setCriteria([])
    setSelectedPreset('')
    onFilterChange([])
  }

  const savePreset = async () => {
    if (!presetName.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/filter-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: presetName,
          criteria,
        }),
      })

      if (response.ok) {
        const newPreset = await response.json()
        setPresets([...presets, newPreset])
        setPresetName('')
        setShowSaveDialog(false)
      }
    } catch (error) {
      console.error('Failed to save preset:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const loadPreset = async (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    if (preset) {
      setCriteria(preset.criteria)
      setSelectedPreset(presetId)
      onFilterChange(preset.criteria)
    }
  }

  const deletePreset = async (presetId: string) => {
    try {
      const response = await fetch(`/api/admin/filter-presets/${presetId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPresets(presets.filter(p => p.id !== presetId))
        if (selectedPreset === presetId) {
          setSelectedPreset('')
        }
      }
    } catch (error) {
      console.error('Failed to delete preset:', error)
    }
  }

  const getFieldType = (fieldName: string) => {
    return availableFields.find(f => f.value === fieldName)?.type || 'text'
  }

  const getFieldOptions = (fieldName: string) => {
    return availableFields.find(f => f.value === fieldName)?.options || []
  }

  const getOperatorsForField = (fieldName: string) => {
    const fieldType = getFieldType(fieldName)
    
    switch (fieldType) {
      case 'text':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'contains', label: 'Contains' },
        ]
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'gt', label: 'Greater than' },
          { value: 'lt', label: 'Less than' },
          { value: 'between', label: 'Between' },
        ]
      case 'date':
        return [
          { value: 'equals', label: 'On date' },
          { value: 'gt', label: 'After' },
          { value: 'lt', label: 'Before' },
          { value: 'between', label: 'Between' },
        ]
      case 'select':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'in', label: 'In' },
        ]
      default:
        return [{ value: 'equals', label: 'Equals' }]
    }
  }

  const renderValueInput = (criterion: FilterCriteria, index: number) => {
    const fieldType = getFieldType(criterion.field)
    const fieldOptions = getFieldOptions(criterion.field)

    if (criterion.operator === 'between') {
      const values = Array.isArray(criterion.value) ? criterion.value : ['', '']
      
      return (
        <div className="flex items-center gap-2">
          <Input
            type={fieldType === 'date' ? 'date' : 'number'}
            value={values[0] || ''}
            onChange={(e) =>
              updateCriterion(index, {
                value: [e.target.value, values[1]],
              })
            }
            placeholder="Min"
            className="flex-1"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type={fieldType === 'date' ? 'date' : 'number'}
            value={values[1] || ''}
            onChange={(e) =>
              updateCriterion(index, {
                value: [values[0], e.target.value],
              })
            }
            placeholder="Max"
            className="flex-1"
          />
        </div>
      )
    }

    if (fieldType === 'select' && fieldOptions.length > 0) {
      return (
        <Select
          value={criterion.value as string}
          onValueChange={(value) => updateCriterion(index, { value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {fieldOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    return (
      <Input
        type={fieldType === 'date' ? 'date' : fieldType === 'number' ? 'number' : 'text'}
        value={criterion.value as string}
        onChange={(e) => updateCriterion(index, { value: e.target.value })}
        placeholder="Enter value"
      />
    )
  }

  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'date':
        return <Calendar className="h-4 w-4" />
      case 'number':
        return <Hash className="h-4 w-4" />
      default:
        return <Type className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Advanced Filters
          {criteria.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {criteria.length}
            </Badge>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              showFilters ? 'rotate-180' : ''
            }`}
          />
        </Button>

        {criteria.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card variant="outlined">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Filter Criteria</CardTitle>
                <CardDescription>
                  Add multiple criteria to refine your search
                </CardDescription>
              </div>
              
              {/* Preset Selector */}
              <div className="flex items-center gap-2">
                {presets.length > 0 && (
                  <Select
                    value={selectedPreset}
                    onValueChange={loadPreset}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Load preset" />
                    </SelectTrigger>
                    <SelectContent>
                      {presets.map((preset) => (
                        <div
                          key={preset.id}
                          className="flex items-center justify-between group"
                        >
                          <SelectItem value={preset.id} className="flex-1">
                            {preset.name}
                          </SelectItem>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              deletePreset(preset.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {criteria.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveDialog(true)}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Criteria List */}
            {criteria.map((criterion, index) => (
              <div key={index} className="space-y-3">
                {/* Logic Operator (for 2nd+ criteria) */}
                {index > 0 && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={criterion.logic || 'AND'}
                      onValueChange={(value) =>
                        updateCriterion(index, { logic: value as 'AND' | 'OR' })
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}

                {/* Criterion Row */}
                <div className="flex items-start gap-2 p-4 rounded-lg border bg-card">
                  {/* Field Icon */}
                  <div className="mt-2 text-muted-foreground">
                    {getFieldIcon(getFieldType(criterion.field))}
                  </div>

                  {/* Field Selector */}
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs text-muted-foreground">Field</Label>
                    <Select
                      value={criterion.field}
                      onValueChange={(value) =>
                        updateCriterion(index, { field: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operator Selector */}
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs text-muted-foreground">Operator</Label>
                    <Select
                      value={criterion.operator}
                      onValueChange={(value) =>
                        updateCriterion(index, {
                          operator: value as FilterCriteria['operator'],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getOperatorsForField(criterion.field).map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Value Input */}
                  <div className="flex-[2] space-y-2">
                    <Label className="text-xs text-muted-foreground">Value</Label>
                    {renderValueInput(criterion, index)}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCriterion(index)}
                    className="mt-7 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Add Criterion Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={addCriterion}
              className="w-full gap-2 border-dashed"
            >
              <Plus className="h-4 w-4" />
              Add Filter Criterion
            </Button>

            {/* Action Buttons */}
            {criteria.length > 0 && (
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={applyFilters}
                  className="bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-leaf/90 hover:to-eco-forest/90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {criteria.length > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {criteria.map((criterion, index) => {
            const field = availableFields.find(f => f.value === criterion.field)
            const operator = getOperatorsForField(criterion.field).find(
              o => o.value === criterion.operator
            )
            
            return (
              <Badge
                key={index}
                variant="secondary"
                className="gap-2 pr-1 pl-3 py-1"
              >
                <span className="text-xs">
                  {field?.label} {operator?.label.toLowerCase()}{' '}
                  {Array.isArray(criterion.value)
                    ? `${criterion.value[0]} - ${criterion.value[1]}`
                    : criterion.value}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => removeCriterion(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Save Preset Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Save your current filter criteria for quick access later
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="preset-name">Preset Name</Label>
            <Input
              id="preset-name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="e.g., Active users with high points"
              className="mt-2"
              disabled={isSaving}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={savePreset}
              disabled={isSaving || !presetName.trim()}
              className="bg-gradient-to-r from-eco-leaf to-eco-forest"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preset
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
