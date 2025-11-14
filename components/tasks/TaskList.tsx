"use client";

import { useState, useMemo } from "react";
import { TaskWithCompletion } from "@/types";
import { TaskContainer } from "./TaskContainer";
import { TaskCompletionModal } from "./TaskCompletionModal";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Filter, X, ArrowUpDown, Twitter, MessageCircle, Heart, Repeat, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskDisplayConfig } from "@/lib/tasks/organizer";

interface TaskListProps {
  initialTasks: TaskWithCompletion[];
  isFullyVerified: boolean;
}

type TaskType = "ALL" | "TWITTER_FOLLOW" | "TWITTER_LIKE" | "TWITTER_RETWEET" | "TELEGRAM_JOIN" | "REFERRAL" | "CUSTOM";
type SortOption = "default" | "points-high" | "points-low" | "type" | "priority" | "deadline";

const taskTypeIcons: Record<string, React.ElementType> = {
  TWITTER_FOLLOW: Twitter,
  TWITTER_LIKE: Heart,
  TWITTER_RETWEET: Repeat,
  TELEGRAM_JOIN: MessageCircle,
  REFERRAL: Sparkles,
  CUSTOM: Sparkles,
};

export function TaskList({ initialTasks, isFullyVerified }: TaskListProps) {
  const [tasks, setTasks] = useState<TaskWithCompletion[]>(initialTasks);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<TaskType>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("default");
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

  const handleCompleteTask = async (taskId: string) => {
    // Check full verification before allowing task completion
    if (!isFullyVerified) {
      alert(t("taskList.verificationRequiredAlert"));
      router.push("/profile");
      return;
    }

    setLoadingTaskId(taskId);

    try {
      const response = await fetch("/api/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("taskList.completionError"));
      }

      // Find the completed task to get its details
      const completedTask = tasks.find((task) => task.id === taskId);

      // Update the task in the local state to show it as completed
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                isCompleted: true,
                completedToday: true,
                lastCompletedAt: new Date(),
              }
            : task
        )
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
      alert(error instanceof Error ? error.message : t("taskList.completionError"));
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleCloseCompletionModal = () => {
    setCompletionModal({
      isOpen: false,
      taskTitle: "",
      pointsEarned: 0,
    });
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply type filter
    if (filterType !== "ALL") {
      filtered = filtered.filter((task) => task.taskType === filterType);
    }

    return filtered;
  }, [tasks, filterType]);

  const completedTasks = filteredTasks.filter((task) => task.completedToday);
  const availableTasks = filteredTasks.filter((task) => !task.completedToday);

  // Create display config based on sort option
  const displayConfig: Partial<TaskDisplayConfig> = useMemo(() => {
    const config: Partial<TaskDisplayConfig> = {
      boxCount: 10,
    };

    // Map sort options to organizer sort types
    switch (sortBy) {
      case "points-high":
      case "points-low":
        config.sortBy = "points";
        break;
      case "priority":
        config.sortBy = "priority";
        break;
      case "deadline":
        config.sortBy = "deadline";
        break;
      case "default":
      default:
        config.sortBy = "created";
        break;
    }

    return config;
  }, [sortBy]);

  const hasActiveFilters = filterType !== "ALL" || sortBy !== "default";

  const clearFilters = () => {
    setFilterType("ALL");
    setSortBy("default");
  };

  const taskTypes: TaskType[] = ["ALL", "TWITTER_FOLLOW", "TWITTER_LIKE", "TWITTER_RETWEET", "TELEGRAM_JOIN", "REFERRAL", "CUSTOM"];

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4 bg-gradient-to-br from-white/80 to-emerald-50/40 dark:from-slate-900/80 dark:to-emerald-950/40 backdrop-blur-sm rounded-lg border border-eco shadow-sm">
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-5 h-5 text-eco-forest dark:text-eco-leaf" />
          <span className="text-sm font-medium text-eco-forest dark:text-eco-leaf">{t("filters.filterBy")}:</span>
          
          {taskTypes.map((type) => {
            const Icon = type !== "ALL" ? taskTypeIcons[type] : null;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                  flex items-center gap-1.5
                  ${filterType === type
                    ? 'bg-gradient-to-r from-eco-leaf to-eco-forest text-white shadow-lg shadow-eco-leaf/30'
                    : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-eco-leaf/10 dark:hover:bg-eco-leaf/20 border border-slate-200 dark:border-slate-700'
                  }
                `}
              >
                {Icon && <Icon className="w-3 h-3" />}
                {type === "ALL" ? t("filters.all") : t(`taskTypes.${type}`)}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 items-center">
          <ArrowUpDown className="w-4 h-4 text-eco-forest dark:text-eco-leaf" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-eco-leaf transition-all"
          >
            <option value="default">{t("filters.sortDefault")}</option>
            <option value="priority">{t("filters.sortPriority")}</option>
            <option value="deadline">{t("filters.sortDeadline")}</option>
            <option value="points-high">{t("filters.sortPointsHigh")}</option>
            <option value="points-low">{t("filters.sortPointsLow")}</option>
            <option value="type">{t("filters.sortType")}</option>
          </select>

          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="text-xs gap-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400"
            >
              <X className="w-3 h-3" />
              {t("filters.clear")}
            </Button>
          )}
        </div>
      </div>

      {/* Available Tasks with Container */}
      {availableTasks.length > 0 && (
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gradient-eco">{t("taskList.availableTasks")}</h2>
          <TaskContainer
            tasks={availableTasks}
            displayConfig={displayConfig}
            viewMode="pending"
            onComplete={handleCompleteTask}
            isLoading={!!loadingTaskId}
            disabled={!isFullyVerified}
          />
        </div>
      )}

      {/* Completed Tasks with Container */}
      {completedTasks.length > 0 && (
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gradient-eco">{t("taskList.completedToday")}</h2>
          <TaskContainer
            tasks={completedTasks}
            displayConfig={displayConfig}
            viewMode="completed"
            onComplete={handleCompleteTask}
            isLoading={false}
            disabled={false}
          />
        </div>
      )}

      {/* Empty State */}
      {availableTasks.length === 0 && completedTasks.length === 0 && (
        <div className="text-center py-12 animate-in fade-in-50 zoom-in-95 duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 mb-4">
            <Filter className="w-8 h-8 text-eco-forest dark:text-eco-leaf" />
          </div>
          <p className="text-muted-foreground text-lg mb-2">
            {hasActiveFilters ? t("taskList.noFilteredTasks") : t("taskList.noTasks")}
          </p>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="mt-4"
            >
              {t("filters.clear")}
            </Button>
          )}
        </div>
      )}

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
