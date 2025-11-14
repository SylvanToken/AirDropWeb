"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Crown, Star, TrendingUp } from "lucide-react";
import { LoadingState } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  totalPoints: number;
  completionCount: number;
}

type TimePeriod = 'all-time' | 'weekly' | 'daily';

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all-time');
  const [userRank, setUserRank] = useState<number | null>(null);
  const userRowRef = useRef<HTMLDivElement>(null);
  const limit = 50;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaderboard?page=${page}&limit=${limit}`);

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const data = await response.json();
      
      if (page === 1) {
        setLeaderboard(data.leaderboard);
        // Find user's rank
        const userEntry = data.leaderboard.find((entry: LeaderboardEntry) => entry.id === session?.user?.id);
        if (userEntry) {
          setUserRank(userEntry.rank);
        }
      } else {
        setLeaderboard(prev => [...prev, ...data.leaderboard]);
      }
      
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, session?.user?.id]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchLeaderboard();
    }
  }, [status, fetchLeaderboard]);

  const scrollToUserPosition = () => {
    if (userRowRef.current) {
      userRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/50">
          <Crown className="w-7 h-7 text-white" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-yellow-900">1</span>
          </div>
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 shadow-lg shadow-gray-400/50">
          <Medal className="w-7 h-7 text-white" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">2</span>
          </div>
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-lg shadow-orange-500/50">
          <Award className="w-7 h-7 text-white" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-orange-900">3</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-eco-leaf/20 to-eco-forest/20 border-2 border-eco-leaf/30">
          <span className="text-xl font-bold text-eco-forest">{rank}</span>
        </div>
      );
    }
  };

  const getTopThreeUsers = () => {
    return leaderboard.slice(0, 3);
  };

  if (status === "loading" || (loading && page === 1)) {
    return <LoadingState message={t('leaderboardPage.loadingText')} />;
  }

  const topThree = getTopThreeUsers();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-eco-leaf/5">
      <div className="max-w-[80%] mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t('leaderboardPage.pageTitle')}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {t('leaderboardPage.pageSubtitle')}
          </p>
          {userRank && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-eco-leaf/10 border border-eco-leaf/20 rounded-lg">
              <Trophy className="w-5 h-5 text-eco-leaf" />
              <span className="text-sm font-semibold text-eco-forest">
                {t('leaderboardPage.userRankLabel', { rank: userRank, total: leaderboard.length })}
              </span>
            </div>
          )}
        </div>
        {/* Top 3 Showcase */}
        {topThree.length >= 3 && (
          <Card className="mb-8 overflow-hidden border-2 border-eco-leaf/30 bg-gradient-to-br from-card via-card to-eco-leaf/5">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="h-6 w-6 text-eco-leaf" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-eco-leaf to-eco-forest bg-clip-text text-transparent">
                  Top Performers
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 2nd Place */}
                {topThree[1] && (
                  <div className="order-2 md:order-1 flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-300 dark:border-gray-700">
                    <div className="mb-4">{getRankBadge(2)}</div>
                    <h3 className="text-xl font-bold text-center mb-2">{topThree[1].username}</h3>
                    <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-1">
                      {topThree[1].totalPoints}
                    </div>
                    <p className="text-sm text-muted-foreground">points</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {topThree[1].completionCount} tasks
                    </p>
                  </div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                  <div className="order-1 md:order-2 flex flex-col items-center p-8 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 border-2 border-yellow-400 dark:border-yellow-600 shadow-xl shadow-yellow-500/20 transform md:scale-110">
                    <div className="mb-4">{getRankBadge(1)}</div>
                    <h3 className="text-2xl font-bold text-center mb-2">{topThree[0].username}</h3>
                    <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-500 mb-1">
                      {topThree[0].totalPoints}
                    </div>
                    <p className="text-sm text-muted-foreground">points</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {topThree[0].completionCount} tasks
                    </p>
                    <Star className="w-6 h-6 text-yellow-500 mt-2 animate-pulse" />
                  </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <div className="order-3 flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 border-2 border-orange-400 dark:border-orange-600">
                    <div className="mb-4">{getRankBadge(3)}</div>
                    <h3 className="text-xl font-bold text-center mb-2">{topThree[2].username}</h3>
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-500 mb-1">
                      {topThree[2].totalPoints}
                    </div>
                    <p className="text-sm text-muted-foreground">points</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {topThree[2].completionCount} tasks
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Time Period Filters */}
        <Card className="mb-6 border-eco-leaf/20">
          <div className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-eco-leaf" />
                <span className="font-semibold text-foreground">Time Period:</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={timePeriod === 'daily' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTimePeriod('daily');
                    setPage(1);
                  }}
                  className={cn(
                    timePeriod === 'daily' && 'bg-gradient-to-r from-eco-leaf to-eco-forest'
                  )}
                >
                  Daily
                </Button>
                <Button
                  variant={timePeriod === 'weekly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTimePeriod('weekly');
                    setPage(1);
                  }}
                  className={cn(
                    timePeriod === 'weekly' && 'bg-gradient-to-r from-eco-leaf to-eco-forest'
                  )}
                >
                  Weekly
                </Button>
                <Button
                  variant={timePeriod === 'all-time' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTimePeriod('all-time');
                    setPage(1);
                  }}
                  className={cn(
                    timePeriod === 'all-time' && 'bg-gradient-to-r from-eco-leaf to-eco-forest'
                  )}
                >
                  All Time
                </Button>
              </div>
              {userRank && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={scrollToUserPosition}
                  className="text-eco-leaf hover:text-eco-forest"
                >
                  Find My Position
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Leaderboard Table */}
        <Card className="border-eco-leaf/20">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-eco-leaf/10 to-eco-forest/10 border-b border-eco-leaf/20 px-4 py-3">
                <div className="grid grid-cols-12 gap-4 items-center font-semibold text-sm text-muted-foreground">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-5 md:col-span-6">User</div>
                  <div className="col-span-3 md:col-span-2 text-center">Tasks</div>
                  <div className="col-span-3 md:col-span-3 text-right">Points</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border">
                {loading && page === 1 ? (
                  // Loading skeletons
                  Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="px-4 py-4">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1">
                          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                        </div>
                        <div className="col-span-5 md:col-span-6">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="col-span-3 md:col-span-2">
                          <Skeleton className="h-5 w-16 mx-auto" />
                        </div>
                        <div className="col-span-3 md:col-span-3">
                          <Skeleton className="h-6 w-20 ml-auto" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  leaderboard.map((entry) => {
                    const isCurrentUser = entry.id === session?.user?.id;
                    return (
                      <div
                        key={entry.id}
                        ref={isCurrentUser ? userRowRef : null}
                        className={cn(
                          "px-4 py-4 transition-all duration-300",
                          isCurrentUser
                            ? "bg-gradient-to-r from-eco-leaf/20 via-eco-leaf/10 to-transparent border-l-4 border-eco-leaf shadow-lg"
                            : "hover:bg-accent/50"
                        )}
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Rank Badge */}
                          <div className="col-span-1 flex justify-center">
                            {getRankBadge(entry.rank)}
                          </div>

                          {/* Username */}
                          <div className="col-span-5 md:col-span-6">
                            <div className="flex items-center gap-2">
                              <p className={cn(
                                "font-semibold text-base md:text-lg",
                                isCurrentUser && "text-eco-forest"
                              )}>
                                {entry.username}
                              </p>
                              {isCurrentUser && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-eco-leaf/20 text-eco-forest border border-eco-leaf/30">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Member
                            </p>
                          </div>

                          {/* Tasks Completed */}
                          <div className="col-span-3 md:col-span-2 text-center">
                            <p className="font-semibold text-base md:text-lg">
                              {entry.completionCount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.completionCount === 1 ? 'task' : 'tasks'}
                            </p>
                          </div>

                          {/* Points */}
                          <div className="col-span-3 md:col-span-3 text-right">
                            <p className={cn(
                              "font-bold text-xl md:text-2xl",
                              entry.rank <= 3 
                                ? entry.rank === 1 
                                  ? "text-yellow-600 dark:text-yellow-500"
                                  : entry.rank === 2
                                  ? "text-gray-600 dark:text-gray-400"
                                  : "text-orange-600 dark:text-orange-500"
                                : "text-eco-leaf"
                            )}>
                              {entry.totalPoints.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Load More / End Message */}
              <div className="p-6 text-center border-t border-border">
                {hasMore ? (
                  <Button
                    onClick={() => setPage(p => p + 1)}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {t('leaderboardPage.loadingText')}
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                ) : leaderboard.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    You've reached the end of the leaderboard
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
