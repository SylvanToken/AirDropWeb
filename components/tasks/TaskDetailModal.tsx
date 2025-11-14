"use client";

import { TaskWithCompletion } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "./CountdownTimer";
import { TwitterTaskInstructions } from "@/components/twitter/TwitterTaskInstructions";
import { TwitterVerificationStatus } from "@/components/twitter/TwitterVerificationStatus";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield,
  Twitter,
  MessageCircle,
  Heart,
  Repeat,
  Sparkles,
  Coins
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";

interface TaskDetailModalProps {
  task: TaskWithCompletion | null;
  isOpen: boolean;
  onClose: () => void;
}

const taskTypeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  TWITTER_FOLLOW: {
    icon: Twitter,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    label: "Twitter Follow",
  },
  TWITTER_LIKE: {
    icon: Heart,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    label: "Twitter Like",
  },
  TWITTER_RETWEET: {
    icon: Repeat,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    label: "Twitter Retweet",
  },
  TELEGRAM_JOIN: {
    icon: MessageCircle,
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    label: "Telegram Join",
  },
  CUSTOM: {
    icon: Sparkles,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    label: "Custom Task",
  },
};

/**
 * Get status badge variant and label based on task state
 */
function getTaskStatus(task: TaskWithCompletion): {
  variant: "default" | "secondary" | "destructive" | "outline";
  label: string;
  icon: React.ElementType;
  color: string;
} {
  // Check if task is expired
  const isExpired = task.expiresAt && new Date(task.expiresAt) <= new Date();
  const isMissed = task.missedAt;
  
  if (isMissed || isExpired) {
    return {
      variant: "destructive",
      label: "Missed",
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
    };
  }
  
  if (task.completedToday || task.lastCompletedAt) {
    switch (task.completionStatus) {
      case 'PENDING':
        return {
          variant: "outline",
          label: task.needsReview ? "Under Review" : "Pending Approval",
          icon: Clock,
          color: "text-yellow-600 dark:text-yellow-400",
        };
      case 'APPROVED':
        return {
          variant: "outline",
          label: "Approved",
          icon: CheckCircle,
          color: "text-green-600 dark:text-green-400",
        };
      case 'AUTO_APPROVED':
        return {
          variant: "outline",
          label: "Auto Approved",
          icon: Shield,
          color: "text-blue-600 dark:text-blue-400",
        };
      case 'REJECTED':
        return {
          variant: "destructive",
          label: "Rejected",
          icon: XCircle,
          color: "text-red-600 dark:text-red-400",
        };
      default:
        return {
          variant: "outline",
          label: "Completed",
          icon: CheckCircle,
          color: "text-green-600 dark:text-green-400",
        };
    }
  }
  
  return {
    variant: "secondary",
    label: "Active",
    icon: Sparkles,
    color: "text-emerald-600 dark:text-emerald-400",
  };
}

/**
 * TaskDetailModal Component
 * 
 * Displays detailed information about a task in a modal dialog.
 * Shows task title, description, points, type, status, and countdown timer for active time-limited tasks.
 * 
 * Features:
 * - Modal dialog with shadcn Dialog component
 * - Task status badge (active/completed/missed)
 * - Countdown timer for active time-limited tasks
 * - Close button and keyboard navigation (Escape key)
 * - Click-outside-to-close functionality
 * - Prevents body scroll when modal is open
 * - Accessible with ARIA labels
 */
export function TaskDetailModal({ task, isOpen, onClose }: TaskDetailModalProps) {
  const t = useTranslations("tasks");
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [isCheckingTwitter, setIsCheckingTwitter] = useState(false);
  
  // Check Twitter connection status
  const checkTwitterConnection = useCallback(async () => {
    if (!task) return;
    
    const isTwitterTask = ['TWITTER_FOLLOW', 'TWITTER_LIKE', 'TWITTER_RETWEET'].includes(task.taskType);
    if (!isTwitterTask) return;
    
    setIsCheckingTwitter(true);
    try {
      const response = await fetch('/api/auth/twitter/status');
      if (response.ok) {
        const data = await response.json();
        setTwitterConnected(data.connected);
      }
    } catch (error) {
      console.error('Failed to check Twitter connection:', error);
      setTwitterConnected(false);
    } finally {
      setIsCheckingTwitter(false);
    }
  }, [task]);

  useEffect(() => {
    if (isOpen && task) {
      checkTwitterConnection();
    }
  }, [isOpen, task, checkTwitterConnection]);
  
  if (!task) {
    return null;
  }

  const status = getTaskStatus(task);
  const StatusIcon = status.icon;
  const typeConfig = taskTypeConfig[task.taskType] || taskTypeConfig.CUSTOM;
  const TypeIcon = typeConfig.icon;
  
  // Check if task is active and time-limited
  const isActive = !task.completedToday && !task.missedAt;
  const isTimeLimited = task.expiresAt && new Date(task.expiresAt) > new Date();
  const showCountdown = isActive && isTimeLimited;
  
  // Check if this is a Twitter task
  const isTwitterTask = ['TWITTER_FOLLOW', 'TWITTER_LIKE', 'TWITTER_RETWEET'].includes(task.taskType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby="task-detail-description"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient-eco pr-8">
            {task.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6" id="task-detail-description">
          {/* Status and Timer Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge 
              variant={status.variant}
              className={`${status.color} border-current`}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
            
            {showCountdown && (
              <div className="flex-1 min-w-[200px]">
                <CountdownTimer 
                  expiresAt={new Date(task.expiresAt!)}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800"
                />
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Description
            </h3>
            <p className="text-base text-foreground leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Task Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Points */}
            <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                <Coins className="w-4 h-4" />
                <span>Points</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {task.points}
              </p>
            </div>

            {/* Task Type */}
            <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/30 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                <TypeIcon className="w-4 h-4" />
                <span>Type</span>
              </div>
              <p className={`text-lg font-semibold ${typeConfig.color}`}>
                {typeConfig.label}
              </p>
            </div>
          </div>

          {/* Twitter Task Instructions */}
          {isTwitterTask && isActive && !isCheckingTwitter && (
            <TwitterTaskInstructions
              taskType={task.taskType as 'TWITTER_FOLLOW' | 'TWITTER_LIKE' | 'TWITTER_RETWEET'}
              taskUrl={task.taskUrl || ''}
              isConnected={twitterConnected}
              onConnect={() => {
                checkTwitterConnection();
              }}
              onComplete={async () => {
                // Trigger task completion
                try {
                  const response = await fetch('/api/completions', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      taskId: task.id,
                    }),
                  });
                  
                  if (response.ok) {
                    // Refresh task data
                    window.location.reload();
                  }
                } catch (error) {
                  console.error('Failed to complete task:', error);
                }
              }}
            />
          )}

          {/* Twitter Verification Status */}
          {isTwitterTask && task.lastCompletedAt && task.completionId && (
            <TwitterVerificationStatus
              completionId={task.completionId!}
              taskType={task.taskType as 'TWITTER_FOLLOW' | 'TWITTER_LIKE' | 'TWITTER_RETWEET'}
              status={(task.completionStatus === 'AUTO_APPROVED' ? 'APPROVED' : task.completionStatus) as 'PENDING' | 'APPROVED' | 'REJECTED' || 'PENDING'}
              reason={task.rejectionReason || undefined}
              pointsAwarded={task.points}
              onRetry={() => {
                if (task.taskUrl) {
                  window.open(task.taskUrl, '_blank', 'noopener,noreferrer');
                }
              }}
            />
          )}

          {/* Additional Information */}
          {task.taskUrl && !isTwitterTask && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Task URL
              </h3>
              <a 
                href={task.taskUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline break-all"
              >
                {task.taskUrl}
              </a>
            </div>
          )}

          {/* Completion Information */}
          {task.lastCompletedAt && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Completed At
              </h3>
              <p className="text-base text-foreground">
                {new Date(task.lastCompletedAt).toLocaleString()}
              </p>
            </div>
          )}

          {/* Missed Information */}
          {task.missedAt && (
            <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-200 uppercase tracking-wide">
                  Task Expired
                </h3>
              </div>
              <p className="text-sm text-red-800 dark:text-red-300">
                This task expired on {new Date(task.missedAt).toLocaleString()} and could not be completed.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
