'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmailAnalyticsChartProps {
  data: {
    template: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  }[];
}

export function EmailAnalyticsChart({ data }: EmailAnalyticsChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Performance by Template</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No email data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Performance by Template</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((template) => (
            <div key={template.template} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {template.template.replace(/-/g, ' ')}
                </span>
                <span className="text-sm text-muted-foreground">
                  {template.sent} sent
                </span>
              </div>
              
              <div className="space-y-1">
                {/* Delivery Rate */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20">Delivery</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${template.deliveryRate}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-12 text-right">
                    {template.deliveryRate.toFixed(1)}%
                  </span>
                </div>

                {/* Open Rate */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20">Open</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${template.openRate}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-12 text-right">
                    {template.openRate.toFixed(1)}%
                  </span>
                </div>

                {/* Click Rate */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20">Click</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all"
                      style={{ width: `${template.clickRate}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-12 text-right">
                    {template.clickRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
