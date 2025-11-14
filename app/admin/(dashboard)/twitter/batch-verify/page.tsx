'use client';

/**
 * Admin Batch Verification Tool
 * 
 * Allows admins to verify multiple pending completions at once
 * Requirements: 9.5
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface BatchResult {
  completionId: string;
  result: string;
  reason?: string;
}

export default function BatchVerifyPage() {
  const [completionIds, setCompletionIds] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const { toast } = useToast();

  const handleBatchVerify = async () => {
    const ids = completionIds
      .split('\n')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (ids.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter at least one completion ID',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    setResults([]);

    try {
      const response = await fetch('/api/twitter/verify/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completionIds: ids }),
      });

      if (!response.ok) {
        throw new Error('Batch verification failed');
      }

      const data = await response.json();
      setResults(data.results || []);
      
      toast({
        title: 'Batch Verification Complete',
        description: `Verified ${data.results.length} completions`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform batch verification',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Batch Verification</h1>
        <p className="text-muted-foreground">
          Verify multiple Twitter task completions at once
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Completion IDs</CardTitle>
            <CardDescription>
              Enter completion IDs (one per line)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter completion IDs, one per line..."
              value={completionIds}
              onChange={(e) => setCompletionIds(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <Button
              onClick={handleBatchVerify}
              disabled={isVerifying}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Icons.check className="mr-2 h-4 w-4" />
                  Verify All
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              Verification results will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No results yet
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="font-mono text-sm truncate flex-1">
                      {result.completionId}
                    </span>
                    <Badge
                      variant={
                        result.result === 'APPROVED'
                          ? 'default'
                          : result.result === 'REJECTED'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {result.result}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
