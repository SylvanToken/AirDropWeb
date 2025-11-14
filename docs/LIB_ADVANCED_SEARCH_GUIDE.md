# Advanced Search System Guide

## Overview

The Advanced Search system provides powerful full-text search capabilities across multiple models with features including:

- Full-text search across multiple fields
- Search result highlighting
- Autocomplete suggestions
- Complex query operators (AND, OR, NOT)
- Field-specific searches
- Search history tracking
- Relevance scoring

## Features

### 1. Full-Text Search

Search across multiple fields simultaneously with intelligent relevance scoring.

```typescript
import { performSearch } from '@/lib/admin/search';

const results = await performSearch('user', {
  query: 'john',
  limit: 50,
  offset: 0,
});
```

### 2. Search Result Highlighting

Automatically highlights matching terms in search results:

```typescript
// Results include highlighted text
{
  item: { name: 'John Doe', email: 'john@example.com' },
  highlights: {
    name: '<mark>John</mark> Doe',
    email: '<mark>john</mark>@example.com'
  },
  score: 150,
  matchedFields: ['name', 'email']
}
```

### 3. Autocomplete Suggestions

Get intelligent suggestions as users type:

```typescript
import { getAutocompleteSuggestions } from '@/lib/admin/search';

const suggestions = await getAutocompleteSuggestions('user', 'joh', 10);
// Returns field suggestions, operator suggestions, and value suggestions
```

### 4. Complex Query Operators

Support for advanced query syntax:

#### Field-Specific Search
```
email:john@example.com
name:John
```

#### Quoted Phrases
```
"John Doe"
```

#### Boolean Operators
```
john AND doe
john OR jane
john NOT doe
```

#### Combined Queries
```
email:john@example.com AND status:ACTIVE
"John Doe" OR "Jane Smith"
```

### 5. Search History

Track and manage search history:

```typescript
import {
  getSearchHistory,
  clearSearchHistory,
  deleteSearchHistoryEntry,
} from '@/lib/admin/search';

// Get history
const history = await getSearchHistory(userId, 20);

// Clear all history
await clearSearchHistory(userId);

// Delete specific entry
await deleteSearchHistoryEntry(entryId, userId);
```

## API Endpoints

### POST /api/admin/search

Perform a search query.

**Request Body:**
```json
{
  "model": "user",
  "query": "john",
  "fields": ["name", "email"],
  "operators": [
    { "type": "AND", "value": "active" }
  ],
  "limit": 50,
  "offset": 0
}
```

**Response:**
```json
{
  "results": [
    {
      "item": { ... },
      "score": 150,
      "highlights": { ... },
      "matchedFields": ["name", "email"]
    }
  ],
  "total": 42,
  "query": "john",
  "executionTime": 45
}
```

### GET /api/admin/search/autocomplete

Get autocomplete suggestions.

**Query Parameters:**
- `model`: Model to search (user, task, completion, campaign)
- `query`: Search query
- `limit`: Maximum suggestions (default: 10)

**Response:**
```json
{
  "suggestions": [
    {
      "text": "email:",
      "type": "field",
      "description": "Search in email field"
    },
    {
      "text": "John Doe",
      "type": "value",
      "description": "john@example.com"
    }
  ]
}
```

### GET /api/admin/search/history

Get search history for current user.

**Query Parameters:**
- `limit`: Maximum entries (default: 20)

**Response:**
```json
{
  "history": [
    {
      "id": "...",
      "query": "john",
      "timestamp": "2025-11-10T...",
      "userId": "...",
      "resultCount": 42
    }
  ]
}
```

### DELETE /api/admin/search/history

Delete search history.

**Query Parameters:**
- `id`: Entry ID (optional, if not provided clears all history)

## Component Usage

### AdvancedSearch Component

```tsx
import AdvancedSearch from '@/components/admin/AdvancedSearch';

<AdvancedSearch
  model="user"
  onResultSelect={(result) => {
    console.log('Selected:', result);
    // Navigate to detail page or perform action
  }}
  placeholder="Search users..."
  className="w-full"
/>
```

**Props:**
- `model`: Model to search ('user' | 'task' | 'completion' | 'campaign')
- `onResultSelect`: Callback when result is selected
- `placeholder`: Input placeholder text
- `className`: Additional CSS classes

## Searchable Fields

### User Model
- name
- email
- walletAddress

### Task Model
- title
- description
- type

### Completion Model
- status
- verificationData

### Campaign Model
- name
- description

## Relevance Scoring

Search results are scored based on match quality:

- **Exact match**: 100 points
- **Starts with**: 50 points
- **Contains**: 25 points
- **Field-specific query**: +75 points

Results are automatically sorted by relevance score (highest first).

## Performance Considerations

1. **Debouncing**: Autocomplete requests are debounced by 300ms
2. **Pagination**: Use `limit` and `offset` for large result sets
3. **Field Selection**: Specify `fields` parameter to search only relevant fields
4. **Indexing**: Database indexes on searchable fields improve performance

## Best Practices

1. **Use Field-Specific Searches**: More precise and faster
   ```
   email:john@example.com
   ```

2. **Combine Operators**: Build complex queries
   ```
   status:ACTIVE AND totalPoints:>1000
   ```

3. **Quote Exact Phrases**: For multi-word exact matches
   ```
   "John Doe"
   ```

4. **Limit Results**: Use pagination for better performance
   ```typescript
   { limit: 50, offset: 0 }
   ```

5. **Clear Old History**: Periodically clear search history
   ```typescript
   await clearSearchHistory(userId);
   ```

## Examples

### Basic Search
```typescript
const results = await performSearch('user', {
  query: 'john',
});
```

### Field-Specific Search
```typescript
const results = await performSearch('user', {
  query: 'email:john@example.com',
});
```

### Complex Query with Operators
```typescript
const results = await performSearch('user', {
  query: 'john',
  operators: [
    { type: 'AND', value: 'active' },
    { type: 'NOT', value: 'blocked' },
  ],
});
```

### Search with Custom Fields
```typescript
const results = await performSearch('user', {
  query: 'john',
  fields: ['name', 'email'],
  limit: 20,
});
```

## Troubleshooting

### No Results Found

1. Check query syntax
2. Verify searchable fields
3. Try broader search terms
4. Check database indexes

### Slow Performance

1. Add database indexes on searchable fields
2. Reduce result limit
3. Use field-specific searches
4. Implement caching for frequent queries

### Autocomplete Not Working

1. Verify minimum query length (2 characters)
2. Check debounce timing
3. Verify API endpoint accessibility
4. Check browser console for errors

## Security

- All search endpoints require ADMIN authentication
- Search history is user-specific
- SQL injection protection via Prisma parameterization
- XSS protection via proper HTML escaping in highlights

## Future Enhancements

- [ ] Fuzzy matching for typo tolerance
- [ ] Search filters integration
- [ ] Export search results
- [ ] Saved search queries
- [ ] Search analytics
- [ ] Multi-language search support
- [ ] Search result caching
- [ ] Advanced query builder UI
