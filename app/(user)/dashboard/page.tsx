"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Award, Target, Zap, Star } from "lucide-react";
import { LoadingState } from "@/components/ui/loading";
import { useTranslations } from "next-intl";
import { formatDateTime } from "@/lib/i18n/formatting";
import { Progress } from "@/components/ui/progress";
import { ErrorReportButton } from "@/components/error-report/ErrorReportButton";


interface CompletedTask {
  id: string;
  taskId: string;
  taskTitle: string;
  pointsAwarded: number;
  completedAt: string;
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  totalPoints: number;
  completionCount: number;
}

interface UserStats {
  user: {
    id: string;
    email: string;
    username: string;
    totalPoints: number;
    createdAt: string;
    lastActive: string;
  };
  stats: {
    completionCount: number;
    streak: number;
    rank: number;
  };
  completedTasks: CompletedTask[];
  leaderboard: LeaderboardEntry[];
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const t = useTranslations("dashboard");
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    // Get locale from localStorage
    const savedLocale = localStorage.getItem("NEXT_LOCALE") || "en";
    setLocale(savedLocale);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserStats();
    }
  }, [status]);

  // Auto-refresh every 30 seconds to keep data fresh
  useEffect(() => {
    if (status === "authenticated") {
      const interval = setInterval(() => {
        fetchUserStats();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [status]);

  // Listen for task completion events to refresh immediately
  useEffect(() => {
    const handleTaskCompleted = () => {
      fetchUserStats();
    };

    window.addEventListener("taskCompleted", handleTaskCompleted);
    return () => window.removeEventListener("taskCompleted", handleTaskCompleted);
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/users/me");

      if (!response.ok) {
        throw new Error("Failed to fetch user stats");
      }

      const data = await response.json();
      setUserStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <LoadingState message={t("loading")} fullScreen />;
  }

  if (error) {
    return (
      <div className="max-w-[80%] mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">{t("error.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <button
              onClick={fetchUserStats}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {t("error.retry")}
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userStats) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[80%] mx-auto py-6 sm:py-8 lg:py-12 landscape:py-4 px-4">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {t("hero.title", { username: userStats.user.username })}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("hero.subtitle")}
              </p>
            </div>
            <ErrorReportButton variant="outline" size="sm" />
          </div>
        </div>

        {/* Point Threshold Banner */}
        <div className="mb-8">
          {userStats.user.totalPoints < 1500 ? (
            <div className="w-full bg-red-600 text-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xl font-bold mb-2">
                    {t("pointThreshold.belowThreshold")}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold">{userStats.user.totalPoints} / 1500</span>
                    <div className="flex-1 max-w-md">
                      <Progress 
                        value={(userStats.user.totalPoints / 1500) * 100} 
                        className="h-3 bg-red-800"
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {((userStats.user.totalPoints / 1500) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full bg-green-700 text-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <Trophy className="h-8 w-8" />
                <p className="text-2xl font-bold">
                  {t("pointThreshold.aboveThreshold")}
                </p>
                <Trophy className="h-8 w-8" />
              </div>
              <div className="text-center mt-3">
                <span className="text-xl font-semibold">{userStats.user.totalPoints} / 1500 {t("pointThreshold.pointsOf")}</span>
              </div>
            </div>
          )}
        </div>

      {/* Enhanced Stats Cards with Eco Theme */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 landscape:md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10 landscape:mb-4">
        {/* Total Points Card */}
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-eco-leaf/20">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-eco-leaf/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">{t("stats.totalPoints.title")}</CardTitle>
            <div className="p-2 rounded-full bg-gradient-to-br from-yellow-500/20 to-eco-leaf/20 group-hover:scale-110 transition-transform">
              <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-eco-leaf bg-clip-text text-transparent">
              {userStats.user.totalPoints}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t("stats.totalPoints.description")}
            </p>
            <div className="mt-3">
              <Progress 
                value={Math.min((userStats.user.totalPoints / 1000) * 100, 100)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.min((userStats.user.totalPoints / 1000) * 100, 100).toFixed(0)}% to next milestone
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rank Card */}
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-eco-sky/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-eco-sky/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">{t("stats.rank.title")}</CardTitle>
            <div className="p-2 rounded-full bg-gradient-to-br from-blue-500/20 to-eco-sky/20 group-hover:scale-110 transition-transform">
              <Award className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-eco-sky bg-clip-text text-transparent">
              #{userStats.stats.rank}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t("stats.rank.description")}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Top performer
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-eco-leaf/20">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-eco-leaf/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">{t("stats.streak.title")}</CardTitle>
            <div className="p-2 rounded-full bg-gradient-to-br from-green-500/20 to-eco-leaf/20 group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-eco-leaf bg-clip-text text-transparent">
              {userStats.stats.streak}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {userStats.stats.streak === 1 ? t("stats.streak.day") : t("stats.streak.days")} {t("stats.streak.description")}
            </p>
            <div className="mt-3">
              <Progress 
                value={Math.min((userStats.stats.streak / 30) * 100, 100)} 
                className="h-2 bg-green-100 dark:bg-green-950"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {30 - userStats.stats.streak} days to 30-day streak
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Completions Card */}
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-eco-forest/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">{t("stats.completions.title")}</CardTitle>
            <div className="p-2 rounded-full bg-gradient-to-br from-purple-500/20 to-eco-forest/20 group-hover:scale-110 transition-transform">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-eco-forest bg-clip-text text-transparent">
              {userStats.stats.completionCount}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t("stats.completions.description")}
            </p>
            <div className="mt-3">
              <Progress 
                value={Math.min((userStats.stats.completionCount / 50) * 100, 100)} 
                className="h-2 bg-purple-100 dark:bg-purple-950"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {50 - userStats.stats.completionCount} tasks to 50 completions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 landscape:md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 landscape:gap-4">
        {/* Recent Completions with Enhanced Visualization */}
        <Card className="border-eco-leaf/20 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-eco-leaf/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-eco-leaf" />
              {t("recentCompletions.title")}
            </CardTitle>
            <CardDescription>{t("recentCompletions.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {userStats.completedTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-eco-leaf/10 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-eco-leaf/50" />
                </div>
                <p className="font-medium">{t("recentCompletions.empty")}</p>
                <p className="text-sm mt-2">{t("recentCompletions.emptyDescription")}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
                {userStats.completedTasks.slice(0, 10).map((task, index) => (
                  <div
                    key={task.id}
                    className="group relative flex items-center justify-between p-4 border border-eco-leaf/10 rounded-xl hover:border-eco-leaf/30 hover:bg-eco-leaf/5 transition-all duration-300 hover:shadow-md"
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-eco-leaf to-eco-forest rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 pl-2">
                      <p className="font-medium text-foreground group-hover:text-eco-forest transition-colors">
                        {task.taskTitle}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateTime(task.completedAt, locale)}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-500/20 to-eco-leaf/20 text-eco-forest border border-eco-leaf/30 group-hover:scale-105 transition-transform">
                        <Trophy className="h-3 w-3 mr-1" />
                        +{task.pointsAwarded}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard with Enhanced Styling */}
        <Card className="border-eco-sky/20 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-eco-sky/5 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-eco-sky" />
                  {t("leaderboard.title")}
                </CardTitle>
                <CardDescription>{t("leaderboard.subtitle")}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/leaderboard')}
                className="border-eco-sky/30 hover:bg-eco-sky/10 hover:border-eco-sky/50"
              >
                View Full List
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
              {userStats.leaderboard.map((entry, index) => {
                const isCurrentUser = entry.id === userStats.user.id;
                const maxPoints = Math.max(...userStats.leaderboard.map(e => e.totalPoints));
                const pointsPercentage = (entry.totalPoints / maxPoints) * 100;
                
                return (
                  <div
                    key={entry.id}
                    className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
                      isCurrentUser
                        ? "bg-gradient-to-r from-eco-leaf/10 to-eco-forest/10 border-eco-leaf shadow-md scale-105"
                        : "border-border hover:border-eco-sky/30 hover:bg-eco-sky/5 hover:shadow-md"
                    }`}
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                    }}
                  >
                    {/* Progress bar background */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-eco-leaf/5 to-transparent transition-all duration-500"
                      style={{ width: `${pointsPercentage}%` }}
                    />
                    
                    <div className="relative flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shadow-lg transition-transform group-hover:scale-110 ${
                            entry.rank === 1
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white ring-2 ring-yellow-300"
                              : entry.rank === 2
                              ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white ring-2 ring-gray-200"
                              : entry.rank === 3
                              ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white ring-2 ring-orange-300"
                              : "bg-gradient-to-br from-muted to-muted-foreground/20 text-muted-foreground"
                          }`}
                        >
                          {entry.rank <= 3 ? (
                            <Trophy className="h-5 w-5" />
                          ) : (
                            entry.rank
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground flex items-center gap-2">
                            {entry.username}
                            {isCurrentUser && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-eco-leaf/20 text-eco-forest border border-eco-leaf/30">
                                {t("leaderboard.you")}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Target className="h-3 w-3" />
                            {entry.completionCount} {entry.completionCount === 1 ? t("leaderboard.task") : t("leaderboard.tasks")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-eco-leaf bg-clip-text text-transparent">
                          {entry.totalPoints}
                        </p>
                        <p className="text-xs text-muted-foreground">{t("leaderboard.points")}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
