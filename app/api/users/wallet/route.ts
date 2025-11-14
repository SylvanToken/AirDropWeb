import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { walletAddressSchema } from "@/lib/validations";
import { isValidBEP20Address, formatBEP20Address } from "@/lib/wallet-validation";
import { queueWalletPendingEmail } from "@/lib/email/queue";

/**
 * POST /api/users/wallet
 * Add or update user's BEP-20 wallet address
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate wallet address format
    const validation = walletAddressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: validation.error.errors[0]?.message || "Invalid wallet address",
        },
        { status: 400 }
      );
    }

    const { walletAddress } = validation.data;

    // Double-check with custom validation
    if (!isValidBEP20Address(walletAddress)) {
      return NextResponse.json(
        {
          error: "Invalid Address",
          message: "Please provide a valid BEP-20 wallet address",
        },
        { status: 400 }
      );
    }

    // Format address (lowercase for consistency)
    const formattedAddress = formatBEP20Address(walletAddress);

    // First verify user exists and check wallet status
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        walletAddress: true, 
        walletVerified: true,
        email: true,
        username: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "User Not Found",
          message: "Your session is invalid. Please logout and login again.",
        },
        { status: 401 }
      );
    }

    // Check if user already has a verified wallet
    if (currentUser.walletVerified && currentUser.walletAddress) {
      return NextResponse.json(
        {
          error: "Wallet Already Set",
          message: "Your wallet address has already been verified and cannot be changed",
        },
        { status: 400 }
      );
    }

    // Check if wallet address is already used by another user
    const walletInUse = await prisma.user.findFirst({
      where: {
        walletAddress: formattedAddress,
        id: { not: session.user.id },
      },
    });

    if (walletInUse) {
      return NextResponse.json(
        {
          error: "Wallet In Use",
          message: "This wallet address is already registered to another account",
        },
        { status: 409 }
      );
    }

    // Update user's wallet address (not verified yet)
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        walletAddress: formattedAddress,
        walletVerified: false,
      },
      select: {
        id: true,
        email: true,
        username: true,
        walletAddress: true,
        walletVerified: true,
      },
    });

    // Queue wallet pending verification email
    // Get locale from session or use default
    const userLocale = (session.user as any).locale || 'en';
    
    try {
      await queueWalletPendingEmail(
        updatedUser.id,
        updatedUser.email,
        updatedUser.username,
        formattedAddress,
        userLocale
      );
    } catch (emailError) {
      console.error('Failed to queue wallet pending email:', emailError);
      // Don't fail the request if email queueing fails
    }

    return NextResponse.json({
      message: "Wallet address saved. Please confirm to verify.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Wallet update error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to update wallet address",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/wallet
 * Verify and lock user's wallet address
 */
export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    // Get user's current wallet
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletAddress: true, walletVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User Not Found",
          message: "Your session is invalid. Please logout and login again.",
        },
        { status: 401 }
      );
    }

    if (!user.walletAddress) {
      return NextResponse.json(
        {
          error: "No Wallet",
          message: "No wallet address found. Please add a wallet first.",
        },
        { status: 400 }
      );
    }

    if (user.walletVerified) {
      return NextResponse.json(
        {
          error: "Already Verified",
          message: "Your wallet address is already verified",
        },
        { status: 400 }
      );
    }

    // Verify and lock the wallet
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { walletVerified: true },
      select: {
        id: true,
        email: true,
        username: true,
        walletAddress: true,
        walletVerified: true,
      },
    });

    return NextResponse.json({
      message: "Wallet address verified successfully. This address is now permanently linked to your account.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Wallet verification error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to verify wallet address",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/wallet
 * Get user's wallet information
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    // Get user's wallet info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        walletAddress: true,
        walletVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User Not Found",
          message: "Your session is invalid. Please logout and login again.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      walletAddress: user.walletAddress || null,
      walletVerified: user.walletVerified || false,
    });
  } catch (error) {
    console.error("Wallet fetch error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to fetch wallet information",
      },
      { status: 500 }
    );
  }
}
