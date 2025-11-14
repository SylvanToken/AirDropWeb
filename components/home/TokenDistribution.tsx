"use client";

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TokenStats {
  totalSupply: string;
  holderCount: number;
  distribution: {
    team: number;
    locked: number;
    donation: number;
    fee: number;
    burn: number;
    circulating: number;
  };
  lastUpdated?: string;
}

const COLORS = {
  team: '#8b5cf6', // Purple
  locked: '#3b82f6', // Blue
  donation: '#10b981', // Green
  fee: '#f59e0b', // Amber
  burn: '#ef4444', // Red
  circulating: '#06b6d4', // Cyan
};

export function TokenDistribution() {
  const t = useTranslations('home.tokenDistribution');
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const LABELS = {
    team: t('team'),
    locked: t('locked'),
    donation: t('donation'),
    fee: t('fee'),
    burn: t('burned'),
    circulating: t('circulating'),
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/token/stats');
        const data = await response.json();
        
        // Always set stats, even if it's demo data
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching token stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load token stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Refresh every 10 minutes
    const interval = setInterval(fetchStats, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card variant="neon" className="depth-4k-2 p-8 backdrop-blur-md bg-gradient-to-br from-card to-eco-leaf/5">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-eco-leaf" />
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card variant="neon" className="depth-4k-2 p-8 backdrop-blur-md bg-gradient-to-br from-card to-eco-leaf/5">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">{error || 'Unable to load token stats'}</p>
          <p className="text-xs mt-2">Please check your configuration</p>
        </div>
      </Card>
    );
  }

  // Prepare chart data
  const totalSupplyNum = parseFloat(stats.totalSupply);
  const chartData = Object.entries(stats.distribution)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: LABELS[key as keyof typeof LABELS],
      value: typeof value === 'string' ? parseFloat(value) : value,
      percentage: ((value / totalSupplyNum) * 100).toFixed(2),
    }));

  const formatNumber = (num: number | string) => {
    // Convert from wei (18 decimals) to tokens
    const value = typeof num === 'string' ? parseFloat(num) / 1e18 : num;
    
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toFixed(0);
  };

  const formatSupply = (supply: string) => {
    const value = parseFloat(supply) / 1e18;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)} ${t('billion')}`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)} ${t('million')}`;
    return formatNumber(supply);
  };

  return (
    <Card variant="neon" className="depth-4k-2 backdrop-blur-md bg-gradient-to-br from-card to-eco-leaf/5 flex flex-col h-full">
      <CardHeader className="pb-2 px-6 pt-6">
        <CardTitle className="text-lg bg-gradient-to-r from-eco-leaf via-eco-forest to-eco-moss bg-clip-text text-transparent">
          {t('title')}
        </CardTitle>
        <CardDescription className="text-xs">
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-6 pb-6">
        {/* Key Stats - Compact */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-center p-2 rounded-lg bg-gradient-to-br from-eco-leaf/10 to-eco-forest/10 border border-eco-leaf/20">
            <div className="text-lg font-bold bg-gradient-to-r from-eco-leaf to-eco-forest bg-clip-text text-transparent">
              {formatSupply(stats.totalSupply)}
            </div>
            <div className="text-[10px] text-muted-foreground">{t('totalSupply')}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              {stats.holderCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground">{t('holders')}</div>
          </div>
        </div>

        {/* 3D Pie Chart - Fixed height */}
        <div className="flex-1 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {Object.entries(COLORS).map(([key, color]) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  const percentage = percent * 100;
                  
                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill="white" 
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                      className="font-bold text-sm drop-shadow-lg"
                      style={{ 
                        textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)',
                        paintOrder: 'stroke fill',
                        stroke: 'rgba(0,0,0,0.8)',
                        strokeWidth: '3px',
                        strokeLinejoin: 'round'
                      }}
                    >
                      {`${percentage}%`}
                    </text>
                  );
                }}
                outerRadius="80%"
                innerRadius="50%"
                fill="#8884d8"
                dataKey="value"
                paddingAngle={3}
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => {
                  const colorKey = Object.keys(LABELS)[Object.values(LABELS).indexOf(entry.name)] as keyof typeof COLORS;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#gradient-${colorKey})`}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth={2}
                    />
                  );
                })}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [formatNumber(value), name]}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                }}
                labelStyle={{
                  color: '#fff',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={24}
                iconType="circle"
                formatter={(value) => <span className="text-[10px]">{value}</span>}
                wrapperStyle={{
                  paddingTop: '4px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Last Updated - Compact */}
        {stats.lastUpdated && (
          <div className="text-[10px] text-center text-muted-foreground pt-2 mt-1 border-t border-border/50">
            {t('updated')}: {new Date(stats.lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
