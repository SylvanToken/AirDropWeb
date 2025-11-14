import { Metadata } from 'next';
import { VerificationDashboard } from '@/components/admin/VerificationDashboard';

export const metadata: Metadata = {
  title: 'Task Verifications - Admin Panel',
  description: 'Review and verify user task completions',
};

export default function VerificationsPage() {
  return <VerificationDashboard />;
}
