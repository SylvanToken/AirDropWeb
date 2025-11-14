import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AuditLogTable from '@/components/admin/AuditLogTable';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin.audit');
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default async function AuditLogPage() {
  const t = await getTranslations('admin.audit');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('heading')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('subheading')}
        </p>
      </div>

      <AuditLogTable />
    </div>
  );
}
