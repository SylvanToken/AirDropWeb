import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/users/social
 * Add or update user's social media username (Twitter or Telegram)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, username } = body;

    // Validate type
    if (!type || !["twitter", "telegram"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid Type", message: "Type must be 'twitter' or 'telegram'" },
        { status: 400 }
      );
    }

    // Validate username
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Invalid Username", message: "Username is required" },
        { status: 400 }
      );
    }

    const cleanedUsername = username.trim().replace(/^@/, "");

    if (cleanedUsername.length < 3 || cleanedUsername.length > 30) {
      return NextResponse.json(
        { error: "Invalid Length", message: "Username must be between 3 and 30 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanedUsername)) {
      return NextResponse.json(
        { error: "Invalid Format", message: "Username can only contain letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    // Check if user already has verified social media
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twitterUsername: true,
        twitterVerified: true,
        telegramUsername: true,
        telegramVerified: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Not Found", message: "User not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (type === "twitter" && existingUser.twitterVerified && existingUser.twitterUsername) {
      return NextResponse.json(
        {
          error: "Already Verified",
          message: "Your Twitter username has already been verified and cannot be changed",
        },
        { status: 400 }
      );
    }

    if (type === "telegram" && existingUser.telegramVerified && existingUser.telegramUsername) {
      return NextResponse.json(
        {
          error: "Already Verified",
          message: "Your Telegram username has already been verified and cannot be changed",
        },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const whereClause = type === "twitter"
      ? { twitterUsername: cleanedUsername, id: { not: session.user.id } }
      : { telegramUsername: cleanedUsername, id: { not: session.user.id } };

    const usernameInUse = await prisma.user.findFirst({ where: whereClause });

    if (usernameInUse) {
      return NextResponse.json(
        {
          error: "Username In Use",
          message: `This ${type === "twitter" ? "Twitter" : "Telegram"} username is already registered to another account`,
        },
        { status: 409 }
      );
    }

    // Update and verify username
    const updateData = type === "twitter"
      ? { twitterUsername: cleanedUsername, twitterVerified: true }
      : { telegramUsername: cleanedUsername, telegramVerified: true };

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        twitterUsername: true,
        twitterVerified: true,
        telegramUsername: true,
        telegramVerified: true,
      },
    });

    return NextResponse.json({
      message: `${type === "twitter" ? "Twitter" : "Telegram"} username verified successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Social media update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update social media username" },
      { status: 500 }
    );
  }
}
