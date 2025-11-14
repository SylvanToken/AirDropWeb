# Requirements Document

## Introduction

This specification defines a comprehensive refactoring and enhancement project for the Sylvan Token Airdrop Platform. The project aims to improve code organization, enhance user experience with advanced task timing features, optimize visual presentation, and establish a centralized theme management system.

## Glossary

- **System**: The Sylvan Token Airdrop Platform web application
- **Task Timer**: A countdown mechanism that tracks task completion time
- **Scheduled Task**: A task with a future completion deadline
- **Task Box**: A card-style visual representation of a task
- **Task List**: A compact list-style representation of tasks
- **Background Image**: Full-page hero image displayed behind content
- **Theme Palette**: Centralized color configuration file
- **Code Duplication**: Multiple files or code blocks serving identical purposes

## Requirements

### Requirement 1: Task Timing System Enhancement

**User Story:** As a user, I want to see tasks with time-based deadlines so that I can prioritize time-sensitive activities

#### Acceptance Criteria

1. WHEN a task has a future deadline, THE System SHALL display a countdown timer showing remaining time
2. WHEN a task deadline expires, THE System SHALL automatically mark the task as expired and update its visual state
3. WHEN a user views the tasks page, THE System SHALL display all active timers with accurate remaining time
4. WHERE a task has a scheduled completion time (e.g., 2 hours from start), THE System SHALL persist the deadline across page refreshes
5. WHEN a user returns after a task deadline has passed, THE System SHALL show the task as expired with appropriate messaging

### Requirement 2: Task Display Organization

**User Story:** As a user, I want to see my most important tasks prominently displayed so that I can focus on priority items

#### Acceptance Criteria

1. WHEN a user views pending tasks, THE System SHALL display the first 10 tasks as card boxes
2. WHEN there are more than 10 pending tasks, THE System SHALL display additional tasks in a compact list format below the boxes
3. WHEN a user views completed tasks, THE System SHALL display the first 10 completed tasks as card boxes
4. WHEN there are more than 10 completed tasks, THE System SHALL display additional completed tasks in a compact list format
5. WHEN tasks are displayed in list format, THE System SHALL show essential information (title, points, status) in a single row

### Requirement 3: Background Image Optimization

**User Story:** As a user, I want to see beautiful full-page backgrounds that change on each visit without distortion

#### Acceptance Criteria

1. THE System SHALL display background images at full page dimensions without scaling distortion
2. WHEN a background image is displayed, THE System SHALL maintain the image's original aspect ratio
3. WHEN a background image does not match viewport dimensions, THE System SHALL use cover positioning to fill the space
4. WHEN a user refreshes the page, THE System SHALL randomly select a different background image from available options
5. THE System SHALL ensure background images do not interfere with content readability

### Requirement 4: Logo and Visual Consistency

**User Story:** As a user, I want to see consistent branding across all pages including the homepage

#### Acceptance Criteria

1. THE System SHALL display the Sylvan Token logo consistently on all pages including the homepage
2. WHEN the logo is displayed, THE System SHALL use the correct image path and dimensions
3. THE System SHALL ensure logo visibility against all background variations
4. WHEN a user views the homepage, THE System SHALL display both logo and background correctly
5. THE System SHALL maintain logo aspect ratio across all screen sizes

### Requirement 5: Centralized Theme Management

**User Story:** As a developer, I want all theme colors defined in one place so that I can easily update the visual design

#### Acceptance Criteria

1. THE System SHALL define all color values in a single centralized theme configuration file
2. WHEN a component needs a theme color, THE System SHALL reference the centralized theme file
3. THE System SHALL support both light and dark mode color variants in the theme file
4. WHEN the theme file is updated, THE System SHALL reflect changes across all components without individual component modifications
5. THE System SHALL document all color tokens with their intended usage in the theme file

### Requirement 6: Code Organization and Cleanup

**User Story:** As a developer, I want a clean codebase without duplication so that maintenance is easier

#### Acceptance Criteria

1. THE System SHALL identify and remove duplicate files serving identical purposes
2. THE System SHALL consolidate redundant code into reusable utilities
3. THE System SHALL organize files into logical folder structures based on functionality
4. WHEN duplicate functionality is found, THE System SHALL keep the most maintainable implementation
5. THE System SHALL document the folder structure and file organization conventions

### Requirement 7: Task Timer Persistence

**User Story:** As a user, I want my task timers to persist across sessions so that I don't lose progress

#### Acceptance Criteria

1. WHEN a user starts a task with a timer, THE System SHALL store the start time and deadline in the database
2. WHEN a user closes and reopens the application, THE System SHALL restore active timers with correct remaining time
3. WHEN a timer expires while the user is offline, THE System SHALL update the task status upon next login
4. THE System SHALL handle timezone differences correctly for scheduled tasks
5. WHEN a task timer is active, THE System SHALL update the display every second without requiring page refresh

### Requirement 8: Visual Hierarchy and Accessibility

**User Story:** As a user, I want clear visual distinction between different task states so that I can quickly understand my progress

#### Acceptance Criteria

1. THE System SHALL use distinct visual styles for pending, active, completed, and expired tasks
2. WHEN a task is time-sensitive, THE System SHALL use visual indicators (color, icons) to show urgency
3. THE System SHALL maintain WCAG 2.1 AA contrast ratios for all task state indicators
4. WHEN a task transitions between states, THE System SHALL animate the transition smoothly
5. THE System SHALL ensure all task information is accessible via screen readers
