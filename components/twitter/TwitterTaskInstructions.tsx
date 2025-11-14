'use client';

/**
 * Twitter Task Instructions Component
 * 
 * Shows step-by-step instructions for Twitter tasks
 * Requirements: 7.5, 8.1, 8.2
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { TwitterConnectButton } from './TwitterConnectButton';

interface TwitterTaskInstructionsProps {
  taskType: 'TWITTER_FOLLOW' | 'TWITTER_LIKE' | 'TWITTER_RETWEET';
  taskUrl: string;
  isConnected: boolean;
  onConnect?: () => void;
  onComplete?: () => void;
  className?: string;
}

export function TwitterTaskInstructions({
  taskType,
  taskUrl,
  isConnected,
  onConnect,
  onComplete,
  className,
}: TwitterTaskInstructionsProps) {
  const getTaskDetails = () => {
    switch (taskType) {
      case 'TWITTER_FOLLOW':
        return {
          title: 'Follow on Twitter',
          icon: <Icons.userPlus className="h-5 w-5" />,
          action: 'Follow',
          instructions: [
            'Click the "Follow on Twitter" button below',
            'Follow the specified Twitter account',
            'Return here and click "Verify" to confirm',
          ],
          buttonText: 'Follow on Twitter',
        };
      case 'TWITTER_LIKE':
        return {
          title: 'Like Tweet',
          icon: <Icons.heart className="h-5 w-5" />,
          action: 'Like',
          instructions: [
            'Click the "Like Tweet" button below',
            'Like the specified tweet',
            'Return here and click "Verify" to confirm',
          ],
          buttonText: 'Like Tweet',
        };
      case 'TWITTER_RETWEET':
        return {
          title: 'Retweet',
          icon: <Icons.repeat className="h-5 w-5" />,
          action: 'Retweet',
          instructions: [
            'Click the "Retweet" button below',
            'Retweet or quote tweet the specified tweet',
            'Return here and click "Verify" to confirm',
          ],
          buttonText: 'Retweet',
        };
      default:
        return {
          title: 'Twitter Task',
          icon: <Icons.twitter className="h-5 w-5" />,
          action: 'Complete',
          instructions: ['Complete the Twitter task'],
          buttonText: 'Open Twitter',
        };
    }
  };

  const taskDetails = getTaskDetails();

  const handleOpenTwitter = () => {
    if (taskUrl) {
      window.open(taskUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {taskDetails.icon}
            {taskDetails.title}
          </CardTitle>
          <CardDescription>
            Connect your Twitter account to enable automatic verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-950/20">
            <div className="flex">
              <Icons.info className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Twitter Connection Required
                </h3>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  Connect your Twitter account to enable automatic verification for this task. 
                  This will make the process much faster and easier!
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">How it works:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Connect your Twitter account (one-time setup)</li>
              <li>Complete the Twitter action</li>
              <li>Verification happens automatically</li>
              <li>Earn points instantly!</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <TwitterConnectButton
              onSuccess={onConnect}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleOpenTwitter}
              disabled={!taskUrl}
            >
              <Icons.externalLink className="mr-2 h-4 w-4" />
              Manual Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {taskDetails.icon}
          {taskDetails.title}
        </CardTitle>
        <CardDescription>
          Complete this Twitter task to earn points
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <Icons.check className="mr-1 h-3 w-3" />
            Twitter Connected
          </Badge>
          <span className="text-sm text-muted-foreground">
            Automatic verification enabled
          </span>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            {taskDetails.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>

        <div className="rounded-md bg-green-50 p-3 dark:bg-green-950/20">
          <div className="flex">
            <Icons.zap className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Automatic Verification
              </h3>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                Once you complete the action, we'll automatically verify it and award your points!
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleOpenTwitter}
            disabled={!taskUrl}
            className="flex-1"
          >
            <Icons.twitter className="mr-2 h-4 w-4" />
            {taskDetails.buttonText}
          </Button>
          {onComplete && (
            <Button
              variant="outline"
              onClick={onComplete}
            >
              <Icons.check className="mr-2 h-4 w-4" />
              Verify
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
