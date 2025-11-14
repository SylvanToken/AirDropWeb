# Implementation Plan

- [x] 1. Database Schema Updates





  - Create Prisma migration for Task model extensions (duration, expiresAt fields)
  - Create Prisma migration for Completion model extension (missedAt field)
  - Run migrations and verify schema changes
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 2. Admin Task Creation Form Updates





  - [x] 2.1 Add time-limited checkbox to task creation form


    - Add "Enable Time Limit" checkbox component
    - Add conditional duration input field (1-24 hours range)
    - Add helper text showing calculated expiration time
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Implement expiration calculation logic


    - Create `calculateExpiration` utility function
    - Calculate expiresAt timestamp when duration is provided
    - Store duration and expiresAt in database on task creation
    - _Requirements: 1.4, 1.5, 2.1_

  - [x] 2.3 Update task creation API endpoint


    - Accept duration parameter in POST /api/admin/tasks
    - Validate duration range (1-24 hours)
    - Calculate and store expiration timestamp
    - Return expiration data in response
    - _Requirements: 1.3, 1.4_

- [x] 3. Countdown Timer Component






  - [x] 3.1 Create CountdownTimer component

    - Implement time remaining calculation function
    - Create component with hours:minutes:seconds display
    - Add Clock icon from lucide-react
    - Style with monospace font for better readability
    - _Requirements: 3.1, 3.2_


  - [x] 3.2 Implement real-time timer updates

    - Use setInterval for second-by-second updates
    - Calculate remaining time on each tick
    - Clear interval on component unmount
    - Handle expiration callback when timer reaches zero
    - _Requirements: 3.3, 3.4, 9.1, 9.2_


  - [x] 3.3 Add timer synchronization and optimization

    - Use requestAnimationFrame for smooth updates
    - Pause timer when browser tab is not visible
    - Synchronize with server time on mount
    - Handle timezone differences correctly
    - _Requirements: 9.3, 9.4, 9.5_

- [x] 4. Task Expiration Management




  - [x] 4.1 Create task expiration check API endpoint


    - Implement POST /api/tasks/check-expiration
    - Check if task has expired based on expiresAt
    - Return expiration status and timestamp
    - _Requirements: 2.2, 2.3_

  - [x] 4.2 Implement automatic expiration marking


    - Create background job or API route for expiration checks
    - Mark expired tasks in database
    - Create missedAt timestamp for expired tasks
    - Prevent completion of expired tasks
    - _Requirements: 2.3, 2.4, 2.5_

  - [x] 4.3 Update task completion validation


    - Check expiration status before allowing completion
    - Return error if task is expired
    - Log expiration attempts for monitoring
    - _Requirements: 2.4, 2.5_

- [x] 5. Task Organization Logic





  - [x] 5.1 Create task organization utility


    - Implement `organizeTasks` function in lib/tasks/organizer.ts
    - Categorize tasks into active, completed, and missed
    - Limit active tasks to maximum of 5
    - Sort completed and missed tasks by date (newest first)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3_

  - [x] 5.2 Create organized tasks API endpoint


    - Implement GET /api/tasks/organized
    - Fetch user's tasks and completions
    - Apply organization logic
    - Return categorized tasks (active, completed, missed)
    - _Requirements: 4.1, 5.1, 6.1_

- [x] 6. Task Card Component Updates





  - [x] 6.1 Add countdown timer to TaskCard


    - Conditionally render CountdownTimer for time-limited tasks
    - Position timer in top-right corner of card
    - Handle timer expiration callback
    - _Requirements: 3.1, 3.5_

  - [x] 6.2 Add expired task visual indicators


    - Add "Expired" badge for expired tasks
    - Reduce opacity for expired tasks
    - Disable completion button for expired tasks
    - Add red color scheme for expired state
    - _Requirements: 3.4, 6.5_

  - [x] 6.3 Update task card interactions


    - Prevent click events on expired tasks
    - Show tooltip explaining expiration
    - Update button text based on task status
    - _Requirements: 2.4, 6.5_

- [x] 7. Task Detail Modal Component





  - [x] 7.1 Create TaskDetailModal component

    - Create modal dialog using shadcn Dialog component
    - Display task title, description, points, and type
    - Show task status badge (active/completed/missed)
    - Add countdown timer for active time-limited tasks
    - _Requirements: 7.1, 7.2, 7.3_


  - [x] 7.2 Implement modal interactions

    - Add close button to dismiss modal
    - Handle keyboard navigation (Escape key)
    - Prevent body scroll when modal is open
    - Add click-outside-to-close functionality
    - _Requirements: 7.4, 7.5_

- [x] 8. User Tasks Page Layout Restructure





  - [x] 8.1 Implement Row 1: Active Tasks section


    - Create section with "Active Tasks" heading
    - Display up to 5 active tasks in grid layout
    - Use 5-column grid on xl screens
    - Show countdown timers on time-limited tasks
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 8.2 Implement Row 2: Completed Tasks section

    - Create section with "Completed Tasks" heading
    - Display 5 most recent completed tasks in grid
    - Add collapsible list for additional completed tasks
    - Implement click handler to open detail modal
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 8.3 Implement Row 3: Missed Tasks section

    - Create section with "Missed Tasks" heading
    - Display 5 most recent missed tasks in grid
    - Add collapsible list for additional missed tasks
    - Show expired badges on all missed tasks
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 8.4 Integrate TaskDetailModal

    - Add modal state management
    - Implement click handlers for list items
    - Pass selected task to modal
    - Handle modal open/close events
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [-] 9. Admin Task Edit Functionality



  - [x] 9.1 Update task edit form


    - Add time-limited checkbox to edit form
    - Add duration input field
    - Pre-fill existing duration value
    - Show current expiration time if set
    - _Requirements: 10.1_

  - [x] 9.2 Implement duration update logic


    - Recalculate expiresAt when duration changes
    - Allow removing time limit (set duration to null)
    - Allow adding time limit to existing tasks
    - Update database with new values
    - _Requirements: 10.2, 10.3, 10.4_

  - [x] 9.3 Add audit logging for duration changes





    - Log all duration modifications
    - Record old and new values
    - Store admin user who made the change
    - Include timestamp of modification
    - _Requirements: 10.5_

- [x] 10. Testing and Validation





  - [x] 10.1 Create unit tests for core logic


    - Test expiration calculation function
    - Test time remaining calculation
    - Test task organization algorithm
    - Test countdown timer component logic
    - _Requirements: All_


  - [x] 10.2 Create integration tests

    - Test task creation with time limits
    - Test automatic expiration marking
    - Test task completion validation
    - Test organized tasks API endpoint
    - _Requirements: All_


  - [x] 10.3 Perform manual testing

    - Create time-limited task as admin
    - Verify countdown timer displays correctly
    - Wait for expiration and verify status change
    - Attempt to complete expired task (should fail)
    - Verify task appears in correct section
    - Test all three rows display correctly
    - Test collapsible lists and modal popup
    - _Requirements: All_

- [x] 11. UI Polish and Accessibility





  - [x] 11.1 Add loading states


    - Show skeleton loaders while fetching tasks
    - Add loading spinner for task completion
    - Show loading state during expiration checks
    - _Requirements: All_

  - [x] 11.2 Add error handling and user feedback


    - Show error message if task completion fails
    - Display toast notification on expiration
    - Handle network errors gracefully
    - Add retry mechanism for failed requests
    - _Requirements: All_

  - [x] 11.3 Ensure accessibility compliance


    - Add ARIA labels to all interactive elements
    - Ensure keyboard navigation works correctly
    - Test with screen readers
    - Verify color contrast ratios
    - Add focus indicators
    - _Requirements: 7.5_

- [x] 12. Documentation and Deployment






  - [x] 12.1 Update API documentation

    - Document new task creation parameters
    - Document organized tasks endpoint
    - Document expiration check endpoint
    - Add example requests and responses
    - _Requirements: All_


  - [x] 12.2 Create user guide

    - Document how to create time-limited tasks
    - Explain countdown timer behavior
    - Describe task organization sections
    - Add screenshots of new features
    - _Requirements: All_

  - [x] 12.3 Prepare deployment


    - Run database migrations in staging
    - Test all features in staging environment
    - Create rollback plan
    - Deploy to production
    - Monitor for errors
    - _Requirements: All_

