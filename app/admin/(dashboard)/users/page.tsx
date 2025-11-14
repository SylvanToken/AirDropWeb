'use client'

import { useEffect, useState } from 'react'
import { UserWithStats, PlatformStats } from '@/types'
import UserTable from '@/components/admin/UserTable'
import StatsCard from '@/components/admin/StatsCard'
import { Users, UserCheck, CheckCircle, Award } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function AdminUsersPage() {
  const t = useTranslations('admin')
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('totalPoints')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder, searchQuery, page])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch users with pagination
      const usersParams = new URLSearchParams({
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: '50',
        ...(searchQuery && { search: searchQuery }),
      })
      const usersRes = await fetch(`/api/admin/users?${usersParams}`)
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || usersData) // Support both old and new format
        if (usersData.pagination) {
          setTotalPages(usersData.pagination.totalPages)
          setHasMore(usersData.pagination.hasMore)
        }
      }

      // Fetch stats
      const statsRes = await fetch('/api/admin/stats')
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t('users.loading')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('users.title')}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t('users.subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <StatsCard
            title={t('stats.totalUsers.title')}
            value={stats.totalUsers}
            description={t('stats.totalUsers.description')}
            icon={Users}
            gradient="blue"
          />
          <StatsCard
            title={t('stats.activeUsers.title')}
            value={stats.activeUsers}
            description={t('stats.activeUsers.description')}
            icon={UserCheck}
            gradient="green"
          />
          <StatsCard
            title={t('stats.totalCompletions.title')}
            value={stats.totalCompletions}
            description={t('stats.totalCompletions.description')}
            icon={CheckCircle}
            gradient="purple"
          />
          <StatsCard
            title={t('stats.pointsAwarded.title')}
            value={stats.totalPointsAwarded.toLocaleString()}
            description={t('stats.pointsAwarded.description')}
            icon={Award}
            gradient="amber"
          />
        </div>
      )}

      {/* User Table */}
      <UserTable users={users} onSort={handleSort} onSearch={handleSearch} />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t('users.pagination.page', { current: page, total: totalPages })}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
            >
              {t('users.pagination.previous')}
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore}
              className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
            >
              {t('users.pagination.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
