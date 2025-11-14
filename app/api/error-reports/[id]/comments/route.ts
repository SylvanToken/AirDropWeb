import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get comments for error report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comments = await prisma.errorReportComment.findMany({
      where: { errorReportId: params.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST - Add comment to error report
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comment, isInternal } = await request.json();

    if (!comment || typeof comment !== "string") {
      return NextResponse.json(
        { error: "Invalid comment" },
        { status: 400 }
      );
    }

    const newComment = await prisma.errorReportComment.create({
      data: {
        errorReportId: params.id,
        userId: session.user.id,
        comment: comment.trim(),
        isInternal: isInternal || false,
      },
    });

    // Update response time if this is the first comment
    const errorReport = await prisma.errorReport.findUnique({
      where: { id: params.id },
      select: { createdAt: true, responseTime: true },
    });

    if (errorReport && !errorReport.responseTime) {
      const responseTime = Math.floor(
        (Date.now() - errorReport.createdAt.getTime()) / 60000
      );
      await prisma.errorReport.update({
        where: { id: params.id },
        data: { responseTime },
      });
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

// PATCH - Update comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId, comment } = await request.json();

    if (!commentId || !comment) {
      return NextResponse.json(
        { error: "Comment ID and text required" },
        { status: 400 }
      );
    }

    const updatedComment = await prisma.errorReportComment.update({
      where: { id: commentId },
      data: { comment: comment.trim() },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

// DELETE - Delete comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID required" },
        { status: 400 }
      );
    }

    await prisma.errorReportComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
