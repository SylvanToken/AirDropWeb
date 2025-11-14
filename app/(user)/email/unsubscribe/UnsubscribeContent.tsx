'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Mail, ArrowLeft } from 'lucide-react';

type UnsubscribeStatus = 'loading' | 'success' | 'error' | 'confirm';

export default function UnsubscribeContent() {
  const t = useTranslations('email');
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<UnsubscribeStatus>('loading');
  const [error, setError] = useState<string>('');
  const [emailType, setEmailType] = useState<string>('');

  const handleUnsubscribe = useCallback(async (token: string) => {
    try {
      setStatus('loading');
      
      const response = await fetch(`/api/email/unsubscribe?token=${token}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('unsubscribe.errors.failed'));
      }

      setEmailType(data.emailType);
      setStatus('success');
    } catch (err) {
      console.error('Unsubscribe error:', err);
      setError(err instanceof Error ? err.message : t('unsubscribe.errors.unknown'));
      setStatus('error');
    }
  }, [t]);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setError(t('unsubscribe.errors.missingToken'));
      return;
    }

    // Auto-unsubscribe with token
    handleUnsubscribe(token);
  }, [searchParams, t, handleUnsubscribe]);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoToSettings = () => {
    router.push('/profile');
  };

  if (status === 'loading') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Loader2 className="h-6 w-6 animate-spin text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>{t('unsubscribe.loading.title')}</CardTitle>
          <CardDescription>{t('unsubscribe.loading.description')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-red-600 dark:text-red-400">
            {t('unsubscribe.error.title')}
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              {t('unsubscribe.error.help')}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('unsubscribe.actions.goHome')}
            </Button>
            <Button
              className="flex-1"
              onClick={handleGoToSettings}
            >
              {t('unsubscribe.actions.goToSettings')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-green-600 dark:text-green-400">
            {t('unsubscribe.success.title')}
          </CardTitle>
          <CardDescription>
            {emailType === 'all'
              ? t('unsubscribe.success.descriptionAll')
              : t('unsubscribe.success.descriptionType', { type: emailType })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              {t('unsubscribe.success.note')}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2 rounded-lg border p-4">
            <p className="text-sm font-medium">{t('unsubscribe.success.whatNext')}</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• {t('unsubscribe.success.step1')}</li>
              <li>• {t('unsubscribe.success.step2')}</li>
              <li>• {t('unsubscribe.success.step3')}</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleGoToDashboard}
            >
              {t('unsubscribe.actions.goToDashboard')}
            </Button>
            <Button
              className="flex-1"
              onClick={handleGoToSettings}
            >
              {t('unsubscribe.actions.managePreferences')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
