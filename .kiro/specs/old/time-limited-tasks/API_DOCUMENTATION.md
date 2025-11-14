# Time-Limited Tasks API Documentation

## Overview

This document provides comprehensive API documentation for the time-limited tasks feature. The API allows administrators to create tasks with optional time constraints and provides endpoints for task organization, expiration checking, and completion management.

## Base URL

All API endpoints are relative to your application's base URL:
```
https://your-domain.com/api
```

---

## Admin Endpoints

### 1. Create Task

Create a new task with optional time limit.

**Endpoint:** `POST /api/admin/tasks`

**Authentication:** Required (Admin role)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Complete Social Media Follow",
  "description": "Follow us on Twitter and retweet our pinned post",
  "points": 50,
  "taskType": "SOCIAL",
  "taskUrl": "https://twitter.com/yourhandle",
  "isActive": true,
  "isTimeLimited": true,
  "duration": 24
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Task title (max 200 characters) |
| description | string | Yes | Task description |
| points | number | Yes | Points awarded for completion (1-1000) |
| taskType | string | Yes | Task type: SOCIAL, QUIZ, SURVEY, REFERRAL, CUSTOM |
| taskUrl | string | No | External URL for task completion |
| isActive | boolean | Yes | Whether task is active |
| isTimeLimited | boolean | No | Enable time limit (default: false) |
| duration | number | Conditional | Duration in hours (1-24). Required if isTimeLimited is true |

**Response:** `201 Created`
```json
{
  "success": true,
  "task": {
    "id": "clx1234567890",
    "title": "Complete Social Media Follow",
    "description": "Follow us on Twitter and retweet our pinned post",
    "points": 50,
    "taskType": "SOCIAL",
    "taskUrl": "https://twitter.com/yourhandle",
    "isActive": true,
    "duration": 24,
    "expiresAt": "2025-11-13T12:00:00.000Z",
    "createdAt": "2025-11-12T12:00:00.000Z",
    "updatedAt": "2025-11-12T12:00:00.000Z"
  }
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": "Duration must be between 1 and 24 hours"
}
```

`401 Unauthorized` - Not authenticated
```json
{
  "error": "Unauthorized"
}
```

`403 Forbidden` - Not an admin
```json
{
  "error": "Admin access required"
}
```

---

### 2. Update Task

Update an existing task, including time limit settings.

**Endpoint:** `PUT /api/admin/tasks/:id`

**Authentication:** Required (Admin role)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "points": 75,
  "taskType": "SOCIAL",
  "isActive": true,
  "isTimeLimited": true,
  "duration": 12
}
```

**Parameters:**

Same as Create Task endpoint. All fields are optional - only include fields you want to update.

**Response:** `200 OK`
```json
{
  "success": true,
  "task": {
    "id": "clx1234567890",
    "title": "Updated Task Title",
    "description": "Updated description",
    "points": 75,
    "taskType": "SOCIAL",
    "isActive": true,
    "duration": 12,
    "expiresAt": "2025-11-13T00:00:00.000Z",
    "createdAt": "2025-11-12T12:00:00.000Z",
    "updatedAt": "2025-11-12T13:00:00.000Z"
  },
  "auditLog": {
    "id": "clx9876543210",
    "taskId": "clx1234567890",
    "adminId": "admin123",
    "oldDuration": 24,
    "newDuration": 12,
    "oldExpiresAt": "2025-11-13T12:00:00.000Z",
    "newExpiresAt": "2025-11-13T00:00:00.000Z",
    "changedAt": "2025-11-12T13:00:00.000Z"
  }
}
```

**Error Responses:**

`404 Not Found` - Task not found
```json
{
  "error": "Task not found"
}
```

---

### 3. Get Duration Change Audit Logs

Retrieve audit logs for task duration changes.

**Endpoint:** `GET /api/admin/audit/duration-changes`

**Authentication:** Required (Admin role)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 50, max: 100) |
| taskId | string | No | Filter by specific task ID |

**Example Request:**
```
GET /api/admin/audit/duration-changes?page=1&limit=20&taskId=clx1234567890
```

**Response:** `200 OK`
```json
{
  "success": true,
  "logs": [
    {
      "id": "clx9876543210",
      "taskId": "clx1234567890",
      "taskTitle": "Complete Social Media Follow",
      "adminId": "admin123",
      "adminEmail": "admin@example.com",
      "oldDuration": 24,
      "newDuration": 12,
      "oldExpiresAt": "2025-11-13T12:00:00.000Z",
      "newExpiresAt": "2025-11-13T00:00:00.000Z",
      "changedAt": "2025-11-12T13:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

## User Endpoints

### 4. Get Organized Tasks

Retrieve tasks organized into active, completed, and missed categories.

**Endpoint:** `GET /api/tasks/organized`

**Authentication:** Required (User)

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "activeTasks": [
    {
      "id": "clx1234567890",
      "title": "Complete Social Media Follow",
      "description": "Follow us on Twitter and retweet our pinned post",
      "points": 50,
      "taskType": "SOCIAL",
      "taskUrl": "https://twitter.com/yourhandle",
      "isActive": true,
      "duration": 24,
      "expiresAt": "2025-11-13T12:00:00.000Z",
      "createdAt": "2025-11-12T12:00:00.000Z",
      "isCompleted": false,
      "timeRemaining": 82800000
    }
  ],
  "completedTasks": [
    {
      "id": "clx0987654321",
      "title": "Join Telegram Group",
      "description": "Join our official Telegram community",
      "points": 25,
      "taskType": "SOCIAL",
      "isCompleted": true,
      "completedAt": "2025-11-11T15:30:00.000Z"
    }
  ],
  "completedList": [],
  "missedTasks": [
    {
      "id": "clx5555555555",
      "title": "Early Bird Special",
      "description": "Complete within 6 hours",
      "points": 100,
      "taskType": "CUSTOM",
      "duration": 6,
      "expiresAt": "2025-11-10T18:00:00.000Z",
      "isCompleted": false,
      "missedAt": "2025-11-10T18:00:00.000Z"
    }
  ],
  "missedList": []
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| activeTasks | array | Up to 5 active tasks (not completed, not expired) |
| completedTasks | array | 5 most recent completed tasks |
| completedList | array | Additional completed tasks beyond the first 5 |
| missedTasks | array | 5 most recent missed (expired) tasks |
| missedList | array | Additional missed tasks beyond the first 5 |

---

### 5. Check Task Expiration

Check if a specific task has expired.

**Endpoint:** `POST /api/tasks/check-expiration`

**Authentication:** Required (User)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "taskId": "clx1234567890"
}
```

**Response:** `200 OK`

**Not Expired:**
```json
{
  "success": true,
  "isExpired": false,
  "expiresAt": "2025-11-13T12:00:00.000Z",
  "timeRemaining": 82800000
}
```

**Expired:**
```json
{
  "success": true,
  "isExpired": true,
  "expiresAt": "2025-11-10T18:00:00.000Z",
  "expiredAt": "2025-11-10T18:00:00.000Z"
}
```

**No Time Limit:**
```json
{
  "success": true,
  "isExpired": false,
  "hasTimeLimit": false
}
```

**Error Responses:**

`404 Not Found` - Task not found
```json
{
  "error": "Task not found"
}
```

---

### 6. Mark Expired Tasks

Background job endpoint to mark expired tasks (typically called by cron job).

**Endpoint:** `POST /api/tasks/mark-expired`

**Authentication:** Required (System/Admin)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <system-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "markedCount": 12,
  "tasks": [
    {
      "taskId": "clx1234567890",
      "userId": "user123",
      "expiresAt": "2025-11-12T10:00:00.000Z",
      "missedAt": "2025-11-12T10:00:00.000Z"
    }
  ]
}
```

---

### 7. Complete Task

Complete a task and earn points (validates expiration).

**Endpoint:** `POST /api/tasks/:id/complete`

**Authentication:** Required (User)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "completion": {
    "id": "clx7777777777",
    "taskId": "clx1234567890",
    "userId": "user123",
    "completedAt": "2025-11-12T14:30:00.000Z",
    "pointsEarned": 50
  },
  "userPoints": 1250
}
```

**Error Responses:**

`400 Bad Request` - Task expired
```json
{
  "error": "Task has expired and can no longer be completed",
  "expiresAt": "2025-11-12T12:00:00.000Z"
}
```

`409 Conflict` - Already completed
```json
{
  "error": "Task already completed"
}
```

---

## Data Models

### Task Model

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  taskType: 'SOCIAL' | 'QUIZ' | 'SURVEY' | 'REFERRAL' | 'CUSTOM';
  taskUrl?: string;
  isActive: boolean;
  duration?: number;        // Duration in hours (1-24)
  expiresAt?: Date;         // Calculated expiration timestamp
  createdAt: Date;
  updatedAt: Date;
}
```

### TaskWithCompletion Model

```typescript
interface TaskWithCompletion extends Task {
  isCompleted: boolean;
  completedAt?: Date;
  missedAt?: Date;          // When task was missed (expired)
  timeRemaining?: number;   // Milliseconds remaining (client-side)
}
```

### DurationChangeLog Model

```typescript
interface DurationChangeLog {
  id: string;
  taskId: string;
  taskTitle: string;
  adminId: string;
  adminEmail: string;
  oldDuration?: number;
  newDuration?: number;
  oldExpiresAt?: Date;
  newExpiresAt?: Date;
  changedAt: Date;
}
```

---

## Rate Limiting

All API endpoints are rate-limited to prevent abuse:

- **Admin endpoints:** 100 requests per minute
- **User endpoints:** 60 requests per minute
- **System endpoints:** No limit

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699876543
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input data |
| TASK_EXPIRED | 400 | Task has expired |
| ALREADY_COMPLETED | 409 | Task already completed |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Webhooks (Future Enhancement)

Webhook support for task expiration events is planned for a future release:

```json
{
  "event": "task.expired",
  "timestamp": "2025-11-12T12:00:00.000Z",
  "data": {
    "taskId": "clx1234567890",
    "userId": "user123",
    "expiresAt": "2025-11-12T12:00:00.000Z"
  }
}
```

---

## Testing

### Example cURL Commands

**Create Time-Limited Task:**
```bash
curl -X POST https://your-domain.com/api/admin/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Task",
    "description": "Complete within 12 hours",
    "points": 50,
    "taskType": "CUSTOM",
    "isActive": true,
    "isTimeLimited": true,
    "duration": 12
  }'
```

**Get Organized Tasks:**
```bash
curl -X GET https://your-domain.com/api/tasks/organized \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Check Task Expiration:**
```bash
curl -X POST https://your-domain.com/api/tasks/check-expiration \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "taskId": "clx1234567890"
  }'
```

---

## Changelog

### Version 1.0.0 (2025-11-12)
- Initial release of time-limited tasks API
- Added task creation with duration support
- Added organized tasks endpoint
- Added expiration checking
- Added duration change audit logging

---

## Support

For API support or questions:
- Email: api-support@your-domain.com
- Documentation: https://docs.your-domain.com
- Status Page: https://status.your-domain.com
