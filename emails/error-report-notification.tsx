import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
} from "@react-email/components";
import { EmailHeader } from "./components/EmailHeader";
import { EmailFooter } from "./components/EmailFooter";

interface ErrorReportNotificationEmailProps {
  reportId: string;
  errorType: string;
  errorTitle: string;
  errorMessage: string;
  priority: string;
  pageUrl: string;
  userEmail?: string;
  username?: string;
  reportUrl: string;
}

export default function ErrorReportNotificationEmail({
  reportId = "ERR-12345",
  errorType = "UI_ERROR",
  errorTitle = "Button not working",
  errorMessage = "The submit button on the form is not responding to clicks.",
  priority = "MEDIUM",
  pageUrl = "https://sylvantoken.org/dashboard",
  userEmail = "user@example.com",
  username = "John Doe",
  reportUrl = "https://sylvantoken.org/admin/error-reports/ERR-12345",
}: ErrorReportNotificationEmailProps) {
  const previewText = `New ${priority} priority error report: ${errorTitle}`;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "#dc2626";
      case "HIGH":
        return "#ea580c";
      case "MEDIUM":
        return "#ca8a04";
      case "LOW":
        return "#2563eb";
      default:
        return "#6b7280";
    }
  };

  const getErrorTypeLabel = (type: string) => {
    return type.replace("_", " ");
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          <Section style={content}>
            {/* Alert Badge */}
            <div style={{
              ...badge,
              backgroundColor: getPriorityColor(priority),
            }}>
              🚨 {priority} PRIORITY ERROR REPORT
            </div>

            <Heading style={h1}>New Error Report Received</Heading>

            <Text style={text}>
              A new error report has been submitted and requires your attention.
            </Text>

            {/* Error Details Card */}
            <Section style={card}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tr>
                  <td style={labelCell}>Report ID:</td>
                  <td style={valueCell}>{reportId}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Priority:</td>
                  <td style={valueCell}>
                    <span style={{
                      ...priorityBadge,
                      backgroundColor: getPriorityColor(priority),
                    }}>
                      {priority}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={labelCell}>Error Type:</td>
                  <td style={valueCell}>{getErrorTypeLabel(errorType)}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Title:</td>
                  <td style={valueCell}><strong>{errorTitle}</strong></td>
                </tr>
              </table>
            </Section>

            {/* Error Message */}
            <Section style={messageBox}>
              <Text style={messageLabel}>Error Description:</Text>
              <Text style={messageText}>{errorMessage}</Text>
            </Section>

            {/* Context Information */}
            <Section style={contextBox}>
              <Text style={contextLabel}>Context Information:</Text>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tr>
                  <td style={contextItem}>
                    <strong>Page URL:</strong><br />
                    <Link href={pageUrl} style={link}>{pageUrl}</Link>
                  </td>
                </tr>
                {userEmail && (
                  <tr>
                    <td style={contextItem}>
                      <strong>Reported By:</strong><br />
                      {username} ({userEmail})
                    </td>
                  </tr>
                )}
              </table>
            </Section>

            <Hr style={hr} />

            {/* Action Button */}
            <Section style={buttonContainer}>
              <Link href={reportUrl} style={button}>
                View Error Report Details
              </Link>
            </Section>

            <Text style={footer}>
              This is an automated notification. Please review and address this error report as soon as possible.
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const content = {
  padding: "0 48px",
};

const badge = {
  display: "inline-block",
  padding: "8px 16px",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "bold",
  textAlign: "center" as const,
  marginBottom: "24px",
  textTransform: "uppercase" as const,
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "16px 0",
  padding: "0",
};

const text = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "16px 0",
};

const card = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "20px",
  marginTop: "24px",
  marginBottom: "24px",
};

const labelCell = {
  color: "#6b7280",
  fontSize: "13px",
  padding: "8px 12px 8px 0",
  verticalAlign: "top" as const,
  width: "120px",
};

const valueCell = {
  color: "#1f2937",
  fontSize: "14px",
  padding: "8px 0",
  verticalAlign: "top" as const,
};

const priorityBadge = {
  display: "inline-block",
  padding: "4px 12px",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "bold",
};

const messageBox = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "16px",
  marginBottom: "16px",
};

const messageLabel = {
  color: "#991b1b",
  fontSize: "13px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
};

const messageText = {
  color: "#7f1d1d",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const contextBox = {
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "16px",
  marginBottom: "16px",
};

const contextLabel = {
  color: "#1e40af",
  fontSize: "13px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
};

const contextItem = {
  color: "#1e3a8a",
  fontSize: "13px",
  lineHeight: "20px",
  padding: "8px 0",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#dc2626",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "20px",
  marginTop: "32px",
  textAlign: "center" as const,
};
