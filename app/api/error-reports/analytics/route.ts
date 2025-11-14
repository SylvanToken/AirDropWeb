import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total counts
    const total = await prisma.errorReport.count();
    const pending = await prisma.errorReport.count({ where: { status: "PENDING" } });
    const resolved = await prisma.errorReport.count({ where: { status: "RESOLVED" } });

    // By priority
    const byPriority = await prisma.errorReport.groupBy({
      by: ["priority"],
      _count: true,
      where: { createdAt: { gte: startDate } },
    });

    // By type
    const byType = await prisma.errorReport.groupBy({
      by: ["errorType"],
      _count: true,
      where: { createdAt: { gte: startDate } },
    });

    // By status
    const byStatus = await prisma.errorReport.groupBy({
      by: ["status"],
      _count: true,
    });

    // Average response time
    const avgResponseTime = await prisma.errorReport.aggregate({
      _avg: { responseTime: true },
      where: { responseTime: { not: null } },
    });

    // Average resolution time
    const avgResolutionTime = await prisma.errorReport.aggregate({
      _avg: { resolutionTime: true },
      where: { resolutionTime: { not: null } },
    });

    // Trend data (last 7 days)
    const trendData = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const count = await prisma.errorReport.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        });

        return {
          date: date.toISOString().split("T")[0],
          count,
        };
      })
    );

    // Most common tags
    const topTags = await prisma.errorReportTag.groupBy({
      by: ["tag"],
      _count: true,
      orderBy: { _count: { tag: "desc" } },
      take: 10,
    });

    return NextResponse.json({
      summary: {
        total,
        pending,
        resolved,
        avgResponseTime: avgResponseTime._avg.responseTime || 0,
        avgResolutionTime: avgResolutionTime._avg.resolutionTime || 0,
      },
      byPriority,
      byType,
      byStatus,
      trendData: trendData.reverse(),
      topTags,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
