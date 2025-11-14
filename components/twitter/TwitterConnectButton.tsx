'use client';

/**
 * Twitter Connect Button Component
 * 
 * Handles Twitter OAuth connection flow
 * Requirements: 1.1, 8.1
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';

interface TwitterConnectButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export function TwitterConnectButton({
  onSuccess,
  onError,
  className,
  disabled = false,
}: TwitterConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (isConnecting || disabled) return;

    setIsConnecting(true);

    try {
      // Get authorization URL from our API
      const response = await fetch('/api/auth/twitter/authorize', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get authorization URL');
      }

      const { authorizationUrl } = await response.json();

      // Redirect to Twitter authorization
      window.location.href = authorizationUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      
      console.error('[Twitter Connect] Connection failed:', error);
      
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      onError?.(errorMessage);
      setIsConnecting(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting || disabled}
      className={className}
      variant="outline"
    >
      {isConnecting ? (
        <>
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Icons.twitter className="mr-2 h-4 w-4" />
          Connect Twitter
        </>
      )}
    </Button>
  );
}
