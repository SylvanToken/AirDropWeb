# Implementation Plan

- [ ] 1. Set up screenshot capture service
  - Create screenshot capture utility using html2canvas library
  - Implement image compression algorithm to meet 2MB size limit
  - Add error handling for browser permission issues and canvas tainting
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

- [ ] 2. Implement automatic error capture service
- [ ] 2.1 Create error capture service core
  - Write ErrorCaptureService class with initialization and configuration
  - Implement error hash generation for deduplication
  - Create in-memory cache for tracking recent errors within 60-second window
  - _Requirements: 2.1, 2.2, 2.5_

- [ ] 2.2 Register global error handlers
  - Add window.onerror handler for JavaScript errors
  - Add window.onunhandledrejection handler for promise rejections
  - Integrate screenshot capture when errors are caught
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 2.3 Add API error interceptor
  - Create fetch/axios interceptor for API failures
  - Filter to only capture 500-level status codes
  - Include request URL, method, and response details in error report
  - _Requirements: 2.3, 2.4_

- [ ] 2.4 Integrate error capture with existing error report API
  - Connect ErrorCaptureService to POST /api/error-reports endpoint
  - Ensure automatic errors include screenshot data
  - Add deduplication counter to error reports
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. Create dashboard widget component
- [ ] 3.1 Build ErrorReportWidget component
  - Create React component with stats display (24h total, unresolved count)
  - Implement recent errors list showing 5 most recent reports
  - Add click handlers to navigate to error detail view
  - Style with existing UI components and eco theme
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 3.2 Create admin stats API endpoint
  - Implement GET /api/admin/error-reports/stats endpoint
  - Query database for 24-hour error count and unresolved count
  - Fetch 5 most recent error reports with relevant fields
  - Add admin authentication check
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3.3 Integrate widget into admin dashboard
  - Add ErrorReportWidget to admin dashboard page
  - Implement auto-refresh every 30 seconds
  - Add loading and error states
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ] 4. Implement search and filtering system
- [ ] 4.1 Enhance error reports API with filtering
  - Extend GET /api/error-reports to accept query parameters (search, status, priority, errorType, dateFrom, dateTo)
  - Implement Prisma query building with multiple filter combinations using AND logic
  - Add full-text search across errorMessage, errorTitle, and stackTrace fields
  - Implement pagination with page and limit parameters
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4.2 Create filter UI components
  - Add search input with 300ms debounce to ErrorReportsTable component
  - Create multi-select dropdowns for status, priority, and error type filters
  - Implement date range picker for filtering by creation date
  - Add clear all filters button
  - Display active filter badges
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

- [ ] 4.3 Connect filter UI to API
  - Wire filter controls to API query parameters
  - Update URL search params when filters change
  - Restore filters from URL on page load
  - Show results count and pagination controls
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 5. Enhance error report detail view with screenshots
- [ ] 5.1 Update ErrorReportDetailModal component
  - Add screenshot display section to modal
  - Implement image viewer with zoom and download capabilities
  - Show "No screenshot available" message when screenshot is null
  - Handle screenshot loading errors gracefully
  - _Requirements: 4.4, 4.5_

- [ ] 5.2 Update error report API to include screenshot
  - Ensure GET /api/error-reports/[id] returns screenshot data
  - Add screenshot field to API response type
  - Optimize response size for large screenshots
  - _Requirements: 4.3, 4.4_

- [ ] 6. Add error capture initialization to application
- [ ] 6.1 Initialize error capture service on app load
  - Add ErrorCaptureService initialization to root layout or app component
  - Configure deduplication window and exclusion patterns
  - Set up feature flag to enable/disable automatic capture
  - Add error boundary component to catch React rendering errors
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 6.2 Add configuration and environment variables
  - Create environment variables for error capture settings
  - Add configuration file for excluded error patterns
  - Document configuration options
  - _Requirements: 2.1, 2.5_

- [ ] 7. Implement rate limiting and security measures
- [ ] 7.1 Add rate limiting to error report API
  - Implement rate limiter middleware (max 10 reports per minute per user)
  - Add rate limit headers to API responses
  - Return 429 status code when limit exceeded
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 7.2 Add input validation and sanitization
  - Validate all required fields in POST /api/error-reports
  - Sanitize error messages and stack traces to remove sensitive data
  - Validate screenshot size and format
  - Limit stack trace length to 5000 characters
  - _Requirements: 2.1, 2.4, 4.3, 4.6_

- [ ]* 8. Write integration tests
  - Create test for automatic error capture flow
  - Test screenshot capture and compression
  - Test dashboard widget data fetching and display
  - Test search and filtering with various combinations
  - Test error report creation with screenshot
  - _Requirements: All_
