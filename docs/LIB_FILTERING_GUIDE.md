# Advanced Filtering System Guide

## Overview

The advanced filtering system provides a flexible way to filter data using multiple criteria with various operators and logic combinations (AND/OR).

## Features

- **Multiple Operators**: equals, contains, gt, lt, between, in
- **Logic Combinations**: AND/OR logic for combining filters
- **Filter Presets**: Save and load frequently used filters
- **Validation**: Built-in validation for filter criteria
- **Type Safety**: Full TypeScript support

## Filter Operators

### equals
Exact match for a field value.
```typescript
{ field: 'status', operator: 'equals', value: 'ACTIVE' }
```

### contains
Case-insensitive substring search.
```typescript
{ field: 'email', operator: 'contains', value: 'test' }
```

### gt (Greater Than)
Numeric or date comparison.
```typescript
{ field: 'totalPoints', operator: 'gt', value: 100 }
```

### lt (Less Than)
Numeric or date comparison.
```typescript
{ field: 'totalPoints', operator: 'lt', value: 500 }
```

### between
Range filter (inclusive).
```typescript
{ field: 'totalPoints', operator: 'between', value: [100, 500] }
```

### in
Match any value in an array.
```typescript
{ field: 'status', operator: 'in', value: ['ACTIVE', 'PENDING'] }
```

## Logic Operators

### AND (Default)
All conditions must be true. This is the default when no logic is specified.
```typescript
const criteria: FilterCriteria[] = [
  { field: 'status', operator: 'equals', value: 'ACTIVE' },
  { field: 'totalPoints', operator: 'gt', value: 100 },
];
// Result: status = 'ACTIVE' AND totalPoints > 100
```

### OR
Any condition can be true.
```typescript
const criteria: FilterCriteria[] = [
  { field: 'status', operator: 'equals', value: 'ACTIVE', logic: 'OR' },
  { field: 'status', operator: 'equals', value: 'PENDING', logic: 'OR' },
];
// Result: status = 'ACTIVE' OR status = 'PENDING'
```

### Combining AND and OR
You can mix AND and OR logic. Criteria without a logic operator default to AND.
```typescript
const criteria: FilterCriteria[] = [
  { field: 'totalPoints', operator: 'gt', value: 1000 }, // AND
  { field: 'walletVerified', operator: 'equals', value: true }, // AND
  { field: 'status', operator: 'equals', value: 'ACTIVE', logic: 'OR' },
  { field: 'status', operator: 'equals', value: 'PENDING', logic: 'OR' },
];
// Result: totalPoints > 1000 AND walletVerified = true AND (status = 'ACTIVE' OR status = 'PENDING')
```

## Usage Examples

### Basic Filtering

```typescript
import { buildPrismaFilter, FilterCriteria } from '@/lib/admin/filters';
import { prisma } from '@/lib/prisma';

// Filter active users
const criteria: FilterCriteria[] = [
  { field: 'status', operator: 'equals', value: 'ACTIVE' },
];

const filter = buildPrismaFilter(criteria);
const users = await prisma.user.findMany({ where: filter });
```

### Range Filtering

```typescript
// Users with points between 100 and 500
const criteria: FilterCriteria[] = [
  { field: 'totalPoints', operator: 'between', value: [100, 500] },
];

const filter = buildPrismaFilter(criteria);
const users = await prisma.user.findMany({ where: filter });
```

### Search Across Multiple Fields

```typescript
// Search for users by email, username, or wallet address
const searchTerm = 'john';
const criteria: FilterCriteria[] = [
  { field: 'email', operator: 'contains', value: searchTerm, logic: 'OR' },
  { field: 'username', operator: 'contains', value: searchTerm, logic: 'OR' },
  { field: 'walletAddress', operator: 'contains', value: searchTerm, logic: 'OR' },
];

const filter = buildPrismaFilter(criteria);
const users = await prisma.user.findMany({ where: filter });
```

### Complex Filtering

```typescript
// Active or pending users with high points and verified wallet
const criteria: FilterCriteria[] = [
  { field: 'totalPoints', operator: 'gt', value: 1000 },
  { field: 'walletVerified', operator: 'equals', value: true },
  { field: 'status', operator: 'equals', value: 'ACTIVE', logic: 'OR' },
  { field: 'status', operator: 'equals', value: 'PENDING', logic: 'OR' },
];

const filter = buildPrismaFilter(criteria);
const users = await prisma.user.findMany({ where: filter });
```

## Filter Presets

### Saving a Filter Preset

```typescript
import { saveFilterPreset } from '@/lib/admin/filters';

const preset = await saveFilterPreset({
  name: 'High Value Active Users',
  criteria: [
    { field: 'status', operator: 'equals', value: 'ACTIVE' },
    { field: 'totalPoints', operator: 'gt', value: 1000 },
    { field: 'walletVerified', operator: 'equals', value: true },
  ],
  createdBy: userId,
});
```

### Loading Filter Presets

```typescript
import { getFilterPresets, getFilterPresetById } from '@/lib/admin/filters';

// Get all presets for a user
const presets = await getFilterPresets(userId);

// Get a specific preset
const preset = await getFilterPresetById(presetId, userId);

// Use the preset
if (preset) {
  const filter = buildPrismaFilter(preset.criteria);
  const users = await prisma.user.findMany({ where: filter });
}
```

### Updating a Filter Preset

```typescript
import { updateFilterPreset } from '@/lib/admin/filters';

const updated = await updateFilterPreset(presetId, userId, {
  name: 'Updated Preset Name',
  criteria: [
    { field: 'status', operator: 'equals', value: 'ACTIVE' },
  ],
});
```

### Deleting a Filter Preset

```typescript
import { deleteFilterPreset } from '@/lib/admin/filters';

const success = await deleteFilterPreset(presetId, userId);
```

## Validation

Always validate filter criteria before using them:

```typescript
import { validateFilterCriteria } from '@/lib/admin/filters';

const criteria: FilterCriteria[] = [
  { field: 'status', operator: 'equals', value: 'ACTIVE' },
];

const validation = validateFilterCriteria(criteria);

if (!validation.valid) {
  console.error('Invalid criteria:', validation.errors);
  return;
}

// Proceed with filtering
const filter = buildPrismaFilter(criteria);
```

## API Endpoints

### GET /api/admin/filter-presets
Get all filter presets for the current admin user.

**Response:**
```json
{
  "presets": [
    {
      "id": "preset_id",
      "name": "High Value Users",
      "criteria": [...],
      "createdBy": "user_id"
    }
  ]
}
```

### POST /api/admin/filter-presets
Create a new filter preset.

**Request:**
```json
{
  "name": "My Filter",
  "criteria": [
    { "field": "status", "operator": "equals", "value": "ACTIVE" }
  ]
}
```

### GET /api/admin/filter-presets/:id
Get a specific filter preset.

### PATCH /api/admin/filter-presets/:id
Update a filter preset.

**Request:**
```json
{
  "name": "Updated Name",
  "criteria": [...]
}
```

### DELETE /api/admin/filter-presets/:id
Delete a filter preset.

## Best Practices

1. **Use Validation**: Always validate criteria before building filters
2. **Save Common Filters**: Create presets for frequently used filters
3. **Combine with Pagination**: Use filters with pagination for large datasets
4. **Index Fields**: Ensure filtered fields are indexed in the database
5. **Test Complex Filters**: Test complex AND/OR combinations thoroughly
6. **Document Presets**: Give presets descriptive names

## Performance Considerations

- Index frequently filtered fields in your Prisma schema
- Use `between` instead of separate `gt` and `lt` when possible
- Limit the number of OR conditions for better performance
- Consider caching filter results for expensive queries
- Use pagination with filters to avoid loading large datasets

## Troubleshooting

### Filter returns no results
- Check that field names match your Prisma schema exactly
- Verify that values are the correct type (string, number, boolean)
- Test each criterion individually to identify the issue

### Validation errors
- Ensure `between` operator uses an array of two values
- Ensure `in` operator uses an array of values
- Check that logic operators are either 'AND' or 'OR'

### Performance issues
- Add database indexes for filtered fields
- Reduce the number of OR conditions
- Use more specific filters to reduce result sets
- Consider using full-text search for text fields
