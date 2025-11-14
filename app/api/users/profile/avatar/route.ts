import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Please upload PNG, JPG, GIF, or WEBP" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `${session.user.id}-${timestamp}.${extension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure avatars directory exists
    const avatarsDir = join(process.cwd(), "public", "avatars");
    if (!existsSync(avatarsDir)) {
      try {
        await mkdir(avatarsDir, { recursive: true });
      } catch (mkdirError) {
        console.error("Failed to create avatars directory:", mkdirError);
        return NextResponse.json(
          { success: false, error: "Failed to save image" },
          { status: 500 }
        );
      }
    }

    // Save file to public/avatars directory
    const filepath = join(avatarsDir, filename);
    try {
      await writeFile(filepath, buffer);
    } catch (writeError) {
      console.error("Failed to write avatar file:", writeError);
      return NextResponse.json(
        { success: false, error: "Failed to save image" },
        { status: 500 }
      );
    }

    // Update user record with avatar URL
    const avatarUrl = `/avatars/${filename}`;
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { avatarUrl },
      });
    } catch (dbError) {
      console.error("Failed to update user profile:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      avatarUrl,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
