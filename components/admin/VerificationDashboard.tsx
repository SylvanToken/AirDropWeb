"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ExternalLink,
  User,
  Calendar,
  Shield,
  Eye
} from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api-client';

interface Completion {
  id: string;
  completedAt: string;
  status: string;
  verificationStatus: string;
  needsReview: boolean;
  fraudScore: number;
  completionTime?: number;
  ipAddress?: string;
  rejectionReason?: string;
  fraudRisk: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    color: string;
    description: string;
  };
  user: {
    id: string;
    username: string;
    email: string;
    createdAt: string;
    walletVerified: boolean;
    twitterVerified: boolean;
    telegramVerified: boolean;
    totalPoints: number;
  };
  task: {
    id: string;
    title: string;
    description: string;
    points: number;
    taskType: string;
    taskUrl?: string;
  };
}

interface VerificationResponse {
  completions: Completion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function VerificationDashboard() {
  const t = useTranslations();
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const fetchCompletions = async (status = 'PENDING', page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status,
        page: page.toString(),
        limit: '20'
      });
      
      if (status === 'review') {
        params.set('needsReview', 'true');
        params.set('status', 'ALL');
      }
      
      const response = await apiGet<VerificationResponse>(`/api/admin/verifications?${params}`);
      setCompletions(response.completions || []);
      setPagination(response.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch (error) {
      console.error('Failed to fetch completions:', error);
      setCompletions([]);
      setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletions(activeTab.toUpperCase());
  }, [activeTab]);

  const handleVerification = async (completionId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      setProcessing(completionId);
      await apiPost('/api/admin/verifications', {
        completionId,
        action,
        reason
      });
      
      // Refresh the list
      await fetchCompletions(activeTab.toUpperCase(), pagination.page);
    } catch (error) {
      console.error('Failed to process verification:', error);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (completion: Completion) => {
    switch (completion.status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'AUTO_APPROVED':
        return <Badge variant="outline" className="text-blue-600"><Shield className="w-3 h-3 mr-1" />Auto-Approved</Badge>;
      default:
        return <Badge variant="outline">{completion.status}</Badge>;
    }
  };

  const getFraudScoreBadge = (score: number, risk: Completion['fraudRisk']) => {
    return (
      <Badge 
        variant="outline" 
        className={`${risk.color} border-current`}
      >
        <AlertTriangle className="w-3 h-3 mr-1" />
        {score}/100 ({risk.level})
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const CompletionCard = ({ completion }: { completion: Completion }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{completion.task.title}</CardTitle>
            <CardDescription className="mt-1">
              {completion.task.description}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {getStatusBadge(completion)}
            {getFraudScoreBadge(completion.fraudScore, completion.fraudRisk)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* User Info */}
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              User Information
            </h4>
            <div className="text-sm space-y-1">
              <p><strong>Username:</strong> {completion.user.username}</p>
              <p><strong>Email:</strong> {completion.user.email}</p>
              <p><strong>Total Points:</strong> {completion.user.totalPoints}</p>
              <p><strong>Account Age:</strong> {formatDate(completion.user.createdAt)}</p>
              <div className="flex gap-2 mt-2">
                {completion.user.walletVerified && <Badge variant="outline" className="text-green-600">Wallet ✓</Badge>}
                {completion.user.twitterVerified && <Badge variant="outline" className="text-blue-600">Twitter ✓</Badge>}
                {completion.user.telegramVerified && <Badge variant="outline" className="text-cyan-600">Telegram ✓</Badge>}
              </div>
            </div>
          </div>
          
          {/* Task Info */}
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Task Information
            </h4>
            <div className="text-sm space-y-1">
              <p><strong>Type:</strong> {completion.task.taskType}</p>
              <p><strong>Points:</strong> {completion.task.points}</p>
              <p><strong>Completed:</strong> {formatDate(completion.completedAt)}</p>
              {completion.completionTime && (
                <p><strong>Completion Time:</strong> {completion.completionTime}s</p>
              )}
              {completion.ipAddress && (
                <p><strong>IP Address:</strong> {completion.ipAddress}</p>
              )}
              {completion.task.taskUrl && (
                <a 
                  href={completion.task.taskUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Task
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Fraud Analysis */}
        {completion.fraudScore > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Fraud Analysis
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {completion.fraudRisk.description}
            </p>
          </div>
        )}
        
        {/* Rejection Reason */}
        {completion.rejectionReason && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
              Rejection Reason
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              {completion.rejectionReason}
            </p>
          </div>
        )}
        
        {/* Actions */}
        {completion.status === 'PENDING' && (
          <div className="flex gap-2 pt-3 border-t">
            <Button
              onClick={() => handleVerification(completion.id, 'approve')}
              disabled={processing === completion.id}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              onClick={() => {
                const reason = prompt('Rejection reason (optional):');
                handleVerification(completion.id, 'reject', reason || undefined);
              }}
              disabled={processing === completion.id}
              variant="destructive"
              size="sm"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Task Verification Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Review and verify user task completions
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({pagination?.total ?? 0})</TabsTrigger>
          <TabsTrigger value="review">Needs Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">{t("admin.verifications.loading")}</p>
            </div>
          ) : !completions || completions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No completions found</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {completions.map((completion) => (
                <CompletionCard key={completion.id} completion={completion} />
              ))}
              
              {/* Pagination */}
              {(pagination?.pages ?? 0) > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => fetchCompletions(activeTab.toUpperCase(), (pagination?.page ?? 1) - 1)}
                    disabled={(pagination?.page ?? 1) === 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {pagination?.page ?? 1} of {pagination?.pages ?? 1}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => fetchCompletions(activeTab.toUpperCase(), (pagination?.page ?? 1) + 1)}
                    disabled={(pagination?.page ?? 1) === (pagination?.pages ?? 1) || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
