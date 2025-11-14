"use client"

import { TaskWithCompletion } from "@/types"
import {
  TaskDisplayConfig,
  organizeTasks,
  OrganizedTasks,
} from "@/lib/tasks/organizer"
import { TaskCard } from "./TaskCard"
import { TaskListCompact } from "./TaskListCompact"
import { useTranslations } from "next-intl"
import { useState, useMemo } from "react"
import { Sparkles, List } from "lucide-react"

interface TaskContainerProps {
  tasks: TaskWithCompletion[]
  displayConfig?: Partial<TaskDisplayConfig>
  viewMode: "pending" | "completed"
  onComplete: (taskId: string, completionTime?: number) => Promise<void>
  onTaskClick?: (taskId: string) => void
  isLoading?: boolean
  disabled?: boolean
}

export function TaskContainer({
  tasks,
  displayConfig,
  viewMode,
  onComplete,
  onTaskClick,
  isLoading = false,
  disabled = false,
}: TaskContainerProps) {
  const t = useTranslations("tasks")
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)

  // Organize tasks into box and list views
  const organized: OrganizedTasks = useMemo(() => {
    return organizeTasks(tasks, displayConfig)
  }, [tasks, displayConfig])

  const handleTaskClick = (taskId: string) => {
    if (onTaskClick) {
      onTaskClick(taskId)
    } else {
      // Default behavior: expand/collapse task details
      setExpandedTaskId((prev) => (prev === taskId ? null : taskId))
    }
  }

  // Empty state
  if (organized.totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {viewMode === "pending"
            ? t("noPendingTasks")
            : t("noCompletedTasks")}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">
          {viewMode === "pending"
            ? t("noPendingTasksMessage")
            : t("noCompletedTasksMessage")}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Box Tasks Section */}
      {organized.boxTasks.length > 0 && (
        <section aria-labelledby="featured-tasks-heading">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-eco-leaf" aria-hidden="true" />
            <h2
              id="featured-tasks-heading"
              className="text-xl font-bold text-slate-900 dark:text-slate-100"
            >
              {viewMode === "pending"
                ? t("featuredTasks")
                : t("recentlyCompleted")}
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              ({organized.boxTasks.length})
            </span>
          </div>

          {/* Responsive Grid - 5 columns */}
          <div
            className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5"
            role="list"
            aria-label={
              viewMode === "pending" ? "Featured tasks" : "Recently completed tasks"
            }
          >
            {organized.boxTasks.map((task, index) => (
              <div
                key={task.id}
                role="listitem"
                className="animate-task-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <TaskCard
                  task={task}
                  onComplete={onComplete}
                  isLoading={isLoading}
                  disabled={disabled}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* List Tasks Section */}
      {organized.listTasks.length > 0 && (
        <section aria-labelledby="more-tasks-heading">
          <div className="flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-eco-forest" aria-hidden="true" />
            <h2
              id="more-tasks-heading"
              className="text-xl font-bold text-slate-900 dark:text-slate-100"
            >
              {viewMode === "pending" ? t("moreTasks") : t("olderCompleted")}
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              ({organized.listTasks.length})
            </span>
          </div>

          <div className="animate-task-fade-in" style={{ animationDelay: "200ms" }}>
            <TaskListCompact
              tasks={organized.listTasks}
              onTaskClick={handleTaskClick}
              showTimer={viewMode === "pending"}
            />
          </div>

          {/* Expanded Task Details */}
          {expandedTaskId && (
            <div className="mt-4 animate-in fade-in-50 slide-in-from-top-2 duration-300">
              {organized.listTasks
                .filter((task) => task.id === expandedTaskId)
                .map((task) => (
                  <div key={task.id} className="max-w-2xl mx-auto">
                    <TaskCard
                      task={task}
                      onComplete={onComplete}
                      isLoading={isLoading}
                      disabled={disabled}
                    />
                  </div>
                ))}
            </div>
          )}
        </section>
      )}

      {/* Summary */}
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
        <span>
          {t("showingTasks", {
            count: organized.totalCount,
            boxCount: organized.boxTasks.length,
            listCount: organized.listTasks.length,
          })}
        </span>
      </div>
    </div>
  )
}
