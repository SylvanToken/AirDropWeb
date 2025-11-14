import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import DurationChangeLogTable from '@/components/admin/DurationChangeLogTable';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin.audit');

  return {
    title: `${t('pageTitle')} - Duration Changes`,
  };
}

export default async function DurationChangesPage() {
  const t = await getTranslations('admin.audit');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Duration Change Audit Logs</h1>
        <p className="text-muted-foreground mt-2">
          View and track all modifications to task time limits and durations
        </p>
      </div>

      <DurationChangeLogTable />
    </div>
  );
}
