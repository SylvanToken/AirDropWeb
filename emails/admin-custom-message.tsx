import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import { EmailHeader } from "./components/EmailHeader";
import { EmailFooter } from "./components/EmailFooter";

interface AdminCustomMessageEmailProps {
  subject: string;
  message: string;
  username?: string;
  userEmail?: string;
}

export default function AdminCustomMessageEmail({
  subject = "Important Update from Sylvan Token",
  message = "Hello! This is a custom message from the Sylvan Token team.",
  username = "User",
  userEmail = "user@example.com",
}: AdminCustomMessageEmailProps) {
  const previewText = subject;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          <Section style={content}>
            <Heading style={h1}>{subject}</Heading>

            {/* Greeting */}
            <Text style={greeting}>
              Hello {username},
            </Text>

            {/* Custom Message */}
            <Section style={messageBox}>
              <Text style={messageText}>
                {message.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < message.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Signature */}
            <Text style={signature}>
              Best regards,<br />
              <strong>Sylvan Token Team</strong>
            </Text>

            {/* Footer Note */}
            <Text style={footerNote}>
              This email was sent to {userEmail}. If you have any questions, please don't hesitate to contact us.
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

const h1 = {
  color: "#1f2937",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "32px 0 24px 0",
  padding: "0",
  lineHeight: "1.3",
};

const greeting = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px 0",
};

const messageBox = {
  backgroundColor: "#f0fdf4",
  border: "2px solid #9cb86e",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "32px",
};

const messageText = {
  color: "#1f2937",
  fontSize: "15px",
  lineHeight: "26px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const signature = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "24px 0",
};

const footerNote = {
  color: "#9ca3af",
  fontSize: "13px",
  lineHeight: "20px",
  marginTop: "32px",
  textAlign: "center" as const,
  fontStyle: "italic" as const,
};
