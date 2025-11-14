import { render } from "@react-email/render";
import ErrorReportNotificationEmail from "@/emails/error-report-notification";
import { sendEmail } from "./client";

interface ErrorReport {
  id: string;
  errorType: string;
  errorTitle: string;
  errorMessage: string;
  priority: string;
  pageUrl: string;
  userEmail?: string | null;
}

interface User {
  email?: string;
  username?: string;
}

/**
 * Send error report notification to admins
 */
export async function sendErrorReportNotification(
  errorReport: ErrorReport,
  user?: User | null
) {
  try {
    // Get admin emails from environment variable
    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((email) =>
      email.trim()
    ) || [];

    if (adminEmails.length === 0) {
      console.warn("No admin emails configured for error report notifications");
      return;
    }

    // Generate report URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3005";
    const reportUrl = `${baseUrl}/admin/error-reports?id=${errorReport.id}`;

    // Render email HTML
    const emailHtml = await render(
      ErrorReportNotificationEmail({
        reportId: errorReport.id,
        errorType: errorReport.errorType,
        errorTitle: errorReport.errorTitle,
        errorMessage: errorReport.errorMessage,
        priority: errorReport.priority,
        pageUrl: errorReport.pageUrl,
        userEmail: user?.email || errorReport.userEmail || undefined,
        username: user?.username || "Anonymous",
        reportUrl,
      })
    );

    // Determine subject based on priority
    let subject = `[${errorReport.priority}] New Error Report: ${errorReport.errorTitle}`;
    if (errorReport.priority === "CRITICAL") {
      subject = `🚨 ${subject}`;
    }

    // Send email to all admins
    const emailPromises = adminEmails.map((adminEmail) =>
      sendEmail({
        to: adminEmail,
        subject,
        html: emailHtml,
        template: "error-report-notification",
      })
    );

    await Promise.all(emailPromises);

    console.log(
      `Error report notification sent to ${adminEmails.length} admin(s)`
    );
  } catch (error) {
    console.error("Failed to send error report notification:", error);
    throw error;
  }
}

/**
 * Send daily digest of pending error reports
 */
export async function sendErrorReportDigest() {
  try {
    const { prisma } = await import("@/lib/prisma");

    // Get pending error reports from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const pendingReports = await prisma.errorReport.findMany({
      where: {
        status: "PENDING",
        createdAt: {
          gte: yesterday,
        },
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
      take: 20, // Limit to 20 most recent
    });

    if (pendingReports.length === 0) {
      console.log("No pending error reports for daily digest");
      return;
    }

    // Get admin emails
    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((email) =>
      email.trim()
    ) || [];

    if (adminEmails.length === 0) {
      console.warn("No admin emails configured for error report digest");
      return;
    }

    // TODO: Create digest email template
    // For now, just log
    console.log(
      `Would send digest of ${pendingReports.length} pending error reports to ${adminEmails.length} admin(s)`
    );
  } catch (error) {
    console.error("Failed to send error report digest:", error);
    throw error;
  }
}
