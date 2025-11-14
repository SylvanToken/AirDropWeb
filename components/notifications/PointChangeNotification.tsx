'use client';

/**
 * Point Change Notification Component
 * 
 * Shows popup notification for point changes from Telegram reactions
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  pointsChange: number;
  createdAt: string;
}

interface PointChangeNotificationProps {
  notifications: Notification[];
  onDismiss: (notificationId: string) => void;
  onDismissAll: () => void;
}

export function PointChangeNotification({
  notifications,
  onDismiss,
  onDismissAll,
}: PointChangeNotificationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(notifications.length > 0);

  if (notifications.length === 0 || !isOpen) {
    return null;
  }

  const currentNotification = notifications[currentIndex];
  const hasMore = currentIndex < notifications.length - 1;
  const isLast = currentIndex === notifications.length - 1;

  const handleNext = () => {
    if (hasMore) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDismiss = () => {
    onDismiss(currentNotification.id);
    
    if (hasMore) {
      // Show next notification
      handleNext();
    } else {
      // Close dialog
      setIsOpen(false);
    }
  };

  const handleDismissAll = () => {
    onDismissAll();
    setIsOpen(false);
  };

  const getIcon = () => {
    switch (currentNotification.type) {
      case 'points_awarded':
        return <Icons.coins className="h-8 w-8 text-green-500" />;
      case 'points_deducted':
        return <Icons.coins className="h-8 w-8 text-red-500" />;
      case 'manipulation_warning':
        return <Icons.alertTriangle className="h-8 w-8 text-yellow-500" />;
      default:
        return <Icons.bell className="h-8 w-8 text-blue-500" />;
    }
  };

  const getPointsDisplay = () => {
    const points = currentNotification.pointsChange;
    if (points === 0) return null;
    
    const color = points > 0 ? 'text-green-600' : 'text-red-600';
    const sign = points > 0 ? '+' : '';
    
    return (
      <div className={`text-2xl font-bold ${color} text-center my-4`}>
        {sign}{points} points
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            {getIcon()}
          </div>
          <DialogTitle className="text-center">
            {currentNotification.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {currentNotification.message}
          </DialogDescription>
        </DialogHeader>
        
        {getPointsDisplay()}
        
        {notifications.length > 1 && (
          <div className="text-center text-sm text-muted-foreground">
            {currentIndex + 1} of {notifications.length} notifications
          </div>
        )}
        
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <div className="flex gap-2 w-full">
            {hasMore ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleDismissAll}
                  className="flex-1"
                >
                  Dismiss All
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1"
                >
                  Next
                  <Icons.chevronRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={handleDismiss}
                className="w-full"
              >
                {isLast && notifications.length > 1 ? 'Finish' : 'OK'}
              </Button>
            )}
          </div>
          
          {!isLast && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="w-full"
            >
              Skip this notification
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
