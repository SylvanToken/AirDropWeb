"use client";

import { TaskWithCompletion } from "@/types";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, AlertTriangle, XCircle, Shield, CheckCircle, Twitter, MessageCircle, Heart, Repeat, Sparkles, Loader2, Users, Copy, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { TaskTimer } from "./TaskTimer";
import { TaskTimerDisplay } from "./TaskTimerDisplay";
import { CountdownTimer } from "./CountdownTimer";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskCardProps {
  task: TaskWithCompletion;
  onComplete: (taskId: string, completionTime?: number) => Promise<void>;
  onExpire?: (taskId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const taskTypeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; borderColor: string }> = {
  TWITTER_FOLLOW: {
    icon: Twitter,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  TWITTER_LIKE: {
    icon: Heart,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    borderColor: "border-pink-200 dark:border-pink-800",
  },
  TWITTER_RETWEET: {
    icon: Repeat,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
  },
  TELEGRAM_JOIN: {
    icon: MessageCircle,
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    borderColor: "border-sky-200 dark:border-sky-800",
  },
  REFERRAL: {
    icon: Users,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-200 dark:border-violet-800",
  },
  CUSTOM: {
    icon: Sparkles,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
};

export function TaskCard({ task, onComplete, onExpire, isLoading = false, disabled = false }: TaskCardProps) {
  const t = useTranslations("tasks");
  const [isExpired, setIsExpired] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Fetch user's referral code if this is a REFERRAL task
  useEffect(() => {
    if (task.taskType === 'REFERRAL' && task.completedToday && task.completionStatus === 'PENDING') {
      fetch('/api/user/referral-code')
        .then(res => res.json())
        .then(data => {
          if (data.referralCode) {
            setReferralCode(data.referralCode);
          }
        })
        .catch(err => console.error('Failed to fetch referral code:', err));
    }
  }, [task.taskType, task.completedToday, task.completionStatus]);

  const handleComplete = async (taskId: string, completionTime?: number) => {
    if (task.completedToday || isLoading || disabled || isExpired) return;
    await onComplete(taskId, completionTime);
  };

  const handleTimerExpire = () => {
    setIsExpired(true);
    if (onExpire) {
      onExpire(task.id);
    }
  };

  const copyReferralCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const copyReferralLink = async () => {
    if (!referralCode) return;
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Check if task has a scheduled deadline
  const hasScheduledDeadline = task.scheduledDeadline && new Date(task.scheduledDeadline) > new Date();
  const isTimeSensitive = task.isTimeSensitive || hasScheduledDeadline;
  
  // Check if task is time-limited (has expiresAt)
  const isTimeLimited = task.expiresAt && new Date(task.expiresAt) > new Date();
  const hasExpired = task.expiresAt && new Date(task.expiresAt) <= new Date();

  const getStatusBadge = () => {
    if (!task.completedToday) return null;
    
    switch (task.completionStatus) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            {task.needsReview ? t('underReview') : t('pendingApproval')}
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('approved')}
          </Badge>
        );
      case 'AUTO_APPROVED':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Shield className="w-3 h-3 mr-1" />
            {t('autoApproved')}
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <XCircle className="w-3 h-3 mr-1" />
            {t('rejected')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Check className="w-3 h-3 mr-1" />
            {t("taskCard.completed")}
          </Badge>
        );
    }
  };

  const typeConfig = taskTypeConfig[task.taskType] || taskTypeConfig.CUSTOM;
  const TypeIcon = typeConfig.icon;

  return (
    <Card 
      className={`
        h-full flex flex-col 
        transition-all duration-300 ease-out
        ${!(isExpired || hasExpired) && 'hover:-translate-y-2 hover:shadow-2xl'}
        ${task.completedToday 
          ? 'bg-gradient-to-br from-emerald-50/90 to-teal-50/90 dark:from-emerald-950/50 dark:to-teal-950/50 border-emerald-300 dark:border-emerald-700 animate-task-complete' 
          : (isExpired || hasExpired)
          ? 'bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-950/30 dark:to-rose-950/30 border-red-300 dark:border-red-700 opacity-60 cursor-not-allowed'
          : 'bg-gradient-to-br from-white/90 to-emerald-50/40 dark:from-slate-900/90 dark:to-emerald-950/40 border-eco hover:border-eco-leaf dark:hover:border-eco-leaf focus-within:ring-2 focus-within:ring-eco-leaf focus-within:ring-offset-2'
        }
        backdrop-blur-sm
      `}
      role="article"
      aria-label={`Task: ${task.title}`}
      aria-describedby={`task-desc-${task.id}`}
      onClick={(e) => {
        // Prevent any click events on expired tasks
        if (isExpired || hasExpired) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${typeConfig.bgColor} ${typeConfig.borderColor} border`}>
                <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
              </div>
              <span className={`text-xs font-medium ${typeConfig.color}`}>
                {t(`taskTypes.${task.taskType}`)}
              </span>
            </div>
            <CardTitle className="text-lg sm:text-xl mb-2 break-words text-gradient-eco">
              {task.title}
            </CardTitle>
            <CardDescription 
              id={`task-desc-${task.id}`}
              className="text-slate-600 dark:text-slate-300"
            >
              {task.description}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge 
              variant="secondary" 
              className={`
                shrink-0 text-white border-0 shadow-lg px-3 py-1 text-sm font-bold
                ${task.points <= 25 
                  ? 'bg-gradient-to-br from-slate-500 to-slate-600 shadow-slate-500/30' 
                  : task.points <= 60 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30' 
                  : task.points <= 150 
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30' 
                  : 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30'
                }
              `}
              aria-label={`${task.points} points reward`}
            >
              <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
              {task.points}
            </Badge>
            {getStatusBadge()}
          </div>
        </div>
        
        {/* Countdown Timer for Time-Limited Tasks - positioned in top-right corner */}
        {!task.completedToday && isTimeLimited && (
          <div className="absolute top-2 right-2">
            <CountdownTimer 
              expiresAt={new Date(task.expiresAt!)}
              onExpire={handleTimerExpire}
              className="bg-white/90 dark:bg-slate-800/90 px-2 py-1 rounded-md shadow-md border border-slate-200 dark:border-slate-700"
            />
          </div>
        )}
        
        {/* Expired Badge for Time-Limited Tasks */}
        {!task.completedToday && (isExpired || hasExpired) && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive" className="bg-red-500 text-white shadow-md">
              <XCircle className="w-3 h-3 mr-1" />
              Expired
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardFooter className="flex flex-col gap-3 mt-auto">
        {/* Scheduled Deadline Timer */}
        {!task.completedToday && hasScheduledDeadline && (
          <TaskTimerDisplay
            taskId={task.id}
            deadline={new Date(task.scheduledDeadline!)}
            onExpire={handleTimerExpire}
            variant="full"
          />
        )}

        {/* Expired Task Warning */}
        {!task.completedToday && isExpired && (
          <div className="w-full p-3 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg border-2 border-red-300 dark:border-red-700 shadow-sm">
            <div className="flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-red-900 dark:text-red-200">
                  {t('taskExpired')}
                </p>
                <p className="text-red-800 dark:text-red-300 mt-1">
                  {t('taskExpiredMessage')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Referral Code Display for Pending Referral Tasks */}
        {task.taskType === 'REFERRAL' && task.completedToday && task.completionStatus === 'PENDING' && referralCode && (
          <div className="w-full p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg border-2 border-violet-300 dark:border-violet-700 shadow-sm">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="font-semibold text-violet-900 dark:text-violet-200 mb-1">
                    {t('referral.pendingReferral')}
                  </p>
                  <p className="text-sm text-violet-800 dark:text-violet-300">
                    {t('referral.waitingForRegistration')}
                  </p>
                </div>
                
                {/* Referral Code Display */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
                    {t('referral.yourCode')}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-white dark:bg-slate-800 rounded-lg border-2 border-violet-200 dark:border-violet-700">
                      <p className="text-lg font-bold font-mono text-violet-900 dark:text-violet-100 text-center tracking-wider">
                        {referralCode}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={copyReferralCode}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                      aria-label={t('referral.copyCode')}
                    >
                      <Copy className="w-4 h-4" />
                      {codeCopied ? t('referral.codeCopied') : t('referral.copyCode')}
                    </button>
                    <button
                      onClick={copyReferralLink}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                      aria-label={t('referral.copyLink')}
                    >
                      <Share2 className="w-4 h-4" />
                      {linkCopied ? t('referral.linkCopied') : t('referral.copyLink')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Info */}
        {task.completedToday && task.completionStatus === 'PENDING' && task.taskType !== 'REFERRAL' && (
          <div className="w-full p-3 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border-2 border-yellow-300 dark:border-yellow-700 shadow-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-900 dark:text-yellow-200">
                  {task.needsReview ? t('taskUnderReview') : t('verificationPending')}
                </p>
                <p className="text-yellow-800 dark:text-yellow-300 mt-1">
                  {task.needsReview 
                    ? t('manualReviewMessage')
                    : task.estimatedApprovalTime 
                    ? t('autoApprovalMessage', { time: new Date(task.estimatedApprovalTime).toLocaleString() })
                    : t('verificationMessage')
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        
        {task.completedToday && task.completionStatus === 'REJECTED' && (
          <div className="w-full p-3 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg border-2 border-red-300 dark:border-red-700 shadow-sm">
            <div className="flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-red-900 dark:text-red-200">
                  {t('taskRejected')}
                </p>
                <p className="text-red-800 dark:text-red-300 mt-1">
                  {t('rejectionMessage')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {task.completedToday ? (
          <div 
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white shadow-lg shadow-emerald-500/30 animate-in fade-in-50 slide-in-from-bottom-2 duration-500"
            role="status"
            aria-label={t("taskCard.completed")}
          >
            <CheckCircle className="w-5 h-5" aria-hidden="true" />
            <span className="font-semibold">{t("taskCard.completed")}</span>
          </div>
        ) : disabled ? (
          <div 
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg text-yellow-800 dark:text-yellow-200"
            role="status"
            aria-label={t("taskCard.walletRequired")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm font-medium">{t("taskCard.walletRequired")}</span>
          </div>
        ) : (isExpired || hasExpired) ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300 cursor-not-allowed border-2 border-red-300 dark:border-red-700"
                  role="status"
                  aria-label="Task expired"
                >
                  <XCircle className="w-5 h-5" aria-hidden="true" />
                  <span className="font-semibold">Expired</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>This task has expired and can no longer be completed</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          // All tasks use timer
          <TaskTimer
            taskId={task.id}
            taskUrl={task.taskUrl || ''}
            taskTitle={task.title}
            onComplete={handleComplete}
            isCompleting={isLoading}
          />
        )}
      </CardFooter>
    </Card>
  );
}
