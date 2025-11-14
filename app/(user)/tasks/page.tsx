import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrganizedTasksView } from "@/components/tasks/OrganizedTasksView";
import { getTranslations } from "next-intl/server";
import { organizeTasksForTimeLimited } from "@/lib/tasks/organizer";
import { TaskWithCompletion } from "@/types";

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TasksPage() {
  // Get authenticated user session
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const t = await getTranslations("tasks");

  // Check user's verification status
  const user: any = await prisma.user.findUnique({
    where: { id: userId },
  });

  const hasVerifiedWallet = !!(user?.walletVerified && user.walletAddress);
  const hasVerifiedTwitter = !!user?.twitterVerified;
  const hasVerifiedTelegram = !!user?.telegramVerified;
  const isFullyVerified = hasVerifiedWallet && hasVerifiedTwitter && hasVerifiedTelegram;

  // Debug log
  console.log('[Tasks Page] User verification status:', {
    userId,
    username: user?.username,
    walletAddress: user?.walletAddress,
    walletVerified: user?.walletVerified,
    twitterUsername: user?.twitterUsername,
    twitterVerified: user?.twitterVerified,
    telegramUsername: user?.telegramUsername,
    telegramVerified: user?.telegramVerified,
    hasVerifiedWallet,
    hasVerifiedTwitter,
    hasVerifiedTelegram,
    isFullyVerified,
  });

  // Get today's date range (UTC)
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);

  // Get user's completions for today
  const todayCompletions = await prisma.completion.findMany({
    where: {
      userId,
      completedAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: {
      taskId: true,
      status: true,
    },
  });

  // Create a set of completed task IDs (only count non-rejected completions)
  const completedTaskIds = new Set(
    todayCompletions
      .filter((c) => c.status !== 'REJECTED')
      .map((c) => c.taskId)
  );

  // Get all active tasks that user hasn't completed today
  // Priority: Time-limited tasks first, then regular tasks
  const allTasks = await prisma.task.findMany({
    where: {
      isActive: true,
      id: {
        notIn: Array.from(completedTaskIds),
      },
    },
    orderBy: [
      // Priority 1: Time-limited tasks (with expiresAt) come first
      { expiresAt: { sort: 'asc', nulls: 'last' } },
      // Priority 2: Then by creation date (newest first)
      { createdAt: 'desc' },
    ],
  });

  // Limit to 5 tasks maximum
  const tasks = allTasks.slice(0, 5);

  // Get user's all completions for history with status
  const completions = await prisma.completion.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      userId: true,
      taskId: true,
      completedAt: true,
      missedAt: true,
      status: true,
      task: {
        select: {
          id: true,
          campaignId: true,
          title: true,
          description: true,
          points: true,
          taskType: true,
          taskUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          duration: true,
          expiresAt: true,
        },
      },
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  // Enrich tasks with completion status
  const tasksWithCompletion: TaskWithCompletion[] = tasks.map((task: any) => ({
    id: task.id,
    campaignId: task.campaignId || '',
    title: task.title,
    description: task.description,
    points: task.points,
    taskType: task.taskType as any,
    taskUrl: task.taskUrl ?? undefined,
    isActive: task.isActive,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    duration: task.duration ?? undefined,
    expiresAt: task.expiresAt ?? undefined,
    isCompleted: false,
    completedToday: false,
  }));

  // Add tasks from completions (for pending, completed, and missed)
  const completionTasks: TaskWithCompletion[] = completions
    .filter((c: any) => c.task) // Only include completions with task data
    .map((c: any) => ({
      id: c.task.id,
      campaignId: c.task.campaignId || '',
      title: c.task.title,
      description: c.task.description,
      points: c.task.points,
      taskType: c.task.taskType as any,
      taskUrl: c.task.taskUrl ?? undefined,
      isActive: c.task.isActive,
      createdAt: c.task.createdAt,
      updatedAt: c.task.updatedAt,
      duration: c.task.duration ?? undefined,
      expiresAt: c.task.expiresAt ?? undefined,
      isCompleted: false,
      completedToday: false,
    }));

  // Combine active tasks with completion tasks (remove duplicates)
  const allTasksMap = new Map<string, TaskWithCompletion>();
  
  // Add active tasks first
  tasksWithCompletion.forEach(task => {
    allTasksMap.set(task.id, task);
  });
  
  // Add completion tasks (won't overwrite active tasks)
  completionTasks.forEach(task => {
    if (!allTasksMap.has(task.id)) {
      allTasksMap.set(task.id, task);
    }
  });

  const allTasksWithCompletion = Array.from(allTasksMap.values());

  // Organize tasks into categories
  const organized = organizeTasksForTimeLimited(allTasksWithCompletion, completions);

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedCount = organized.completedTasks.length + organized.completedList.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="container-fluid mx-auto py-4 sm:py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          {t("hero.title")}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t("hero.subtitle")}
        </p>
        
        {/* Info Banner - Max 5 Tasks */}
        {allTasks.length > 5 && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 dark:text-blue-400 text-xl">ℹ️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Showing 5 of {allTasks.length} Available Tasks
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Complete tasks to unlock more! Time-limited tasks are shown first.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Task Stats */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="px-4 py-2 bg-eco-leaf/10 border border-eco-leaf/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-eco-leaf animate-pulse" />
              <span className="text-sm font-semibold text-eco-forest">
                {completedCount} / {totalTasks} {t("hero.tasksCompleted")}
              </span>
            </div>
          </div>
          
          <div className="px-4 py-2 bg-eco-sky/10 border border-eco-sky/20 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-eco-sky" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-semibold text-eco-forest">
                {progressPercentage}% {t("hero.progress")}
              </span>
            </div>
          </div>
        </div>
      </div>
        {/* Verification Required Warning */}
        {!isFullyVerified && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-2">
                  {t("verificationWarning.title")}
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                  {t("verificationWarning.description")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {!hasVerifiedWallet && (
                    <a
                      href="/wallet"
                      className="inline-flex items-center px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-md hover:bg-amber-700 transition-colors"
                    >
                      <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      {t("verificationWarning.verifyWallet")}
                    </a>
                  )}
                  {!hasVerifiedTwitter && (
                    <a
                      href="/profile"
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      {t("verificationWarning.verifyTwitter")}
                    </a>
                  )}
                  {!hasVerifiedTelegram && (
                    <a
                      href="/profile"
                      className="inline-flex items-center px-3 py-1.5 bg-cyan-600 text-white text-xs font-medium rounded-md hover:bg-cyan-700 transition-colors"
                    >
                      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                      {t("verificationWarning.verifyTelegram")}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      <OrganizedTasksView 
        organized={organized}
        isFullyVerified={isFullyVerified}
      />
    </div>
  );
}
