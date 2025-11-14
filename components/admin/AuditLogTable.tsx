'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Download, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { AuditEvent } from '@/lib/admin/audit';

interface AuditLogFilters {
  search: string;
  action: string;
  affectedModel: string;
  startDate: string;
  endDate: string;
  type: 'all' | 'security';
}

export default function AuditLogTable() {
  const t = useTranslations('admin.audit');
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [selectedLog, setSelectedLog] = useState<AuditEvent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilters>({
    search: '',
    action: '',
    affectedModel: '',
    startDate: '',
    endDate: '',
    type: 'all',
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
        type: filters.type,
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.action) params.append('action', filters.action);
      if (filters.affectedModel) params.append('affectedModel', filters.affectedModel);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch logs');

      const data = await response.json();
      setLogs(data.logs);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.action) params.append('action', filters.action);
      if (filters.affectedModel) params.append('affectedModel', filters.affectedModel);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('type', filters.type);
      params.append('limit', '10000'); // Export all matching records

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      if (!response.ok) throw new Error('Failed to export logs');

      const data = await response.json();
      
      // Convert to CSV
      const csv = convertToCSV(data.logs);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const convertToCSV = (logs: AuditEvent[]): string => {
    const headers = ['Timestamp', 'Action', 'Admin', 'Model', 'Record ID', 'IP Address'];
    const rows = logs.map(log => [
      log.timestamp ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss') : '',
      log.action,
      log.adminEmail,
      log.affectedModel || '',
      log.affectedId || '',
      log.ipAddress || '',
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
  };

  const isSecurityEvent = (action: string): boolean => {
    const securityActions = [
      'delete',
      'role',
      'permission',
      'export',
      'reset',
      'unauthorized',
      'failed',
    ];
    return securityActions.some(sa => action.toLowerCase().includes(sa));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      action: '',
      affectedModel: '',
      startDate: '',
      endDate: '',
      type: 'all',
    });
    setPage(1);
  };

  const hasActiveFilters = 
    filters.search || 
    filters.action || 
    filters.affectedModel || 
    filters.startDate || 
    filters.endDate ||
    filters.type !== 'all';

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={filters.search}
                  onChange={(e) => {
                    setFilters({ ...filters, search: e.target.value });
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.type}
                onValueChange={(value: 'all' | 'security') => {
                  setFilters({ ...filters, type: value });
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allEvents')}</SelectItem>
                  <SelectItem value="security">{t('filters.securityOnly')}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {t('export')}
              </Button>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('filters.action')}
                </label>
                <Input
                  placeholder={t('filters.actionPlaceholder')}
                  value={filters.action}
                  onChange={(e) => {
                    setFilters({ ...filters, action: e.target.value });
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('filters.model')}
                </label>
                <Input
                  placeholder={t('filters.modelPlaceholder')}
                  value={filters.affectedModel}
                  onChange={(e) => {
                    setFilters({ ...filters, affectedModel: e.target.value });
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('filters.startDate')}
                </label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => {
                    setFilters({ ...filters, startDate: e.target.value });
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('filters.endDate')}
                </label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => {
                    setFilters({ ...filters, endDate: e.target.value });
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t('filtersActive')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('clearFilters')}
                </Button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.timestamp')}</TableHead>
                  <TableHead>{t('table.action')}</TableHead>
                  <TableHead>{t('table.admin')}</TableHead>
                  <TableHead>{t('table.model')}</TableHead>
                  <TableHead>{t('table.recordId')}</TableHead>
                  <TableHead>{t('table.ipAddress')}</TableHead>
                  <TableHead className="text-right">{t('table.details')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {t('loading')}
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {t('noLogs')}
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className={`cursor-pointer hover:bg-muted/50 ${
                        isSecurityEvent(log.action) ? 'bg-red-50 dark:bg-red-950/10' : ''
                      }`}
                      onClick={() => {
                        setSelectedLog(log);
                        setShowDetails(true);
                      }}
                    >
                      <TableCell className="font-mono text-sm">
                        {log.timestamp
                          ? format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isSecurityEvent(log.action) && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant={isSecurityEvent(log.action) ? 'destructive' : 'secondary'}>
                            {t.has(`actions.${log.action.replace(':', '.')}`) 
                              ? t(`actions.${log.action.replace(':', '.')}`) 
                              : log.action}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{log.adminEmail}</TableCell>
                      <TableCell>
                        {log.affectedModel ? (
                          <Badge variant="outline">{log.affectedModel}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.affectedId ? log.affectedId.substring(0, 8) + '...' : '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.ipAddress || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          {t('viewDetails')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && logs.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {t('resultsCount', {
                  start: (page - 1) * limit + 1,
                  end: Math.min(page * limit, total),
                  total,
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t('previous')}
                </Button>
                <span className="text-sm">
                  {t('page', { current: page, total: totalPages })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  {t('next')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('detailsDialog.title')}</DialogTitle>
            <DialogDescription>
              {selectedLog?.timestamp &&
                format(new Date(selectedLog.timestamp), 'PPpp')}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              {/* Security Warning */}
              {isSecurityEvent(selectedLog.action) && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">
                    {t('detailsDialog.securityEvent')}
                  </span>
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('detailsDialog.action')}
                  </label>
                  <p className="mt-1">
                    <Badge variant={isSecurityEvent(selectedLog.action) ? 'destructive' : 'secondary'}>
                      {selectedLog.action}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('detailsDialog.admin')}
                  </label>
                  <p className="mt-1 text-sm">{selectedLog.adminEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('detailsDialog.model')}
                  </label>
                  <p className="mt-1 text-sm">{selectedLog.affectedModel || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('detailsDialog.recordId')}
                  </label>
                  <p className="mt-1 text-sm font-mono">{selectedLog.affectedId || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('detailsDialog.ipAddress')}
                  </label>
                  <p className="mt-1 text-sm font-mono">{selectedLog.ipAddress || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('detailsDialog.userAgent')}
                  </label>
                  <p className="mt-1 text-sm truncate" title={selectedLog.userAgent}>
                    {selectedLog.userAgent || '-'}
                  </p>
                </div>
              </div>

              {/* Before/After Data */}
              {(selectedLog.beforeData || selectedLog.afterData) && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{t('detailsDialog.dataChanges')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLog.beforeData && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {t('detailsDialog.before')}
                        </label>
                        <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                          {JSON.stringify(selectedLog.beforeData, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedLog.afterData && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {t('detailsDialog.after')}
                        </label>
                        <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                          {JSON.stringify(selectedLog.afterData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
