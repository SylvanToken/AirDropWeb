# Twitter Task Automation - Implementation Plan

## Overview

This implementation plan breaks down the Twitter OAuth and automatic verification system into discrete, manageable coding tasks. Each task builds incrementally on previous work.

---

## Task List

- [x] 1. Database schema and migrations



  - Create TwitterConnection, TwitterVerificationLog models
  - Add necessary indexes for performance
  - Create and apply Prisma migrations
  - _Requirements: All requirements (foundation)_



- [ ] 1.1 Create TwitterConnection model
  - Define model in schema.prisma with all fields
  - Add encrypted token fields (accessToken, refreshToken)
  - Add user relation and indexes

  - _Requirements: 1.3, 1.4, 5.1, 5.2_

- [ ] 1.2 Create TwitterVerificationLog model
  - Define model for audit logging
  - Add completion, user, task relations


  - Add performance metric fields
  - _Requirements: 11.1, 11.2, 11.3_




- [ ] 1.3 Generate and apply database migration
  - Run `prisma migrate dev` to create migration
  - Verify migration SQL is correct
  - Test migration on development database


  - _Requirements: All requirements (foundation)_

- [ ] 2. Token encryption and security utilities
  - Implement AES-256-GCM encryption for tokens
  - Create token manager service

  - Add secure key management
  - _Requirements: 5.1, 5.2, 10.1, 10.2_

- [x] 2.1 Implement token encryption service



  - Create `lib/twitter/token-manager.ts`
  - Implement `encryptToken()` with AES-256-GCM
  - Implement `decryptToken()` with error handling
  - Add unit tests for encryption/decryption



  - _Requirements: 5.1, 5.2, 10.2_

- [ ] 2.2 Implement token storage and retrieval
  - Create `storeTokens()` method with database operations

  - Create `getTokens()` method with decryption
  - Implement `isTokenExpired()` check
  - Add error handling for database failures
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 3. Twitter API client implementation

  - Create Twitter API v2 client wrapper
  - Implement follow, like, retweet checks
  - Add rate limiting and retry logic
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 6.1, 6.2_

- [x] 3.1 Create Twitter API client base

  - Create `lib/twitter/api-client.ts`
  - Initialize twitter-api-v2 client
  - Implement connection pooling
  - Add request/response logging
  - _Requirements: 9.3, 11.3_


- [ ] 3.2 Implement follow verification
  - Create `checkFollowing()` method
  - Call Twitter API `/2/users/:id/following`
  - Parse and validate response
  - Handle pagination if needed

  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3.3 Implement like verification
  - Create `checkLiked()` method
  - Call Twitter API `/2/users/:id/liked_tweets`



  - Extract tweet ID from URL
  - Check if tweet ID exists in liked tweets
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3.4 Implement retweet verification

  - Create `checkRetweeted()` method
  - Call Twitter API `/2/tweets/:id/retweeted_by`
  - Check if user ID exists in retweeters
  - Handle quote tweets as valid retweets
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


- [ ] 3.5 Implement user lookup utilities
  - Create `getUserInfo()` for authenticated user
  - Create `lookupUser()` for username to ID conversion
  - Cache lookup results for performance
  - _Requirements: 1.5, 9.4_


- [ ] 3.6 Add rate limiting and retry logic
  - Implement exponential backoff retry
  - Handle Twitter rate limit responses
  - Queue requests when rate limited
  - Log rate limit events
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_


- [ ] 4. OAuth 2.0 implementation
  - Implement OAuth authorization flow
  - Handle callback and token exchange
  - Implement token refresh mechanism
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.3, 5.4_


- [ ] 4.1 Implement OAuth authorization URL generation
  - Create `lib/twitter/oauth-manager.ts`
  - Implement `getAuthorizationUrl()` with PKCE



  - Generate and store state parameter for CSRF
  - Add code verifier and challenge
  - _Requirements: 1.1, 10.3_

- [x] 4.2 Implement OAuth callback handler

  - Create `handleCallback()` method
  - Validate state parameter
  - Exchange authorization code for tokens
  - Store tokens in database (encrypted)
  - _Requirements: 1.2, 1.3, 1.4, 5.1, 5.2_


- [ ] 4.3 Implement token refresh mechanism
  - Create `refreshAccessToken()` method
  - Call Twitter OAuth token endpoint
  - Update stored tokens in database
  - Handle refresh token expiration
  - _Requirements: 5.3, 5.4_


- [ ] 4.4 Implement disconnect functionality
  - Create `disconnect()` method
  - Delete tokens from database
  - Revoke tokens with Twitter (optional)
  - Update user connection status
  - _Requirements: 10.4, 10.5_


- [ ] 4.5 Implement automatic token refresh
  - Create `getValidAccessToken()` helper
  - Check token expiration before use
  - Auto-refresh if expired
  - Return valid token or throw error
  - _Requirements: 5.3, 5.4_


- [ ] 5. Verification service implementation
  - Create verification service orchestrator
  - Implement verification logic for each task type
  - Add performance monitoring
  - _Requirements: 2.5, 3.5, 4.5, 9.1, 9.2, 11.1, 11.2_

- [x] 5.1 Create verification service base

  - Create `lib/twitter/verification-service.ts`
  - Define `VerificationResult` interface
  - Implement performance timer utility
  - Add structured logging



  - _Requirements: 9.1, 11.1, 11.2_

- [ ] 5.2 Implement follow task verification
  - Create `verifyFollow()` method
  - Get user's access token
  - Call API client to check following

  - Return verification result
  - Log verification attempt
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5.3 Implement like task verification
  - Create `verifyLike()` method

  - Extract tweet ID from task URL
  - Call API client to check like
  - Return verification result
  - Handle invalid URLs gracefully
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5.4 Implement retweet task verification

  - Create `verifyRetweet()` method
  - Extract tweet ID from task URL
  - Call API client to check retweet
  - Accept quote tweets as valid
  - Return verification result
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


- [ ] 5.5 Implement completion verification orchestrator
  - Create `verifyCompletion()` method
  - Load completion and task from database



  - Route to appropriate verification method
  - Update completion status in database
  - Create verification log entry
  - _Requirements: All verification requirements_


- [ ] 5.6 Add caching for verification results
  - Implement in-memory cache with TTL
  - Cache verification results for 60 seconds
  - Cache user lookups for 5 minutes
  - Add cache hit/miss metrics
  - _Requirements: 9.4_


- [ ] 6. API routes for OAuth flow
  - Create authorization endpoint
  - Create callback endpoint
  - Create disconnect endpoint
  - Create status endpoint
  - _Requirements: 1.1, 1.2, 1.5, 10.4_


- [ ] 6.1 Create OAuth authorization route
  - Create `app/api/auth/twitter/authorize/route.ts`
  - Generate OAuth URL with PKCE
  - Store state in session
  - Return authorization URL to client
  - _Requirements: 1.1, 10.3_

- [ ] 6.2 Create OAuth callback route
  - Create `app/api/auth/twitter/callback/route.ts`
  - Validate state parameter
  - Exchange code for tokens
  - Store user connection in database
  - Redirect to profile page
  - _Requirements: 1.2, 1.3, 1.4, 10.3_

- [ ] 6.3 Create disconnect route
  - Create `app/api/auth/twitter/disconnect/route.ts`
  - Verify user authentication
  - Delete Twitter connection
  - Return success response
  - _Requirements: 10.4, 10.5_

- [ ] 6.4 Create connection status route
  - Create `app/api/auth/twitter/status/route.ts`
  - Check if user has Twitter connection
  - Return connection details
  - Handle not connected state
  - _Requirements: 1.5_

- [ ] 7. API routes for verification
  - Create verification endpoint
  - Create batch verification endpoint
  - Add rate limiting middleware
  - _Requirements: 2.5, 3.5, 4.5, 6.1, 6.2, 6.3_

- [ ] 7.1 Create single verification route
  - Create `app/api/twitter/verify/route.ts`
  - Validate request parameters
  - Call verification service
  - Update completion status
  - Return verification result
  - _Requirements: All verification requirements_

- [ ] 7.2 Create batch verification route
  - Create `app/api/twitter/verify/batch/route.ts`
  - Accept array of completion IDs
  - Process verifications concurrently
  - Return summary of results
  - Add admin-only access control
  - _Requirements: 9.5_

- [ ] 7.3 Add rate limiting middleware
  - Implement per-user rate limiting
  - Implement IP-based rate limiting
  - Return 429 status when exceeded
  - Log rate limit violations
  - _Requirements: 6.1, 6.2_

- [x] 8. Update completion API to trigger verification




  - Modify POST /api/completions route
  - Detect Twitter task types
  - Trigger automatic verification
  - Handle verification errors gracefully

  - _Requirements: 2.5, 3.5, 4.5, 8.2, 8.3_

- [ ] 8.1 Add Twitter verification to completion flow
  - Check if task is Twitter type
  - Check if user has Twitter connected
  - Call verification service asynchronously

  - Update completion based on result
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 8.2 Handle verification errors in completion
  - Catch verification errors


  - Mark completion as PENDING if error
  - Log error for admin review
  - Return user-friendly error message
  - _Requirements: 6.3, 6.4, 8.4_


- [ ] 9. UI components for Twitter connection
  - Create Twitter connect button
  - Create connection status display
  - Add disconnect functionality
  - _Requirements: 1.1, 1.5, 8.1, 10.4_

- [x] 9.1 Create TwitterConnectButton component

  - Create `components/twitter/TwitterConnectButton.tsx`
  - Handle OAuth flow initiation
  - Show loading state during OAuth
  - Display connection status
  - Add Twitter branding and styling
  - _Requirements: 1.1, 8.1_


- [ ] 9.2 Create TwitterConnectionStatus component
  - Create `components/twitter/TwitterConnectionStatus.tsx`
  - Display connected username
  - Show connection date
  - Add disconnect button



  - Handle disconnection confirmation
  - _Requirements: 1.5, 10.4_

- [ ] 9.3 Add Twitter connection to profile page
  - Update `app/(user)/profile/page.tsx`

  - Add Twitter connection section
  - Show TwitterConnectButton if not connected
  - Show TwitterConnectionStatus if connected
  - _Requirements: 1.1, 1.5, 8.1_

- [ ] 10. UI components for task verification
  - Create verification status component

  - Create task instructions component
  - Update task modal with Twitter features
  - _Requirements: 8.2, 8.3, 8.4_

- [ ] 10.1 Create TwitterVerificationStatus component
  - Create `components/twitter/TwitterVerificationStatus.tsx`
  - Show verification progress (verifying...)

  - Display result with appropriate icon
  - Show rejection reason if failed
  - Add retry button for failed verifications
  - _Requirements: 8.2, 8.3, 8.4_



- [ ] 10.2 Create TwitterTaskInstructions component
  - Create `components/twitter/TwitterTaskInstructions.tsx`
  - Show step-by-step instructions
  - Display "Connect Twitter" prompt if needed
  - Add "Complete on Twitter" button

  - Show verification button
  - _Requirements: 7.5, 8.1, 8.2_

- [ ] 10.3 Update TaskDetailModal for Twitter tasks
  - Detect Twitter task types
  - Show TwitterTaskInstructions
  - Show TwitterVerificationStatus

  - Handle verification trigger
  - Update UI based on verification result
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 11. Admin features and monitoring
  - Add Twitter connection management to admin panel
  - Create verification logs viewer

  - Add batch verification tool
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 11.1 Create admin Twitter connections page
  - Create `app/admin/(dashboard)/twitter/connections/page.tsx`
  - List all user Twitter connections

  - Show connection status and dates
  - Add search and filter functionality
  - Allow admin to disconnect users if needed
  - _Requirements: 11.1, 11.4_

- [x] 11.2 Create verification logs viewer


  - Create `app/admin/(dashboard)/twitter/logs/page.tsx`
  - Display TwitterVerificationLog entries
  - Show verification results and timing
  - Add filtering by result, task type, date
  - Display API error details

  - _Requirements: 11.1, 11.2, 11.3_

- [ ] 11.3 Add batch verification tool
  - Create admin UI for batch verification
  - Allow selection of pending completions
  - Trigger batch verification API

  - Display results summary
  - _Requirements: 9.5_

- [ ] 11.4 Create verification analytics dashboard
  - Create `app/admin/(dashboard)/twitter/analytics/page.tsx`
  - Show success rate metrics



  - Display average verification time
  - Show API error rates
  - Add charts for trends over time
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_


- [ ] 12. Update admin task form for Twitter tasks
  - Add URL validation for Twitter tasks
  - Show Twitter-specific help text
  - Add URL format examples
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_


- [ ] 12.1 Add Twitter URL validation
  - Update `lib/validations.ts`
  - Add Twitter username validation for FOLLOW
  - Add tweet URL validation for LIKE/RETWEET
  - Extract and validate tweet IDs

  - _Requirements: 7.4_

- [ ] 12.2 Update TaskForm for Twitter tasks
  - Update `components/admin/TaskForm.tsx`
  - Add Twitter-specific help text
  - Show URL format examples
  - Validate URLs on input
  - Display preview of what users will see
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ] 13. Localization and translations
  - Add English translations for Twitter features
  - Add Turkish translations
  - Update translation files
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 13.1 Add English translations
  - Update `locales/en/common.json`
  - Add Twitter connection strings
  - Add verification status strings
  - Add error messages
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 13.2 Add Turkish translations
  - Update `locales/tr/common.json`
  - Translate all Twitter-related strings
  - Ensure cultural appropriateness
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 13.3 Add admin translations
  - Update `locales/en/admin.json`
  - Update `locales/tr/admin.json`
  - Add Twitter management strings
  - Add analytics strings
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ]* 14. Testing and quality assurance
  - Write unit tests for core services
  - Write integration tests for API routes
  - Write E2E tests for user flows
  - _Requirements: All requirements_

- [ ]* 14.1 Unit tests for token manager
  - Test encryption/decryption
  - Test token storage/retrieval
  - Test expiration checks
  - Test error handling
  - _Requirements: 5.1, 5.2_

- [ ]* 14.2 Unit tests for API client
  - Test follow verification
  - Test like verification
  - Test retweet verification


  - Test rate limiting
  - Test retry logic
  - _Requirements: 2.1, 3.1, 4.1, 6.1, 6.2_

- [ ]* 14.3 Unit tests for verification service
  - Test verification orchestration

  - Test result caching
  - Test error handling
  - Test performance monitoring
  - _Requirements: All verification requirements_

- [x]* 14.4 Integration tests for OAuth flow

  - Test authorization URL generation
  - Test callback handling (mocked)
  - Test token refresh
  - Test disconnect
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.3, 10.4_


- [ ]* 14.5 Integration tests for verification API
  - Test single verification endpoint
  - Test batch verification endpoint
  - Test rate limiting
  - Test error responses
  - _Requirements: All verification requirements_


- [ ]* 14.6 E2E tests for user journey
  - Test complete OAuth connection flow
  - Test task completion with verification
  - Test disconnection


  - Test error scenarios
  - _Requirements: All requirements_

- [ ] 15. Documentation and deployment
  - Create setup guide for Twitter API credentials
  - Document environment variables
  - Create user guide

  - Create admin guide
  - _Requirements: All requirements_

- [ ] 15.1 Create Twitter API setup guide
  - Document Twitter Developer Portal steps
  - Explain OAuth 2.0 app creation

  - List required permissions
  - Provide callback URL configuration
  - _Requirements: All requirements (setup)_

- [ ] 15.2 Create environment variables documentation
  - Document all required env vars

  - Provide example .env file
  - Explain encryption key generation
  - Add security best practices
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 15.3 Create user guide

  - Explain how to connect Twitter
  - Show how Twitter tasks work
  - Explain verification process
  - Add troubleshooting section
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 15.4 Create admin guide
  - Explain Twitter connection management
  - Show how to use verification logs
  - Explain batch verification
  - Document analytics dashboard
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 16. Performance optimization and monitoring
  - Implement caching strategy
  - Add performance monitoring
  - Optimize database queries
  - Add alerting for errors
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 11.4_

- [ ] 16.1 Implement response caching
  - Set up node-cache for verification results
  - Cache user lookups
  - Cache API responses
  - Add cache metrics
  - _Requirements: 9.4_

- [ ] 16.2 Add performance monitoring
  - Track verification times (p50, p95, p99)
  - Monitor API call counts
  - Track success/failure rates
  - Log slow operations
  - _Requirements: 9.1, 11.2_

- [ ] 16.3 Optimize database queries
  - Add indexes for TwitterConnection
  - Add indexes for TwitterVerificationLog
  - Optimize completion queries
  - Use connection pooling
  - _Requirements: 9.2, 9.3_

- [ ] 16.4 Implement error alerting
  - Set up error rate monitoring
  - Alert when error rate > 10%
  - Alert on rate limit issues
  - Alert on token refresh failures
  - _Requirements: 11.4_

---

## Implementation Order

**Phase 1: Foundation (Tasks 1-2)**
- Database schema
- Token encryption

**Phase 2: Core Services (Tasks 3-5)**
- Twitter API client
- OAuth implementation
- Verification service

**Phase 3: API Layer (Tasks 6-8)**
- OAuth routes
- Verification routes
- Completion integration

**Phase 4: User Interface (Tasks 9-10)**
- Connection components
- Verification components
- Task modal updates

**Phase 5: Admin Features (Tasks 11-12)**
- Admin pages
- Task form updates

**Phase 6: Polish (Tasks 13-16)**
- Translations
- Testing
- Documentation
- Optimization

---

## Estimated Timeline

- **Phase 1**: 1-2 days
- **Phase 2**: 3-4 days
- **Phase 3**: 2-3 days
- **Phase 4**: 2-3 days
- **Phase 5**: 2 days
- **Phase 6**: 2-3 days

**Total**: 12-17 days

---

## Dependencies

- Twitter Developer Account (Essential plan or higher)
- OAuth 2.0 credentials from Twitter
- HTTPS-enabled domain for callbacks
- Node.js packages: `twitter-api-v2`, `node-cache`

---

**Document Version**: 1.0  
**Date**: November 13, 2025  
**Status**: Ready for Implementation
