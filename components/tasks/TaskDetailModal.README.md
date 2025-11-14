# TaskDetailModal Component

## Overview

The `TaskDetailModal` component displays detailed information about a task in a modal dialog. It's designed to show comprehensive task information including status, countdown timers for time-limited tasks, and completion details.

## Features

### Core Functionality
- ✅ Modal dialog using shadcn Dialog component
- ✅ Displays task title, description, points, and type
- ✅ Shows task status badge (active/completed/missed)
- ✅ Countdown timer for active time-limited tasks
- ✅ Task URL with external link
- ✅ Completion timestamp display
- ✅ Expiration information for missed tasks

### Modal Interactions
- ✅ Close button (X icon in top-right corner)
- ✅ Keyboard navigation (Escape key to close)
- ✅ Click-outside-to-close functionality
- ✅ Prevents body scroll when modal is open
- ✅ Smooth animations for open/close transitions

### Accessibility
- ✅ ARIA labels for screen readers
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Semantic HTML structure
- ✅ Proper role attributes

## Usage

```tsx
import { useState } from "react";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { TaskWithCompletion } from "@/types";

function MyComponent() {
  const [selectedTask, setSelectedTask] = useState<TaskWithCompletion | null>(null);

  return (
    <>
      {/* Your task list or cards */}
      <div onClick={() => setSelectedTask(task)}>
        Click to view details
      </div>

      {/* Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `task` | `TaskWithCompletion \| null` | Yes | The task to display. Pass `null` when no task is selected. |
| `isOpen` | `boolean` | Yes | Controls whether the modal is visible. |
| `onClose` | `() => void` | Yes | Callback function called when the modal should close. |

## Task Status Display

The modal automatically determines and displays the appropriate status badge based on the task state:

### Active Tasks
- Badge: "Active" (secondary variant)
- Icon: Sparkles
- Color: Emerald
- Shows countdown timer if time-limited

### Completed Tasks
- **Pending**: "Pending Approval" or "Under Review"
- **Approved**: "Approved" (green)
- **Auto Approved**: "Auto Approved" (blue)
- **Rejected**: "Rejected" (red)
- **Default**: "Completed" (green)

### Missed Tasks
- Badge: "Missed" (destructive variant)
- Icon: XCircle
- Color: Red
- Shows expiration information

## Countdown Timer

For active time-limited tasks (tasks with `expiresAt` in the future):
- Displays real-time countdown in HH:MM:SS format
- Updates every second
- Styled with emerald gradient background
- Automatically hides when task expires or is completed

## Layout Sections

### Header
- Task title (large, gradient text)
- Close button (X icon, top-right)

### Status Row
- Status badge
- Countdown timer (if applicable)

### Description Section
- Full task description
- Readable typography

### Details Grid
- **Points**: Large display with coin icon
- **Task Type**: Icon and label (Twitter Follow, etc.)

### Additional Information
- Task URL (if available) - opens in new tab
- Completion timestamp (if completed)
- Expiration information (if missed)

### Footer
- Close button (outline variant)

## Styling

The modal uses:
- Gradient backgrounds for visual appeal
- Consistent color scheme with the rest of the application
- Responsive design (max-width: 2xl)
- Scrollable content area (max-height: 90vh)
- Smooth animations for open/close transitions

## Type Definitions

```typescript
interface TaskDetailModalProps {
  task: TaskWithCompletion | null;
  isOpen: boolean;
  onClose: () => void;
}
```

## Dependencies

- `@/components/ui/dialog` - Dialog components from shadcn/ui
- `@/components/ui/badge` - Badge component
- `@/components/ui/button` - Button component
- `@/components/tasks/CountdownTimer` - Countdown timer component
- `lucide-react` - Icons
- `next-intl` - Internationalization

## Implementation Details

### Status Determination Logic

The `getTaskStatus` function determines the task status in this order:
1. Check if task is missed or expired → "Missed"
2. Check if task is completed → Show completion status
3. Otherwise → "Active"

### Countdown Timer Display

The countdown timer is shown when:
- Task is active (not completed, not missed)
- Task has `expiresAt` field
- `expiresAt` is in the future

### Modal Behavior

The modal automatically handles:
- Opening/closing animations
- Focus trapping
- Body scroll prevention
- Escape key handling
- Outside click handling

All these behaviors are provided by the Radix UI Dialog primitive used by shadcn/ui.

## Testing

A test file is provided at `components/tasks/__tests__/TaskDetailModal.test.tsx` that covers:
- Rendering with different task states
- Status badge display
- Task information display
- Accessibility features
- Modal interactions

## Integration with Task 8

This modal is designed to be integrated with Task 8 (User Tasks Page Layout Restructure):
- Use in collapsible lists for completed and missed tasks
- Open modal when list items are clicked
- Display full task details without leaving the page

## Browser Support

The modal works in all modern browsers that support:
- CSS Grid
- CSS Flexbox
- ES6+ JavaScript
- Radix UI Dialog primitives

## Performance

- Lightweight component (~5KB gzipped)
- No unnecessary re-renders
- Efficient countdown timer updates
- Lazy loading of modal content

## Future Enhancements

Potential improvements for future versions:
- Task completion action from within modal
- Task sharing functionality
- Task history/timeline view
- Related tasks suggestions
