# Audit Logging System - Implementation Guide

## Overview

The audit logging system provides comprehensive tracking of all administrative actions performed on the Sylvan Token Airdrop Platform. This system ensures accountability, security monitoring, and compliance by recording detailed information about every admin operation.

## Features

### Core Capabilities

1. **Automatic Logging**: All admin actions are automatically logged with minimal code overhead
2. **Before/After Tracking**: Captures data state before and after modifications
3. **Request Context**: Automatically captures IP address and user agent
4. **Flexible Filtering**: Query logs by admin, action type, date range, and search terms
5. **Security Event Detection**: Automatically flags security-sensitive operations
6. **Statistics & Analytics**: Provides insights into admin activity patterns

## Database Schema

```prisma
model AuditLog {
  id            String   @id @default(cuid())
  action        String
  adminId       String
  adminEmail    String
  timestamp     DateTime @default(now())
  affectedModel String?
  affectedId    String?
  beforeData    String?  // JSON string
  afterData     String?  // JSON string
  ipAddress     String?
  userAgent     String?

  @@index([adminId])
  @@index([action])
  @@index([timestamp])
}
```

## Core Functions

### `logAuditEvent()`

Logs a single audit event to the database.

```typescript
await logAuditEvent({
  action: 'user_status_updated',
  adminId: session.user.id,
  adminEmail: session.user.email,
  affectedModel: 'User',
  affectedId: userId,
  beforeData: { status: 'ACTIVE' },
  afterData: { status: 'BLOCKED' },
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});
```

### `logAuditEventFromRequest()`

Convenience function that automatically extracts IP address and user agent from the request.

```typescript
await logAuditEventFromRequest(request, {
  action: 'workflow_created',
  affectedModel: 'Workflow',
  affectedId: workflow.id,
  afterData: { name: workflow.name },
});
```

### `logCrudOperation()`

Helper for logging CRUD operations with before/after data.

```typescript
await logCrudOperation(
  request,
  'update',
  'User',
  userId,
  beforeData,
  afterData
);
```

### `logBulkOperation()`

Helper for logging bulk operations.

```typescript
await logBulkOperation(
  request,
  'delete',
  'User',
  affectedCount,
  { userIds: [...] }
);
```

### `getAuditLogs()`

Retrieve audit logs with filtering and pagination.

```typescript
const { logs, total } = await getAuditLogs({
  adminId: 'user123',
  action: 'user_delete',
  dateRange: {
    start: new Date('2025-01-01'),
    end: new Date('2025-12-31'),
  },
  search: 'john@example.com',
  limit: 50,
  offset: 0,
});
```

### `getSecurityEvents()`

Retrieve only security-sensitive events.

```typescript
const { logs, total } = await getSecurityEvents({
  dateRange: {
    start: startDate,
    end: endDate,
  },
  limit: 100,
});
```

### `getAuditStats()`

Get statistics about audit log activity.

```typescript
const stats = await getAuditStats({
  start: new Date('2025-01-01'),
  end: new Date('2025-12-31'),
});

// Returns:
// {
//   totalEvents: 1234,
//   eventsByAction: [{ action: 'user_delete', count: 45 }, ...],
//   eventsByAdmin: [{ adminEmail: 'admin@example.com', count: 234 }, ...],
//   securityEventCount: 67
// }
```

## Action Types

### User Management
- `user_created`
- `user_updated`
- `user_status_updated`
- `user_deleted`
- `bulk_update_status`
- `bulk_delete`
- `bulk_assign_points`

### Task Management
- `task_created`
- `task_updated`
- `task_deleted`

### Campaign Management
- `campaign_created`
- `campaign_updated`
- `campaign_deleted`

### Workflow Management
- `workflow_created`
- `workflow_updated`
- `workflow_deleted`
- `workflow_started`
- `workflow_completed`
- `workflow_execution_failed`
- `workflow_action_executed`
- `workflow_action_failed`
- `workflow_conditions_not_met`

### Verification
- `completion_approved`
- `completion_rejected`

### Data Operations
- `export_queued`
- `export_completed`
- `export_failed`
- `filter_preset_created`
- `filter_preset_updated`
- `filter_preset_deleted`

### Security Events
- `database_reset`
- `unauthorized_access`
- `admin_login_failed`

## Security-Sensitive Actions

The following actions are automatically flagged as security events:

- `user_delete`
- `bulk_delete`
- `role_change`
- `permission_change`
- `admin_login_failed`
- `unauthorized_access`
- `data_export`
- `database_reset`

## Usage Examples

### In API Routes

```typescript
import { logAuditEventFromRequest } from '@/lib/admin/audit';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  // Get data before deletion
  const userBefore = await prisma.user.findUnique({
    where: { id: params.id },
  });
  
  // Perform deletion
  await prisma.user.delete({ where: { id: params.id } });
  
  // Log audit event
  await logAuditEventFromRequest(request, {
    action: 'user_deleted',
    affectedModel: 'User',
    affectedId: params.id,
    beforeData: userBefore,
  });
  
  return NextResponse.json({ success: true });
}
```

### In Bulk Operations

```typescript
// Individual operations are logged automatically
for (const userId of userIds) {
  await logAuditEvent({
    action: 'user_status_updated',
    adminId,
    adminEmail,
    affectedModel: 'User',
    affectedId: userId,
    beforeData: { status: oldStatus },
    afterData: { status: newStatus },
  });
}

// Summary log for bulk operation
await logAuditEvent({
  action: 'bulk_update_status',
  adminId,
  adminEmail,
  affectedModel: 'User',
  afterData: {
    successful: successCount,
    failed: failedCount,
    totalUsers: userIds.length,
  },
});
```

### In Workflows

```typescript
// Workflows automatically log their execution
await logAuditEvent({
  action: 'workflow_started',
  adminId: 'system',
  adminEmail: 'system',
  affectedModel: 'Workflow',
  affectedId: workflow.id,
  afterData: { context },
});
```

## API Endpoints

### GET /api/admin/audit-logs

Retrieve audit logs with filtering.

**Query Parameters:**
- `adminId`: Filter by admin user ID
- `action`: Filter by action type
- `affectedModel`: Filter by affected model
- `startDate`: Start of date range (ISO string)
- `endDate`: End of date range (ISO string)
- `search`: Search term
- `limit`: Number of records (default 100)
- `offset`: Number of records to skip (default 0)
- `type`: 'all' | 'security' | 'stats' (default 'all')

**Example:**
```bash
GET /api/admin/audit-logs?action=user_delete&startDate=2025-01-01&limit=50
```

**Response:**
```json
{
  "logs": [
    {
      "id": "log123",
      "action": "user_deleted",
      "adminId": "admin123",
      "adminEmail": "admin@example.com",
      "timestamp": "2025-01-15T10:30:00Z",
      "affectedModel": "User",
      "affectedId": "user456",
      "beforeData": { "email": "user@example.com", "status": "ACTIVE" },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    }
  ],
  "total": 1
}
```

### GET /api/admin/audit-logs?type=security

Retrieve only security-sensitive events.

### GET /api/admin/audit-logs?type=stats

Get audit log statistics.

**Response:**
```json
{
  "totalEvents": 1234,
  "eventsByAction": [
    { "action": "user_delete", "count": 45 },
    { "action": "task_created", "count": 123 }
  ],
  "eventsByAdmin": [
    { "adminEmail": "admin@example.com", "count": 234 }
  ],
  "securityEventCount": 67
}
```

## Best Practices

### 1. Always Log Admin Actions

Every admin action that modifies data should be logged:

```typescript
// ✅ Good
await prisma.user.update({ ... });
await logAuditEvent({ ... });

// ❌ Bad
await prisma.user.update({ ... });
// No audit log!
```

### 2. Capture Before/After Data

For updates and deletes, always capture the state before the operation:

```typescript
// ✅ Good
const before = await prisma.user.findUnique({ where: { id } });
await prisma.user.update({ where: { id }, data: { ... } });
await logAuditEvent({
  beforeData: before,
  afterData: updatedData,
});

// ❌ Bad
await prisma.user.update({ ... });
await logAuditEvent({
  afterData: updatedData,
  // Missing beforeData!
});
```

### 3. Use Descriptive Action Names

Action names should be clear and follow a consistent pattern:

```typescript
// ✅ Good
action: 'user_status_updated'
action: 'bulk_delete'
action: 'workflow_created'

// ❌ Bad
action: 'update'
action: 'delete_users'
action: 'new_workflow'
```

### 4. Include Relevant Context

Add context that helps understand what happened:

```typescript
// ✅ Good
afterData: {
  status: 'BLOCKED',
  reason: 'Suspicious activity detected',
  affectedUsers: 5,
}

// ❌ Bad
afterData: {
  status: 'BLOCKED',
}
```

### 5. Don't Throw on Audit Failures

Audit logging should never break the main operation:

```typescript
// ✅ Good
try {
  await logAuditEvent({ ... });
} catch (error) {
  console.error('Failed to log audit event:', error);
  // Continue with main operation
}

// ❌ Bad
await logAuditEvent({ ... }); // If this throws, operation fails
```

## Performance Considerations

1. **Async Logging**: Audit logs are written asynchronously and don't block the main operation
2. **Indexed Fields**: `adminId`, `action`, and `timestamp` are indexed for fast queries
3. **JSON Storage**: Before/after data is stored as JSON strings to support flexible schemas
4. **Pagination**: Always use pagination when querying large result sets

## Security Considerations

1. **Sensitive Data**: Be careful not to log passwords or other sensitive credentials
2. **PII Protection**: Consider data retention policies for personally identifiable information
3. **Access Control**: Only admins should be able to view audit logs
4. **Immutability**: Audit logs should never be modified or deleted (except for compliance)

## Monitoring & Alerts

Consider setting up alerts for:

- High frequency of failed operations
- Security-sensitive actions (deletes, exports, database resets)
- Unusual activity patterns (e.g., bulk operations at odd hours)
- Multiple failed login attempts

## Compliance

The audit logging system helps meet compliance requirements for:

- **GDPR**: Track data access and modifications
- **SOC 2**: Demonstrate security controls and monitoring
- **ISO 27001**: Maintain audit trails for security events
- **Internal Policies**: Accountability and transparency

## Troubleshooting

### Logs Not Appearing

1. Check database connection
2. Verify Prisma client is generated
3. Check for errors in console
4. Ensure audit logging code is being executed

### Performance Issues

1. Add indexes to frequently queried fields
2. Use pagination for large result sets
3. Consider archiving old logs
4. Optimize JSON data size

### Missing Context

1. Ensure `logAuditEventFromRequest()` is used in API routes
2. Check that request object is passed correctly
3. Verify headers are being forwarded (for IP address)

## Future Enhancements

Potential improvements to consider:

1. **Real-time Monitoring**: WebSocket-based live audit log viewer
2. **Anomaly Detection**: ML-based detection of unusual patterns
3. **Export Functionality**: Export audit logs to external systems
4. **Retention Policies**: Automatic archiving of old logs
5. **Advanced Search**: Full-text search across all fields
6. **Visualization**: Charts and graphs of audit activity

## Related Documentation

- [Bulk Operations Guide](./BULK_OPERATIONS_GUIDE.md)
- [Workflows Guide](./WORKFLOWS_GUIDE.md)
- [Security Best Practices](../../SECURITY.md)

## Support

For questions or issues with the audit logging system, please contact the development team or refer to the main project documentation.
