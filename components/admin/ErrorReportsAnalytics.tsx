"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, TrendingDown, Clock, CheckCircle } from "lucide-react";

interface AnalyticsData {
  summary: {
    total: number;
    pending: number;
    resolved: number;
    avgResponseTime: number;
    avgResolutionTime: number;
  };
  byPriority: Array<{ priority: string; _count: number }>;
  byType: Array<{ errorType: string; _count: number }>;
  byStatus: Array<{ status: string; _count: number }>;
  trendData: Array<{ date: string; count: number }>;
  topTags: Array<{ tag: string; _count: number }>;
}

export function ErrorReportsAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/error-reports/analytics?days=${days}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "bg-red-500";
      case "HIGH": return "bg-orange-500";
      case "MEDIUM": return "bg-yellow-500";
      case "LOW": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.summary.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {analytics.summary.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Resolved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {analytics.summary.resolved}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Avg Response
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(analytics.summary.avgResponseTime)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Avg Resolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(analytics.summary.avgResolutionTime)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* By Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.byPriority.map((item) => (
                <div key={item.priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(item.priority)}`} />
                    <span className="text-sm">{item.priority}</span>
                  </div>
                  <Badge variant="secondary">{item._count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.byType.map((item) => (
                <div key={item.errorType} className="flex items-center justify-between">
                  <span className="text-sm">{item.errorType.replace("_", " ")}</span>
                  <Badge variant="secondary">{item._count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.byStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm">{item.status.replace("_", " ")}</span>
                  <Badge variant="secondary">{item._count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">7-Day Trend</CardTitle>
          <CardDescription>Error reports over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.trendData.map((item, index) => {
              const maxCount = Math.max(...analytics.trendData.map(d => d.count));
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              
              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-eco-leaf rounded-t transition-all hover:bg-eco-forest"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${item.count} reports`}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold">
                      {item.count}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground rotate-45 origin-top-left mt-2">
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Tags */}
      {analytics.topTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Common Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.topTags.map((item) => (
                <Badge key={item.tag} variant="outline" className="text-sm">
                  {item.tag} ({item._count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
