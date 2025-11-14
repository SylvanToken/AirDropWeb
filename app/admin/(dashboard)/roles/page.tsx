import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Shield, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import RoleList from '@/components/admin/RoleList';

export const metadata = {
  title: 'Role Management - Admin',
  description: 'Manage roles and permissions',
};

export default async function RolesPage() {
  const t = await getTranslations('admin.roles');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.totalRoles')}
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-8 w-16" />}>
              <RoleCount />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.assignedUsers')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-8 w-16" />}>
              <AssignedUsersCount />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Role List */}
      <Suspense fallback={<RoleListSkeleton />}>
        <RoleList />
      </Suspense>
    </div>
  );
}

async function RoleCount() {
  const { getRoles } = await import('@/lib/admin/permissions');
  const roles = await getRoles();
  return <div className="text-2xl font-bold">{roles.length}</div>;
}

async function AssignedUsersCount() {
  const { prisma } = await import('@/lib/prisma');
  const count = await prisma.user.count({
    where: { roleId: { not: null } },
  });
  return <div className="text-2xl font-bold">{count}</div>;
}

function RoleListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
