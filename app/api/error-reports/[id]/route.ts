import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get single error report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const errorReport = await prisma.errorReport.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            walletAddress: true,
          },
        },
      },
    });

    if (!errorReport) {
      return NextResponse.json(
        { error: "Error report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(errorReport);
  } catch (error) {
    console.error("Error fetching error report:", error);
    return NextResponse.json(
      { error: "Failed to fetch error report" },
      { status: 500 }
    );
  }
}

// PATCH - Update error report (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, priority, assignedTo, resolution } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (resolution) updateData.resolution = resolution;

    // If status is RESOLVED or CLOSED, set resolvedBy and resolvedAt
    if (status === "RESOLVED" || status === "CLOSED") {
      updateData.resolvedBy = session.user.id;
      updateData.resolvedAt = new Date();
    }

    const errorReport = await prisma.errorReport.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(errorReport);
  } catch (error) {
    console.error("Error updating error report:", error);
    return NextResponse.json(
      { error: "Failed to update error report" },
      { status: 500 }
    );
  }
}

// DELETE - Delete error report (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.errorReport.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting error report:", error);
    return NextResponse.json(
      { error: "Failed to delete error report" },
      { status: 500 }
    );
  }
}
