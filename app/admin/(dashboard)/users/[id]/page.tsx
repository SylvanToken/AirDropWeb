'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Award, Calendar, CheckCircle, Flame, Ban, Trash2, CheckCircle2, Wallet, UserPlus, Copy, ExternalLink } from 'lucide-react'
// import { UserTimeline } from '@/components/admin/UserTimeline'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface UserDetails {
  id: string
  email: string
  username: string
  role: 'USER' | 'ADMIN'
  status: string
  walletAddress: string | null
  walletVerified: boolean
  twitterUsername: string | null
  twitterVerified: boolean
  telegramUsername: string | null
  telegramVerified: boolean
  referralCode: string | null
  totalPoints: number
  createdAt: string
  lastActive: string
  completionCount: number
  streak: number
  completions: Array<{
    id: string
    completedAt: string
    pointsAwarded: number
    task: {
      id: string
      title: string
      description: string
      points: number
      taskType: string
    }
  }>
  loginLogs: Array<{
    id: string
    ipAddress: string
    userAgent: string | null
    success: boolean
    createdAt: string
  }>
  referralData: {
    referredUsersCount: number
    referralCompletions: Array<{
      id: string
      completedAt: string
      pointsAwarded: number
      task: {
        id: string
        title: string
        points: number
      }
    }>
    referralLink: string | null
  }
  pagination?: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}

export default function UserDetailPage() {
  const router = useRouter()
  const t = useTranslations()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      })
      const res = await fetch(`/api/admin/users/${userId}?${params}`)

      if (!res.ok) {
        throw new Error('Failed to fetch user details')
      }

      const data = await res.json()
      setUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [userId, page])

  useEffect(() => {
    fetchUserDetails()
  }, [fetchUserDetails])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleBlockUser = async () => {
    if (!confirm(`Are you sure you want to ${user?.status === 'BLOCKED' ? 'unblock' : 'block'} this user?`)) {
      return
    }

    setActionLoading(true)
    try {
      const newStatus = user?.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error('Failed to update user status')
      }

      await fetchUserDetails()
      alert(`User ${newStatus === 'BLOCKED' ? 'blocked' : 'unblocked'} successfully`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!confirm('Are you sure you want to DELETE this user? This action cannot be undone!')) {
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete user')
      }

      alert('User deleted successfully')
      router.push('/admin/users')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred')
      setActionLoading(false)
    }
  }

  const handleCopyCode = async () => {
    if (user?.referralCode) {
      await navigator.clipboard.writeText(user.referralCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const handleCopyLink = async () => {
    if (user?.referralData?.referralLink) {
      await navigator.clipboard.writeText(user.referralData.referralLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t("admin.users.detail.loading")}</div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">{error || 'User not found'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Back to Users</span>
        <span className="sm:hidden">Back</span>
      </Button>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{user.username}</h1>
              {user.role === 'ADMIN' && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  Admin
                </span>
              )}
              {user.status === 'BLOCKED' && (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  Blocked
                </span>
              )}
              {user.status === 'DELETED' && (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  Deleted
                </span>
              )}
            </div>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          
          {user.role !== 'ADMIN' && user.status !== 'DELETED' && (
            <div className="flex gap-2">
              <Button
                variant={user.status === 'BLOCKED' ? 'default' : 'destructive'}
                size="sm"
                onClick={handleBlockUser}
                disabled={actionLoading}
              >
                {user.status === 'BLOCKED' ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Unblock
                  </>
                ) : (
                  <>
                    <Ban className="mr-2 h-4 w-4" />
                    Block
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteUser}
                disabled={actionLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.totalPoints}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Accumulated points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.completionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.streak}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Consecutive days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referred Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.referralData.referredUsersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Friends invited
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Registration Date
              </p>
              <p className="text-sm mt-1">{formatDateTime(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Active
              </p>
              <p className="text-sm mt-1">{formatDateTime(user.lastActive)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Wallet Address
              </p>
              {user.walletAddress ? (
                <div className="mt-1">
                  <p className="text-sm font-mono break-all">{user.walletAddress}</p>
                  {user.walletVerified && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm mt-1 text-muted-foreground">Not set</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Account Status
              </p>
              <p className="text-sm mt-1">
                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                  user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  user.status === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Twitter Account
              </p>
              {user.twitterUsername ? (
                <div className="mt-1">
                  <p className="text-sm">@{user.twitterUsername}</p>
                  {user.twitterVerified && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm mt-1 text-muted-foreground">Not set</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Referral Code
              </p>
              {user.referralCode ? (
                <div className="mt-1">
                  <p className="text-sm font-mono font-semibold text-eco-forest">{user.referralCode}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">User's unique referral code</p>
                </div>
              ) : (
                <p className="text-sm mt-1 text-muted-foreground">Not generated</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Telegram Account
              </p>
              {user.telegramUsername ? (
                <div className="mt-1">
                  <p className="text-sm">@{user.telegramUsername}</p>
                  {user.telegramVerified && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm mt-1 text-muted-foreground">Not set</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Information */}
      {user.referralCode && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Referral Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Referral Code */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Referral Code
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-lg font-semibold text-eco-forest">
                    {user.referralCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="shrink-0"
                  >
                    {copiedCode ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Referral Link */}
              {user.referralData.referralLink && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Referral Link
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-sm truncate">
                      {user.referralData.referralLink}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="shrink-0"
                    >
                      {copiedLink ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="shrink-0"
                    >
                      <a href={user.referralData.referralLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Referral Stats */}
              <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Users Referred
                  </p>
                  <p className="text-2xl font-bold mt-1">{user.referralData.referredUsersCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Referral Tasks Completed
                  </p>
                  <p className="text-2xl font-bold mt-1">{user.referralData.referralCompletions.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Points from Referrals
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {user.referralData.referralCompletions.reduce((sum, c) => sum + c.pointsAwarded, 0)}
                  </p>
                </div>
              </div>

              {/* Referral Completions */}
              {user.referralData.referralCompletions.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    Completed Referral Tasks
                  </p>
                  <div className="space-y-2">
                    {user.referralData.referralCompletions.map((completion) => (
                      <div key={completion.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{completion.task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(completion.completedAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-eco-forest">+{completion.pointsAwarded} points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Tabs */}
      <Tabs defaultValue="timeline" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
          <TabsTrigger value="logins">Login History</TabsTrigger>
          <TabsTrigger value="completions">Completions</TabsTrigger>
        </TabsList>

        {/* Activity Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          {/* <UserTimeline userId={userId} showStats={true} /> */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Activity timeline temporarily disabled</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login History Tab */}
        <TabsContent value="logins" className="mt-6">
          {user.loginLogs && user.loginLogs.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Login Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.loginLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.success ? 'Success' : 'Failed'}
                          </span>
                          <span className="text-sm font-mono">{log.ipAddress}</span>
                        </div>
                        {log.userAgent && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {log.userAgent}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-muted-foreground text-center">No login history available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Completion History Tab */}
        <TabsContent value="completions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Completion History</CardTitle>
            </CardHeader>
            <CardContent>
              {user.completions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No completions yet
                </p>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Completed At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {user.completions.map((completion) => (
                          <TableRow key={completion.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{completion.task.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {completion.task.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded">
                                {completion.task.taskType.replace('_', ' ')}
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold">
                              +{completion.pointsAwarded}
                            </TableCell>
                            <TableCell>{formatDateTime(completion.completedAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  {user.pagination && user.pagination.totalPages && user.pagination.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Page {user.pagination.page} of {user.pagination.totalPages} ({user.pagination.totalCount} total completions)
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => p + 1)}
                          disabled={!user.pagination?.hasMore}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
