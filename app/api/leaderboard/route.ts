// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.user.count({
      where: {
        role: "USER",
        status: "ACTIVE",
      },
    });

    // Get leaderboard with pagination
    const users = await prisma.user.findMany({
      where: {
        role: "USER",
        status: "ACTIVE",
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
        { createdAt: "asc" },
      ],
      skip,
      take: limit,
    });

    const leaderboard = users.map((u, index) => ({
      rank: skip + index + 1,
      id: u.id,
      username: u.username,
      totalPoints: u.totalPoints,
      completionCount: u._count.completions,
    }));

    return NextResponse.json({
      leaderboard,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + users.length < totalCount,
      },
      hasMore: skip + users.length < totalCount,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
