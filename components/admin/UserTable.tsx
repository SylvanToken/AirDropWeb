'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowUpDown, Search, Eye, Filter, X, Download, Shield } from 'lucide-react'
import { UserWithStats } from '@/types'
import { useTranslations, useLocale } from 'next-intl'
import { formatDate, formatDateTime } from '@/lib/i18n/formatting'
import { cn } from '@/lib/utils'
import BulkActionMenu from './BulkActionMenu'
import ExportDialog from './ExportDialog'
import { FilterCriteria } from '@/lib/admin/filters'

interface UserTableProps {
  users: UserWithStats[]
  onSort: (field: string) => void
  onSearch: (query: string) => void
}

export default function UserTable({ users, onSort, onSearch }: UserTableProps) {
  const router = useRouter()
  const t = useTranslations('admin.users')
  const tFields = useTranslations('admin.filters.fields')
  const locale = useLocale()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [roleFilter, setRoleFilter] = useState<'all' | 'USER' | 'ADMIN'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showExportDialog, setShowExportDialog] = useState(false)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  // Build filters for export based on current UI filters
  const getActiveFilters = (): FilterCriteria[] => {
    const filters: FilterCriteria[] = []
    
    if (roleFilter !== 'all') {
      filters.push({
        field: 'role',
        operator: 'equals',
        value: roleFilter,
      })
    }
    
    if (searchQuery) {
      // Note: Search is handled differently in the API
      // This is just for display purposes
    }
    
    return filters
  }

  // Available fields for export
  const availableFields = [
    { value: 'id', label: 'ID' },
    { value: 'username', label: tFields('username') },
    { value: 'email', label: tFields('email') },
    { value: 'role', label: tFields('role') },
    { value: 'status', label: tFields('status') },
    { value: 'totalPoints', label: tFields('points') },
    { value: 'walletAddress', label: 'Wallet Address' },
    { value: 'walletVerified', label: 'Wallet Verified' },
    { value: 'twitterUsername', label: 'Twitter Username' },
    { value: 'twitterVerified', label: 'Twitter Verified' },
    { value: 'telegramUsername', label: 'Telegram Username' },
    { value: 'telegramVerified', label: 'Telegram Verified' },
    { value: 'createdAt', label: tFields('createdAt') },
    { value: 'lastActive', label: tFields('lastActive') },
  ]

  const filteredUsers = roleFilter === 'all' 
    ? users 
    : users.filter(user => user.role === roleFilter)

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    }
  }

  const handleRefresh = () => {
    // Trigger a refresh by calling the parent's search with current query
    onSearch(searchQuery)
  }

  return (
    <Card className="border-eco-leaf/20">
      <div className="p-4 space-y-4">
        {/* Bulk Action Menu */}
        <BulkActionMenu
          selectedUsers={selectedUsers}
          users={filteredUsers}
          onSelectionChange={setSelectedUsers}
          onOperationComplete={handleRefresh}
        />

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 border-eco-leaf/20 focus:border-eco-leaf focus:ring-eco-leaf/20"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "border-eco-leaf/20",
                showFilters && "bg-eco-leaf/10 border-eco-leaf"
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('filters.title')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportDialog(true)}
              className="border-eco-leaf/20 hover:bg-eco-leaf/10"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('export')}
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-eco-leaf/5 to-eco-forest/5 border border-eco-leaf/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                {t('filters.title')}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRoleFilter('all')
                  setShowFilters(false)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={roleFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('all')}
                className={cn(
                  roleFilter === 'all' && "bg-gradient-to-r from-eco-leaf to-eco-forest"
                )}
              >
                {t('filters.allUsers')}
              </Button>
              <Button
                variant={roleFilter === 'USER' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('USER')}
                className={cn(
                  roleFilter === 'USER' && "bg-gradient-to-r from-eco-leaf to-eco-forest"
                )}
              >
                {t('filters.users')}
              </Button>
              <Button
                variant={roleFilter === 'ADMIN' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('ADMIN')}
                className={cn(
                  roleFilter === 'ADMIN' && "bg-gradient-to-r from-eco-leaf to-eco-forest"
                )}
              >
                {t('filters.admins')}
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border border-eco-leaf/20 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="relative">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-eco-leaf/5 to-eco-forest/5 hover:from-eco-leaf/10 hover:to-eco-forest/10">
                    <TableHead className="w-12">
                      {/* Checkbox column header - handled by BulkActionMenu */}
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => onSort('username')}
                        className="h-8 px-2 hover:bg-eco-leaf/10"
                      >
                        {t('table.username')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => onSort('email')}
                        className="h-8 px-2 hover:bg-eco-leaf/10"
                      >
                        {t('table.email')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => onSort('totalPoints')}
                        className="h-8 px-2 hover:bg-eco-leaf/10"
                      >
                        {t('table.points')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => onSort('completionCount')}
                        className="h-8 px-2 hover:bg-eco-leaf/10"
                      >
                        {t('table.completions')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => onSort('createdAt')}
                        className="h-8 px-2 hover:bg-eco-leaf/10"
                      >
                        {t('table.registered')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => onSort('lastActive')}
                        className="h-8 px-2 hover:bg-eco-leaf/10"
                      >
                        {t('table.lastActive')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right sticky right-0 bg-white dark:bg-slate-950 shadow-[-4px_0_8px_rgba(0,0,0,0.1)]">{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 rounded-full bg-eco-leaf/10 flex items-center justify-center">
                            <Search className="h-6 w-6 text-eco-leaf" />
                          </div>
                          <p className="text-muted-foreground">{t('noUsers')}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow 
                        key={user.id}
                        className="hover:bg-eco-leaf/5 transition-colors"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => 
                              handleUserSelection(user.id, checked as boolean)
                            }
                            className="border-eco-leaf data-[state=checked]:bg-eco-leaf data-[state=checked]:border-eco-leaf"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-eco-leaf to-eco-forest flex items-center justify-center text-white text-sm font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <span>{user.username}</span>
                            {user.role === 'ADMIN' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium">
                                <Shield className="h-3 w-3" />
                                {t('table.admin')}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-800 dark:text-amber-300 text-sm font-semibold">
                            {user.totalPoints}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-300 text-sm font-medium">
                            {user.completionCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt, locale)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(user.lastActive, locale)}
                        </TableCell>
                        <TableCell className="text-right sticky right-0 bg-white dark:bg-slate-950 shadow-[-4px_0_8px_rgba(0,0,0,0.05)]">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                            className="hover:bg-eco-leaf/10 hover:text-eco-forest"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t('table.view')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {t('resultsCount', { count: filteredUsers.length, total: users.length })}
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        model="users"
        filters={getActiveFilters()}
        availableFields={availableFields}
      />
    </Card>
  )
}
