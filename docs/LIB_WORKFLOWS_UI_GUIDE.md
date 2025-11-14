# Workflow Management UI Guide

## Overview

The Workflow Management UI provides a comprehensive interface for creating, managing, and testing automated workflows in the Sylvan Token Airdrop Platform. This guide covers all aspects of the workflow management system.

## Features

### 1. Workflow List View

The main workflows page (`/admin/workflows`) displays all workflows with:

- **Workflow Cards**: Each workflow is displayed in a card showing:
  - Name and active/inactive status
  - Trigger type (User Registered, Task Completed, Scheduled)
  - Number of conditions (if any)
  - List of actions
  - Execution statistics (total runs, success rate, successful/failed counts)
  
- **Quick Actions**:
  - Test: Execute the workflow with test data
  - Edit: Open the workflow builder to modify the workflow
  - Delete: Remove the workflow (with confirmation)
  - Enable/Disable: Toggle workflow active status

### 2. Workflow Builder

The WorkflowBuilder component provides a comprehensive form for creating and editing workflows:

#### Workflow Details
- **Name**: Descriptive name for the workflow
- **Active Status**: Toggle to enable/disable the workflow

#### Trigger Configuration
- **Trigger Types**:
  - User Registered: Triggers when a new user signs up
  - Task Completed: Triggers when a user completes a task
  - Scheduled: Triggers at regular intervals

- **Schedule Configuration** (for scheduled workflows):
  - Interval in minutes

- **Conditions** (optional):
  - Add multiple conditions with AND/OR logic
  - Field, operator, and value configuration
  - Supported operators: equals, not_equals, greater_than, less_than, contains, in, not_in

#### Actions
Add one or more actions to execute when the workflow triggers:

1. **Send Email**
   - Email template name
   - Subject line

2. **Update Status**
   - New user status (ACTIVE, BLOCKED, PENDING)

3. **Assign Points**
   - Points to add (positive) or deduct (negative)

4. **Create Notification**
   - Notification message
   - Notification type (info, success, warning, error)

### 3. Workflow Testing

Test workflows without affecting production data:

- Click "Test" button on any workflow
- System executes workflow with test context:
  ```json
  {
    "userId": "test-user",
    "userEmail": "test@example.com",
    "username": "testuser",
    "isTest": true
  }
  ```
- View execution results:
  - Success/failure status
  - Number of actions executed
  - Execution time
  - Error messages (if any)

### 4. Workflow Statistics

Each workflow displays real-time statistics:

- **Total Runs**: Number of times the workflow has executed
- **Success Rate**: Percentage of successful executions
- **Successful**: Count of successful executions (green)
- **Failed**: Count of failed executions (red)

Statistics are loaded asynchronously and updated when workflows are modified.

## API Endpoints

### GET /api/admin/workflows
Fetch all workflows for the authenticated admin.

**Response:**
```json
[
  {
    "id": "workflow-id",
    "name": "Welcome New Users",
    "trigger": {
      "type": "user_registered",
      "conditions": []
    },
    "actions": [
      {
        "type": "send_email",
        "config": {
          "template": "welcome",
          "subject": "Welcome to Sylvan Token!"
        }
      }
    ],
    "isActive": true
  }
]
```

### POST /api/admin/workflows
Create a new workflow.

**Request Body:**
```json
{
  "name": "Reward Task Completion",
  "trigger": {
    "type": "task_completed",
    "conditions": [
      {
        "field": "taskPoints",
        "operator": "greater_than",
        "value": 50
      }
    ]
  },
  "actions": [
    {
      "type": "assign_points",
      "config": {
        "points": 10
      }
    }
  ],
  "isActive": true
}
```

**Response:** Created workflow object

### PATCH /api/admin/workflows/[id]
Update an existing workflow.

**Request Body:** Partial workflow object with fields to update

**Response:** Updated workflow object

### DELETE /api/admin/workflows/[id]
Delete a workflow.

**Response:**
```json
{
  "success": true
}
```

### GET /api/admin/workflows/[id]
Get workflow execution statistics.

**Response:**
```json
{
  "totalExecutions": 150,
  "successfulExecutions": 145,
  "failedExecutions": 5,
  "lastExecution": "2025-01-10T12:00:00Z"
}
```

### POST /api/admin/workflows/[id]/test
Test a workflow with sample data.

**Request Body:**
```json
{
  "context": {
    "userId": "test-user",
    "userEmail": "test@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "actionsExecuted": 2,
  "actionsFailed": 0,
  "errors": [],
  "executionTime": 125
}
```

## Components

### WorkflowBuilder
**Location:** `components/admin/WorkflowBuilder.tsx`

**Props:**
- `workflow?: Workflow` - Existing workflow to edit (optional)
- `onSave: (workflow: Omit<Workflow, 'id'>) => void` - Save callback
- `onCancel: () => void` - Cancel callback
- `isSaving?: boolean` - Loading state

**Features:**
- Form validation
- Dynamic action configuration based on action type
- Condition builder with AND/OR logic
- Schedule configuration for scheduled workflows
- Visual feedback for all interactions

### Workflows Page
**Location:** `app/admin/(dashboard)/workflows/page.tsx`

**Features:**
- Workflow list with cards
- Create workflow dialog
- Edit workflow dialog
- Delete confirmation dialog
- Workflow testing
- Real-time statistics loading
- Toast notifications for all actions

## Toast Notification System

The workflow UI uses a toast notification system for user feedback:

**Components:**
- `components/ui/toast.tsx` - Toast primitives
- `components/ui/toaster.tsx` - Toast container
- `components/ui/use-toast.ts` - Toast hook

**Usage:**
```typescript
import { useToast } from '@/components/ui/use-toast'

const { toast } = useToast()

toast({
  title: 'Success',
  description: 'Workflow created successfully',
})

toast({
  title: 'Error',
  description: 'Failed to create workflow',
  variant: 'destructive',
})
```

## Navigation

The Workflows link is added to the admin sidebar:
- Icon: Zap (lightning bolt)
- Color: Yellow to orange gradient
- Position: Between Users and Verifications

## Best Practices

### Creating Workflows

1. **Use Descriptive Names**: Make workflow names clear and specific
   - Good: "Welcome New Users with Bonus Points"
   - Bad: "Workflow 1"

2. **Test Before Activating**: Always test workflows before enabling them
   - Use the Test button to verify behavior
   - Check execution results and timing

3. **Use Conditions Wisely**: Add conditions to prevent unnecessary executions
   - Example: Only send welcome email to users with verified emails

4. **Keep Actions Simple**: Break complex workflows into multiple smaller workflows
   - Easier to debug
   - Better performance
   - More maintainable

### Managing Workflows

1. **Monitor Statistics**: Regularly check workflow execution statistics
   - High failure rates indicate issues
   - Zero executions might mean conditions are too restrictive

2. **Disable Unused Workflows**: Turn off workflows that are no longer needed
   - Reduces system load
   - Prevents unintended executions

3. **Document Complex Logic**: Add comments in workflow names or use clear field names
   - Example: "Send Reminder - Users Inactive 7+ Days"

### Testing Workflows

1. **Use Realistic Test Data**: Provide context that matches real scenarios
2. **Test Edge Cases**: Try workflows with missing or invalid data
3. **Check Execution Time**: Ensure workflows complete quickly (< 5 seconds)
4. **Verify Actions**: Confirm that actions execute as expected

## Troubleshooting

### Workflow Not Executing

1. Check if workflow is active (toggle should be on)
2. Verify trigger type matches the event
3. Review conditions - they might be too restrictive
4. Check audit logs for execution attempts

### Actions Failing

1. Use the Test button to see specific error messages
2. Verify action configuration (e.g., valid email template, status values)
3. Check that required fields are present in the context
4. Review audit logs for detailed error information

### Low Success Rate

1. Review failed execution logs in audit system
2. Check if actions require data that's not always available
3. Verify external dependencies (e.g., email service)
4. Consider adding error handling or fallback actions

## Security Considerations

1. **Admin Only**: Workflow management is restricted to ADMIN role users
2. **Validation**: All workflow configurations are validated before saving
3. **Audit Logging**: All workflow operations are logged for accountability
4. **Test Mode**: Test executions are clearly marked and logged separately

## Future Enhancements

Potential improvements for the workflow system:

1. **Workflow Templates**: Pre-built workflows for common scenarios
2. **Advanced Scheduling**: Cron expression support for complex schedules
3. **Workflow Versioning**: Track changes and rollback capabilities
4. **Conditional Actions**: Execute actions based on previous action results
5. **Workflow Analytics**: Detailed performance metrics and insights
6. **Email Preview**: Preview email content before sending
7. **Workflow Duplication**: Clone existing workflows as templates
8. **Bulk Operations**: Enable/disable multiple workflows at once

## Related Documentation

- [Workflows Implementation Guide](./WORKFLOWS_GUIDE.md) - Technical implementation details
- [Audit Logging](./audit.ts) - Audit system integration
- [Admin Permissions](./permissions.ts) - Access control

## Support

For issues or questions about the workflow management system:
1. Check the audit logs for detailed error information
2. Review workflow execution statistics
3. Test workflows in isolation to identify issues
4. Consult the technical implementation guide for advanced troubleshooting
