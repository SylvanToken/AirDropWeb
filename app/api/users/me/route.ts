import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Optimize: Get user and completions separately to avoid loading all task data
    const [user, completions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
      }),
      prisma.completion.findMany({
        where: { userId },
        select: {
          id: true,
          taskId: true,
          pointsAwarded: true,
          completedAt: true,
          task: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          completedAt: "desc",
        },
        take: 50, // Limit to last 50 completions for performance
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: "Not Found", message: "User not found" },
        { status: 404 }
      );
    }

    // Calculate streak using only completion dates (no task data needed)
    const streak = calculateStreak(completions);

    // Optimize: Use aggregation for rank calculation
    const rank = await calculateRankOptimized(userId, user.totalPoints);

    // Optimize: Get leaderboard with aggregation
    const leaderboard = await getLeaderboardOptimized();

    // Format completed tasks
    const completedTasks = completions.map((completion) => ({
      id: completion.id,
      taskId: completion.taskId,
      taskTitle: completion.task.title,
      pointsAwarded: completion.pointsAwarded,
      completedAt: completion.completedAt,
    }));

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        totalPoints: user.totalPoints,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
      },
      stats: {
        completionCount: completions.length,
        streak,
        rank,
      },
      completedTasks,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}

// Calculate consecutive day streak
function calculateStreak(completions: any[]): number {
  if (completions.length === 0) return 0;

  // Get unique completion dates (in UTC, date only)
  const completionDates = Array.from(
    new Set(
      completions.map((c) => {
        const date = new Date(c.completedAt);
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())).getTime();
      })
    )
  ).sort((a, b) => b - a); // Sort descending (most recent first)

  let streak = 0;
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Check if there's a completion today or yesterday (to start the streak)
  const mostRecentDate = completionDates[0];
  const daysSinceLastCompletion = Math.floor((todayUTC - mostRecentDate) / oneDayMs);

  if (daysSinceLastCompletion > 1) {
    // Streak is broken if last completion was more than 1 day ago
    return 0;
  }

  // Count consecutive days
  let expectedDate = mostRecentDate;
  for (const date of completionDates) {
    if (date === expectedDate) {
      streak++;
      expectedDate -= oneDayMs;
    } else if (date < expectedDate) {
      // Gap found, break the streak
      break;
    }
  }

  return streak;
}

// Optimized rank calculation using index
async function calculateRankOptimized(userId: string, totalPoints: number): Promise<number> {
  const usersWithMorePoints = await prisma.user.count({
    where: {
      role: "USER",
      status: "ACTIVE", // Only count active users
      totalPoints: {
        gt: totalPoints,
      },
    },
  });

  return usersWithMorePoints + 1;
}

// Optimized leaderboard query with proper aggregation
async function getLeaderboardOptimized() {
  const leaderboard = await prisma.user.findMany({
    where: {
      role: "USER",
      status: "ACTIVE", // Only show active users
    },
    select: {
      id: true,
      username: true,
      totalPoints: true,
      _count: {
        select: {
          completions: true,
        },
      },
    },
    orderBy: [
      { totalPoints: "desc" },
      { createdAt: "asc" }, // Tie-breaker: earlier registration wins
    ],
    take: 10,
  });

  return leaderboard.map((u, index) => ({
    rank: index + 1,
    id: u.id,
    username: u.username,
    totalPoints: u.totalPoints,
    completionCount: u._count.completions,
  }));
}
