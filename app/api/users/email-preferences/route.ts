import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const emailPreferencesSchema = z.object({
  taskCompletions: z.boolean(),
  walletVerifications: z.boolean(),
  adminNotifications: z.boolean(),
  marketingEmails: z.boolean(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get or create email preferences
    let preferences = await prisma.emailPreference.findUnique({
      where: { userId: session.user.id },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.emailPreference.create({
        data: {
          userId: session.user.id,
          taskCompletions: true,
          walletVerifications: true,
          adminNotifications: true,
          marketingEmails: false,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching email preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch email preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = emailPreferencesSchema.parse(body);

    // Update or create email preferences
    const preferences = await prisma.emailPreference.upsert({
      where: { userId: session.user.id },
      update: {
        ...validatedData,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        ...validatedData,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating email preferences:", error);
    return NextResponse.json(
      { error: "Failed to update email preferences" },
      { status: 500 }
    );
  }
}
