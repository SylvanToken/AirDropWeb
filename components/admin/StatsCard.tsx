'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  gradient?: 'blue' | 'green' | 'purple' | 'amber' | 'eco'
  className?: string
}

const gradientClasses = {
  blue: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
  green: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
  purple: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
  amber: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
  eco: 'from-eco-leaf/10 to-eco-forest/10 dark:from-eco-leaf/5 dark:to-eco-forest/5',
}

const iconGradientClasses = {
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-green-500 to-emerald-500',
  purple: 'from-purple-500 to-pink-500',
  amber: 'from-amber-500 to-orange-500',
  eco: 'from-eco-leaf to-eco-forest',
}

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  gradient = 'eco',
  className,
}: StatsCardProps) {
  return (
    <Card className={cn(
      'relative overflow-hidden border-eco-leaf/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1',
      className
    )}>
      <div className={cn('absolute inset-0 bg-gradient-to-br', gradientClasses[gradient])}></div>
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn(
            'h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm',
            iconGradientClasses[gradient]
          )}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold text-slate-900 dark:text-white">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-2 mt-2">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">
              from last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
