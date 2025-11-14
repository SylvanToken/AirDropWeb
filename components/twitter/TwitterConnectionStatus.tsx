'use client';

/**
 * Twitter Connection Status Component
 * 
 * Displays Twitter connection status and allows disconnection
 * Requirements: 1.5, 10.4
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TwitterConnectionStatusProps {
  connected: boolean;
  username?: string;
  twitterId?: string;
  tokenExpired?: boolean;
  onDisconnect?: () => void;
  onReconnect?: () => void;
  className?: string;
}

export function TwitterConnectionStatus({
  connected,
  username,
  twitterId,
  tokenExpired = false,
  onDisconnect,
  onReconnect,
  className,
}: TwitterConnectionStatusProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { toast } = useToast();

  const handleDisconnect = async () => {
    setIsDisconnecting(true);

    try {
      const response = await fetch('/api/auth/twitter/disconnect', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect');
      }

      toast({
        title: 'Disconnected',
        description: 'Your Twitter account has been disconnected.',
      });

      onDisconnect?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Disconnection failed';
      
      console.error('[Twitter Status] Disconnection failed:', error);
      
      toast({
        title: 'Disconnection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (!connected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.twitter className="h-5 w-5" />
            Twitter Connection
          </CardTitle>
          <CardDescription>
            Connect your Twitter account to enable automatic task verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Icons.x className="mr-1 h-3 w-3" />
              Not Connected
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.twitter className="h-5 w-5 text-blue-500" />
          Twitter Connection
        </CardTitle>
        <CardDescription>
          Your Twitter account is connected and ready for automatic verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={tokenExpired ? "destructive" : "default"}>
                <Icons.check className="mr-1 h-3 w-3" />
                {tokenExpired ? 'Token Expired' : 'Connected'}
              </Badge>
            </div>
            {username && (
              <p className="text-sm text-muted-foreground">
                @{username}
              </p>
            )}
            {twitterId && (
              <p className="text-xs text-muted-foreground">
                ID: {twitterId}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            {tokenExpired && (
              <Button
                onClick={onReconnect}
                size="sm"
                variant="outline"
              >
                <Icons.refresh className="mr-2 h-4 w-4" />
                Reconnect
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Icons.unlink className="mr-2 h-4 w-4" />
                      Disconnect
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect Twitter Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove your Twitter connection and disable automatic 
                    verification for Twitter tasks. You can reconnect at any time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDisconnect}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {tokenExpired && (
          <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-950/20">
            <div className="flex">
              <Icons.alertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Token Expired
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  Your Twitter connection has expired. Please reconnect to enable 
                  automatic verification.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
