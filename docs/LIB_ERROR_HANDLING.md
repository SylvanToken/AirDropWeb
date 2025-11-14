# Error Handling Guide

This document describes the error handling utilities and best practices for the Sylvan Token Airdrop Platform.

## Overview

The platform uses a consistent error handling approach across both server-side (API routes) and client-side code.

## Server-Side Error Handling

### API Error Response Format

All API errors follow a consistent format:

```typescript
interface ApiError {
  error: string        // Error type (e.g., "Validation Error", "Not Found")
  message: string      // User-friendly error message
  statusCode: number   // HTTP status code
  details?: any        // Optional additional error details
}
```

### Utility Functions (lib/utils.ts)

#### `createErrorResponse(error, message, statusCode, details?)`

Creates a standardized error response.

```typescript
return createErrorResponse(
  "Not Found",
  "Task not found",
  404
)
```

#### `handleApiError(error)`

Generic error handler that automatically handles:
- Zod validation errors
- Prisma database errors
- Generic JavaScript errors

```typescript
export async function GET() {
  try {
    // Your code here
  } catch (error) {
    return handleApiError(error)
  }
}
```

#### `handlePrismaError(error)`

Specifically handles Prisma errors:
- P2002: Unique constraint violation
- P2025: Record not found
- P2003: Foreign key constraint violation
- P2014: Required relation violation

#### `validateRequest<T>(request, schema)`

Validates request body using Zod schema:

```typescript
const validation = await validateRequest<{ email: string; password: string }>(
  request,
  loginSchema
)

if (!validation.success) {
  return validation.error
}

const { email, password } = validation.data
```

### Example API Route

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { taskSchema } from '@/lib/validations'
import { validateRequest, createErrorResponse, handleApiError } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    // Validate request
    const validation = await validateRequest<{ title: string }>(request, taskSchema)
    
    if (!validation.success) {
      return validation.error
    }

    // Your business logic
    const task = await prisma.task.create({
      data: validation.data
    })

    return NextResponse.json({ data: task }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
```

## Client-Side Error Handling

### API Client (lib/api-client.ts)

#### HTTP Methods

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'

// GET request
const tasks = await apiGet<Task[]>('/api/tasks')

// POST request
const result = await apiPost('/api/completions', { taskId: '123' })

// PUT request
await apiPut('/api/admin/tasks/123', { title: 'Updated' })

// DELETE request
await apiDelete('/api/admin/tasks/123')
```

#### Error Handling

```typescript
import { getErrorMessage, ApiError } from '@/lib/api-client'

try {
  await apiPost('/api/tasks', data)
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.statusCode)  // HTTP status code
    console.log(error.error)       // Error type
    console.log(error.message)     // User-friendly message
  }
  
  // Get user-friendly message
  const message = getErrorMessage(error)
  setError(message)
}
```

### UI Components

#### ErrorMessage Component

Display error messages to users:

```typescript
import { ErrorMessage } from '@/components/ui/error-message'

{error && (
  <ErrorMessage 
    message={error}
    onDismiss={() => setError("")}
  />
)}
```

#### InlineError Component

For inline form errors:

```typescript
import { InlineError } from '@/components/ui/error-message'

{fieldError && <InlineError message={fieldError} />}
```

## Validation Schemas (lib/validations.ts)

All validation schemas use Zod:

```typescript
import { registerSchema, taskSchema } from '@/lib/validations'

// Available schemas:
- registerSchema
- loginSchema
- adminLoginSchema
- taskSchema
- taskUpdateSchema
- completionSchema
- userIdSchema
- taskIdSchema
```

## Error Types and Status Codes

| Status Code | Error Type | Description |
|------------|-----------|-------------|
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (e.g., email already exists) |
| 500 | Internal Server Error | Unexpected server error |

## Best Practices

1. **Always use try-catch blocks** in API routes
2. **Use validateRequest** for request body validation
3. **Use handleApiError** as the catch-all error handler
4. **Use API client functions** (apiGet, apiPost, etc.) on the client side
5. **Display user-friendly error messages** using ErrorMessage component
6. **Log errors** for debugging (already handled by utility functions)
7. **Never expose sensitive information** in error messages

## Example: Complete Form with Error Handling

```typescript
"use client"

import { useState } from "react"
import { apiPost, getErrorMessage } from "@/lib/api-client"
import { ErrorMessage } from "@/components/ui/error-message"
import { Button } from "@/components/ui/button"

export function MyForm() {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await apiPost("/api/tasks", formData)
      // Success handling
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} onDismiss={() => setError("")} />}
      {/* Form fields */}
      <Button type="submit" disabled={isLoading}>
        Submit
      </Button>
    </form>
  )
}
```
