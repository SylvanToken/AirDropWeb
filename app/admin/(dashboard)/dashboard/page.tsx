"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, Users, Activity, Award, TrendingUp, AlertTriangle, RefreshCw, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalCompletions: number;
  totalPointsAwarded: number;
  totalReferralCompletions: number;
  totalReferralPoints: number;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const t = useTranslations("admin");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch("/api/admin/reset-database", {
        method: "POST",
      });

      if (response.ok) {
        alert(t("databaseReset.successMessage"));
        setShowResetConfirm(false);
        // Refresh stats
        await fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed to reset database: ${error.error}`);
      }
    } catch (error) {
      console.error("Error resetting database:", error);
      alert("Failed to reset database. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with eco gradient */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-eco-leaf via-eco-forest to-eco-moss p-6 sm:p-8 text-white">
        <div className="absolute inset-0 bg-[url('/assets/patterns/topography.svg')] opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t("dashboard.title")}</h1>
              <p className="text-sm sm:text-base text-white/90 mt-1">
                {t("dashboard.welcome", { username: session?.user?.username || "Admin" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards with Gradient Backgrounds */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        {/* Total Users */}
        <Card className="relative overflow-hidden border-eco-leaf/20 hover:shadow-lg transition-shadow depth-4k-1">
          <div className="absolute inset-0 bg-gradient-to-br from-eco-sky/30 to-eco-leaf/20 dark:from-eco-sky/10 dark:to-eco-leaf/10"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("dashboard.stats.totalUsers")}
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-eco-leaf to-eco-forest flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats?.totalUsers || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {t("dashboard.stats.totalUsersDesc")}
            </p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="relative overflow-hidden border-eco-leaf/20 hover:shadow-lg transition-shadow depth-4k-1">
          <div className="absolute inset-0 bg-gradient-to-br from-eco-leaf/30 to-eco-moss/20 dark:from-eco-leaf/10 dark:to-eco-moss/10"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("dashboard.stats.activeUsers")}
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-eco-moss to-eco-forest flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats?.activeUsers || 0}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-3 w-3 text-eco-leaf" />
                  <span className="text-xs text-eco-leaf font-medium">
                    {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% active
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Completions */}
        <Card className="relative overflow-hidden border-eco-leaf/20 hover:shadow-lg transition-shadow depth-4k-1">
          <div className="absolute inset-0 bg-gradient-to-br from-eco-earth/30 to-eco-forest/20 dark:from-eco-earth/10 dark:to-eco-forest/10"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("dashboard.stats.totalCompletions")}
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-eco-leaf to-eco-earth flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats?.totalCompletions || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {t("dashboard.stats.totalCompletionsDesc")}
            </p>
          </CardContent>
        </Card>

        {/* Total Points */}
        <Card className="relative overflow-hidden border-eco-leaf/20 hover:shadow-lg transition-shadow depth-4k-1">
          <div className="absolute inset-0 bg-gradient-to-br from-eco-moss/30 to-eco-sky/20 dark:from-eco-moss/10 dark:to-eco-sky/10"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("dashboard.stats.totalPoints")}
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-eco-forest to-eco-moss flex items-center justify-center">
              <Award className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats?.totalPointsAwarded?.toLocaleString() || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {t("dashboard.stats.totalPointsDesc")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Metrics Section */}
      <Card className="border-eco-leaf/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-eco-leaf to-eco-forest flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-white" />
            </div>
            {t("dashboard.referralMetrics.title")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.referralMetrics.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            {/* Referral Completions */}
            <div className="relative overflow-hidden rounded-lg border border-eco-leaf/20 p-4 bg-gradient-to-br from-eco-sky/10 to-eco-leaf/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("dashboard.referralMetrics.completions")}
                </p>
                <UserPlus className="h-5 w-5 text-eco-forest" />
              </div>
              {isLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats?.totalReferralCompletions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.referralMetrics.completionsDesc")}
                  </p>
                </>
              )}
            </div>

            {/* Referral Points */}
            <div className="relative overflow-hidden rounded-lg border border-eco-leaf/20 p-4 bg-gradient-to-br from-eco-moss/10 to-eco-forest/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("dashboard.referralMetrics.points")}
                </p>
                <Award className="h-5 w-5 text-eco-forest" />
              </div>
              {isLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats?.totalReferralPoints?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.totalPointsAwarded && stats?.totalReferralPoints
                      ? t("dashboard.referralMetrics.percentageOfTotal", {
                          percentage: Math.round((stats.totalReferralPoints / stats.totalPointsAwarded) * 100)
                        })
                      : t("dashboard.referralMetrics.pointsDesc")}
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Session Info */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-eco-leaf/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-eco-leaf to-eco-forest flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              {t("dashboard.quickActions.title")}
            </CardTitle>
            <CardDescription>{t("dashboard.quickActions.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/tasks"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-eco-leaf/5 transition-colors group border border-transparent hover:border-eco-leaf/20"
            >
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-eco-sky/50 to-eco-leaf/30 dark:from-eco-sky/20 dark:to-eco-leaf/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle className="h-5 w-5 text-eco-forest dark:text-eco-leaf" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {t("dashboard.quickActions.manageTasks")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.quickActions.manageTasksDesc")}
                </p>
              </div>
            </a>
            <a
              href="/admin/users"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-eco-leaf/5 transition-colors group border border-transparent hover:border-eco-leaf/20"
            >
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-eco-leaf/50 to-eco-moss/30 dark:from-eco-leaf/20 dark:to-eco-moss/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-eco-forest dark:text-eco-leaf" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {t("dashboard.quickActions.viewUsers")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.quickActions.viewUsersDesc")}
                </p>
              </div>
            </a>
            <a
              href="/admin/campaigns"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-eco-leaf/5 transition-colors group border border-transparent hover:border-eco-leaf/20"
            >
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-eco-earth/50 to-eco-forest/30 dark:from-eco-earth/20 dark:to-eco-forest/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="h-5 w-5 text-eco-forest dark:text-eco-leaf" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {t("dashboard.quickActions.manageCampaigns")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.quickActions.manageCampaignsDesc")}
                </p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="border-eco-leaf/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-eco-leaf to-eco-forest flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              {t("dashboard.sessionInfo.title")}
            </CardTitle>
            <CardDescription>{t("dashboard.sessionInfo.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-eco-leaf/5 dark:bg-eco-leaf/5 border border-eco-leaf/20">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-eco-leaf to-eco-forest flex items-center justify-center text-white font-bold">
                {session?.user?.username?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {session?.user?.username || "Admin"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("dashboard.sessionInfo.role")}</span>
                <span className="px-2 py-1 rounded-md bg-gradient-to-r from-eco-leaf to-eco-forest text-white text-xs font-medium">
                  {session?.user?.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("dashboard.sessionInfo.userId")}</span>
                <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                  {session?.user?.id?.slice(0, 8)}...
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access Control */}
      <Card className="border-eco-leaf/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            {t("dashboard.accessControl.title")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.accessControl.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {t("dashboard.accessControl.features.manageTasks")}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {t("dashboard.accessControl.features.viewUsers")}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {t("dashboard.accessControl.features.viewHistory")}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {t("dashboard.accessControl.features.viewAnalytics")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Reset - Testing Only */}
      <Card className="border-red-500/20 bg-red-50/50 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <div className="h-8 w-8 rounded-lg bg-red-500 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            {t("databaseReset.title")}
          </CardTitle>
          <CardDescription className="text-red-600 dark:text-red-400">
            {t("databaseReset.warning")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium mb-2">
              {t("databaseReset.actionWillTitle")}
            </p>
            <ul className="text-sm text-red-700 dark:text-red-400 space-y-1 list-disc list-inside">
              <li>{t("databaseReset.deleteUsers")}</li>
              <li>{t("databaseReset.deleteTasks")}</li>
              <li>{t("databaseReset.deleteCompletions")}</li>
              <li>{t("databaseReset.resetAdminData")}</li>
            </ul>
          </div>
          
          {showResetConfirm && (
            <div className="p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 font-bold mb-2">
                {t("databaseReset.confirmTitle")}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                {t("databaseReset.confirmMessage")}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleResetDatabase}
              disabled={isResetting}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {t("databaseReset.resetting")}
                </>
              ) : showResetConfirm ? (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  {t("databaseReset.confirmButton")}
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  {t("databaseReset.resetButton")}
                </>
              )}
            </Button>
            
            {showResetConfirm && (
              <Button
                onClick={() => setShowResetConfirm(false)}
                variant="outline"
              >
                {t("databaseReset.cancel")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
