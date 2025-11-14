"use client"

import { TaskWithCompletion } from "@/types"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  Clock,
  AlertTriangle,
  XCircle,
  Shield,
  CheckCircle,
  Twitter,
  MessageCircle,
  Heart,
  Repeat,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { TaskTimerDisplay } from "./TaskTimerDisplay"
import { useState, useEffect, useRef } from "react"
import { getTaskUrgency, isTaskExpired } from "@/lib/tasks/organizer"

interface TaskListCompactProps {
  tasks: TaskWithCompletion[]
  onTaskClick: (taskId: string) => void
  showTimer?: boolean
}

const taskTypeConfig: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  TWITTER_FOLLOW: {
    icon: Twitter,
    color: "text-blue-600 dark:text-blue-400",
  },
  TWITTER_LIKE: {
    icon: Heart,
    color: "text-pink-600 dark:text-pink-400",
  },
  TWITTER_RETWEET: {
    icon: Repeat,
    color: "text-green-600 dark:text-green-400",
  },
  TELEGRAM_JOIN: {
    icon: MessageCircle,
    color: "text-sky-600 dark:text-sky-400",
  },
  CUSTOM: {
    icon: Sparkles,
    color: "text-purple-600 dark:text-purple-400",
  },
}

interface TaskRowProps {
  task: TaskWithCompletion
  onClick: () => void
  showTimer: boolean
  isSelected: boolean
}

function TaskRow({ task, onClick, showTimer, isSelected }: TaskRowProps) {
  const t = useTranslations("tasks")
  const [expired, setExpired] = useState(isTaskExpired(task))
  const rowRef = useRef<HTMLDivElement>(null)

  const typeConfig = taskTypeConfig[task.taskType] || taskTypeConfig.CUSTOM
  const TypeIcon = typeConfig.icon
  const urgency = getTaskUrgency(task)

  const hasScheduledDeadline =
    task.scheduledDeadline && new Date(task.scheduledDeadline) > new Date()

  const getStatusIcon = () => {
    if (!task.completedToday) return null

    switch (task.completionStatus) {
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
      case "APPROVED":
      case "AUTO_APPROVED":
        return (
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        )
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
      default:
        return <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
    }
  }

  const getUrgencyColor = () => {
    if (expired) return "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20"
    if (!urgency) return ""
    
    switch (urgency) {
      case "critical":
        return "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20"
      case "high":
        return "border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20"
      case "medium":
        return "border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-950/20"
      default:
        return ""
    }
  }

  useEffect(() => {
    if (isSelected && rowRef.current) {
      rowRef.current.focus()
    }
  }, [isSelected])

  return (
    <div
      ref={rowRef}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      className={`
        group relative flex items-center gap-3 p-3 rounded-lg border-2 
        transition-all duration-200 cursor-pointer
        ${
          task.completedToday
            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700"
            : `bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-eco-leaf dark:hover:border-eco-leaf hover:shadow-md ${getUrgencyColor()}`
        }
        ${isSelected ? "ring-2 ring-eco-leaf ring-offset-2" : ""}
        focus:outline-none focus:ring-2 focus:ring-eco-leaf focus:ring-offset-2
      `}
      aria-label={`${task.title}, ${task.points} points${task.completedToday ? ", completed" : ""}`}
    >
      {/* Task Type Icon */}
      <div className="shrink-0">
        <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} aria-hidden="true" />
      </div>

      {/* Task Title */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
          {task.title}
        </h3>
      </div>

      {/* Timer Display (if applicable) */}
      {showTimer && !task.completedToday && hasScheduledDeadline && (
        <div className="shrink-0">
          <TaskTimerDisplay
            taskId={task.id}
            deadline={new Date(task.scheduledDeadline!)}
            onExpire={() => setExpired(true)}
            variant="compact"
          />
        </div>
      )}

      {/* Expired Badge */}
      {expired && !task.completedToday && (
        <Badge
          variant="outline"
          className="shrink-0 text-red-600 border-red-600 text-xs"
        >
          <XCircle className="w-3 h-3 mr-1" />
          {t("expired")}
        </Badge>
      )}

      {/* Points Badge */}
      <Badge
        variant="secondary"
        className="shrink-0 bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-0 text-xs font-bold px-2 py-0.5"
      >
        <Sparkles className="w-3 h-3 mr-1" />
        {task.points}
      </Badge>

      {/* Status Icon */}
      {task.completedToday && (
        <div className="shrink-0" aria-label="Completed">
          {getStatusIcon()}
        </div>
      )}

      {/* Chevron */}
      <ChevronRight
        className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-eco-leaf dark:group-hover:text-eco-leaf transition-colors shrink-0"
        aria-hidden="true"
      />

      {/* Tooltip on hover */}
      <div className="absolute left-0 top-full mt-2 z-10 hidden group-hover:block w-full max-w-md">
        <div className="bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl border border-slate-700">
          <p className="font-semibold mb-1">{task.title}</p>
          <p className="text-slate-300 dark:text-slate-400 line-clamp-2">
            {task.description}
          </p>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700">
            <span className="text-slate-400">
              {t(`taskTypes.${task.taskType}`)}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold">
              {task.points} {t("points")}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TaskListCompact({
  tasks,
  onTaskClick,
  showTimer = true,
}: TaskListCompactProps) {
  const t = useTranslations("tasks")
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < tasks.length - 1 ? prev + 1 : prev
          )
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case "Home":
          e.preventDefault()
          setSelectedIndex(0)
          break
        case "End":
          e.preventDefault()
          setSelectedIndex(tasks.length - 1)
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [tasks.length])

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p>{t("noTasksAvailable")}</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="space-y-2"
      role="list"
      aria-label="Compact task list"
    >
      {tasks.map((task, index) => (
        <TaskRow
          key={task.id}
          task={task}
          onClick={() => onTaskClick(task.id)}
          showTimer={showTimer}
          isSelected={selectedIndex === index}
        />
      ))}
    </div>
  )
}
