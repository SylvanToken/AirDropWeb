# Centralized Theme Management System

## Overview

The Sylvan Token Airdrop Platform now has a centralized theme management system that provides a single source of truth for all colors, spacing, typography, and other design tokens.

## Features

### 1. Central Theme Configuration (`config/theme.ts`)

All theme values are defined in a single TypeScript file with full type safety:

- **Colors**: Light and dark mode variants for all UI elements
- **Eco Palette**: Nature-inspired colors (leaf, forest, earth, sky, moss)
- **Task States**: Colors for pending, active, completed, expired, and urgent tasks
- **Status Colors**: Success, error, warning, and info states
- **Spacing**: Consistent spacing tokens (xs, sm, md, lg, xl, 2xl, 3xl)
- **Typography**: Font sizes, line heights, and font weights
- **Shadows**: Eco-themed and neon glow shadow effects
- **Transitions**: Consistent animation durations

### 2. CSS Variable Generator (`lib/theme/generator.ts`)

Utilities to generate CSS custom properties from the theme configuration:

- `generateColorVariables()` - Generate CSS variables from theme colors
- `generateThemeVariables()` - Generate all theme variables for a mode
- `generateThemeCSS()` - Generate complete CSS string for both themes
- `applyThemeVariables()` - Apply theme variables to document root
- `setThemeMode()` - Switch between light and dark modes
- Helper functions for HSL manipulation and validation

### 3. Theme Provider (`components/providers/ThemeProvider.tsx`)

React context provider for theme management:

- **Theme Modes**: Light, dark, and system (follows OS preference)
- **Persistence**: Saves user preference to localStorage
- **System Sync**: Automatically updates when OS theme changes
- **No Flash**: Prevents flash of unstyled content on page load
- **Hook**: `useTheme()` hook for accessing theme in components

### 4. Theme Toggle Component (`components/ui/ThemeToggle.tsx`)

UI components for theme switching:

- **ThemeToggle**: Dropdown menu with light, dark, and system options
- **SimpleThemeToggle**: Simple button to toggle between light and dark
- Accessible with proper ARIA labels and keyboard navigation

## Usage

### Using Theme Colors in Components

```tsx
import { useTheme } from '@/components/providers/ThemeProvider';

function MyComponent() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  return (
    <div className="bg-background text-foreground">
      <p className="text-eco-leaf">Eco-friendly text</p>
      <button className="bg-task-pending">Pending Task</button>
    </div>
  );
}
```

### Using Theme in Tailwind

All theme colors are available as Tailwind utilities:

```tsx
// Base colors
<div className="bg-background text-foreground" />
<div className="bg-primary text-primary-foreground" />

// Eco colors
<div className="bg-eco-leaf text-eco-forest" />
<div className="border-eco-earth" />

// Task states
<div className="bg-task-pending" />
<div className="text-task-completed" />

// Status colors
<div className="bg-status-success" />
<div className="text-status-error" />
```

### Accessing Theme Values in TypeScript

```typescript
import { theme, getThemeColor } from '@/config/theme';

// Get a specific color
const leafColor = getThemeColor('light', 'eco.leaf');

// Access theme directly
const spacing = theme.spacing.md;
const fontSize = theme.typography.fontSize.base;
```

### Adding Theme Toggle to UI

```tsx
import { ThemeToggle } from '@/components/ui/ThemeToggle';

function Header() {
  return (
    <header>
      <nav>
        {/* ... other nav items ... */}
        <ThemeToggle />
      </nav>
    </header>
  );
}
```

## Color Palette

### Light Mode
- **Background**: Soft sage (95 35% 92%)
- **Foreground**: Deep forest green (140 60% 18%)
- **Primary**: Deep forest green (140 60% 18%)
- **Accent**: Lime green (85 65% 55%)

### Dark Mode
- **Background**: Dark forest (140 35% 10%)
- **Foreground**: Lime green (85 65% 55%)
- **Primary**: Lime green (85 65% 55%)
- **Accent**: Vibrant lime (85 70% 60%)

### Eco Palette (Both Modes)
- **Leaf**: 85 65% 55% - Bright lime green
- **Forest**: 140 60% 18% - Deep forest green
- **Earth**: 85 40% 32% - Olive/earth tone
- **Sky**: 95 35% 65% (light) / 95 30% 55% (dark) - Soft sage
- **Moss**: 100 40% 30% - Dark moss green

### Task States
- **Pending**: Amber/yellow
- **Active**: Blue
- **Completed**: Green
- **Expired**: Red
- **Urgent**: Orange

## Testing

Comprehensive test suite in `__tests__/theme-system.test.ts`:

- ✅ 40 tests covering all functionality
- Theme configuration structure
- CSS variable generation
- HSL color manipulation
- Color consistency across modes
- Integration with CSS

Run tests:
```bash
npm test -- __tests__/theme-system.test.ts
```

## Benefits

1. **Single Source of Truth**: All colors defined in one place
2. **Type Safety**: Full TypeScript support with autocomplete
3. **Consistency**: Ensures consistent colors across the app
4. **Easy Updates**: Change colors in one place, updates everywhere
5. **Dark Mode**: Built-in support with automatic switching
6. **Accessibility**: WCAG-compliant contrast ratios
7. **Performance**: CSS variables for instant theme switching
8. **Developer Experience**: Easy to use with clear documentation

## Migration Notes

The existing color definitions in `app/globals.css` have been preserved for backward compatibility. New components should use the centralized theme system, and existing components can be gradually migrated.

## Future Enhancements

- [ ] Theme customization UI for users
- [ ] Additional color schemes (e.g., ocean, sunset)
- [ ] Theme preview before applying
- [ ] Export/import custom themes
- [ ] Per-component theme overrides
