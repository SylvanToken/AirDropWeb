'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCard from '@/components/admin/StatsCard';
import AnalyticsChart from '@/components/admin/AnalyticsChart';
import { PlatformMetrics } from '@/lib/admin/analytics';
import { 
  Users, 
  Activity, 
  CheckCircle, 
  Award, 
  TrendingUp, 
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function AnalyticsPage() {
  const t = useTranslations('admin');
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      setIsRefreshing(true);
      const params = new URLSearchParams({
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      });
      
      const response = await fetch(`/api/admin/analytics?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const handleDateRangeChange = (days: number) => {
    setDateRange({
      start: subDays(new Date(), days),
      end: new Date(),
    });
  };

  const handleExportPDF = async () => {
    try {
      setIsRefreshing(true);
      
      // Create a printable version of the dashboard
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow pop-ups to export PDF');
        return;
      }

      // Generate HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Analytics Report - ${format(new Date(), 'MMM dd, yyyy')}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                color: #1e293b;
              }
              h1 {
                color: #0f172a;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 10px;
              }
              .header {
                margin-bottom: 30px;
              }
              .date-range {
                color: #64748b;
                font-size: 14px;
                margin-top: 5px;
              }
              .metrics {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                margin-bottom: 30px;
              }
              .metric-card {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 15px;
                background: #f8fafc;
              }
              .metric-title {
                font-size: 12px;
                color: #64748b;
                text-transform: uppercase;
                margin-bottom: 5px;
              }
              .metric-value {
                font-size: 24px;
                font-weight: bold;
                color: #0f172a;
                margin-bottom: 5px;
              }
              .metric-description {
                font-size: 12px;
                color: #64748b;
              }
              .section {
                margin-bottom: 30px;
                page-break-inside: avoid;
              }
              .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #0f172a;
                margin-bottom: 15px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
              }
              th, td {
                border: 1px solid #e2e8f0;
                padding: 8px;
                text-align: left;
              }
              th {
                background: #f1f5f9;
                font-weight: bold;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                color: #64748b;
                font-size: 12px;
              }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Analytics Dashboard Report</h1>
              <div class="date-range">
                Report Period: ${format(dateRange.start, 'MMM dd, yyyy')} - ${format(dateRange.end, 'MMM dd, yyyy')}
              </div>
              <div class="date-range">
                Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>

            <div class="metrics">
              <div class="metric-card">
                <div class="metric-title">Total Users</div>
                <div class="metric-value">${metrics?.totalUsers.toLocaleString() || '0'}</div>
                <div class="metric-description">All registered users</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Active Users</div>
                <div class="metric-value">${metrics?.activeUsers.toLocaleString() || '0'}</div>
                <div class="metric-description">Active in last 7 days</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Total Completions</div>
                <div class="metric-value">${metrics?.totalCompletions.toLocaleString() || '0'}</div>
                <div class="metric-description">All task completions</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Total Points</div>
                <div class="metric-value">${metrics?.totalPoints.toLocaleString() || '0'}</div>
                <div class="metric-description">Avg: ${metrics?.averagePointsPerUser.toLocaleString() || '0'} per user</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Top Tasks by Completions</div>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Task Title</th>
                    <th>Completions</th>
                  </tr>
                </thead>
                <tbody>
                  ${metrics?.topTasks.map((task, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${task.title}</td>
                      <td>${task.completions.toLocaleString()}</td>
                    </tr>
                  `).join('') || '<tr><td colspan="3">No data available</td></tr>'}
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="section-title">User Growth Summary</div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>New Users</th>
                  </tr>
                </thead>
                <tbody>
                  ${metrics?.userGrowth.slice(-10).map(item => `
                    <tr>
                      <td>${format(new Date(item.date), 'MMM dd, yyyy')}</td>
                      <td>${item.count}</td>
                    </tr>
                  `).join('') || '<tr><td colspan="2">No data available</td></tr>'}
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="section-title">Completion Trends Summary</div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Completions</th>
                  </tr>
                </thead>
                <tbody>
                  ${metrics?.completionTrends.slice(-10).map(item => `
                    <tr>
                      <td>${format(new Date(item.date), 'MMM dd, yyyy')}</td>
                      <td>${item.count}</td>
                    </tr>
                  `).join('') || '<tr><td colspan="2">No data available</td></tr>'}
                </tbody>
              </table>
            </div>

            <div class="footer">
              <p>Sylvan Token Airdrop Platform - Analytics Report</p>
              <p>This report contains confidential information</p>
            </div>

            <div class="no-print" style="margin-top: 20px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                Print / Save as PDF
              </button>
              <button onclick="window.close()" style="padding: 10px 20px; background: #64748b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; margin-left: 10px;">
                Close
              </button>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {t('analytics.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('analytics.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t('analytics.refresh')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            {t('analytics.exportPdf')}
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="border-eco-leaf/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            {t('analytics.dateRange.title')}
          </CardTitle>
          <CardDescription>
            {t('analytics.dateRange.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={dateRange.start.getTime() === subDays(new Date(), 7).getTime() ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDateRangeChange(7)}
            >
              {t('analytics.dateRange.last7Days')}
            </Button>
            <Button
              variant={dateRange.start.getTime() === subDays(new Date(), 30).getTime() ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDateRangeChange(30)}
            >
              {t('analytics.dateRange.last30Days')}
            </Button>
            <Button
              variant={dateRange.start.getTime() === subDays(new Date(), 90).getTime() ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDateRangeChange(90)}
            >
              {t('analytics.dateRange.last90Days')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateRangeChange(365)}
            >
              {t('analytics.dateRange.lastYear')}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {t('analytics.dateRange.showing', {
              start: format(dateRange.start, 'MMM dd, yyyy'),
              end: format(dateRange.end, 'MMM dd, yyyy')
            })}
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('analytics.metrics.totalUsers')}
          value={metrics?.totalUsers.toLocaleString() || '0'}
          description={t('analytics.metrics.totalUsersDesc')}
          icon={Users}
          gradient="blue"
        />
        <StatsCard
          title={t('analytics.metrics.activeUsers')}
          value={metrics?.activeUsers.toLocaleString() || '0'}
          description={t('analytics.metrics.activeUsersDesc')}
          icon={Activity}
          gradient="green"
          trend={
            metrics?.totalUsers
              ? {
                  value: Math.round((metrics.activeUsers / metrics.totalUsers) * 100),
                  isPositive: true,
                }
              : undefined
          }
        />
        <StatsCard
          title={t('analytics.metrics.totalCompletions')}
          value={metrics?.totalCompletions.toLocaleString() || '0'}
          description={t('analytics.metrics.totalCompletionsDesc')}
          icon={CheckCircle}
          gradient="purple"
        />
        <StatsCard
          title={t('analytics.metrics.totalPoints')}
          value={metrics?.totalPoints.toLocaleString() || '0'}
          description={t('analytics.metrics.totalPointsDesc', {
            avg: metrics?.averagePointsPerUser.toLocaleString() || '0'
          })}
          icon={Award}
          gradient="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card className="border-eco-leaf/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {t('analytics.charts.userGrowth')}
            </CardTitle>
            <CardDescription>
              {t('analytics.charts.userGrowthDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              data={metrics?.userGrowth || []}
              type="line"
              dataKey="count"
              xAxisKey="date"
              color="#3b82f6"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Completion Trends Chart */}
        <Card className="border-eco-leaf/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {t('analytics.charts.completionTrends')}
            </CardTitle>
            <CardDescription>
              {t('analytics.charts.completionTrendsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              data={metrics?.completionTrends || []}
              type="line"
              dataKey="count"
              xAxisKey="date"
              color="#10b981"
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Tasks Chart */}
      <Card className="border-eco-leaf/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            {t('analytics.charts.topTasks')}
          </CardTitle>
          <CardDescription>
            {t('analytics.charts.topTasksDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsChart
            data={metrics?.topTasks || []}
            type="bar"
            dataKey="completions"
            xAxisKey="title"
            color="#a855f7"
            height={400}
          />
        </CardContent>
      </Card>

      {/* Distribution Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Activity Distribution */}
        <Card className="border-eco-leaf/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-eco-forest" />
              {t('analytics.charts.userActivity')}
            </CardTitle>
            <CardDescription>
              {t('analytics.charts.userActivityDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              data={[
                { name: t('analytics.labels.activeUsers'), value: metrics?.activeUsers || 0 },
                { name: t('analytics.labels.inactiveUsers'), value: (metrics?.totalUsers || 0) - (metrics?.activeUsers || 0) },
              ]}
              type="pie"
              dataKey="value"
              nameKey="name"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Today's Activity */}
        <Card className="border-eco-leaf/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              {t('analytics.charts.todayActivity')}
            </CardTitle>
            <CardDescription>
              {t('analytics.charts.todayActivityDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              data={[
                { name: t('analytics.labels.newUsers'), value: metrics?.newUsersToday || 0 },
                { name: t('analytics.labels.completions'), value: metrics?.completionsToday || 0 },
              ]}
              type="bar"
              dataKey="value"
              xAxisKey="name"
              color="#f59e0b"
              height={300}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
