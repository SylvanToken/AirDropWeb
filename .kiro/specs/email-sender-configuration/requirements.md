# Requirements Document

## Introduction

This feature addresses the email sender address configuration issue where emails are being sent from `sylvantoken@gmail.com` instead of the intended `noreply@sylvantoken.org`. The system currently uses Gmail SMTP for email delivery, which automatically overrides the "from" address with the authenticated account email. This feature will migrate the email system to use a proper SMTP service (Resend) that allows custom sender addresses while maintaining all existing email functionality.

## Glossary

- **Email_System**: The application's email delivery infrastructure responsible for sending transactional emails to users
- **SMTP_Service**: Simple Mail Transfer Protocol service used for sending emails (currently Gmail SMTP)
- **Resend**: A modern email API service that allows custom sender domains and addresses
- **Sender_Address**: The email address that appears in the "From" field of sent emails
- **Authentication_Address**: The email address used to authenticate with the SMTP service
- **Email_Template**: React-based email component that defines the structure and content of emails
- **Transactional_Email**: Automated emails triggered by user actions (welcome, verification, password reset, etc.)

## Requirements

### Requirement 1: Email Service Migration

**User Story:** As a system administrator, I want to migrate from Gmail SMTP to Resend API, so that emails are sent from the correct sender address (noreply@sylvantoken.org)

#### Acceptance Criteria

1. WHEN the Email_System initializes, THE Email_System SHALL use Resend API instead of Gmail SMTP for email delivery
2. WHEN the Email_System sends an email, THE Email_System SHALL set the sender address to "noreply@sylvantoken.org"
3. WHEN the Email_System sends an email, THE Email_System SHALL set the sender name to "Sylvan Token"
4. WHERE Resend API credentials are not configured, THE Email_System SHALL log a warning message and fail gracefully
5. WHEN an email is sent successfully via Resend, THE Email_System SHALL return a success response with the message ID

### Requirement 2: Environment Configuration

**User Story:** As a developer, I want clear environment variable configuration for Resend, so that I can easily set up the email service in different environments

#### Acceptance Criteria

1. THE Email_System SHALL read the Resend API key from the environment variable "RESEND_API_KEY"
2. THE Email_System SHALL read the sender email address from the environment variable "EMAIL_FROM" with a default value of "noreply@sylvantoken.org"
3. THE Email_System SHALL read the sender name from the environment variable "EMAIL_FROM_NAME" with a default value of "Sylvan Token"
4. WHEN required environment variables are missing, THE Email_System SHALL log specific error messages indicating which variables are not configured
5. THE Email_System SHALL include Resend configuration examples in the .env.example file

### Requirement 3: Backward Compatibility

**User Story:** As a developer, I want all existing email functions to work without code changes, so that the migration does not break existing functionality

#### Acceptance Criteria

1. WHEN any existing email function is called, THE Email_System SHALL send the email using the new Resend integration
2. THE Email_System SHALL maintain the same function signatures for sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail, and sendTaskCompletionEmail
3. THE Email_System SHALL preserve all existing rate limiting functionality during email sending
4. THE Email_System SHALL maintain the same error handling behavior as the previous implementation
5. WHEN an email fails to send, THE Email_System SHALL return an error response with the same structure as before

### Requirement 4: Email Template Compatibility

**User Story:** As a developer, I want React Email templates to work with Resend, so that emails maintain their professional appearance and branding

#### Acceptance Criteria

1. WHEN sending an email with a React Email template, THE Email_System SHALL render the template to HTML using the React Email renderer
2. THE Email_System SHALL support all existing Email_Template components (WelcomeEmail, WalletApprovedEmail, etc.)
3. WHEN a template includes locale-specific content, THE Email_System SHALL pass the locale parameter correctly
4. THE Email_System SHALL preserve all template styling and formatting during rendering
5. WHEN template rendering fails, THE Email_System SHALL log the error and return a failure response

### Requirement 5: Testing and Verification

**User Story:** As a developer, I want to test the email configuration, so that I can verify emails are sent from the correct address

#### Acceptance Criteria

1. THE Email_System SHALL provide a test email function that sends a test message to a specified address
2. WHEN a test email is sent, THE Email_System SHALL display the sender address in the console output
3. THE Email_System SHALL include a test script that can be run from the command line
4. WHEN the test script runs successfully, THE Email_System SHALL output confirmation with the message ID
5. WHERE the test fails, THE Email_System SHALL output detailed error information including the failure reason
