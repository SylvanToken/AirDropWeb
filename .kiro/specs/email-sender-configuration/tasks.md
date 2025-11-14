# Implementation Plan: Email Sender Configuration

## Overview
This implementation plan converts the email sender configuration design into actionable coding tasks. Each task builds incrementally on previous tasks to migrate from Gmail SMTP to Resend API, ensuring emails are sent from `noreply@sylvantoken.org`.

## Tasks

- [x] 1. Update email client configuration to use environment variables










  - Modify `lib/email/client.ts` to read sender configuration from environment variables
  - Update `emailConfig` to use `EMAIL_FROM`, `EMAIL_FROM_NAME`, and `EMAIL_REPLY_TO` from env
  - Add fallback values for backward compatibility
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Create backward compatibility wrapper in legacy email module






  - [x] 2.1 Update `sendEmail` function in `lib/email.ts` to delegate to modern queue system

    - Import `queueEmail` from `lib/email/queue`
    - Wrap queue call with legacy return format
    - Add deprecation notice in JSDoc comments
    - _Requirements: 3.1, 3.2, 3.4_
  

  - [x] 2.2 Update `sendWelcomeEmail` function to use modern system




    - Import `queueWelcomeEmail` from `lib/email/queue`
    - Maintain existing function signature
    - Preserve rate limiting behavior through modern system
    - Add deprecation notice
    - _Requirements: 3.1, 3.2, 3.3_

  
  - [x] 2.3 Update `sendVerificationEmail` function to use modern system





    - Create verification email template if not exists
    - Delegate to modern queue system
    - Maintain function signature and rate limiting
    - Add deprecation notice

    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 2.4 Update `sendPasswordResetEmail` function to use modern system





    - Create password reset email template if not exists
    - Delegate to modern queue system
    - Maintain function signature and rate limiting

    - Add deprecation notice
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 2.5 Update `sendTaskCompletionEmail` function to use modern system





    - Use existing `queueTaskCompletionEmail` from queue
    - Maintain function signature and rate limiting
    - Add deprecation notice
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Update environment configuration files






  - [x] 3.1 Update `.env.example` with Resend configuration

    - Add `RESEND_API_KEY` with example value
    - Add `EMAIL_FROM` with default value `noreply@sylvantoken.org`
    - Add `EMAIL_FROM_NAME` with default value `Sylvan Token`
    - Add `EMAIL_REPLY_TO` with default value `support@sylvantoken.org`
    - Add comments explaining each variable
    - _Requirements: 2.5_
  
  - [x] 3.2 Add environment variable validation on startup


    - Create validation function in `lib/email/client.ts`
    - Check for required `RESEND_API_KEY`
    - Log warnings for missing optional variables
    - Provide clear error messages
    - _Requirements: 1.4, 2.4_

- [x] 4. Create email sender test script




  - [x] 4.1 Create test script at `scripts/test-email-sender.ts`


    - Import email functions from legacy module
    - Send test email to specified address
    - Display sender address in console output
    - Show success/failure with detailed error info
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 4.2 Add test cases for sender address verification
    - Test welcome email sender address
    - Test verification email sender address
    - Test password reset email sender address
    - Test task completion email sender address
    - Verify sender name and reply-to address
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Update existing email sending code to use correct sender






  - [x] 5.1 Find and update all direct calls to old email functions

    - Search codebase for `sendWelcomeEmail` usage
    - Search for `sendVerificationEmail` usage
    - Search for `sendPasswordResetEmail` usage
    - Search for `sendTaskCompletionEmail` usage
    - Verify all calls work with updated functions
    - _Requirements: 3.1, 3.2_
  

  - [x] 5.2 Verify email templates use correct sender configuration

    - Check React Email templates in `emails/` directory
    - Ensure templates don't override sender address
    - Verify templates use `emailConfig.from` correctly
    - _Requirements: 4.1, 4.2, 4.4_

- [x] 6. Add configuration validation and error handling






  - [x] 6.1 Implement startup configuration check

    - Add check in application initialization
    - Validate `RESEND_API_KEY` is present
    - Log configuration status on startup
    - Provide helpful error messages for missing config
    - _Requirements: 1.4, 2.4_
  

  - [x] 6.2 Add graceful error handling for missing configuration

    - Handle missing API key gracefully
    - Log errors without crashing application
    - Provide clear instructions for configuration
    - _Requirements: 1.4, 3.4_

- [x] 7. Update documentation




  - [x] 7.1 Add migration guide in code comments


    - Document the migration from Gmail SMTP to Resend
    - Explain why functions are deprecated
    - Provide examples of using modern system directly
    - _Requirements: 3.1, 3.2_
  
  - [ ]* 7.2 Create README for email system
    - Document email configuration requirements
    - Explain sender address setup
    - Provide troubleshooting guide
    - Include examples of sending emails
    - _Requirements: 2.5, 5.1, 5.2, 5.3_

- [x] 8. Verify and test complete email flow






  - [x] 8.1 Run test script and verify sender address

    - Execute `scripts/test-email-sender.ts`
    - Check received email for correct sender
    - Verify sender name displays as "Sylvan Token"
    - Confirm reply-to address is correct
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  

  - [x] 8.2 Test all email types with new configuration

    - Send welcome email and verify sender
    - Send verification email and verify sender
    - Send password reset email and verify sender
    - Send task completion email and verify sender
    - Check email logs for correct sender information
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  
  - [ ]* 8.3 Monitor email delivery and logs
    - Check email delivery rates
    - Verify no increase in bounce rates
    - Review email logs for errors
    - Confirm all emails sent successfully
    - _Requirements: 1.5, 3.4, 3.5_

## Notes

- All tasks should maintain backward compatibility with existing code
- Rate limiting behavior should be preserved through the modern system
- Email templates should work without modification
- The legacy Gmail SMTP code will be kept temporarily for rollback capability
- Tasks marked with * are optional and focus on testing/documentation

## Success Criteria

- All emails sent from `noreply@sylvantoken.org`
- Sender name displays as "Sylvan Token"
- Reply-to address is `support@sylvantoken.org`
- All existing email functions work without breaking changes
- Email delivery rate remains above 95%
- No increase in bounce rates
- Email logs show correct sender information
