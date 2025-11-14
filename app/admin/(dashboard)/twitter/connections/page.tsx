'use client';

/**
 * Admin Twitter Connections Page
 * 
 * Lists all user Twitter connections with management capabilities
 * Requirements: 11.1, 11.4
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

interface TwitterConnection {
  id: string;
  userId: string;
  username: string;
  twitterUsername: string;
  twitterId: string;
  tokenExpired: boolean;
  connectedAt: string;
  lastUsedAt: string | null;
}

export default function TwitterConnectionsPage() {
  const [connections, setConnections] = useState<TwitterConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/twitter/connections');
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Twitter connections',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (userId: string, username: string) => {
    try {
      const response = await fetch(`/api/admin/twitter/connections/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      toast({
        title: 'Success',
        description: `Disconnected Twitter for ${username}`,
      });

      fetchConnections();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect Twitter account',
        variant: 'destructive',
      });
    }
  };

  const filteredConnections = connections.filter(conn => {
    const matchesSearch = 
      conn.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.twitterUsername.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && !conn.tokenExpired) ||
      (filterStatus === 'expired' && conn.tokenExpired);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Twitter Connections</h1>
        <p className="text-muted-foreground">
          Manage user Twitter OAuth connections
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Management</CardTitle>
          <CardDescription>
            View and manage all user Twitter connections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by username or Twitter handle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'expired' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('expired')}
                size="sm"
              >
                Expired
              </Button>
            </div>
          </div>

          {/* Connections Table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No connections found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Twitter Handle</TableHead>
                  <TableHead>Twitter ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connected</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConnections.map((conn) => (
                  <TableRow key={conn.id}>
                    <TableCell className="font-medium">{conn.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icons.twitter className="h-4 w-4 text-blue-500" />
                        @{conn.twitterUsername}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{conn.twitterId}</TableCell>
                    <TableCell>
                      <Badge variant={conn.tokenExpired ? 'destructive' : 'default'}>
                        {conn.tokenExpired ? 'Expired' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(conn.connectedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {conn.lastUsedAt 
                        ? new Date(conn.lastUsedAt).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Icons.unlink className="h-4 w-4 mr-1" />
                            Disconnect
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect Twitter?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will disconnect Twitter for {conn.username}. 
                              They will need to reconnect to use Twitter tasks.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDisconnect(conn.userId, conn.username)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Disconnect
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
