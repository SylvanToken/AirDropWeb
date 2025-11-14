'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp, TrendingDown, Plus, Minus, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DurationChangeLog {
  id: string;
  timestamp: Date;
  adminId: string;
  adminEmail: string;
  taskId: string;
  taskTitle: string;
  changeType: string;
  oldDuration: number | null;
  newDuration: number | null;
  oldExpiresAt: Date | null;
  newExpiresAt: Date | null;
  ipAddress?: string;
}

interface DurationChangeStats {
  totalChanges: number;
  changesByType: Array<{ changeType: string; count: number }>;
  changesByAdmin: Array<{ adminEmail: string; count: number }>;
  tasksWithTimeLimit: number;
  tasksWithoutTimeLimit: number;
}

export default function DurationChangeLogTable() {
  const [logs, setLogs] = useState<DurationChangeLog[]>([]);
  const [stats, setStats] = useState<DurationChangeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'logs' | 'stats'>('logs');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchData = async () => {
    setLoading(true);
    try {
      if (view === 'stats') {
        const response = await fetch('/api/admin/audit/duration-changes?view=stats');
        const data = await response.json();
        setStats(data.data);
      } else {
        const response = await fetch(
          `/api/admin/audit/duration-changes?limit=${limit}&offset=${page * limit}`
        );
        const data = await response.json();
        setLogs(data.data.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
          oldExpiresAt: log.oldExpiresAt ? new Date(log.oldExpiresAt) : null,
          newExpiresAt: log.newExpiresAt ? new Date(log.newExpiresAt) : null,
        })));
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch duration change logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, page]);

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'CREATED_WITH_TIME_LIMIT':
        return <Plus className="w-4 h-4" />;
      case 'ADDED_TIME_LIMIT':
        return <Clock className="w-4 h-4" />;
      case 'REMOVED_TIME_LIMIT':
        return <Minus className="w-4 h-4" />;
      case 'INCREASED_DURATION':
        return <TrendingUp className="w-4 h-4" />;
      case 'DECREASED_DURATION':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getChangeVariant = (changeType: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (changeType) {
      case 'CREATED_WITH_TIME_LIMIT':
      case 'ADDED_TIME_LIMIT':
        return 'default';
      case 'REMOVED_TIME_LIMIT':
        return 'destructive';
      case 'INCREASED_DURATION':
        return 'secondary';
      case 'DECREASED_DURATION':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatChangeType = (changeType: string) => {
    return changeType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDuration = (hours: number | null) => {
    if (hours === null) return 'No limit';
    return `${hours}h`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Duration Change Logs</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Duration Change Logs</CardTitle>
              <CardDescription>
                Track all modifications to task time limits and durations
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={view === 'logs' ? 'default' : 'outline'}
                onClick={() => setView('logs')}
              >
                Logs
              </Button>
              <Button
                variant={view === 'stats' ? 'default' : 'outline'}
                onClick={() => setView('stats')}
              >
                Statistics
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'stats' && stats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Changes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalChanges}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">With Time Limit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.tasksWithTimeLimit}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Without Time Limit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.tasksWithoutTimeLimit}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Changes by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.changesByType.map(({ changeType, count }) => (
                        <div key={changeType} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getChangeIcon(changeType)}
                            <span className="text-sm">{formatChangeType(changeType)}</span>
                          </div>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Changes by Admin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.changesByAdmin.map(({ adminEmail, count }) => (
                        <div key={adminEmail} className="flex items-center justify-between">
                          <span className="text-sm">{adminEmail}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Change Type</TableHead>
                    <TableHead>Old Duration</TableHead>
                    <TableHead>New Duration</TableHead>
                    <TableHead>Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No duration changes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={log.taskTitle}>
                            {log.taskTitle}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getChangeVariant(log.changeType)} className="flex items-center gap-1 w-fit">
                            {getChangeIcon(log.changeType)}
                            {formatChangeType(log.changeType)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDuration(log.oldDuration)}</TableCell>
                        <TableCell>{formatDuration(log.newDuration)}</TableCell>
                        <TableCell className="text-sm">{log.adminEmail}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {total > limit && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total} changes
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={(page + 1) * limit >= total}
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
    </div>
  );
}
