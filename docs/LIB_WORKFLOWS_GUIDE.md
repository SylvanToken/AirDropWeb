# Workflow Engine Guide

## Overview

The workflow engine enables automated actions based on platform events. Workflows consist of triggers, conditions, and actions that execute automatically when specific events occur.

## Workflow Structure

```typescript
interface Workflow {
  id: string;
  name: string;
  trigger: {
    type: 'user_registered' | 'task_completed' | 'schedule';
    conditions?: WorkflowCondition[];
    scheduleConfig?: {
      cron?: string;
      interval?: number; // minutes
    };
  };
  actions: Array<{
    type: 'send_email' | 'update_status' | 'assign_points' | 'create_notification';
    config: Record<string, any>;
  }>;
  isActive: boolean;
}
```

## Trigger Types

### 1. User Registered
Triggered when a new user registers on the platform.

**Context Available:**
- `userId`: User ID
- `userEmail`: User email
- `username`: Username
- `eventType`: 'user_registered'
- `timestamp`: ISO timestamp

**Example:**
```typescript
{
  type: 'user_registered',
  conditions: [
    {
      field: 'userEmail',
      operator: 'contains',
      value: '@company.com'
    }
  ]
}
```

### 2. Task Completed
Triggered when a user completes a task.

**Context Available:**
- `userId`: User ID
- `userEmail`: User email
- `username`: Username
- `userTotalPoints`: User's total points
- `userStatus`: User status
- `taskId`: Task ID
- `taskTitle`: Task title
- `taskPoints`: Points awarded
- `taskType`: Task type
- `eventType`: 'task_completed'
- `timestamp`: ISO timestamp

**Example:**
```typescript
{
  type: 'task_completed',
  conditions: [
    {
      field: 'taskPoints',
      operator: 'greater_than',
      value: 100
    }
  ]
}
```

### 3. Schedule
Triggered on a schedule (cron or interval).

**Context Available:**
- `eventType`: 'schedule'
- `timestamp`: ISO timestamp

**Example:**
```typescript
{
  type: 'schedule',
  scheduleConfig: {
    interval: 60 // Run every 60 minutes
  }
}
```

## Conditions

Conditions determine whether a workflow should execute. Multiple conditions can be combined with AND/OR logic.

### Condition Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `equals` | Exact match | `{ field: 'status', operator: 'equals', value: 'ACTIVE' }` |
| `not_equals` | Not equal | `{ field: 'status', operator: 'not_equals', value: 'BLOCKED' }` |
| `greater_than` | Numeric comparison | `{ field: 'points', operator: 'greater_than', value: 100 }` |
| `less_than` | Numeric comparison | `{ field: 'points', operator: 'less_than', value: 50 }` |
| `contains` | String/array contains | `{ field: 'email', operator: 'contains', value: '@example.com' }` |
| `in` | Value in array | `{ field: 'taskType', operator: 'in', value: ['TWITTER_FOLLOW', 'TWITTER_LIKE'] }` |
| `not_in` | Value not in array | `{ field: 'status', operator: 'not_in', value: ['BLOCKED', 'DELETED'] }` |

### Combining Conditions

Use the `logic` field to combine conditions:

```typescript
conditions: [
  {
    field: 'taskPoints',
    operator: 'greater_than',
    value: 50,
    logic: 'AND' // Next condition must also be true
  },
  {
    field: 'userStatus',
    operator: 'equals',
    value: 'ACTIVE',
    logic: 'OR' // OR next condition must be true
  },
  {
    field: 'taskType',
    operator: 'equals',
    value: 'TWITTER_FOLLOW'
  }
]
```

### Nested Field Access

Use dot notation to access nested fields:

```typescript
{
  field: 'user.profile.verified',
  operator: 'equals',
  value: true
}
```

## Actions

Actions are executed when workflow conditions are met.

### 1. Assign Points

Award points to a user.

**Required Config:**
- `points`: Number of points to assign (can be negative)

**Example:**
```typescript
{
  type: 'assign_points',
  config: {
    points: 100
  }
}
```

### 2. Update Status

Change a user's status.

**Required Config:**
- `status`: New status value

**Example:**
```typescript
{
  type: 'update_status',
  config: {
    status: 'VERIFIED'
  }
}
```

### 3. Send Email

Send an email to the user (requires email-notifications feature).

**Required Config:**
- `template`: Email template name OR
- `subject`: Email subject (if not using template)
- `to`: Recipient email (optional, defaults to context.userEmail)

**Example:**
```typescript
{
  type: 'send_email',
  config: {
    template: 'welcome_email',
    subject: 'Welcome to Sylvan Token!'
  }
}
```

### 4. Create Notification

Create an in-app notification for the user.

**Required Config:**
- `message`: Notification message
- `type`: Notification type (info, success, warning, error)

**Example:**
```typescript
{
  type: 'create_notification',
  config: {
    message: 'Congratulations on completing your first task!',
    type: 'success'
  }
}
```

## Usage Examples

### Example 1: Welcome Bonus

Award 50 points to new users:

```typescript
{
  name: 'Welcome Bonus',
  trigger: {
    type: 'user_registered'
  },
  actions: [
    {
      type: 'assign_points',
      config: { points: 50 }
    },
    {
      type: 'send_email',
      config: {
        template: 'welcome_email'
      }
    }
  ],
  isActive: true
}
```

### Example 2: High-Value Task Bonus

Award bonus points for completing high-value tasks:

```typescript
{
  name: 'High-Value Task Bonus',
  trigger: {
    type: 'task_completed',
    conditions: [
      {
        field: 'taskPoints',
        operator: 'greater_than',
        value: 100
      }
    ]
  },
  actions: [
    {
      type: 'assign_points',
      config: { points: 25 }
    },
    {
      type: 'create_notification',
      config: {
        message: 'Bonus! You earned 25 extra points for completing a high-value task!',
        type: 'success'
      }
    }
  ],
  isActive: true
}
```

### Example 3: Twitter Task Completion

Special handling for Twitter tasks:

```typescript
{
  name: 'Twitter Task Completion',
  trigger: {
    type: 'task_completed',
    conditions: [
      {
        field: 'taskType',
        operator: 'in',
        value: ['TWITTER_FOLLOW', 'TWITTER_LIKE', 'TWITTER_RETWEET']
      }
    ]
  },
  actions: [
    {
      type: 'assign_points',
      config: { points: 10 }
    }
  ],
  isActive: true
}
```

### Example 4: Milestone Achievement

Reward users who reach 1000 points:

```typescript
{
  name: 'Milestone: 1000 Points',
  trigger: {
    type: 'task_completed',
    conditions: [
      {
        field: 'userTotalPoints',
        operator: 'greater_than',
        value: 1000
      }
    ]
  },
  actions: [
    {
      type: 'assign_points',
      config: { points: 100 }
    },
    {
      type: 'send_email',
      config: {
        template: 'milestone_1000',
        subject: 'Congratulations! You reached 1000 points!'
      }
    }
  ],
  isActive: true
}
```

## API Functions

### Execute Workflow

```typescript
import { executeWorkflow } from '@/lib/admin/workflows';

const result = await executeWorkflow(workflow, context);

console.log(result.success); // true/false
console.log(result.actionsExecuted); // Number of successful actions
console.log(result.actionsFailed); // Number of failed actions
console.log(result.errors); // Array of error messages
console.log(result.executionTime); // Execution time in ms
```

### Trigger Workflows

```typescript
import {
  triggerUserRegisteredWorkflows,
  triggerTaskCompletedWorkflows,
  executeScheduledWorkflows
} from '@/lib/admin/workflows';

// On user registration
await triggerUserRegisteredWorkflows(userId, userEmail, userData);

// On task completion
await triggerTaskCompletedWorkflows(userId, taskId, completionData);

// Run scheduled workflows (call from cron job)
await executeScheduledWorkflows();
```

### Validate Workflow

```typescript
import { validateWorkflow } from '@/lib/admin/workflows';

const validation = validateWorkflow(workflowData);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### Manage Workflows

```typescript
import {
  getWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getWorkflowStats
} from '@/lib/admin/workflows';

// Get all workflows
const workflows = await getWorkflows();

// Create workflow
const newWorkflow = await createWorkflow(workflowData, adminUserId);

// Update workflow
const updated = await updateWorkflow(workflowId, updates);

// Delete workflow
await deleteWorkflow(workflowId);

// Get statistics
const stats = await getWorkflowStats(workflowId);
console.log(stats.totalExecutions);
console.log(stats.successfulExecutions);
console.log(stats.failedExecutions);
console.log(stats.lastExecution);
```

## Error Handling

The workflow engine includes comprehensive error handling:

1. **Action Failures**: If an action fails, the error is logged and the workflow continues with remaining actions
2. **Audit Logging**: All workflow executions and failures are logged to the audit log
3. **Admin Notifications**: Admins are notified when workflows fail
4. **Validation**: Workflows are validated before execution

## Logging and Monitoring

All workflow activity is logged:

- `workflow_started`: Workflow execution began
- `workflow_conditions_not_met`: Conditions were not satisfied
- `workflow_action_executed`: Action completed successfully
- `workflow_action_failed`: Action failed with error
- `workflow_completed`: Workflow finished successfully
- `workflow_execution_failed`: Workflow failed completely

View logs in the audit log system or query directly:

```typescript
import { getAuditLogs } from '@/lib/admin/audit';

const logs = await getAuditLogs({
  action: 'workflow_completed',
  dateRange: {
    start: new Date('2025-01-01'),
    end: new Date('2025-12-31')
  }
});
```

## Best Practices

1. **Keep workflows simple**: Focus on single, clear objectives
2. **Test conditions thoroughly**: Ensure conditions match expected scenarios
3. **Use descriptive names**: Make workflow purpose clear
4. **Monitor execution**: Regularly check workflow statistics
5. **Handle failures gracefully**: Design workflows to continue even if one action fails
6. **Validate before saving**: Always validate workflow configuration
7. **Use appropriate triggers**: Choose the right trigger type for your use case
8. **Document complex logic**: Add comments explaining complex conditions
9. **Test in development**: Test workflows thoroughly before enabling in production
10. **Review audit logs**: Regularly review workflow execution logs

## Troubleshooting

### Workflow Not Executing

1. Check if workflow is active (`isActive: true`)
2. Verify trigger type matches the event
3. Review conditions - they may be too restrictive
4. Check audit logs for condition evaluation results

### Actions Failing

1. Verify required context fields are present
2. Check action configuration (e.g., points value, status value)
3. Review error messages in audit logs
4. Ensure user IDs are valid

### Performance Issues

1. Limit number of active workflows
2. Optimize condition evaluation
3. Use scheduled workflows sparingly
4. Monitor execution times in workflow results

## Security Considerations

1. **Validation**: All workflows are validated before execution
2. **Audit Trail**: Complete audit trail of all workflow executions
3. **Error Isolation**: Action failures don't crash the system
4. **Admin Notifications**: Admins are notified of failures
5. **Context Isolation**: Workflows only access provided context data
