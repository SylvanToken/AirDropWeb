# Requirements Document

## Introduction

This document outlines the requirements for implementing a time-limited task system in the Sylvan Token AirDrop Platform. The system will allow administrators to create tasks with optional time constraints and provide users with an organized view of active, completed, and missed tasks with countdown timers.

## Glossary

- **Time-Limited Task**: A task that has a deadline and must be completed within a specified time period
- **Countdown Timer**: A visual display showing remaining time for a time-limited task
- **Active Task**: A task that is available and not yet completed or expired
- **Completed Task**: A task that has been successfully finished by the user
- **Missed Task**: A time-limited task that expired before the user could complete it
- **Task Expiration**: The moment when a time-limited task's deadline passes
- **Task Duration**: The time period (in hours) allocated for completing a time-limited task

## Requirements

### Requirement 1: Admin Task Creation with Time Limits

**User Story:** As an administrator, I want to create tasks with optional time limits, so that I can add urgency and engagement to certain tasks.

#### Acceptance Criteria

1. THE Admin Panel SHALL provide a checkbox option to enable time-limited tasks during task creation
2. WHEN the time-limited option is enabled, THE Admin Panel SHALL display a duration input field
3. THE Admin Panel SHALL accept duration values in hours (1, 2, 3, etc.)
4. THE System SHALL store the task duration in the database when a time-limited task is created
5. THE System SHALL allow tasks without time limits to be created (default behavior)

### Requirement 2: Task Expiration Management

**User Story:** As a system, I want to automatically mark tasks as expired when their deadline passes, so that users cannot complete outdated tasks.

#### Acceptance Criteria

1. WHEN a time-limited task is created, THE System SHALL calculate the expiration timestamp
2. THE System SHALL continuously monitor task expiration status
3. WHEN a task expires, THE System SHALL mark it as "expired" in the database
4. THE System SHALL prevent users from completing expired tasks
5. THE System SHALL move expired tasks to the "missed tasks" category for the user

### Requirement 3: Countdown Timer Display

**User Story:** As a user, I want to see countdown timers on time-limited tasks, so that I know how much time I have left to complete them.

#### Acceptance Criteria

1. THE Task Card SHALL display a countdown timer for time-limited tasks
2. THE Countdown Timer SHALL show hours, minutes, and seconds remaining
3. THE Countdown Timer SHALL update in real-time every second
4. WHEN the timer reaches zero, THE Task Card SHALL visually indicate expiration
5. THE System SHALL not display a timer for tasks without time limits

### Requirement 4: Active Tasks Display (Row 1)

**User Story:** As a user, I want to see up to 5 active tasks in the first row, so that I can focus on my current priorities.

#### Acceptance Criteria

1. THE Tasks Page SHALL display active tasks in the first row
2. THE System SHALL show a maximum of 5 active tasks in the first row
3. WHEN there are fewer than 5 active tasks, THE System SHALL display only available tasks (3, 4, etc.)
4. THE System SHALL never display more than 5 tasks in the first row
5. THE Active Tasks Section SHALL use a 5-column grid layout on large screens

### Requirement 5: Completed Tasks Display (Row 2)

**User Story:** As a user, I want to see my 5 most recent completed tasks, so that I can track my progress.

#### Acceptance Criteria

1. THE Tasks Page SHALL display completed tasks in the second row
2. THE System SHALL show the 5 most recently completed tasks
3. THE Completed Tasks SHALL be ordered from newest to oldest
4. THE System SHALL display additional completed tasks in a collapsible list below
5. WHEN a list item is clicked, THE System SHALL open a popup with task details

### Requirement 6: Missed Tasks Display (Row 3)

**User Story:** As a user, I want to see tasks I missed due to time expiration, so that I am aware of missed opportunities.

#### Acceptance Criteria

1. THE Tasks Page SHALL display missed tasks in the third row
2. THE System SHALL show the 5 most recently missed tasks
3. THE Missed Tasks SHALL be ordered from newest to oldest
4. THE System SHALL display additional missed tasks in a collapsible list below
5. THE Missed Task Cards SHALL visually indicate that the task is no longer available

### Requirement 7: Task Detail Popup

**User Story:** As a user, I want to view detailed information about any task in a popup, so that I can see full task descriptions without leaving the page.

#### Acceptance Criteria

1. WHEN a task in the list view is clicked, THE System SHALL open a modal popup
2. THE Popup SHALL display the task title, description, points, and type
3. THE Popup SHALL show the task status (active, completed, or missed)
4. THE Popup SHALL include a close button to dismiss the modal
5. THE Popup SHALL be accessible via keyboard navigation

### Requirement 8: Database Schema Updates

**User Story:** As a developer, I want the database schema to support time-limited tasks, so that task duration and expiration data can be stored.

#### Acceptance Criteria

1. THE Task Model SHALL include a "duration" field (nullable integer for hours)
2. THE Task Model SHALL include an "expiresAt" field (nullable datetime)
3. THE Completion Model SHALL include a "missedAt" field (nullable datetime)
4. THE System SHALL maintain backward compatibility with existing tasks
5. THE Database Migration SHALL execute without data loss

### Requirement 9: Real-Time Timer Updates

**User Story:** As a user, I want countdown timers to update automatically, so that I always see accurate time remaining.

#### Acceptance Criteria

1. THE Countdown Timer SHALL use client-side JavaScript for updates
2. THE Timer SHALL update every second without requiring page refresh
3. WHEN the timer reaches zero, THE System SHALL automatically update the task status
4. THE System SHALL handle browser tab visibility changes gracefully
5. THE Timer SHALL synchronize with server time to prevent manipulation

### Requirement 10: Admin Task Management Updates

**User Story:** As an administrator, I want to edit existing tasks to add or remove time limits, so that I can adjust task urgency as needed.

#### Acceptance Criteria

1. THE Admin Panel SHALL allow editing of task duration
2. WHEN duration is changed, THE System SHALL recalculate expiration timestamps
3. THE System SHALL allow removing time limits from existing tasks
4. THE System SHALL allow adding time limits to existing tasks
5. THE System SHALL log all duration changes for audit purposes

