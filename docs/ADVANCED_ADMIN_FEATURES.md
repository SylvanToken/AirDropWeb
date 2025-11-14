# Advanced Admin Features Documentation

## Table of Contents

1. [Overview](#overview)
2. [Bulk Operations](#bulk-operations)
3. [Advanced Filtering](#advanced-filtering)
4. [Data Export](#data-export)
5. [Analytics Dashboard](#analytics-dashboard)
6. [User Activity Timeline](#user-activity-timeline)
7. [Automated Workflows](#automated-workflows)
8. [Audit Logging](#audit-logging)
9. [Role-Based Access Control](#role-based-access-control)
10. [Campaign Analytics](#campaign-analytics)
11. [Advanced Search](#advanced-search)
12. [Troubleshooting](#troubleshooting)

## Overview

The Advanced Admin Features enhance the Sylvan Token Airdrop Platform with powerful tools for managing users, tasks, and campaigns at scale. These features are designed to improve admin productivity, provide better insights, and automate routine operations.

### Key Benefits

- **Efficiency**: Perform operations on multiple records simultaneously
- **Insights**: Comprehensive analytics and reporting capabilities
- **Automation**: Reduce manual work with automated workflows
- **Security**: Complete audit trail of all admin actions
- **Control**: Granular permission management for admin users

### Prerequisites

- Admin role access
- Familiarity with the platform's basic admin features
- Understanding of user roles and permissions

---

## Bulk Operations

Bulk operations allow you to perform actions on multiple users simultaneously, saving time and reducing repetitive tasks.

### Accessing Bulk Operations

1. Navigate to **Admin Dashboard** → **Users**
2. Select users using checkboxes in the user list
3. Click the **Bulk Actions** button that appears
4. Choose your desired action from the dropdown menu

### Available Bulk Actions

#### 1. Bulk Status Update

**Purpose**: Change the status of multiple users at once (e.g., activate, suspend, ban)

**Steps**:
1. Select target users
2. Choose "Update Status" from bulk actions menu
3. Select the new status from the dropdown
4. Confirm the action
5. Review the results summary

**Use Cases**:
- Activate newly registered users after verification
- Suspend suspicious accounts for investigation
- Ban users who violate terms of service

#### 2. Bulk Delete

**Purpose**: Remove multiple user accounts permanently

**Steps**:
1. Select users to delete
2. Choose "Delete Users" from bulk actions menu
3. Review the confirmation dialog showing the count
4. Type "DELETE" to confirm (safety measure)
5. Click "Confirm Delete"

**Warning**: This action is irreversible. All user data, completions, and points will be permanently deleted.

#### 3. Bulk Point Assignment

**Purpose**: Award or deduct points from multiple users

**Steps**:
1. Select target users
2. Choose "Assign Points" from bulk actions menu
3. Enter the point amount (positive to add, negative to deduct)
4. Add an optional reason/note
5. Confirm the action

**Use Cases**:
- Reward participants in special events
- Compensate for system errors
- Adjust points after rule changes

#### 4. Bulk Export

**Purpose**: Export selected user data for analysis

**Steps**:
1. Select users to export
2. Choose "Export Selected" from bulk actions menu
3. Select export format (CSV, Excel, JSON)
4. Choose fields to include
5. Download the generated file

### Best Practices

- Always review your selection before executing bulk operations
- Use filters to narrow down users before bulk selection
- Test with a small group first for critical operations
- Document the reason for bulk changes in audit logs
- Monitor the results summary for any failures

---

## Advanced Filtering


Advanced filtering helps you quickly find specific users or groups based on multiple criteria.

### Accessing Advanced Filters

1. Navigate to **Admin Dashboard** → **Users**
2. Click the **Advanced Filters** button
3. The filter panel will expand on the right side

### Filter Types

#### Text Filters
- **Equals**: Exact match
- **Contains**: Partial match (case-insensitive)
- **Starts With**: Matches beginning of text
- **Ends With**: Matches end of text

**Example**: Find users with email containing "@gmail.com"

#### Numeric Filters
- **Equals**: Exact number
- **Greater Than**: Values above threshold
- **Less Than**: Values below threshold
- **Between**: Range of values

**Example**: Find users with points between 100 and 500

#### Date Filters
- **On**: Specific date
- **Before**: Earlier than date
- **After**: Later than date
- **Between**: Date range

**Example**: Find users registered in the last 30 days

#### Status Filters
- Select from predefined status values
- Multiple selection supported

### Combining Filters

#### AND Logic
All conditions must be met

**Example**: Users with status "ACTIVE" AND points > 100

#### OR Logic
Any condition can be met

**Example**: Users with status "ACTIVE" OR status "PENDING"

#### Complex Combinations
Mix AND/OR logic for advanced queries

**Example**: (Status = "ACTIVE" AND Points > 100) OR (Status = "VIP")

### Filter Presets

Save frequently used filter combinations for quick access.

#### Creating a Preset

1. Configure your filters
2. Click "Save as Preset"
3. Enter a descriptive name
4. Click "Save"

#### Using a Preset

1. Click the "Presets" dropdown
2. Select your saved preset
3. Filters are automatically applied

#### Managing Presets

- Edit: Modify existing preset filters
- Delete: Remove unused presets
- Share: Export preset configuration (future feature)

### Common Filter Scenarios

**Active High-Value Users**:
- Status = "ACTIVE"
- Total Points > 1000
- Last Active within 7 days

**Inactive Users for Cleanup**:
- Last Active > 90 days ago
- Total Completions = 0

**New Users Needing Verification**:
- Created At within 24 hours
- Email Verified = false

---

## Data Export


Export platform data in various formats for external analysis, reporting, or backup purposes.

### Accessing Data Export

1. Navigate to the relevant admin page (Users, Tasks, Completions, Campaigns)
2. Click the **Export** button in the toolbar
3. Configure export options in the dialog
4. Generate and download the file

### Export Formats

#### CSV (Comma-Separated Values)
- **Best For**: Spreadsheet applications, data analysis tools
- **Pros**: Universal compatibility, small file size
- **Cons**: Limited formatting, no multiple sheets

#### Excel (XLSX)
- **Best For**: Microsoft Excel, advanced formatting needs
- **Pros**: Multiple sheets, formatting, formulas
- **Cons**: Larger file size, requires Excel or compatible software

#### JSON (JavaScript Object Notation)
- **Best For**: API integration, programmatic processing
- **Pros**: Structured data, nested relationships
- **Cons**: Not human-readable, requires technical knowledge

### Export Options

#### Field Selection
Choose which columns to include in the export:
- Select All: Include all available fields
- Custom: Choose specific fields
- Preset: Use predefined field sets (Basic, Detailed, Complete)

#### Filtering
Apply filters before exporting:
- Use current filters: Export only filtered results
- Export all: Ignore current filters

#### Data Scope
- Current Page: Export visible records only
- All Pages: Export entire dataset
- Selected: Export only selected records

### Large Dataset Exports

For exports exceeding 10,000 records:

1. Export is processed asynchronously in the background
2. You'll receive an email notification when ready
3. Download link is valid for 24 hours
4. File is automatically deleted after download or expiration

**Email includes**:
- Export summary (record count, filters applied)
- Secure download link
- Expiration time
- File size

### Export File Naming

Files are automatically named with:
- Data type (users, tasks, completions, campaigns)
- Timestamp (YYYY-MM-DD_HH-MM-SS)
- Admin username
- Record count

**Example**: `users_2025-11-11_14-30-00_admin_1250records.csv`

### Security Considerations

- Exports contain sensitive user data
- Store exported files securely
- Delete files after use
- Do not share via unsecured channels
- Comply with data protection regulations (GDPR, etc.)

### Common Export Scenarios

**Monthly User Report**:
- Format: Excel
- Fields: Name, Email, Total Points, Completions, Status
- Filter: Created this month

**Task Performance Analysis**:
- Format: CSV
- Fields: Task Title, Completions, Average Time, Success Rate
- Filter: Active tasks only

**Compliance Audit**:
- Format: JSON
- Fields: All user data
- Filter: None (complete export)

---

## Analytics Dashboard


Comprehensive analytics provide insights into platform performance, user engagement, and growth trends.

### Accessing Analytics

Navigate to **Admin Dashboard** → **Analytics**

### Key Metrics Overview

#### User Metrics
- **Total Users**: All registered accounts
- **Active Users**: Users active in the last 7 days
- **New Users Today**: Registrations in the last 24 hours
- **Growth Rate**: Percentage change from previous period

#### Engagement Metrics
- **Total Completions**: All task completions
- **Completions Today**: Tasks completed in the last 24 hours
- **Average Completions per User**: Total completions / Total users
- **Completion Rate**: Successful completions / Total attempts

#### Points Metrics
- **Total Points Distributed**: Sum of all user points
- **Average Points per User**: Total points / Total users
- **Points Distributed Today**: Points awarded in the last 24 hours

### Interactive Charts

#### User Growth Chart (Line Chart)
- Shows user registration trends over time
- Configurable time periods: 7 days, 30 days, 90 days, 1 year
- Hover to see exact counts for each date
- Compare with previous period

#### Completion Trends Chart (Line Chart)
- Displays task completion patterns
- Identify peak activity times
- Spot declining engagement early
- Filter by task type or campaign

#### Top Tasks Chart (Bar Chart)
- Ranks tasks by completion count
- Shows most and least popular tasks
- Helps identify successful task designs
- Filter by date range

#### User Distribution Chart (Pie Chart)
- Breakdown by user status (Active, Inactive, Suspended, Banned)
- Breakdown by user tier or level
- Breakdown by registration source

### Date Range Selector

Control the time period for all analytics:

1. Click the date range selector
2. Choose a preset (Today, Last 7 Days, Last 30 Days, Last 90 Days, This Year)
3. Or select custom start and end dates
4. Click "Apply"

All metrics and charts update automatically.

### Comparison Mode

Compare current period with previous period:

1. Enable "Compare with previous period" toggle
2. Charts show both periods with different colors
3. Metrics display percentage change
4. Identify trends and anomalies

### Exporting Analytics

#### PDF Report
Generate a comprehensive PDF report including:
- All key metrics
- All charts and visualizations
- Date range and filters applied
- Generated timestamp
- Admin name

**Steps**:
1. Configure desired date range and filters
2. Click "Export to PDF"
3. Wait for generation (may take a few seconds)
4. Download automatically starts

#### CSV Data Export
Export raw analytics data for custom analysis:
1. Click "Export Data"
2. Choose metrics to include
3. Select CSV format
4. Download file

### Real-Time Updates

Analytics dashboard updates automatically:
- Metrics refresh every 5 minutes
- Manual refresh button available
- Last update timestamp displayed

### Performance Tips

- Use shorter date ranges for faster loading
- Limit the number of charts displayed simultaneously
- Export data for complex analysis instead of browser-based processing

---

## User Activity Timeline


View detailed chronological activity for any user to understand behavior patterns and identify issues.

### Accessing User Timeline

1. Navigate to **Admin Dashboard** → **Users**
2. Click on a user's name or ID
3. Scroll to the **Activity Timeline** section

### Activity Types

#### Login Events
- Successful logins
- Failed login attempts
- IP address and location
- Device and browser information
- Session duration

#### Task Completions
- Task name and type
- Completion timestamp
- Points awarded
- Verification status
- Time taken to complete

#### Wallet Updates
- Wallet address changes
- Verification status changes
- Update timestamp
- Previous and new values

#### Profile Changes
- Field modifications (name, email, etc.)
- Avatar uploads
- Social media connections
- Timestamp of changes

#### Admin Actions
- Status changes
- Point adjustments
- Role assignments
- Notes added by admins

### Timeline Features

#### Chronological Display
- Most recent activities at the top
- Infinite scroll for older activities
- Load more button for pagination

#### Activity Icons
- Color-coded by activity type
- Visual indicators for success/failure
- Warning icons for suspicious activities

#### Detailed Information
Click any activity to expand and see:
- Full details and metadata
- IP address and user agent
- Related records (task details, etc.)
- Admin notes (if any)

#### Filtering
Filter timeline by activity type:
- All Activities
- Logins Only
- Completions Only
- Profile Changes Only
- Admin Actions Only

### Suspicious Activity Detection

The system automatically flags potentially suspicious activities:

#### Multiple Failed Logins
- 3+ failed attempts within 15 minutes
- Highlighted in red
- Suggests password issues or attack attempts

#### Rapid Task Completions
- Multiple tasks completed in unrealistic timeframes
- May indicate automation or fraud
- Requires manual review

#### IP Address Changes
- Frequent changes in short periods
- Different geographic locations
- Possible account sharing

#### Unusual Activity Patterns
- Activity at unusual hours
- Sudden spike in completions
- Deviation from normal behavior

### Investigation Tools

#### IP Address Lookup
- Click IP address to see geolocation
- View all activities from same IP
- Identify shared accounts

#### Device Fingerprinting
- Track unique devices used
- Identify device changes
- Detect multiple accounts from same device

#### Activity Export
Export user timeline for detailed analysis:
1. Click "Export Timeline"
2. Select date range
3. Choose format (CSV or JSON)
4. Download file

### Use Cases

**Fraud Investigation**:
- Review completion patterns
- Check IP addresses
- Verify realistic timing

**User Support**:
- Understand user's journey
- Identify where they encountered issues
- Provide context for support tickets

**Compliance Audits**:
- Document user activities
- Verify proper procedures followed
- Generate activity reports

---

## Automated Workflows


Automate routine administrative tasks with configurable workflows that trigger based on events or schedules.

### Accessing Workflow Management

Navigate to **Admin Dashboard** → **Workflows**

### Workflow Components

#### 1. Triggers
Events that start the workflow:

**User Registration**
- Fires when a new user signs up
- Use for welcome emails, initial point awards

**Task Completed**
- Fires when a user completes a task
- Use for congratulations, bonus points, next task suggestions

**Schedule**
- Fires at specific times or intervals
- Use for daily reports, cleanup tasks, reminders

**Manual**
- Triggered by admin action
- Use for one-time operations, testing

#### 2. Conditions
Optional filters that must be met:

**User Conditions**
- User status equals/not equals
- Total points greater/less than
- Registration date before/after
- Email verified true/false

**Task Conditions**
- Task type equals
- Points awarded greater/less than
- Completion time greater/less than

**Time Conditions**
- Day of week
- Time of day
- Date range

#### 3. Actions
Operations performed when triggered:

**Send Email**
- Choose email template
- Personalize with user data
- Schedule delivery time

**Update User Status**
- Change to Active, Suspended, Banned, etc.
- Add reason/note

**Assign Points**
- Award or deduct points
- Add description

**Create Notification**
- In-app notification
- Custom message
- Link to relevant page

**Update Task**
- Enable/disable task
- Change point value
- Modify requirements

### Creating a Workflow

1. Click **Create Workflow** button
2. Enter workflow name and description
3. Configure trigger:
   - Select trigger type
   - Set trigger conditions (if applicable)
4. Add conditions (optional):
   - Click "Add Condition"
   - Choose field, operator, and value
   - Add multiple conditions with AND/OR logic
5. Add actions:
   - Click "Add Action"
   - Select action type
   - Configure action parameters
   - Add multiple actions (executed in order)
6. Test workflow (recommended):
   - Click "Test Workflow"
   - Provide test data
   - Review execution results
7. Enable workflow:
   - Toggle "Active" switch
   - Click "Save Workflow"

### Example Workflows

#### Welcome New Users
**Trigger**: User Registration
**Conditions**: None
**Actions**:
1. Send Email (Welcome template)
2. Assign Points (50 bonus points)
3. Create Notification ("Welcome! Complete your first task")

#### Reward High Achievers
**Trigger**: Task Completed
**Conditions**: User total points > 1000
**Actions**:
1. Update User Status (VIP)
2. Send Email (VIP congratulations)
3. Assign Points (100 bonus)

#### Daily Inactive User Reminder
**Trigger**: Schedule (Daily at 10:00 AM)
**Conditions**: Last active > 7 days ago
**Actions**:
1. Send Email (Come back reminder)
2. Create Notification ("New tasks available!")

#### Fraud Detection Response
**Trigger**: Task Completed
**Conditions**: Completion time < 10 seconds
**Actions**:
1. Update User Status (Suspended)
2. Create Notification (Account under review)
3. Send Email (Admin alert)

### Managing Workflows

#### Editing Workflows
1. Click workflow name in list
2. Modify trigger, conditions, or actions
3. Test changes
4. Save workflow

#### Enabling/Disabling
- Toggle the "Active" switch
- Disabled workflows don't execute
- Useful for temporary suspension

#### Deleting Workflows
1. Click delete icon
2. Confirm deletion
3. Workflow execution history is preserved

### Workflow Execution Logs

View execution history for each workflow:

1. Click "View Logs" on workflow
2. See all executions with:
   - Timestamp
   - Trigger data
   - Actions executed
   - Success/failure status
   - Error messages (if any)

### Best Practices

- Test workflows thoroughly before enabling
- Start with simple workflows and add complexity gradually
- Monitor execution logs regularly
- Use descriptive names and documentation
- Avoid creating conflicting workflows
- Set reasonable rate limits for email actions
- Include error handling and notifications

### Troubleshooting Workflows

**Workflow Not Triggering**:
- Check if workflow is enabled
- Verify trigger conditions are met
- Review execution logs for errors

**Actions Not Executing**:
- Check action configuration
- Verify required fields are provided
- Review error messages in logs

**Email Not Sending**:
- Verify email template exists
- Check email service configuration
- Review email queue status

---

## Audit Logging


Complete audit trail of all administrative actions for accountability, security, and compliance.

### Accessing Audit Logs

Navigate to **Admin Dashboard** → **Audit Logs**

### What Gets Logged

#### User Management Actions
- User creation, updates, deletion
- Status changes
- Role assignments
- Point adjustments
- Password resets

#### Task Management Actions
- Task creation, updates, deletion
- Task enable/disable
- Point value changes
- Requirement modifications

#### Campaign Management Actions
- Campaign creation, updates, deletion
- Campaign activation/deactivation
- Task assignments to campaigns

#### Bulk Operations
- Bulk status updates
- Bulk deletions
- Bulk point assignments
- Number of records affected

#### System Configuration
- Workflow creation/modification
- Role and permission changes
- Filter preset management
- System settings updates

#### Data Access
- Data exports
- Report generations
- Sensitive data views

### Audit Log Information

Each log entry contains:

#### Basic Information
- **Action**: Type of action performed
- **Timestamp**: Exact date and time
- **Admin**: User who performed the action
- **Admin Email**: Email of the admin user

#### Affected Records
- **Model**: Type of record (User, Task, Campaign, etc.)
- **Record ID**: Unique identifier
- **Record Name**: Human-readable name

#### Change Details
- **Before Data**: State before the change (JSON)
- **After Data**: State after the change (JSON)
- **Changed Fields**: Highlighted differences

#### Context Information
- **IP Address**: Admin's IP address
- **User Agent**: Browser and device information
- **Session ID**: Unique session identifier
- **Request ID**: For tracing related actions

### Viewing Audit Logs

#### List View
- Chronological display (newest first)
- Pagination (50 entries per page)
- Quick filters in header
- Color-coded by action type

#### Detail View
Click any log entry to see:
- Full action details
- Complete before/after comparison
- Related log entries
- Admin notes (if any)

### Filtering Audit Logs

#### By Admin
- Select specific admin user
- View all actions by that admin
- Useful for individual accountability

#### By Action Type
- User actions
- Task actions
- Campaign actions
- Bulk operations
- System changes

#### By Date Range
- Today
- Last 7 days
- Last 30 days
- Custom range

#### By Affected Record
- Search by record ID
- View all changes to specific record
- Track record history

#### By IP Address
- Find all actions from specific IP
- Identify suspicious access patterns

### Security Event Flagging

Certain actions are automatically flagged as security events:

#### High-Risk Actions
- Bulk user deletions
- Role permission changes
- Admin account creation
- System configuration changes

#### Suspicious Patterns
- Multiple failed access attempts
- Unusual access times
- Access from new locations
- Rapid successive actions

#### Compliance Events
- Data exports
- User data access
- Privacy-related changes

Flagged events are:
- Highlighted in red
- Sent to security notification channel
- Require additional review

### Exporting Audit Logs

For compliance and archival purposes:

1. Apply desired filters
2. Click "Export Audit Logs"
3. Select format (CSV or JSON)
4. Choose date range
5. Download file

**Export includes**:
- All filtered log entries
- Complete change details
- Admin information
- Timestamps and context

### Audit Log Retention

- Logs are retained for 2 years by default
- Older logs are archived automatically
- Archived logs can be retrieved on request
- Deletion requires super admin approval

### Compliance Features

#### GDPR Compliance
- Track all personal data access
- Log data export requests
- Record deletion requests
- Maintain consent records

#### SOC 2 Compliance
- Complete audit trail
- Access control logging
- Change management tracking
- Security event monitoring

#### Custom Compliance
- Configurable retention periods
- Custom log categories
- Integration with external SIEM systems

### Best Practices

- Review audit logs regularly
- Investigate flagged security events promptly
- Export logs for long-term archival
- Use logs for training and process improvement
- Include audit log review in security procedures

---

## Role-Based Access Control


Manage admin access with granular permissions and role-based controls.

### Accessing Role Management

Navigate to **Admin Dashboard** → **Roles**

### Default Roles

#### Super Admin
**Full system access**
- All permissions enabled
- Cannot be deleted or modified
- Only one super admin recommended

**Permissions**:
- All user management
- All task management
- All campaign management
- Analytics access
- Audit log access
- Role management
- System configuration
- Workflow management

#### Admin
**Standard administrative access**
- Most common role for admin users
- Cannot manage roles or system settings

**Permissions**:
- View, create, edit users
- View, create, edit tasks
- View, create, edit campaigns
- View analytics
- View audit logs
- Create workflows

#### Moderator
**Limited administrative access**
- Content moderation and user support
- Cannot delete or make major changes

**Permissions**:
- View users
- Edit user status (suspend/activate only)
- View tasks
- View campaigns
- View basic analytics

#### Viewer
**Read-only access**
- For reporting and analysis
- Cannot make any changes

**Permissions**:
- View users
- View tasks
- View campaigns
- View analytics
- View audit logs

### Permission Types

#### User Permissions
- `users.view`: View user list and details
- `users.create`: Create new users
- `users.edit`: Modify user information
- `users.delete`: Delete user accounts
- `users.status`: Change user status
- `users.points`: Adjust user points
- `users.role`: Assign roles to users

#### Task Permissions
- `tasks.view`: View task list and details
- `tasks.create`: Create new tasks
- `tasks.edit`: Modify task information
- `tasks.delete`: Delete tasks
- `tasks.verify`: Verify task completions

#### Campaign Permissions
- `campaigns.view`: View campaigns
- `campaigns.create`: Create campaigns
- `campaigns.edit`: Modify campaigns
- `campaigns.delete`: Delete campaigns
- `campaigns.manage`: Full campaign management

#### Analytics Permissions
- `analytics.view`: View analytics dashboard
- `analytics.export`: Export analytics data
- `analytics.advanced`: Access advanced analytics

#### System Permissions
- `audit.view`: View audit logs
- `audit.export`: Export audit logs
- `roles.view`: View roles
- `roles.manage`: Create and edit roles
- `workflows.view`: View workflows
- `workflows.manage`: Create and edit workflows
- `system.config`: Modify system settings

### Creating Custom Roles

1. Click **Create Role** button
2. Enter role name and description
3. Select permissions:
   - Check individual permissions
   - Or use permission groups (All User Permissions, etc.)
4. Review selected permissions
5. Click **Save Role**

### Editing Roles

1. Click role name in list
2. Modify name, description, or permissions
3. Review changes
4. Click **Save Changes**

**Note**: Changes apply immediately to all users with that role.

### Assigning Roles to Users

#### Individual Assignment
1. Go to user detail page
2. Click "Edit Role"
3. Select role from dropdown
4. Click "Save"

#### Bulk Assignment
1. Select multiple users
2. Choose "Assign Role" from bulk actions
3. Select role
4. Confirm action

### Permission Checking

The system automatically enforces permissions:

#### UI Level
- Unauthorized features are hidden
- Disabled buttons for restricted actions
- Permission-based navigation

#### API Level
- All API requests check permissions
- 403 Forbidden for unauthorized access
- Logged in audit trail

#### Database Level
- Row-level security (where applicable)
- Prevents direct database manipulation

### Permission Inheritance

Roles can inherit permissions from other roles (future feature):
- Create role hierarchies
- Simplify permission management
- Maintain consistency

### Best Practices

#### Role Design
- Create roles based on job functions
- Use principle of least privilege
- Avoid creating too many roles
- Document role purposes

#### Assignment
- Assign roles based on actual needs
- Review role assignments regularly
- Remove unnecessary permissions
- Use temporary elevated access when needed

#### Security
- Limit super admin access
- Require approval for role changes
- Monitor permission usage
- Audit role assignments

### Troubleshooting

**User Can't Access Feature**:
1. Check user's assigned role
2. Verify role has required permission
3. Check if feature is enabled
4. Review audit logs for access attempts

**Permission Changes Not Applied**:
1. Verify role was saved
2. Ask user to log out and back in
3. Clear browser cache
4. Check for conflicting permissions

---

## Campaign Analytics


Detailed analytics for individual campaigns to measure effectiveness and optimize future campaigns.

### Accessing Campaign Analytics

1. Navigate to **Admin Dashboard** → **Campaigns**
2. Click on a campaign name
3. Scroll to **Analytics** section

### Key Campaign Metrics

#### Participation Metrics
- **Total Participants**: Unique users who started any task
- **Participation Rate**: Participants / Total active users
- **New Participants**: First-time campaign participants
- **Returning Participants**: Users from previous campaigns

#### Completion Metrics
- **Total Completions**: All task completions in campaign
- **Completion Rate**: Completions / Total tasks assigned
- **Average Completions per User**: Completions / Participants
- **Full Campaign Completion**: Users who completed all tasks

#### Engagement Metrics
- **Average Time per Task**: Mean completion time
- **Engagement Score**: Composite metric of participation and completion
- **Drop-off Rate**: Users who started but didn't complete
- **Return Rate**: Users who came back after first task

#### Points Metrics
- **Total Points Distributed**: Sum of all points awarded
- **Average Points per User**: Total points / Participants
- **Points Distribution**: Breakdown by task

### Task-Level Performance

View performance breakdown for each task in the campaign:

#### Task Metrics
- Completion count
- Completion rate
- Average completion time
- Success rate (verified completions)
- Points awarded

#### Task Comparison
- Side-by-side comparison of all tasks
- Identify best and worst performing tasks
- Spot bottlenecks in campaign flow

#### Task Insights
- Most popular tasks
- Tasks with highest drop-off
- Tasks taking longest to complete
- Tasks with most verification issues

### Participation Patterns

#### Daily Participation
- Line chart showing daily participant counts
- Identify peak activity days
- Spot declining engagement

#### Weekly Patterns
- Heatmap of activity by day of week
- Identify best days for campaigns
- Plan future campaign timing

#### Hourly Patterns
- Activity by hour of day
- Optimize task release timing
- Schedule notifications effectively

### Campaign Comparison

Compare multiple campaigns side-by-side:

1. Click **Compare Campaigns** button
2. Select campaigns to compare (up to 4)
3. View comparison dashboard

**Comparison Includes**:
- All key metrics side-by-side
- Performance trends
- Participant overlap
- Best practices from top performers

### Automatic Performance Reports

System generates automatic reports at campaign milestones:

#### Mid-Campaign Report (50% duration)
- Current performance vs. goals
- Participation trends
- Recommendations for improvement

#### End-of-Campaign Report
- Final performance summary
- Goal achievement
- Lessons learned
- Recommendations for future campaigns

#### Weekly Digest
- Weekly performance summary
- Notable changes
- Action items

### Exporting Campaign Analytics

#### PDF Report
Comprehensive campaign report including:
- Executive summary
- All key metrics
- Charts and visualizations
- Task breakdown
- Recommendations

**Steps**:
1. Click "Export Report"
2. Select "PDF Format"
3. Choose sections to include
4. Download generated report

#### CSV Data Export
Raw campaign data for custom analysis:
1. Click "Export Data"
2. Select metrics to include
3. Choose date range
4. Download CSV file

### Campaign Insights

AI-powered insights (future feature):
- Predicted completion rates
- Optimal task ordering
- Recommended point values
- Participant segmentation
- Personalized recommendations

### Using Analytics to Improve Campaigns

#### Identify Issues Early
- Monitor participation daily
- Spot declining engagement
- Adjust campaign mid-flight

#### Optimize Task Design
- Learn from high-performing tasks
- Improve or remove low-performing tasks
- Balance difficulty and rewards

#### Improve Timing
- Schedule based on participation patterns
- Avoid low-activity periods
- Coordinate with user time zones

#### Set Realistic Goals
- Use historical data
- Account for campaign type and duration
- Adjust expectations based on audience

---

## Advanced Search


Powerful search capabilities to quickly find users, tasks, completions, and campaigns across the platform.

### Accessing Advanced Search

- Global search bar in admin header (always visible)
- Or navigate to **Admin Dashboard** → **Search**

### Search Features

#### Full-Text Search
Search across multiple fields simultaneously:
- User names, emails, wallet addresses
- Task titles, descriptions
- Campaign names, descriptions
- Completion notes

**Example**: Search "twitter" finds:
- Users with "twitter" in email
- Tasks with "twitter" in title
- Twitter-related completions

#### Search Highlighting
- Matching terms are highlighted in results
- See context around matches
- Quickly identify relevance

#### Autocomplete Suggestions
- Real-time suggestions as you type
- Based on recent searches
- Popular search terms
- Exact matches prioritized

### Search Operators

#### Exact Match
Use quotes for exact phrases:
```
"john.doe@example.com"
```

#### Wildcard
Use asterisk for partial matches:
```
john*
```
Matches: john, johnny, johnson

#### Field-Specific Search
Search specific fields:
```
email:gmail.com
status:active
points:>1000
```

#### Boolean Operators
Combine search terms:

**AND** (all terms must match):
```
active AND verified
```

**OR** (any term can match):
```
suspended OR banned
```

**NOT** (exclude terms):
```
active NOT verified
```

#### Range Searches
Search numeric or date ranges:
```
points:[100 TO 500]
created:[2025-01-01 TO 2025-12-31]
```

### Search Filters

Refine search results with filters:

#### Entity Type
- Users
- Tasks
- Campaigns
- Completions

#### Status
- Active
- Inactive
- Pending
- Completed

#### Date Range
- Created date
- Modified date
- Completion date

#### Numeric Range
- Points
- Completion count
- Task count

### Search Results

#### Result Display
- Grouped by entity type
- Relevance-sorted within groups
- Pagination (20 results per page)

#### Result Actions
- Click to view details
- Quick actions (edit, delete, etc.)
- Add to selection for bulk operations

#### Result Export
Export search results:
1. Perform search
2. Click "Export Results"
3. Choose format (CSV, Excel, JSON)
4. Download file

### Search History

System tracks your recent searches:

#### Viewing History
- Click search bar
- See recent searches dropdown
- Click to repeat search

#### Managing History
- Clear individual searches
- Clear all history
- Disable history tracking

### Search Shortcuts

Create shortcuts for frequent searches:

#### Creating a Shortcut
1. Perform search
2. Click "Save as Shortcut"
3. Enter shortcut name
4. Assign keyboard shortcut (optional)
5. Save

#### Using Shortcuts
- Click shortcuts dropdown
- Or use keyboard shortcut
- Search executes immediately

#### Example Shortcuts
- **Active High-Value**: `status:active points:>1000`
- **Recent Registrations**: `created:>7d`
- **Pending Verifications**: `status:pending_verification`
- **Suspicious Activity**: `flagged:true`

### Search Performance

#### Optimization Tips
- Use specific field searches when possible
- Limit date ranges for faster results
- Use filters to narrow results
- Avoid overly broad searches

#### Search Indexing
- Search index updates every 5 minutes
- Recent changes may not appear immediately
- Manual refresh available

### Advanced Search Techniques

#### Finding Duplicate Users
```
email:* AND status:active
```
Then sort by email to spot duplicates

#### Finding Inactive High-Value Users
```
points:>500 AND last_active:<30d
```

#### Finding Verification Issues
```
status:pending_verification AND created:<7d
```

#### Finding Fraud Patterns
```
completions:>10 AND created:<24h
```

### Search API

For programmatic access (future feature):
- RESTful search endpoint
- Same query syntax
- JSON response format
- Rate limited

---

## Troubleshooting


Common issues and solutions for advanced admin features.

### Bulk Operations Issues

#### Bulk Operation Failed Partially
**Symptoms**: Some records succeeded, others failed

**Causes**:
- Invalid data for some records
- Permission issues
- Database constraints
- Network interruptions

**Solutions**:
1. Review the error summary
2. Check failed record IDs in audit log
3. Fix underlying issues
4. Retry operation on failed records only
5. Use smaller batches for large operations

#### Bulk Operation Taking Too Long
**Symptoms**: Operation doesn't complete or times out

**Causes**:
- Too many records selected
- Server resource constraints
- Complex operations

**Solutions**:
1. Break into smaller batches (max 1000 records)
2. Use filters to reduce selection
3. Schedule during off-peak hours
4. Contact support for very large operations

#### Bulk Delete Confirmation Not Working
**Symptoms**: Cannot confirm deletion

**Causes**:
- Incorrect confirmation text
- Browser autofill interference
- JavaScript errors

**Solutions**:
1. Type "DELETE" exactly (case-sensitive)
2. Disable browser autofill
3. Clear browser cache
4. Try different browser

### Filtering Issues

#### Filters Not Returning Expected Results
**Symptoms**: Results don't match filter criteria

**Causes**:
- Incorrect operator selection
- Case sensitivity issues
- Date format problems
- Cached results

**Solutions**:
1. Verify filter operator (equals vs. contains)
2. Check date format (YYYY-MM-DD)
3. Clear filters and reapply
4. Refresh page
5. Check for conflicting AND/OR logic

#### Filter Preset Won't Save
**Symptoms**: Error when saving preset

**Causes**:
- Duplicate preset name
- Invalid filter configuration
- Permission issues

**Solutions**:
1. Use unique preset name
2. Verify all filters are valid
3. Check role permissions
4. Simplify complex filter combinations

#### Slow Filter Performance
**Symptoms**: Filters take long to apply

**Causes**:
- Large dataset
- Complex filter combinations
- Multiple OR conditions
- Unindexed fields

**Solutions**:
1. Use more specific filters
2. Reduce number of OR conditions
3. Filter by indexed fields first
4. Contact support for database optimization

### Export Issues

#### Export File Empty or Incomplete
**Symptoms**: Downloaded file has no data or missing records

**Causes**:
- Filters too restrictive
- Export timeout
- File generation error
- Browser download issues

**Solutions**:
1. Verify filters return results before exporting
2. Check export email for large datasets
3. Try different export format
4. Use smaller date ranges
5. Check browser download settings

#### Export Email Not Received
**Symptoms**: No email for large export

**Causes**:
- Email in spam folder
- Incorrect email address
- Email service issues
- Export still processing

**Solutions**:
1. Check spam/junk folder
2. Verify email address in profile
3. Wait 15-30 minutes for processing
4. Check export queue status
5. Contact support if >1 hour

#### Excel Export Won't Open
**Symptoms**: Excel file corrupted or won't open

**Causes**:
- Incomplete download
- Excel version compatibility
- Special characters in data
- File size too large

**Solutions**:
1. Re-download file
2. Try opening in Google Sheets
3. Use CSV format instead
4. Split export into smaller files

### Analytics Issues

#### Analytics Not Loading
**Symptoms**: Dashboard shows loading spinner indefinitely

**Causes**:
- Large date range
- Server timeout
- Browser memory issues
- Network problems

**Solutions**:
1. Reduce date range
2. Refresh page
3. Clear browser cache
4. Try different browser
5. Check network connection

#### Charts Showing Incorrect Data
**Symptoms**: Numbers don't match expectations

**Causes**:
- Date range confusion
- Timezone differences
- Cached data
- Filter misunderstanding

**Solutions**:
1. Verify date range selection
2. Check timezone settings
3. Force refresh (Ctrl+F5)
4. Compare with raw data export
5. Review filter criteria

#### PDF Export Fails
**Symptoms**: PDF generation error

**Causes**:
- Too many charts selected
- Server resource limits
- Browser compatibility

**Solutions**:
1. Reduce number of charts
2. Use shorter date range
3. Try again during off-peak hours
4. Export data as CSV instead
5. Contact support for assistance

### Workflow Issues

#### Workflow Not Triggering
**Symptoms**: Expected workflow doesn't execute

**Causes**:
- Workflow disabled
- Conditions not met
- Trigger configuration error
- System error

**Solutions**:
1. Verify workflow is enabled (green toggle)
2. Check trigger conditions match event
3. Review execution logs for errors
4. Test workflow manually
5. Check system status

#### Workflow Actions Failing
**Symptoms**: Workflow triggers but actions don't execute

**Causes**:
- Invalid action configuration
- Missing required fields
- Permission issues
- External service errors (email, etc.)

**Solutions**:
1. Review action configuration
2. Check all required fields are filled
3. Verify admin permissions
4. Test individual actions
5. Check external service status

#### Email Actions Not Sending
**Symptoms**: Workflow executes but emails not received

**Causes**:
- Email template missing
- Invalid recipient address
- Email service configuration
- Rate limiting

**Solutions**:
1. Verify email template exists
2. Check recipient email format
3. Review email service logs
4. Check rate limit status
5. Test email service separately

### Audit Log Issues

#### Audit Logs Not Appearing
**Symptoms**: Recent actions not in audit log

**Causes**:
- Logging delay (up to 1 minute)
- Filter hiding logs
- Permission issues
- System error

**Solutions**:
1. Wait 1-2 minutes and refresh
2. Clear all filters
3. Check date range includes today
4. Verify audit.view permission
5. Check system logs

#### Cannot Export Audit Logs
**Symptoms**: Export button disabled or fails

**Causes**:
- No logs match filters
- Permission issues
- Export size limit
- System error

**Solutions**:
1. Verify filters return results
2. Check audit.export permission
3. Reduce date range
4. Try different format
5. Contact support

### Role and Permission Issues

#### User Can't Access Feature After Role Assignment
**Symptoms**: User still sees "Permission Denied"

**Causes**:
- Session cache
- Role not saved properly
- Permission not included in role
- Browser cache

**Solutions**:
1. Ask user to log out and back in
2. Verify role was saved
3. Check role includes required permission
4. Clear browser cache
5. Verify user has correct role assigned

#### Role Changes Not Taking Effect
**Symptoms**: Permission changes don't apply

**Causes**:
- Active sessions
- Cache issues
- Database replication delay

**Solutions**:
1. Wait 1-2 minutes
2. Ask affected users to re-login
3. Clear application cache
4. Verify changes in database
5. Contact support if persists

### Search Issues

#### Search Returns No Results
**Symptoms**: Search finds nothing despite data existing

**Causes**:
- Search index not updated
- Incorrect search syntax
- Too restrictive filters
- Typos in search term

**Solutions**:
1. Wait 5 minutes for index update
2. Simplify search query
3. Remove filters
4. Check spelling
5. Try wildcard search (*)

#### Search Too Slow
**Symptoms**: Search takes long time

**Causes**:
- Very broad search
- Large dataset
- Complex query
- Server load

**Solutions**:
1. Use more specific search terms
2. Add filters to narrow results
3. Use field-specific search
4. Try during off-peak hours

### General Troubleshooting Steps

1. **Refresh the page**: Solves many caching issues
2. **Clear browser cache**: Ctrl+Shift+Delete
3. **Try different browser**: Rules out browser-specific issues
4. **Check permissions**: Verify your role has required permissions
5. **Review audit logs**: See if action was actually attempted
6. **Check system status**: Look for maintenance notifications
7. **Contact support**: Provide error messages and steps to reproduce

### Getting Help

#### Before Contacting Support

Gather this information:
- Exact error message (screenshot if possible)
- Steps to reproduce the issue
- Your admin username and role
- Browser and version
- Date and time of issue
- Any recent changes made

#### Support Channels

- **Email**: support@sylvantoken.com
- **Admin Help**: Click "?" icon in admin header
- **Documentation**: This guide and inline help
- **System Status**: status.sylvantoken.com

#### Emergency Issues

For critical issues affecting platform operation:
- Use emergency support contact
- Mark as "Critical" priority
- Include impact assessment
- Provide admin contact information

---

## Appendix

### Keyboard Shortcuts

- `Ctrl+K` or `Cmd+K`: Open global search
- `Ctrl+/` or `Cmd+/`: Show keyboard shortcuts
- `Esc`: Close dialogs and modals
- `Ctrl+S` or `Cmd+S`: Save current form
- `Ctrl+E` or `Cmd+E`: Export current view

### API Rate Limits

- Search: 60 requests per minute
- Export: 10 requests per hour
- Bulk operations: 5 requests per minute
- Analytics: 30 requests per minute

### Data Retention Policies

- Audit logs: 2 years
- Export files: 24 hours
- Search history: 90 days
- Workflow logs: 1 year
- Analytics data: Indefinite

### Security Best Practices

1. Use strong, unique passwords
2. Enable two-factor authentication
3. Review audit logs regularly
4. Limit super admin access
5. Use role-based permissions
6. Log out when finished
7. Don't share admin credentials
8. Report suspicious activity immediately

### Performance Recommendations

- Use filters before bulk operations
- Export during off-peak hours
- Limit analytics date ranges
- Archive old campaigns
- Clean up unused filter presets
- Disable unused workflows
- Regular database maintenance

---

## Document Version

- **Version**: 1.0
- **Last Updated**: November 11, 2025
- **Author**: Sylvan Token Platform Team
- **Next Review**: February 11, 2026

For questions or suggestions about this documentation, contact the admin team.
