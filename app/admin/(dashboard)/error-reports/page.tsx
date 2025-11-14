import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ErrorReportsTable } from "@/components/admin/ErrorReportsTable";
import { ErrorReportsAnalytics } from "@/components/admin/ErrorReportsAnalytics";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ErrorReportsPage({
  searchParams,
}: {
  searchParams: { 
    status?: string;
    priority?: string;
    page?: string;
  };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const page = parseInt(searchParams.page || "1");
  const limit = 20;
  const status = searchParams.status;
  const priority = searchParams.priority;

  // Build where clause
  const where: any = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;

  // Get total count
  const total = await prisma.errorReport.count({ where });

  // Get error reports
  const errorReports = await prisma.errorReport.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
        },
      },
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "desc" },
    ],
    skip: (page - 1) * limit,
    take: limit,
  });

  // Get statistics
  const stats = await prisma.errorReport.groupBy({
    by: ['status'],
    _count: true,
  });

  const priorityStats = await prisma.errorReport.groupBy({
    by: ['priority'],
    _count: true,
  });

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Error Reports</h1>
        <p className="text-muted-foreground">
          Monitor and manage user-reported errors
        </p>
      </div>

      {/* Analytics Dashboard */}
      <div className="mb-8">
        <ErrorReportsAnalytics />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground mb-1">Total Reports</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
        
        {stats.map((stat) => (
          <div key={stat.status} className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
            <div className="text-sm text-muted-foreground mb-1">{stat.status}</div>
            <div className="text-2xl font-bold">{stat._count}</div>
          </div>
        ))}
      </div>

      {/* Priority Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {priorityStats.map((stat) => (
          <div 
            key={stat.priority} 
            className={`p-4 rounded-lg border ${
              stat.priority === 'CRITICAL' ? 'bg-red-50 dark:bg-red-950/20 border-red-200' :
              stat.priority === 'HIGH' ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200' :
              stat.priority === 'MEDIUM' ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200' :
              'bg-blue-50 dark:bg-blue-950/20 border-blue-200'
            }`}
          >
            <div className="text-sm font-medium mb-1">{stat.priority} Priority</div>
            <div className="text-2xl font-bold">{stat._count}</div>
          </div>
        ))}
      </div>

      <ErrorReportsTable
        errorReports={errorReports}
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        currentStatus={status}
        currentPriority={priority}
      />
    </div>
  );
}
