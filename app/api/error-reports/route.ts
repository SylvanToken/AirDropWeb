import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendErrorReportNotification } from "@/lib/email/error-report-notification";

// POST - Create new error report
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const {
      errorType,
      errorTitle,
      errorMessage,
      stackTrace,
      pageUrl,
      screenshot,
    } = body;

    // Validation
    if (!errorType || !errorTitle || !errorMessage || !pageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user agent
    const userAgent = request.headers.get("user-agent") || undefined;

    // Create error report
    const errorReport = await prisma.errorReport.create({
      data: {
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null,
        errorType,
        errorTitle,
        errorMessage,
        stackTrace: stackTrace || null,
        pageUrl,
        userAgent,
        screenshot: screenshot || null,
        status: "PENDING",
        priority: determinePriority(errorType),
      },
    });

    // Send email notification to admins (async, don't wait)
    if (session?.user) {
      sendErrorReportNotification(errorReport, {
        username: session.user.username,
        email: session.user.email || undefined,
      }).catch((error) => {
        console.error("Failed to send error report notification:", error);
      });
    }

    return NextResponse.json(
      {
        success: true,
        reportId: errorReport.id,
        message: "Error report submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating error report:", error);
    return NextResponse.json(
      { error: "Failed to submit error report" },
      { status: 500 }
    );
  }
}

// GET - Get error reports (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const errorType = searchParams.get("errorType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (errorType) where.errorType = errorType;

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

    return NextResponse.json({
      errorReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching error reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch error reports" },
      { status: 500 }
    );
  }
}

// Helper function to determine priority based on error type
function determinePriority(errorType: string): string {
  switch (errorType) {
    case "PAYMENT_ERROR":
      return "CRITICAL";
    case "API_ERROR":
      return "HIGH";
    case "TASK_ERROR":
      return "MEDIUM";
    case "UI_ERROR":
      return "LOW";
    default:
      return "MEDIUM";
  }
}
