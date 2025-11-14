# Design Document

## Overview

This design document outlines the technical approach for implementing a comprehensive refactoring and enhancement project for the Sylvan Token Airdrop Platform. The project focuses on five main areas:

1. **Task Timing System** - Adding scheduled task deadlines with persistent timers
2. **Task Display Optimization** - Implementing a hybrid box/list view for better UX
3. **Background Image System** - Full-page, non-distorted backgrounds that rotate
4. **Centralized Theme Management** - Single source of truth for all colors
5. **Code Organization** - Cleanup and consolidation of duplicate code

## Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Task Cards   │  │ Task Lists   │  │ Background   │      │
│  │ (Box View)   │  │ (Compact)    │  │ Manager      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Timer        │  │ Task         │  │ Theme        │      │
│  │ Manager      │  │ Organizer    │  │ Provider     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Task API     │  │ Timer Store  │  │ Theme Config │      │
│  │ (Database)   │  │ (LocalStorage│  │ (JSON)       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Task Timing System

#### Database Schema Extension

Add new fields to the `Task` model:

```prisma
model Task {
  // ... existing fields
  scheduledDeadline  DateTime?  // Optional deadline for time-sensitive tasks
  estimatedDuration  Int?       // Estimated completion time in seconds
  isTimeSensitive    Boolean    @default(false)
}

model Completion {
  // ... existing fields
  scheduledFor       DateTime?  // When task was scheduled to complete
  actualDeadline     DateTime?  // Calculated deadline (start + duration)
  isExpired          Boolean    @default(false)
}
```

#### Timer Manager Component

```typescript
// lib/task-timer-manager.ts

interface TaskTimer {
  taskId: string;
  userId: string;
  startTime: number;
  deadline: number;
  duration: number;
  status: 'active' | 'paused' | 'expired' | 'completed';
}

interface TimerStore {
  timers: Map<string, TaskTimer>;
  
  // Core methods
  startTimer(taskId: string, userId: string, duration: number): TaskTimer;
  pauseTimer(taskId: string): void;
  resumeTimer(taskId: string): void;
  completeTimer(taskId: string): void;
  expireTimer(taskId: string): void;
  
  // Persistence
  saveToStorage(): void;
  loadFromStorage(): void;
  syncWithServer(): Promise<void>;
  
  // Queries
  getActiveTimers(userId: string): TaskTimer[];
  getExpiredTimers(userId: string): TaskTimer[];
  getRemainingTime(taskId: string): number;
}
```

#### Timer Display Component

```typescript
// components/tasks/TaskTimerDisplay.tsx

interface TaskTimerDisplayProps {
  taskId: string;
  deadline: Date;
  onExpire: () => void;
  variant: 'compact' | 'full';
}

// Features:
// - Real-time countdown display
// - Visual urgency indicators (color changes)
// - Automatic expiration handling
// - Accessibility support (ARIA live regions)
```

### 2. Task Display Organization

#### Task Organizer Service

```typescript
// lib/task-organizer.ts

interface TaskDisplayConfig {
  boxCount: number;      // Number of tasks to show as boxes (default: 10)
  listCount: number;     // Remaining tasks shown as list
  sortBy: 'priority' | 'deadline' | 'points' | 'created';
  groupBy: 'status' | 'type' | 'campaign';
}

interface OrganizedTasks {
  boxTasks: Task[];      // First 10 tasks for card display
  listTasks: Task[];     // Remaining tasks for list display
  totalCount: number;
}

function organizeTasks(
  tasks: Task[], 
  config: TaskDisplayConfig
): OrganizedTasks;
```

#### Task List Component (Compact View)

```typescript
// components/tasks/TaskListCompact.tsx

interface TaskListCompactProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  showTimer: boolean;
}

// Features:
// - Single row per task
// - Essential info only (title, points, status, timer)
// - Hover for full details
// - Keyboard navigation support
```

#### Task Container Component

```typescript
// components/tasks/TaskContainer.tsx

interface TaskContainerProps {
  tasks: Task[];
  displayConfig: TaskDisplayConfig;
  viewMode: 'pending' | 'completed';
}

// Layout:
// ┌─────────────────────────────────────┐
// │  Box Tasks (Grid: 2-4 columns)     │
// │  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
// │  │ T1 │ │ T2 │ │ T3 │ │ T4 │       │
// │  └────┘ └────┘ └────┘ └────┘       │
// │  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
// │  │ T5 │ │ T6 │ │ T7 │ │ T8 │       │
// │  └────┘ └────┘ └────┘ └────┘       │
// │  ┌────┐ ┌────┐                     │
// │  │ T9 │ │T10 │                     │
// │  └────┘ └────┘                     │
// ├─────────────────────────────────────┤
// │  List Tasks (Compact Rows)          │
// │  ▸ Task 11 - 50 pts - ⏱ 2h left    │
// │  ▸ Task 12 - 30 pts - ⏱ 5h left    │
// │  ▸ Task 13 - 40 pts - ⏱ 1d left    │
// └─────────────────────────────────────┘
```

### 3. Background Image System

#### Background Manager

```typescript
// lib/background-manager.ts

interface BackgroundConfig {
  images: string[];
  changeOnRefresh: boolean;
  opacity: number;
  position: 'cover' | 'contain' | 'fill';
  aspectRatio: 'preserve' | 'stretch';
}

interface BackgroundManager {
  // Image selection
  getRandomImage(): string;
  getCurrentImage(): string;
  setImage(url: string): void;
  
  // Persistence
  saveSelection(): void;
  loadSelection(): string | null;
  
  // Preloading
  preloadImages(urls: string[]): Promise<void>;
}
```

#### Enhanced PageBackground Component

```typescript
// components/layout/PageBackground.tsx

interface PageBackgroundProps {
  mode: 'full' | 'contained';
  changeOnRefresh: boolean;
  overlay: boolean;
  overlayOpacity: number;
}

// CSS Strategy:
// - Use object-fit: cover for full coverage
// - Use object-position: center for centering
// - Maintain aspect ratio with max-width/max-height
// - Apply eco-gradient overlay separately
```

#### Background Image Specifications

```css
.page-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-background__image {
  width: 100%;
  height: 100%;
  object-fit: cover;           /* Fill without distortion */
  object-position: center;     /* Center the image */
  image-rendering: high-quality;
}

.page-background__overlay {
  position: absolute;
  inset: 0;
  background: var(--eco-gradient-overlay);
  opacity: 0.9;
  mix-blend-mode: multiply;
}
```

### 4. Centralized Theme Management

#### Theme Configuration File

```typescript
// config/theme.ts

export interface ThemeColors {
  // Base colors
  background: string;
  foreground: string;
  
  // Semantic colors
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  destructive: string;
  
  // Eco palette
  eco: {
    leaf: string;
    forest: string;
    earth: string;
    sky: string;
    moss: string;
  };
  
  // State colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Task states
  task: {
    pending: string;
    active: string;
    completed: string;
    expired: string;
    urgent: string;
  };
}

export interface Theme {
  light: ThemeColors;
  dark: ThemeColors;
  spacing: Record<string, string>;
  typography: Record<string, any>;
  shadows: Record<string, string>;
  transitions: Record<string, string>;
}

export const theme: Theme = {
  light: {
    background: 'hsl(95, 35%, 92%)',
    foreground: 'hsl(140, 60%, 18%)',
    // ... all colors defined here
  },
  dark: {
    background: 'hsl(140, 35%, 10%)',
    foreground: 'hsl(85, 65%, 55%)',
    // ... all colors defined here
  },
  // ... other theme properties
};
```

#### Theme Provider Component

```typescript
// components/providers/ThemeProvider.tsx

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
}

// Features:
// - Provides theme context to all components
// - Handles theme switching
// - Syncs with system preferences
// - Persists user preference
// - Generates CSS variables from theme config
```

#### CSS Variable Generation

```typescript
// lib/theme-generator.ts

function generateCSSVariables(theme: ThemeColors): string {
  return Object.entries(theme).map(([key, value]) => {
    if (typeof value === 'object') {
      return Object.entries(value).map(([subKey, subValue]) => 
        `--${key}-${subKey}: ${subValue};`
      ).join('\n');
    }
    return `--${key}: ${value};`;
  }).join('\n');
}

// Usage in globals.css:
// :root {
//   /* Generated from theme.ts */
//   --background: hsl(95, 35%, 92%);
//   --foreground: hsl(140, 60%, 18%);
//   /* ... */
// }
```

### 5. Code Organization

#### File Structure Consolidation

```
lib/
├── theme/
│   ├── config.ts          # Central theme configuration
│   ├── provider.tsx       # Theme context provider
│   └── generator.ts       # CSS variable generator
├── tasks/
│   ├── timer-manager.ts   # Timer business logic
│   ├── organizer.ts       # Task display organization
│   └── api.ts             # Task API calls
├── background/
│   ├── manager.ts         # Background image management
│   └── preloader.ts       # Image preloading utility
└── utils/
    ├── storage.ts         # LocalStorage utilities
    ├── time.ts            # Time formatting utilities
    └── validation.ts      # Validation utilities

components/
├── tasks/
│   ├── TaskCard.tsx           # Box view (existing, enhanced)
│   ├── TaskListCompact.tsx    # New compact list view
│   ├── TaskContainer.tsx      # New container component
│   ├── TaskTimerDisplay.tsx   # New timer display
│   └── TaskTimer.tsx          # Existing timer (refactored)
├── layout/
│   ├── PageBackground.tsx     # Enhanced background
│   └── ThemeToggle.tsx        # Theme switcher
└── providers/
    └── ThemeProvider.tsx      # Theme context

config/
└── theme.ts                   # Central theme configuration
```

#### Duplicate File Analysis

Files to consolidate or remove:
1. Multiple color definitions across CSS files → Single theme.ts
2. Duplicate utility functions → Centralized utils/
3. Similar timer implementations → Single timer-manager.ts
4. Background logic scattered → Single background-manager.ts

## Data Models

### Task Model Extension

```typescript
interface Task {
  // Existing fields
  id: string;
  title: string;
  description: string;
  points: number;
  taskType: string;
  taskUrl: string | null;
  isActive: boolean;
  
  // New fields for timing
  scheduledDeadline: Date | null;
  estimatedDuration: number | null;  // seconds
  isTimeSensitive: boolean;
  
  // Computed fields
  isExpired?: boolean;
  remainingTime?: number;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
}
```

### Completion Model Extension

```typescript
interface Completion {
  // Existing fields
  id: string;
  userId: string;
  taskId: string;
  completedAt: Date;
  pointsAwarded: number;
  status: string;
  
  // New fields for timing
  scheduledFor: Date | null;
  actualDeadline: Date | null;
  isExpired: boolean;
  completionTime: number | null;  // seconds taken
}
```

### Timer State Model

```typescript
interface TimerState {
  taskId: string;
  userId: string;
  startTime: number;        // Unix timestamp
  deadline: number;         // Unix timestamp
  duration: number;         // seconds
  remainingTime: number;    // seconds
  status: 'active' | 'paused' | 'expired' | 'completed';
  lastSync: number;         // Unix timestamp
}
```

## Error Handling

### Timer Errors

```typescript
class TimerError extends Error {
  constructor(
    message: string,
    public code: 'EXPIRED' | 'NOT_FOUND' | 'SYNC_FAILED' | 'INVALID_STATE'
  ) {
    super(message);
  }
}

// Error handling strategy:
// 1. Expired timers → Show expired state, allow retry
// 2. Sync failures → Queue for retry, show offline indicator
// 3. Invalid state → Reset timer, log error
// 4. Not found → Remove from local storage
```

### Background Loading Errors

```typescript
// Fallback strategy:
// 1. Try to load selected image
// 2. If fails, try random image from pool
// 3. If all fail, use solid color background
// 4. Log error for monitoring

async function loadBackgroundWithFallback(
  primaryUrl: string,
  fallbackUrls: string[]
): Promise<string> {
  try {
    await preloadImage(primaryUrl);
    return primaryUrl;
  } catch {
    for (const url of fallbackUrls) {
      try {
        await preloadImage(url);
        return url;
      } catch {
        continue;
      }
    }
    return ''; // Use solid color
  }
}
```

### Theme Loading Errors

```typescript
// Fallback strategy:
// 1. Try to load theme from config
// 2. If fails, use embedded default theme
// 3. Log error and notify user
// 4. Allow manual theme reset

function loadThemeWithFallback(): Theme {
  try {
    return loadThemeFromConfig();
  } catch (error) {
    console.error('Failed to load theme:', error);
    return getDefaultTheme();
  }
}
```

## Testing Strategy

### Unit Tests

1. **Timer Manager**
   - Test timer creation and lifecycle
   - Test expiration logic
   - Test persistence and sync
   - Test edge cases (negative time, past deadlines)

2. **Task Organizer**
   - Test box/list splitting logic
   - Test sorting and filtering
   - Test edge cases (0 tasks, 1 task, 100+ tasks)

3. **Background Manager**
   - Test image selection
   - Test preloading
   - Test fallback logic

4. **Theme Generator**
   - Test CSS variable generation
   - Test theme switching
   - Test color format validation

### Integration Tests

1. **Task Display Flow**
   - Load tasks → Organize → Display boxes and list
   - Start timer → Update display → Complete task
   - Expire timer → Update UI → Show expired state

2. **Background System**
   - Page load → Select image → Preload → Display
   - Refresh → Select new image → Display

3. **Theme System**
   - Load theme → Generate CSS → Apply to components
   - Switch theme → Update CSS → Re-render components

### E2E Tests

1. **User completes time-sensitive task**
   - Navigate to tasks page
   - Start task with timer
   - Wait for timer to complete
   - Verify task marked as completed
   - Verify points awarded

2. **User views expired task**
   - Create task with past deadline
   - Navigate to tasks page
   - Verify task shows as expired
   - Verify cannot complete expired task

3. **Background changes on refresh**
   - Load page, note background
   - Refresh page
   - Verify different background displayed

4. **Theme customization**
   - Open theme settings
   - Change color values
   - Verify changes reflected across app

## Performance Considerations

### Timer Performance

- Use single interval for all timers (not one per timer)
- Batch timer updates to reduce re-renders
- Debounce timer sync to server
- Use Web Workers for timer calculations if needed

```typescript
// Efficient timer update strategy
class TimerUpdateScheduler {
  private timers: Map<string, TaskTimer>;
  private updateInterval: NodeJS.Timeout;
  
  constructor() {
    // Single interval updates all timers
    this.updateInterval = setInterval(() => {
      this.updateAllTimers();
    }, 1000);
  }
  
  private updateAllTimers() {
    const updates: TimerUpdate[] = [];
    
    for (const [id, timer] of this.timers) {
      const remaining = this.calculateRemaining(timer);
      if (remaining !== timer.remainingTime) {
        updates.push({ id, remaining });
      }
    }
    
    // Batch update UI
    if (updates.length > 0) {
      this.batchUpdateUI(updates);
    }
  }
}
```

### Background Image Performance

- Preload images during idle time
- Use responsive images (srcset)
- Lazy load non-critical images
- Cache loaded images in memory

```typescript
// Preload strategy
async function preloadBackgroundImages() {
  const images = getAllBackgroundImages();
  
  // Preload current and next 2 images
  const priority = images.slice(0, 3);
  await Promise.all(priority.map(preloadImage));
  
  // Preload rest during idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      images.slice(3).forEach(preloadImage);
    });
  }
}
```

### Theme Performance

- Generate CSS variables once on theme load
- Use CSS custom properties for instant updates
- Avoid inline styles, use classes
- Memoize theme-dependent components

```typescript
// Memoized theme-aware component
const ThemedCard = React.memo(({ children }: Props) => {
  // Uses CSS variables, no re-render on theme change
  return <div className="themed-card">{children}</div>;
});
```

## Accessibility

### Timer Accessibility

- Use ARIA live regions for countdown updates
- Provide screen reader announcements for state changes
- Ensure timer controls are keyboard accessible
- Support reduced motion preferences

```tsx
<div 
  role="timer" 
  aria-live="polite" 
  aria-atomic="true"
  aria-label={`Task timer: ${remainingTime} seconds remaining`}
>
  <span aria-hidden="true">{formatTime(remainingTime)}</span>
</div>
```

### Task List Accessibility

- Proper heading hierarchy
- Keyboard navigation between tasks
- Focus management
- Screen reader friendly task states

### Theme Accessibility

- Maintain WCAG 2.1 AA contrast ratios
- Support high contrast mode
- Respect prefers-color-scheme
- Provide manual theme override

## Security Considerations

### Timer Security

- Validate timer data on server
- Prevent timer manipulation
- Rate limit timer operations
- Verify completion timestamps

### Background Security

- Validate image URLs
- Prevent XSS through image URLs
- Use Content Security Policy
- Sanitize user-uploaded backgrounds (if applicable)

### Theme Security

- Validate color values
- Prevent CSS injection
- Sanitize theme configuration
- Use CSP for inline styles

## Migration Strategy

### Phase 1: Foundation (Week 1)
- Create theme configuration file
- Set up theme provider
- Migrate existing colors to theme config
- Test theme switching

### Phase 2: Timer System (Week 2)
- Extend database schema
- Implement timer manager
- Create timer display components
- Add timer persistence

### Phase 3: Task Display (Week 3)
- Implement task organizer
- Create compact list component
- Update task container
- Test responsive layouts

### Phase 4: Background System (Week 4)
- Implement background manager
- Update PageBackground component
- Add image preloading
- Test across devices

### Phase 5: Cleanup (Week 5)
- Remove duplicate files
- Consolidate utilities
- Update documentation
- Final testing and optimization

## Rollback Plan

Each phase should be deployable independently with rollback capability:

1. **Theme System**: Can revert to inline styles if needed
2. **Timer System**: Can disable timers, fall back to instant completion
3. **Task Display**: Can revert to all-boxes layout
4. **Background System**: Can revert to gradient-only background
5. **Cleanup**: Git history allows file restoration

## Monitoring and Metrics

### Key Metrics

1. **Timer Accuracy**: Measure drift between client and server time
2. **Background Load Time**: Track image loading performance
3. **Theme Switch Time**: Measure theme transition performance
4. **Task Display Performance**: Monitor render time for large task lists
5. **Error Rates**: Track timer sync failures, image load failures

### Logging

```typescript
// Structured logging for monitoring
logger.info('timer.started', {
  taskId,
  userId,
  duration,
  deadline: deadline.toISOString()
});

logger.warn('timer.sync.failed', {
  taskId,
  userId,
  error: error.message,
  retryCount
});

logger.error('background.load.failed', {
  imageUrl,
  error: error.message,
  fallbackUsed: true
});
```
