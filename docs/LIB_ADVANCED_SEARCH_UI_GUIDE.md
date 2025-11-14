# Advanced Search UI Implementation Guide

## Overview

The Advanced Search UI provides a powerful, user-friendly interface for searching across all admin data models (users, tasks, campaigns, completions) with features like autocomplete, search history, result highlighting, and keyboard shortcuts.

## Components

### 1. Global Search Integration (AdminHeader)

The search is integrated into the admin header with:
- **Search Button**: Visible in the header with keyboard shortcut hint (⌘K)
- **Keyboard Shortcut**: Cmd+K (Mac) or Ctrl+K (Windows/Linux) to open search
- **Model Selector**: Quick tabs to switch between searching users, tasks, campaigns, or completions
- **Result Navigation**: Clicking a result navigates to the appropriate detail page

### 2. AdvancedSearch Component

Located at `components/admin/AdvancedSearch.tsx`, this component provides:

#### Features

**Search Input**
- Real-time search with debounced autocomplete (300ms delay)
- Clear button to reset search
- History button to view recent searches
- Loading indicator during search

**Autocomplete Suggestions**
- Field suggestions (e.g., `email:`, `username:`)
- Operator suggestions (AND, OR, NOT)
- Value suggestions from database
- Keyboard navigation (Arrow Up/Down, Enter, Escape)
- Visual badges to distinguish suggestion types

**Search Results**
- Displayed in a modal dialog
- Highlighted matching terms
- Relevance score display
- Matched fields badges
- Click to navigate to detail page
- Execution time and result count

**Search History**
- Recent searches saved automatically
- Click to re-run a search
- Delete individual entries
- Clear all history
- Shows result count and date

**Search Tips**
- Inline help text explaining search syntax
- Field-specific searches: `field:value`
- Exact phrases: `"quoted text"`
- Boolean operators: AND, OR, NOT

## Search Syntax

### Basic Search
```
john
```
Searches across all fields for "john"

### Field-Specific Search
```
email:john@example.com
username:john
walletAddress:0x123
```

### Exact Phrase
```
"John Doe"
```

### Boolean Operators
```
john AND active
twitter OR telegram
NOT blocked
```

### Complex Queries
```
email:john AND status:ACTIVE
"John Doe" OR username:john
```

## API Endpoints

### POST /api/admin/search
Performs the main search operation.

**Request Body:**
```json
{
  "model": "user",
  "query": "john",
  "fields": ["username", "email"],
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
      "item": { /* user/task/campaign/completion object */ },
      "score": 100,
      "highlights": {
        "username": "john (highlighted)",
        "email": "john@example.com (highlighted)"
      },
      "matchedFields": ["username", "email"]
    }
  ],
  "total": 1,
  "query": "john",
  "executionTime": 45
}
```

### GET /api/admin/search/autocomplete
Gets autocomplete suggestions.

**Query Parameters:**
- `model`: user | task | campaign | completion
- `query`: search query
- `limit`: number of suggestions (default: 10)

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
      "text": "john",
      "type": "value",
      "description": "john@example.com"
    }
  ]
}
```

### GET /api/admin/search/history
Gets search history for the current admin user.

**Query Parameters:**
- `limit`: number of entries (default: 20)

**Response:**
```json
{
  "history": [
    {
      "id": "clx123",
      "query": "john",
      "timestamp": "2025-11-10T10:00:00Z",
      "userId": "admin123",
      "resultCount": 5
    }
  ]
}
```

### DELETE /api/admin/search/history
Deletes search history.

**Query Parameters:**
- `id`: (optional) specific entry ID to delete
- If no ID provided, clears all history

## Usage Examples

### Opening Search
```typescript
// Via keyboard shortcut
// Press Cmd+K or Ctrl+K

// Via button click
<Button onClick={() => setSearchOpen(true)}>
  Search
</Button>
```

### Handling Search Results
```typescript
const handleSearchResultSelect = (result: any) => {
  // Navigate based on model type
  switch (searchModel) {
    case 'user':
      router.push(`/admin/users/${result.id}`);
      break;
    case 'task':
      router.push(`/admin/tasks/${result.id}`);
      break;
    case 'campaign':
      router.push(`/admin/campaigns/${result.id}`);
      break;
  }
  setSearchOpen(false);
};
```

### Customizing Search
```typescript
<AdvancedSearch
  model="user"
  onResultSelect={handleResultSelect}
  placeholder="Search users..."
  className="w-full"
/>
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd+K / Ctrl+K | Open search dialog |
| Arrow Down | Navigate to next suggestion |
| Arrow Up | Navigate to previous suggestion |
| Enter | Select suggestion or perform search |
| Escape | Close suggestions/results |

## Styling

The component uses Tailwind CSS and shadcn/ui components for consistent styling:
- Cards for results and suggestions
- Badges for metadata
- Scroll areas for long lists
- Loading states with spinners
- Highlighted text with `<mark>` tags

## Performance Considerations

1. **Debouncing**: Autocomplete requests are debounced by 300ms to reduce API calls
2. **Pagination**: Results are limited to 50 by default
3. **Indexing**: Database queries use indexed fields for fast searches
4. **Caching**: Search history is cached in the component state

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- Focus management
- Semantic HTML
- High contrast highlighting

## Future Enhancements

- [ ] Saved search shortcuts
- [ ] Advanced filter builder UI
- [ ] Export search results
- [ ] Search result previews
- [ ] Multi-model search (search all models at once)
- [ ] Search analytics (popular searches, no-result queries)

## Troubleshooting

### Search not working
1. Check if SearchHistory model exists in Prisma schema
2. Run `npx prisma generate` to regenerate client
3. Verify admin authentication

### Autocomplete not showing
1. Check minimum query length (2 characters)
2. Verify API endpoint is accessible
3. Check browser console for errors

### Results not highlighting
1. Verify search query is being passed correctly
2. Check highlight generation in `lib/admin/search.ts`
3. Ensure `<mark>` tags are allowed in dangerouslySetInnerHTML

## Related Files

- `components/admin/AdvancedSearch.tsx` - Main search component
- `components/layout/AdminHeader.tsx` - Header integration
- `lib/admin/search.ts` - Search logic and utilities
- `app/api/admin/search/route.ts` - Main search API
- `app/api/admin/search/autocomplete/route.ts` - Autocomplete API
- `app/api/admin/search/history/route.ts` - History API
- `prisma/schema.prisma` - SearchHistory model

## Testing

Test the search functionality:

```bash
# Test basic search
curl -X POST http://localhost:3000/api/admin/search \
  -H "Content-Type: application/json" \
  -d '{"model":"user","query":"john"}'

# Test autocomplete
curl http://localhost:3000/api/admin/search/autocomplete?model=user&query=jo

# Test search history
curl http://localhost:3000/api/admin/search/history
```

## Conclusion

The Advanced Search UI provides a comprehensive, user-friendly search experience for admin users. It combines powerful search capabilities with an intuitive interface, making it easy to find and navigate to any data in the system.
