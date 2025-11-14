/**
 * Hero Content Layouts
 * 
 * Specialized hero content layouts for different page variants
 */

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Award,
  CheckCircle2,
  Clock
} from 'lucide-react';

/**
 * Home Hero Layout
 * Large centered content with title, subtitle, and CTA
 */
export interface HomeHeroLayoutProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  className?: string;
}

export function HomeHeroLayout({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  className,
}: HomeHeroLayoutProps) {
  return (
    <div
      className={cn(
        'text-center space-y-8',
        'bg-card/80 backdrop-blur-md rounded-3xl p-8 md:p-16',
        'border border-border/50 shadow-2xl',
        className
      )}
    >
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-eco-leaf via-eco-forest to-eco-leaf bg-clip-text text-transparent animate-gradient">
        {title}
      </h1>
      
      <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
        {subtitle}
      </p>
      
      <div className="pt-4">
        <Button
          size="lg"
          className="text-lg px-10 py-7 bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-forest hover:to-eco-leaf transition-all duration-300 hover:scale-105 hover:shadow-xl"
          asChild
        >
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Dashboard Hero Layout
 * Welcome message with user stats display
 */
export interface DashboardHeroLayoutProps {
  userName: string;
  stats: {
    points: number;
    tasksCompleted: number;
    rank: number;
    streak?: number;
  };
  className?: string;
}

export function DashboardHeroLayout({
  userName,
  stats,
  className,
}: DashboardHeroLayoutProps) {
  return (
    <div
      className={cn(
        'bg-card/80 backdrop-blur-md rounded-3xl p-6 md:p-10',
        'border border-border/50 shadow-2xl',
        className
      )}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-eco-leaf to-eco-forest bg-clip-text text-transparent">
          Welcome back, {userName}!
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Here's your progress overview
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Points */}
        <div className="bg-gradient-to-br from-eco-leaf/20 to-eco-forest/20 rounded-2xl p-6 border border-eco-leaf/30 hover:scale-105 transition-transform">
          <div className="flex items-center justify-center mb-3">
            <Trophy className="w-8 h-8 text-eco-leaf" />
          </div>
          <div className="text-3xl md:text-4xl font-bold text-eco-leaf text-center">
            {stats.points.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground text-center mt-2">
            Total Points
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="bg-gradient-to-br from-eco-sky/20 to-eco-leaf/20 rounded-2xl p-6 border border-eco-sky/30 hover:scale-105 transition-transform">
          <div className="flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8 text-eco-sky" />
          </div>
          <div className="text-3xl md:text-4xl font-bold text-eco-sky text-center">
            {stats.tasksCompleted}
          </div>
          <div className="text-sm text-muted-foreground text-center mt-2">
            Tasks Done
          </div>
        </div>

        {/* Rank */}
        <div className="bg-gradient-to-br from-eco-earth/20 to-eco-moss/20 rounded-2xl p-6 border border-eco-earth/30 hover:scale-105 transition-transform">
          <div className="flex items-center justify-center mb-3">
            <Award className="w-8 h-8 text-eco-earth" />
          </div>
          <div className="text-3xl md:text-4xl font-bold text-eco-earth text-center">
            #{stats.rank}
          </div>
          <div className="text-sm text-muted-foreground text-center mt-2">
            Your Rank
          </div>
        </div>

        {/* Streak (if available) */}
        {stats.streak !== undefined && (
          <div className="bg-gradient-to-br from-eco-forest/20 to-eco-leaf/20 rounded-2xl p-6 border border-eco-forest/30 hover:scale-105 transition-transform">
            <div className="flex items-center justify-center mb-3">
              <TrendingUp className="w-8 h-8 text-eco-forest" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-eco-forest text-center">
              {stats.streak}
            </div>
            <div className="text-sm text-muted-foreground text-center mt-2">
              Day Streak
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Tasks Hero Layout
 * Task count and progress indicators
 */
export interface TasksHeroLayoutProps {
  totalTasks: number;
  completedTasks: number;
  availableTasks: number;
  dailyProgress?: {
    current: number;
    total: number;
  };
  className?: string;
}

export function TasksHeroLayout({
  totalTasks,
  completedTasks,
  availableTasks,
  dailyProgress,
  className,
}: TasksHeroLayoutProps) {
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  return (
    <div
      className={cn(
        'bg-card/80 backdrop-blur-md rounded-3xl p-6 md:p-10',
        'border border-border/50 shadow-2xl',
        className
      )}
    >
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-eco-leaf to-eco-forest bg-clip-text text-transparent">
          Your Tasks
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Complete tasks to earn rewards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Available Tasks */}
        <div className="bg-gradient-to-br from-eco-leaf/20 to-eco-forest/20 rounded-2xl p-6 border border-eco-leaf/30 text-center">
          <Target className="w-10 h-10 text-eco-leaf mx-auto mb-3" />
          <div className="text-4xl font-bold text-eco-leaf">
            {availableTasks}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Available Now
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-gradient-to-br from-eco-sky/20 to-eco-leaf/20 rounded-2xl p-6 border border-eco-sky/30 text-center">
          <CheckCircle2 className="w-10 h-10 text-eco-sky mx-auto mb-3" />
          <div className="text-4xl font-bold text-eco-sky">
            {completedTasks}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Completed
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-gradient-to-br from-eco-earth/20 to-eco-moss/20 rounded-2xl p-6 border border-eco-earth/30 text-center">
          <TrendingUp className="w-10 h-10 text-eco-earth mx-auto mb-3" />
          <div className="text-4xl font-bold text-eco-earth">
            {completionPercentage}%
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Completion Rate
          </div>
        </div>
      </div>

      {/* Daily Progress */}
      {dailyProgress && (
        <div className="bg-gradient-to-r from-eco-leaf/10 to-eco-forest/10 rounded-2xl p-6 border border-eco-leaf/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-eco-leaf" />
              <span className="font-semibold text-foreground">Daily Progress</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {dailyProgress.current} / {dailyProgress.total}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-eco-leaf to-eco-forest rounded-full transition-all duration-500"
              style={{
                width: `${(dailyProgress.current / dailyProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Leaderboard Hero Layout
 * User rank and top performers display
 */
export interface LeaderboardHeroLayoutProps {
  userRank: number;
  totalUsers: number;
  userPoints: number;
  topUsers?: Array<{
    name: string;
    points: number;
    rank: number;
  }>;
  className?: string;
}

export function LeaderboardHeroLayout({
  userRank,
  totalUsers,
  userPoints,
  topUsers,
  className,
}: LeaderboardHeroLayoutProps) {
  const topThree = topUsers?.slice(0, 3) || [];

  return (
    <div
      className={cn(
        'bg-card/80 backdrop-blur-md rounded-3xl p-6 md:p-10',
        'border border-border/50 shadow-2xl',
        className
      )}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-eco-leaf to-eco-forest bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Compete with the community
        </p>
      </div>

      {/* User's Current Rank */}
      <div className="bg-gradient-to-r from-eco-leaf/20 to-eco-forest/20 rounded-2xl p-6 border border-eco-leaf/30 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Trophy className="w-12 h-12 text-eco-leaf" />
            <div>
              <div className="text-sm text-muted-foreground">Your Rank</div>
              <div className="text-3xl font-bold text-eco-leaf">
                #{userRank}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Your Points</div>
            <div className="text-2xl font-bold text-foreground">
              {userPoints.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="mt-3 text-center text-sm text-muted-foreground">
          Out of {totalUsers.toLocaleString()} participants
        </div>
      </div>

      {/* Top 3 Users */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThree.map((user, index) => {
            const medals = ['🥇', '🥈', '🥉'];
            const gradients = [
              'from-yellow-400/20 to-yellow-600/20 border-yellow-500/30',
              'from-gray-300/20 to-gray-500/20 border-gray-400/30',
              'from-orange-400/20 to-orange-600/20 border-orange-500/30',
            ];

            return (
              <div
                key={user.rank}
                className={cn(
                  'bg-gradient-to-br rounded-2xl p-6 border text-center',
                  'hover:scale-105 transition-transform',
                  gradients[index]
                )}
              >
                <div className="text-4xl mb-2">{medals[index]}</div>
                <div className="font-semibold text-lg text-foreground mb-1">
                  {user.name}
                </div>
                <div className="text-2xl font-bold text-eco-leaf">
                  {user.points.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  points
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
