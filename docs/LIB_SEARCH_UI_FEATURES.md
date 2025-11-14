# Advanced Search UI - Feature Reference

## Quick Reference Guide

### Opening Search

**Method 1: Click Button**
- Look for the "Search" button in the admin header (top right)
- Button shows search icon and keyboard shortcut hint (⌘K)

**Method 2: Keyboard Shortcut**
- Mac: `Cmd + K`
- Windows/Linux: `Ctrl + K`

### Search Dialog Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Global Search                                          [X]   │
│ Search across users, tasks, campaigns, and completions      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─────────────────────────────┐  ┌────────────────────────┐│
│ │ Main Search Area            │  │ Search Shortcuts       ││
│ │                             │  │                        ││
│ │ [Users][Tasks][Campaigns]   │  │ Quick Searches:        ││
│ │ [Completions]               │  │ • Active Users         ││
│ │                             │  │ • Pending Completions  ││
│ │ ┌─────────────────────────┐ │  │ • Active Campaigns     ││
│ │ │ 🔍 Search users...      │ │  │ • High Point Users     ││
│ │ └─────────────────────────┘ │  │                        ││
│ │                             │  │ My Shortcuts:          ││
│ │ Autocomplete Suggestions:   │  │ [+ New Shortcut]       ││
│ │ • email: (Field)            │  │                        ││
│ │ • username: (Field)         │  │ (Your saved shortcuts) ││
│ │ • john (Value)              │  │                        ││
│ │                             │  │                        ││
│ │ Recent Searches:            │  │                        ││
│ │ • status:ACTIVE (5 results) │  │                        ││
│ │ • john (12 results)         │  │                        ││
│ │                             │  │                        ││
│ │ Search Results:             │  │                        ││
│ │ ┌─────────────────────────┐ │  │                        ││
│ │ │ John Doe                │ │  │                        ││
│ │ │ email: john@example.com │ │  │                        ││
│ │ │ Score: 100 [→]          │ │  │                        ││
│ │ └─────────────────────────┘ │  │                        ││
│ └─────────────────────────────┘  └────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Feature Breakdown

### 1. Model Selector Tabs

**Location:** Top of search area  
**Options:** Users | Tasks | Campaigns | Completions  
**Function:** Switch between different data types to search

**Visual:**
```
┌─────────┬─────────┬───────────┬─────────────┐
│ Users   │ Tasks   │ Campaigns │ Completions │
└─────────┴─────────┴───────────┴─────────────┘
  (active)  (inactive) (inactive)  (inactive)
```

### 2. Search Input

**Features:**
- Search icon on left
- Clear button (X) when text entered
- History button (clock icon)
- Loading spinner during search

**Visual:**
```
┌──────────────────────────────────────────┐
│ 🔍  Search users...              🕐 ⌛ ✕ │
└──────────────────────────────────────────┘
```

### 3. Autocomplete Dropdown

**Appears:** After typing 2+ characters  
**Delay:** 300ms debounce  
**Navigation:** Arrow keys, Enter to select

**Types of Suggestions:**
- **Field** - Searchable fields (email:, username:, status:)
- **Operator** - Boolean operators (AND, OR, NOT)
- **Value** - Actual values from database

**Visual:**
```
┌──────────────────────────────────────────┐
│ [Field] email:                           │
│   Search in email field                  │
├──────────────────────────────────────────┤
│ [Op] AND                                 │
│   Use AND operator                       │
├──────────────────────────────────────────┤
│ john                                     │
│   john@example.com                       │
└──────────────────────────────────────────┘
```

### 4. Search History

**Appears:** When clicking history button or focusing empty input  
**Features:**
- Shows recent searches
- Result count per search
- Date of search
- Delete individual entries
- Clear all button

**Visual:**
```
┌──────────────────────────────────────────┐
│ 🕐 Recent Searches      [Clear all]      │
├──────────────────────────────────────────┤
│ status:ACTIVE                        [🗑] │
│ 5 results • Nov 10, 2025                 │
├──────────────────────────────────────────┤
│ john                                 [🗑] │
│ 12 results • Nov 9, 2025                 │
└──────────────────────────────────────────┘
```

### 5. Search Results

**Display:** Modal dialog  
**Info Shown:**
- Highlighted matching text
- Relevance score
- Matched fields
- Execution time

**Visual:**
```
┌──────────────────────────────────────────┐
│ 🔍 Search Results                        │
│ Found 12 results in 45ms for "john"      │
├──────────────────────────────────────────┤
│ ┌────────────────────────────────────┐   │
│ │ username                           │   │
│ │ john (highlighted)                 │   │
│ │                                    │   │
│ │ email                              │   │
│ │ john@example.com (highlighted)     │   │
│ │                                    │   │
│ │ [username] [email]    Score: 100 →│   │
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### 6. Search Shortcuts

**Location:** Right sidebar in search dialog  
**Sections:**
- Quick Searches (predefined)
- My Shortcuts (custom)

**Predefined Shortcuts:**
1. **Active Users** - `status:ACTIVE`
2. **Pending Completions** - `status:PENDING`
3. **Active Campaigns** - `isActive:true`
4. **High Point Users** - `totalPoints:>1000`

**Visual:**
```
┌──────────────────────────────────────────┐
│ 🔖 Search Shortcuts    [+ New Shortcut]  │
│ Quick access to frequent searches        │
├──────────────────────────────────────────┤
│ Quick Searches                           │
│ ┌────────────────────────────────────┐   │
│ │ 🔍 Active Users          [user]    │   │
│ │ All active users                   │   │
│ │ status:ACTIVE                      │   │
│ └────────────────────────────────────┘   │
│                                          │
│ My Shortcuts                             │
│ ┌────────────────────────────────────┐   │
│ │ 🔍 My Custom Search      [user]    │   │
│ │ Description here                   │   │
│ │ custom:query                  [✏][🗑]│   │
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### 7. Create Shortcut Dialog

**Trigger:** Click "+ New Shortcut" button  
**Fields:**
- Name (required)
- Search Query (required)
- Model (dropdown)
- Description (optional)

**Visual:**
```
┌──────────────────────────────────────────┐
│ Create Search Shortcut              [X]  │
│ Save a frequently used search            │
├──────────────────────────────────────────┤
│ Name                                     │
│ ┌────────────────────────────────────┐   │
│ │ e.g., Active Users                 │   │
│ └────────────────────────────────────┘   │
│                                          │
│ Search Query                             │
│ ┌────────────────────────────────────┐   │
│ │ e.g., status:ACTIVE                │   │
│ └────────────────────────────────────┘   │
│                                          │
│ Model                                    │
│ ┌────────────────────────────────────┐   │
│ │ Users ▼                            │   │
│ └────────────────────────────────────┘   │
│                                          │
│ Description (optional)                   │
│ ┌────────────────────────────────────┐   │
│ │ Brief description                  │   │
│ └────────────────────────────────────┘   │
│                                          │
│              [Cancel] [Create Shortcut]  │
└──────────────────────────────────────────┘
```

## Search Syntax Examples

### Basic Search
```
john
```
Searches all fields for "john"

### Field-Specific
```
email:john@example.com
username:john
status:ACTIVE
walletAddress:0x123
```

### Exact Phrase
```
"John Doe"
```
Searches for exact phrase

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
status:ACTIVE AND NOT blocked
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` / `Ctrl+K` | Open search dialog |
| `↓` | Next suggestion |
| `↑` | Previous suggestion |
| `Enter` | Select suggestion / Search |
| `Esc` | Close dropdown / dialog |

## Tips & Tricks

### 1. Quick Field Search
Type field name followed by colon to search specific field:
```
email:
username:
status:
```

### 2. Use Operators
Combine terms with AND, OR, NOT:
```
active AND verified
twitter OR telegram
```

### 3. Save Frequent Searches
Create shortcuts for searches you use often:
- Click "+ New Shortcut"
- Give it a name
- Enter your query
- Click to use anytime

### 4. Browse History
Click the clock icon to see recent searches and re-run them.

### 5. Navigate with Keyboard
Use arrow keys to navigate suggestions, Enter to select.

## Common Use Cases

### Find Active Users
```
status:ACTIVE
```

### Find Users by Email
```
email:john@example.com
```

### Find High-Value Users
```
totalPoints:>1000
```

### Find Pending Verifications
```
status:PENDING
```

### Find Users with Twitter
```
twitterVerified:true
```

### Find Blocked Users
```
status:BLOCKED
```

### Complex: Active Twitter Users
```
status:ACTIVE AND twitterVerified:true
```

## Troubleshooting

### No Suggestions Appearing
- Type at least 2 characters
- Wait 300ms for debounce
- Check internet connection

### No Results Found
- Try broader search terms
- Check spelling
- Try different fields
- Use OR operator for alternatives

### Shortcut Not Saving
- Check localStorage is enabled
- Try clearing browser cache
- Ensure all required fields filled

### Search Slow
- Narrow search with specific fields
- Use more specific terms
- Check database performance

## Best Practices

1. **Use Field-Specific Searches** - Faster and more accurate
2. **Save Common Searches** - Create shortcuts for efficiency
3. **Use Autocomplete** - Let suggestions guide you
4. **Review History** - Re-run previous searches quickly
5. **Use Keyboard Shortcuts** - Cmd+K for quick access

---

**Need Help?** See `ADVANCED_SEARCH_UI_GUIDE.md` for detailed documentation.
