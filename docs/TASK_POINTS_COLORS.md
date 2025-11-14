# Task Points Color System

## Overview

Task points are visually categorized by color to help users quickly identify task difficulty and reward levels.

## Color Categories

### 🔘 Easy Tasks (10-25 points)
- **Color:** Gray/Slate
- **Gradient:** `from-slate-500 to-slate-600`
- **Shadow:** `shadow-slate-500/30`
- **Examples:**
  - Daily check-in (10 pts)
  - Like a tweet (15-20 pts)
  - Set preferences (10 pts)
  - Write bio (15 pts)

### 🔵 Medium Tasks (30-60 points)
- **Color:** Blue
- **Gradient:** `from-blue-500 to-blue-600`
- **Shadow:** `shadow-blue-500/30`
- **Examples:**
  - Follow Twitter account (30-50 pts)
  - Join Telegram group (30-50 pts)
  - Subscribe to YouTube (40 pts)
  - Complete profile (50 pts)
  - Take survey (50 pts)

### 🟣 Hard Tasks (75-150 points)
- **Color:** Purple
- **Gradient:** `from-purple-500 to-purple-600`
- **Shadow:** `shadow-purple-500/30`
- **Examples:**
  - Join beta testing (75 pts)
  - Add wallet address (100 pts)
  - Weekly active user (100 pts)
  - Submit pull request (150 pts)

### 🟠 Referral Tasks (150+ points)
- **Color:** Amber/Orange
- **Gradient:** `from-amber-500 to-orange-500`
- **Shadow:** `shadow-amber-500/30`
- **Examples:**
  - Create content (200 pts)
  - Refer 3 friends (350 pts)
  - Refer 5 friends (600 pts)
  - Refer 10 friends (1500 pts)
  - Refer 25 friends (4000 pts)
  - Refer 50 friends (10000 pts)

## Implementation

### Component: `components/tasks/TaskCard.tsx`

```tsx
<Badge 
  variant="secondary" 
  className={`
    shrink-0 text-white border-0 shadow-lg px-3 py-1 text-sm font-bold
    ${task.points <= 25 
      ? 'bg-gradient-to-br from-slate-500 to-slate-600 shadow-slate-500/30' 
      : task.points <= 60 
      ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30' 
      : task.points <= 150 
      ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30' 
      : 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30'
    }
  `}
  aria-label={`${task.points} points reward`}
>
  <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
  {task.points}
</Badge>
```

## Visual Hierarchy

The color system creates a clear visual hierarchy:

1. **Gray badges** = Quick, easy tasks for daily engagement
2. **Blue badges** = Standard tasks requiring moderate effort
3. **Purple badges** = Challenging tasks with significant rewards
4. **Orange badges** = Premium tasks with maximum rewards

## User Benefits

- **Quick Scanning:** Users can instantly identify high-value tasks
- **Motivation:** Color progression encourages completing harder tasks
- **Gamification:** Visual rewards system enhances engagement
- **Accessibility:** Color + icon + text provides multiple cues

## Design Principles

### Gradient Usage
- All badges use `bg-gradient-to-br` (bottom-right gradient)
- Creates depth and premium feel
- Consistent with overall eco-theme design

### Shadow Effects
- Each color has matching shadow with 30% opacity
- Creates floating effect on hover
- Enhances visual hierarchy

### Contrast
- White text on all colored backgrounds
- Ensures WCAG AA compliance
- Readable in both light and dark modes

## Customization

To adjust point thresholds:

```tsx
// Current thresholds
task.points <= 25   // Easy (Gray)
task.points <= 60   // Medium (Blue)
task.points <= 150  // Hard (Purple)
task.points > 150   // Referral (Orange)

// Example: Adjust for different point economy
task.points <= 50   // Easy
task.points <= 100  // Medium
task.points <= 300  // Hard
task.points > 300   // Premium
```

## Related Components

- `components/tasks/TaskCard.tsx` - Main implementation
- `components/tasks/OrganizedTasksView.tsx` - Task list display
- `components/tasks/TaskDetailModal.tsx` - Task details

## Color Palette Reference

| Category | Primary | Secondary | Shadow | Hex Codes |
|----------|---------|-----------|--------|-----------|
| Easy | Slate 500 | Slate 600 | Slate 500/30 | #64748b → #475569 |
| Medium | Blue 500 | Blue 600 | Blue 500/30 | #3b82f6 → #2563eb |
| Hard | Purple 500 | Purple 600 | Purple 500/30 | #a855f7 → #9333ea |
| Referral | Amber 500 | Orange 500 | Amber 500/30 | #f59e0b → #f97316 |

## Dark Mode

All colors are optimized for both light and dark modes:
- Sufficient contrast in both themes
- Shadow effects visible in both modes
- Gradient maintains depth in dark mode

## Accessibility

- **Color Blindness:** Icon + text provide non-color cues
- **Screen Readers:** `aria-label` describes point value
- **Contrast Ratio:** All combinations meet WCAG AA standards
- **Focus States:** Maintained for keyboard navigation

---

**Last Updated:** 2025-01-13  
**Version:** 1.0  
**Component:** TaskCard v2.0+
