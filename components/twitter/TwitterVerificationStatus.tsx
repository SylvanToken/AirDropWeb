'use client';

/**
 * Twitter Verification Status Component
 * 
 * Shows verification progress and results for Twitter tasks
 * Requirements: 8.2, 8.3, 8.4
 */

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

type VerificationStatus = 'PENDING' | 'VERIFYING' | 'APPROVED' | 'REJECTED' | 'ERROR';

interface TwitterVerificationStatusProps {
  completionId: string;
  taskType: 'TWITTER_FOLLOW' | 'TWITTER_LIKE' | 'TWITTER_RETWEET';
  status: VerificationStatus;
  reason?: string;
  pointsAwarded?: number;
  onRetry?: () => void;
  className?: string;
}

export function TwitterVerificationStatus({
  completionId,
  taskType,
  status,
  reason,
  pointsAwarded,
  onRetry,
  className,
}: TwitterVerificationStatusProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentReason, setCurrentReason] = useState(reason);
  const { toast } = useToast();

  // Auto-refresh verification status for pending/verifying tasks
  useEffect(() => {
    if (currentStatus === 'PENDING' || currentStatus === 'VERIFYING') {
      const interval = setInterval(async () => {
        try {
          // Check completion status
          const response = await fetch(`/api/completions/${completionId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.completion.status !== currentStatus) {
              setCurrentStatus(data.completion.status);
              setCurrentReason(data.completion.rejectionReason);
              
              if (data.completion.status === 'APPROVED') {
                toast({
                  title: 'Task Verified!',
                  description: `Your ${getTaskTypeLabel(taskType)} task has been approved.`,
                });
              }
            }
          }
        } catch (error) {
          console.error('Failed to check verification status:', error);
        }
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    }
  }, [completionId, currentStatus, taskType, toast]);

  const handleManualVerify = async () => {
    setIsVerifying(true);
    setCurrentStatus('VERIFYING');

    try {
      const response = await fetch('/api/twitter/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      const data = await response.json();
      
      setCurrentStatus(data.result);
      setCurrentReason(data.reason);

      if (data.verified) {
        toast({
          title: 'Task Verified!',
          description: data.reason || 'Your task has been approved.',
        });
      } else {
        toast({
          title: 'Verification Failed',
          description: data.reason || 'Please complete the task and try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      
      setCurrentStatus('ERROR');
      setCurrentReason(errorMessage);
      
      toast({
        title: 'Verification Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'TWITTER_FOLLOW':
        return 'follow';
      case 'TWITTER_LIKE':
        return 'like';
      case 'TWITTER_RETWEET':
        return 'retweet';
      default:
        return 'Twitter';
    }
  };

  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'PENDING':
        return (
          <Badge variant="secondary">
            <Icons.clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'VERIFYING':
        return (
          <Badge variant="secondary">
            <Icons.spinner className="mr-1 h-3 w-3 animate-spin" />
            Verifying...
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <Icons.check className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive">
            <Icons.x className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      case 'ERROR':
        return (
          <Badge variant="destructive">
            <Icons.alertTriangle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            Unknown
          </Badge>
        );
    }
  };

  const getStatusMessage = () => {
    if (currentReason) {
      return currentReason;
    }

    switch (currentStatus) {
      case 'PENDING':
        return 'Waiting for verification...';
      case 'VERIFYING':
        return 'Checking your Twitter activity...';
      case 'APPROVED':
        return `Great! Your ${getTaskTypeLabel(taskType)} task has been verified.`;
      case 'REJECTED':
        return `Please complete the ${getTaskTypeLabel(taskType)} action and try again.`;
      case 'ERROR':
        return 'Verification failed. Please try again or contact support.';
      default:
        return 'Unknown status';
    }
  };

  const canRetry = currentStatus === 'REJECTED' || currentStatus === 'ERROR';
  const showPoints = currentStatus === 'APPROVED' && pointsAwarded;

  return (
    <Card className={className}>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icons.twitter className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">
                Twitter {getTaskTypeLabel(taskType).charAt(0).toUpperCase() + getTaskTypeLabel(taskType).slice(1)} Verification
              </span>
            </div>
            {getStatusBadge()}
          </div>

          <p className="text-sm text-muted-foreground">
            {getStatusMessage()}
          </p>

          {showPoints && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Icons.coins className="h-4 w-4" />
              <span>+{pointsAwarded} points earned!</span>
            </div>
          )}

          {canRetry && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleManualVerify}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Icons.refresh className="mr-2 h-4 w-4" />
                    Retry Verification
                  </>
                )}
              </Button>
              {onRetry && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onRetry}
                >
                  <Icons.externalLink className="mr-2 h-4 w-4" />
                  Complete Task
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
