# Duration Audit Logging

## Overview

The Duration Audit Logging system provides comprehensive tracking and monitoring of all changes to task time limits and durations. This feature ensures full transparency and accountability for administrative actions related to time-limited tasks.

## Features

### Automatic Logging

All duration-related changes are automatically logged, including:

- **Task Creation with Time Limit**: When a new task is created with a time limit
- **Adding Time Limit**: When a time limit is added to an existing task
- **Removing Time Limit**: When a time limit is removed from a task
- **Increasing Duration**: When the duration is increased
- **Decreasing Duration**: When the duration is decreased

### Logged Information

Each audit log entry captures:

- **Timestamp**: When the change occurred
- **Admin User**: Who made the change (ID and email)
- **Task Information**: Task ID and title
- **Change Type**: Type of modification (see above)
- **Old Values**: Previous duration and expiration timestamp
- **New Values**: Updated duration and expiration timestamp
- **Request Context**: IP address and user agent

## API Endpoints

### Get Duration Change Logs

```
GET /api/admin/audit/duration-changes
```

**Query Parameters:**

- `taskId` (optional): Filter by specific task
- `adminId` (optional): Filter by admin user
- `changeType` (optional): Filter by change type
- `startDate` (optional): Start of date range (ISO 8601)
- `endDate` (optional): End of date range (ISO 8601)
- `limit` (optional): Number of results per page (default: 100)
- `offset` (optional): Pagination offset (default: 0)
- `view` (optional): View type - 'logs', 'stats', 'recent', or 'history'

**Response:**

```json
{
  "data": [
    {
      "id": "log_123",
      "timestamp": "2024-01-15T10:30:00Z",
      "adminId": "admin_456",
      "adminEmail": "admin@example.com",
      "taskId": "task_789",
      "taskTitle": "Complete Twitter Follow",
      "changeType": "INCREASED_DURATION",
      "oldDuration": 2,
      "newDuration": 4,
      "oldExpiresAt": "2024-01-15T12:30:00Z",
      "newExpiresAt": "2024-01-15T14:30:00Z",
      "ipAddress": "192.168.1.1"
    }
  ],
  "total": 150
}
```

### Get Duration Change Statistics

```
GET /api/admin/audit/duration-changes?view=stats
```

**Response:**

```json
{
  "data": {
    "totalChanges": 150,
    "changesByType": [
      { "changeType": "CREATED_WITH_TIME_LIMIT", "count": 50 },
      { "changeType": "INCREASED_DURATION", "count": 30 },
      { "changeType": "DECREASED_DURATION", "count": 25 },
      { "changeType": "ADDED_TIME_LIMIT", "count": 25 },
      { "changeType": "REMOVED_TIME_LIMIT", "count": 20 }
    ],
    "changesByAdmin": [
      { "adminEmail": "admin1@example.com", "count": 80 },
      { "adminEmail": "admin2@example.com", "count": 70 }
    ],
    "tasksWithTimeLimit": 45,
    "tasksWithoutTimeLimit": 105
  }
}
```

### Get Recent Duration Changes

```
GET /api/admin/audit/duration-changes?view=recent&hours=24
```

Returns duration changes from the last N hours (default: 24).

### Get Task Duration History

```
GET /api/admin/audit/duration-changes?view=history&taskId=task_789
```

Returns all duration changes for a specific task.

## Programmatic Usage

### Import Functions

```typescript
import {
  getDurationChangeLogs,
  getTaskDurationHistory,
  getDurationChangeStats,
  getRecentDurationChanges,
  formatDurationChange,
} from '@/lib/admin/duration-audit';
```

### Get Filtered Logs

```typescript
const { logs, total } = await getDurationChangeLogs({
  taskId: 'task_123',
  adminId: 'admin_456',
  changeType: 'INCREASED_DURATION',
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
  },
  limit: 50,
  offset: 0,
});
```

### Get Task History

```typescript
const history = await getTaskDurationHistory('task_123');
console.log(`Task has ${history.length} duration changes`);
```

### Get Statistics

```typescript
const stats = await getDurationChangeStats({
  start: new Date('2024-01-01'),
  end: new Date('2024-01-31'),
});

console.log(`Total changes: ${stats.totalChanges}`);
console.log(`Tasks with time limit: ${stats.tasksWithTimeLimit}`);
```

### Get Recent Changes

```typescript
const recentChanges = await getRecentDurationChanges(24); // Last 24 hours
```

### Format Change for Display

```typescript
const log = logs[0];
const message = formatDurationChange(log);
// Output: "Increased duration for task 'Complete Twitter Follow' from 2h to 4h"
```

## Admin UI

### Duration Change Log Table

A dedicated admin interface is available at:

```
/admin/audit/duration-changes
```

**Features:**

- View all duration changes in a paginated table
- Switch between logs view and statistics view
- See change types with visual indicators
- Filter by date range, admin, or task
- Export logs for compliance

**Statistics View:**

- Total number of changes
- Breakdown by change type
- Breakdown by admin user
- Count of tasks with/without time limits

## Change Types

### CREATED_WITH_TIME_LIMIT

A new task was created with a time limit.

**Example:**
```
Created task "Complete Twitter Follow" with 2h time limit
```

### ADDED_TIME_LIMIT

A time limit was added to an existing task that didn't have one.

**Example:**
```
Added 3h time limit to task "Join Telegram Channel"
```

### REMOVED_TIME_LIMIT

A time limit was removed from a task.

**Example:**
```
Removed time limit from task "Complete Survey" (was 4h)
```

### INCREASED_DURATION

The duration was increased.

**Example:**
```
Increased duration for task "Watch Video" from 1h to 3h
```

### DECREASED_DURATION

The duration was decreased.

**Example:**
```
Decreased duration for task "Complete Quiz" from 6h to 2h
```

## Security Considerations

### Access Control

- Only users with ADMIN role can access duration change logs
- All API endpoints require authentication
- Unauthorized access attempts are logged

### Data Integrity

- Audit logs are immutable (cannot be edited or deleted)
- All changes are timestamped with server time
- IP addresses and user agents are captured for forensics

### Compliance

- Logs support compliance requirements (SOC 2, GDPR, etc.)
- Full audit trail for all administrative actions
- Exportable for external auditing

## Best Practices

### For Administrators

1. **Review Regularly**: Check duration change logs weekly
2. **Document Reasons**: Add comments when making significant changes
3. **Monitor Patterns**: Watch for unusual patterns in duration modifications
4. **Coordinate Changes**: Communicate with team before bulk changes

### For Developers

1. **Use Existing Functions**: Leverage the audit utility functions
2. **Don't Bypass Logging**: Always use the official API endpoints
3. **Test Thoroughly**: Verify audit logs are created correctly
4. **Handle Errors**: Audit logging failures should not break main operations

## Troubleshooting

### Logs Not Appearing

1. Check that the admin user has proper permissions
2. Verify the task update was successful
3. Check database connectivity
4. Review application logs for errors

### Missing Information

1. Ensure all required fields are provided during task updates
2. Verify the session contains admin user information
3. Check that the request context is properly captured

### Performance Issues

1. Use pagination for large result sets
2. Apply date range filters to limit query scope
3. Consider caching statistics for dashboard views
4. Index the AuditLog table on relevant fields

## Database Schema

The audit logs are stored in the `AuditLog` table:

```prisma
model AuditLog {
  id            String   @id @default(cuid())
  action        String   // "taskduration_update" or "taskduration_create"
  adminId       String
  adminEmail    String
  timestamp     DateTime @default(now())
  affectedModel String?  // "TaskDuration"
  affectedId    String?  // Task ID
  beforeData    String?  // JSON with old values
  afterData     String?  // JSON with new values
  ipAddress     String?
  userAgent     String?

  @@index([adminId])
  @@index([action])
  @@index([timestamp])
  @@index([affectedModel])
}
```

## Integration Examples

### Webhook Notification

```typescript
import { getRecentDurationChanges } from '@/lib/admin/duration-audit';

async function notifyDurationChanges() {
  const changes = await getRecentDurationChanges(1); // Last hour
  
  if (changes.length > 0) {
    await fetch('https://webhook.example.com/duration-changes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changes }),
    });
  }
}
```

### Daily Report

```typescript
import { getDurationChangeStats, formatDurationChange } from '@/lib/admin/duration-audit';

async function generateDailyReport() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const stats = await getDurationChangeStats({
    start: yesterday,
    end: today,
  });
  
  console.log(`Daily Duration Changes Report`);
  console.log(`Total Changes: ${stats.totalChanges}`);
  console.log(`\nBy Type:`);
  stats.changesByType.forEach(({ changeType, count }) => {
    console.log(`  ${changeType}: ${count}`);
  });
}
```

## Related Documentation

- [Task Management API](./LIB_README.md)
- [Audit Logging Guide](./LIB_AUDIT_LOGGING_GUIDE.md)
- [Time-Limited Tasks Design](../.kiro/specs/time-limited-tasks/design.md)
- [Admin Security Guide](./LIB_SECURITY_GUIDE.md)
