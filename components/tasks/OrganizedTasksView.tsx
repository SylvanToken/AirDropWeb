"use client";

import { useState } from "react";
import { TaskWithCompletion } from "@/types";
import { CategorizedTasks } from "@/lib/tasks/organizer";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";
import { TaskCompletionModal } from "./TaskCompletionModal";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkeletonTaskCard } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { withRetry, parseApiError, getUserFriendlyErrorMessage, getErrorCode } from "@/lib/tasks/error-handler";
import { ErrorReportButton } from "@/components/error-report/ErrorReportButton";

interface OrganizedTasksViewProps {
  organized: CategorizedTasks;
  isFullyVerified: boolean;
}

export function OrganizedTasksView({ organized, isFullyVerified }: OrganizedTasksViewProps) {
  const [activeTasks, setActiveTasks] = useState<TaskWithCompletion[]>(organized.activeTasks);
  const [pendingTasks] = useState<TaskWithCompletion[]>(organized.pendingTasks);
  const [pendingList] = useState<TaskWithCompletion[]>(organized.pendingList);
  const [completedTasks] = useState<TaskWithCompletion[]>(organized.completedTasks);
  const [completedList] = useState<TaskWithCompletion[]>(organized.completedList);
  const [missedTasks] = useState<TaskWithCompletion[]>(organized.missedTasks);
  const [missedList] = useState<TaskWithCompletion[]>(organized.missedList);
  
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskWithCompletion | null>(null);
  const [showPendingList, setShowPendingList] = useState(false);
  const [showCompletedList, setShowCompletedList] = useState(false);
  const [showMissedList, setShowMissedList] = useState(false);
  const [isCheckingExpiration, setIsCheckingExpiration] = useState(false);
  
  const [completionModal, setCompletionModal] = useState<{
    isOpen: boolean;
    taskTitle: string;
    pointsEarned: number;
  }>({
    isOpen: false,
    taskTitle: "",
    pointsEarned: 0,
  });

  const router = useRouter();
  const t = useTranslations("tasks");
  const { toast } = useToast();

  const handleCompleteTask = async (taskId: string, retryCount = 0) => {
    // Check full verification before allowing task completion
    if (!isFullyVerified) {
      toast({
        title: "Verification Required",
        description: t("taskList.verificationRequiredAlert"),
        variant: "destructive",
      });
      router.push("/profile");
      return;
    }

    setLoadingTaskId(taskId);

    try {
      await withRetry(
        async () => {
          const response = await fetch("/api/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ taskId }),
          });

          if (!response.ok) {
            const error = await parseApiError(response);
            throw error;
          }

          return response.json();
        },
        {
          maxRetries: 2,
          retryDelay: 1000,
          onRetry: (attempt) => {
            toast({
              title: "Retrying...",
              description: `Attempt ${attempt} of 2`,
            });
          },
        }
      );

      // Find the completed task to get its details
      const completedTask = activeTasks.find((task) => task.id === taskId);

      // Remove task from active tasks
      setActiveTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskId)
      );

      // Show completion modal with animation
      if (completedTask) {
        setCompletionModal({
          isOpen: true,
          taskTitle: completedTask.title,
          pointsEarned: completedTask.points,
        });
      }

      // Refresh the page data to update any other components (like user points)
      router.refresh();

      // Trigger a custom event for dashboard refresh
      window.dispatchEvent(new CustomEvent("taskCompleted"));
    } catch (error) {
      console.error("Error completing task:", error);
      
      const errorMessage = getUserFriendlyErrorMessage(error);
      const errorCode = getErrorCode(error);
      
      // Show error toast with retry option
      toast({
        title: t("errors.completionFailed"),
        description: errorMessage,
        variant: "destructive",
        action: retryCount < 2 ? {
          label: t("errors.retry"),
          onClick: () => handleCompleteTask(taskId, retryCount + 1),
        } as any : undefined,
      });
      
      // Log error for monitoring
      console.error(`Task completion failed: ${errorCode}`, {
        taskId,
        error: errorMessage,
        retryCount,
      });
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleTaskExpired = async (taskId: string) => {
    setIsCheckingExpiration(true);
    
    try {
      await withRetry(
        async () => {
          const response = await fetch("/api/tasks/mark-expired", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ taskId }),
          });

          if (!response.ok) {
            const error = await parseApiError(response);
            throw error;
          }

          return response.json();
        },
        {
          maxRetries: 1, // Only retry once for expiration checks
          retryDelay: 500,
        }
      );

      // Remove expired task from active tasks
      setActiveTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskId)
      );
      
      // Show expiration notification
      const expiredTask = activeTasks.find((task) => task.id === taskId);
      if (expiredTask) {
        toast({
          title: t("taskExpired"),
          description: `"${expiredTask.title}" has expired and moved to missed tasks.`,
          variant: "destructive",
        });
      }
      
      // Refresh to get updated data
      router.refresh();
    } catch (error) {
      console.error("Error marking task as expired:", error);
      
      // Still remove from UI even if API call fails (graceful degradation)
      setActiveTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskId)
      );
      
      const errorMessage = getUserFriendlyErrorMessage(error);
      
      toast({
        title: t("taskExpired"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCheckingExpiration(false);
    }
  };

  const handleCloseCompletionModal = () => {
    setCompletionModal({
      isOpen: false,
      taskTitle: "",
      pointsEarned: 0,
    });
  };

  return (
    <div className="space-y-8">
      {/* Error Report Button */}
      <div className="flex justify-end">
        <ErrorReportButton variant="ghost" size="sm" />
      </div>

      {/* Row 1: Active Tasks (Max 5) */}
      <section 
        className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
        aria-labelledby="active-tasks-heading"
      >
        <h2 
          id="active-tasks-heading"
          className="text-2xl font-bold mb-4 text-gradient-eco"
        >
          {t("organized.activeTasks")}
          <span className="sr-only">
            {activeTasks.length > 0 
              ? ` - ${activeTasks.length} task${activeTasks.length === 1 ? '' : 's'} available`
              : ' - No tasks available'
            }
          </span>
        </h2>
        {activeTasks.length > 0 ? (
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4"
            role="list"
            aria-label="Active tasks"
          >
            {activeTasks.map((task) => (
              <div key={task.id} role="listitem">
                <TaskCard
                  task={task}
                  onComplete={handleCompleteTask}
                  onExpire={handleTaskExpired}
                  isLoading={loadingTaskId === task.id}
                  disabled={!isFullyVerified}
                />
              </div>
            ))}
          </div>
        ) : (
          <div 
            className="text-center py-12 bg-gradient-to-br from-white/80 to-emerald-50/40 dark:from-slate-900/80 dark:to-emerald-950/40 backdrop-blur-sm rounded-lg border border-eco"
            role="status"
            aria-live="polite"
          >
            <p className="text-muted-foreground text-lg">
              {t("organized.noActiveTasks")}
            </p>
          </div>
        )}
      </section>

      {/* Row 2: Pending Tasks (Awaiting Approval) */}
      <section 
        className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
        aria-labelledby="pending-tasks-heading"
      >
        <h2 
          id="pending-tasks-heading"
          className="text-2xl font-bold mb-4 text-gradient-eco"
        >
          {t("organized.pendingTasks")}
          <span className="sr-only">
            {pendingTasks.length > 0 || pendingList.length > 0
              ? ` - ${pendingTasks.length + pendingList.length} task${pendingTasks.length + pendingList.length === 1 ? '' : 's'} pending`
              : ' - No tasks pending'
            }
          </span>
        </h2>
        {(pendingTasks.length > 0 || pendingList.length > 0) ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onExpire={handleTaskExpired}
                  isLoading={false}
                  disabled={true}
                />
              ))}
          </div>
          
          {/* Collapsible List for Additional Pending Tasks */}
          {pendingList.length > 0 && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => setShowPendingList(!showPendingList)}
                className="w-full flex items-center justify-center gap-2 focus:ring-2 focus:ring-eco-leaf focus:ring-offset-2"
                aria-expanded={showPendingList}
                aria-controls="pending-tasks-list"
              >
                {showPendingList ? (
                  <>
                    <ChevronUp className="w-4 h-4" aria-hidden="true" />
                    {t("organized.hideMore", { count: pendingList.length })}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    {t("organized.showMore", { count: pendingList.length })}
                  </>
                )}
              </Button>
              
              {showPendingList && (
                <div 
                  id="pending-tasks-list"
                  className="space-y-2 mt-4 animate-in fade-in-50 slide-in-from-top-4 duration-300"
                  role="list"
                >
                  {pendingList.map((task) => (
                    <div
                      key={task.id}
                      role="listitem"
                      tabIndex={0}
                      className="p-4 bg-white dark:bg-slate-800 border border-yellow-200 dark:border-yellow-900 rounded-lg cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-950/20 transition-all duration-200 focus:ring-2 focus:ring-eco-leaf focus:ring-offset-2 focus:outline-none"
                      onClick={() => setSelectedTask(task)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedTask(task);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{task.title}</h3>
                            <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
                              {t("organized.pending")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className="text-sm font-semibold text-yellow-600">
                            {task.points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          </>
        ) : (
          <div 
            className="text-center py-12 bg-gradient-to-br from-white/80 to-yellow-50/40 dark:from-slate-900/80 dark:to-yellow-950/40 backdrop-blur-sm rounded-lg border border-yellow-200 dark:border-yellow-800"
            role="status"
            aria-live="polite"
          >
            <p className="text-muted-foreground text-lg">
              {t("organized.noPendingTasks")}
            </p>
          </div>
        )}
      </section>

      {/* Row 3: Completed Tasks (5 Recent) */}
      <section 
        className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
        aria-labelledby="completed-tasks-heading"
      >
        <h2 
          id="completed-tasks-heading"
          className="text-2xl font-bold mb-4 text-gradient-eco"
        >
          {t("organized.completedTasks")}
          <span className="sr-only">
            {completedTasks.length > 0 
              ? ` - ${completedTasks.length + completedList.length} task${completedTasks.length + completedList.length === 1 ? '' : 's'} completed`
              : ' - No tasks completed'
            }
          </span>
        </h2>
        {completedTasks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onExpire={handleTaskExpired}
                  isLoading={false}
                  disabled={true}
                />
              ))}
            </div>
            
            {/* Collapsible List for Additional Completed Tasks */}
            {completedList.length > 0 && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCompletedList(!showCompletedList)}
                  className="w-full flex items-center justify-center gap-2 focus:ring-2 focus:ring-eco-leaf focus:ring-offset-2"
                  aria-expanded={showCompletedList}
                  aria-controls="completed-tasks-list"
                  aria-label={showCompletedList 
                    ? `Hide ${completedList.length} additional completed tasks`
                    : `Show ${completedList.length} additional completed tasks`
                  }
                >
                  {showCompletedList ? (
                    <>
                      <ChevronUp className="w-4 h-4" aria-hidden="true" />
                      {t("organized.hideMore", { count: completedList.length })}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      {t("organized.showMore", { count: completedList.length })}
                    </>
                  )}
                </Button>
                
                {showCompletedList && (
                  <div 
                    id="completed-tasks-list"
                    className="space-y-2 mt-4 animate-in fade-in-50 slide-in-from-top-4 duration-300"
                    role="list"
                    aria-label="Additional completed tasks"
                  >
                    {completedList.map((task) => (
                      <div
                        key={task.id}
                        role="listitem"
                        tabIndex={0}
                        className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-accent hover:border-eco-leaf transition-all duration-200 focus:ring-2 focus:ring-eco-leaf focus:ring-offset-2 focus:outline-none"
                        onClick={() => setSelectedTask(task)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedTask(task);
                          }
                        }}
                        aria-label={`View details for ${task.title}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{task.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {task.description}
                            </p>
                          </div>
                          <div className="ml-4 flex items-center gap-2">
                            <span className="text-sm font-semibold text-eco-forest">
                              {task.points} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-white/80 to-emerald-50/40 dark:from-slate-900/80 dark:to-emerald-950/40 backdrop-blur-sm rounded-lg border border-eco">
            <p className="text-muted-foreground text-lg">
              {t("organized.noCompletedTasks")}
            </p>
          </div>
        )}
      </section>

      {/* Row 4: Missed Tasks (5 Recent) */}
      <section 
        className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
        aria-labelledby="missed-tasks-heading"
      >
        <h2 
          id="missed-tasks-heading"
          className="text-2xl font-bold mb-4 text-gradient-eco"
        >
          {t("organized.missedTasks")}
          <span className="sr-only">
            {missedTasks.length > 0 
              ? ` - ${missedTasks.length + missedList.length} task${missedTasks.length + missedList.length === 1 ? '' : 's'} missed`
              : ' - No tasks missed'
            }
          </span>
        </h2>
        {missedTasks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {missedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onExpire={handleTaskExpired}
                  isLoading={false}
                  disabled={true}
                />
              ))}
            </div>
            
            {/* Collapsible List for Additional Missed Tasks */}
            {missedList.length > 0 && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowMissedList(!showMissedList)}
                  className="w-full flex items-center justify-center gap-2 focus:ring-2 focus:ring-eco-leaf focus:ring-offset-2"
                  aria-expanded={showMissedList}
                  aria-controls="missed-tasks-list"
                  aria-label={showMissedList 
                    ? `Hide ${missedList.length} additional missed tasks`
                    : `Show ${missedList.length} additional missed tasks`
                  }
                >
                  {showMissedList ? (
                    <>
                      <ChevronUp className="w-4 h-4" aria-hidden="true" />
                      {t("organized.hideMore", { count: missedList.length })}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      {t("organized.showMore", { count: missedList.length })}
                    </>
                  )}
                </Button>
                
                {showMissedList && (
                  <div 
                    id="missed-tasks-list"
                    className="space-y-2 mt-4 animate-in fade-in-50 slide-in-from-top-4 duration-300"
                    role="list"
                    aria-label="Additional missed tasks"
                  >
                    {missedList.map((task) => (
                      <div
                        key={task.id}
                        role="listitem"
                        tabIndex={0}
                        className="p-4 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 opacity-75 focus:ring-2 focus:ring-eco-leaf focus:ring-offset-2 focus:outline-none"
                        onClick={() => setSelectedTask(task)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedTask(task);
                          }
                        }}
                        aria-label={`View details for expired task: ${task.title}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{task.title}</h3>
                              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                                {t("organized.expired")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {task.description}
                            </p>
                          </div>
                          <div className="ml-4 flex items-center gap-2">
                            <span className="text-sm font-semibold text-muted-foreground line-through">
                              {task.points} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-white/80 to-emerald-50/40 dark:from-slate-900/80 dark:to-emerald-950/40 backdrop-blur-sm rounded-lg border border-eco">
            <p className="text-muted-foreground text-lg">
              {t("organized.noMissedTasks")}
            </p>
          </div>
        )}
      </section>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      {/* Task Completion Modal */}
      <TaskCompletionModal
        isOpen={completionModal.isOpen}
        onClose={handleCloseCompletionModal}
        taskTitle={completionModal.taskTitle}
        pointsEarned={completionModal.pointsEarned}
      />
    </div>
  );
}
