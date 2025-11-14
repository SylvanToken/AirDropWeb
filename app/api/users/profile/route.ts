import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/users/profile
 * Get current user's profile information
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        walletAddress: true,
        walletVerified: true,
        twitterUsername: true,
        twitterVerified: true,
        telegramUsername: true,
        telegramVerified: true,
        referralCode: true,
        totalPoints: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Not Found", message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
