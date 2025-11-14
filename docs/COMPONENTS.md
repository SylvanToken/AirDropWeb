# Component Documentation

This document provides comprehensive documentation for all custom components in the Sylvan Token Airdrop Platform.

## Table of Contents

- [Hero Section](#hero-section)
- [Card Components](#card-components)
- [Button Components](#button-components)
- [Form Components](#form-components)
- [Loading Components](#loading-components)
- [Navigation Components](#navigation-components)
- [Animation Components](#animation-components)
- [Layout Components](#layout-components)
- [Accessibility Components](#accessibility-components)

---

## Hero Section

Dynamic hero sections with random nature imagery and glassmorphism effects.

### HeroSection

**Location**: `components/ui/HeroSection.tsx`

**Description**: A flexible hero section component with support for random background images, multiple variants, and responsive layouts.

#### Props

```typescript
interface HeroSectionProps {
  variant: 'home' | 'dashboard' | 'tasks' | 'leaderboard';
  backgroundImage?: string;
  overlay?: 'gradient' | 'solid' | 'none';
  height?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  children: React.ReactNode;
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'home' \| 'dashboard' \| 'tasks' \| 'leaderboard'` | Required | Determines the hero style and layout |
| `backgroundImage` | `string` | Random | Path to background image (auto-selected if not provided) |
| `overlay` | `'gradient' \| 'solid' \| 'none'` | `'gradient'` | Type of overlay effect |
| `height` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Hero section height |
| `className` | `string` | `''` | Additional CSS classes |
| `children` | `React.ReactNode` | Required | Hero content |

#### Usage

```tsx
import { HeroSection } from '@/components/ui/HeroSection';

// Basic usage with auto-selected image
<HeroSection variant="home" height="lg">
  <h1>Welcome to Sylvan Token</h1>
  <p>Complete tasks, earn rewards</p>
</HeroSection>

// With custom background
<HeroSection 
  variant="dashboard" 
  backgroundImage="/assets/heroes/forest-1.webp"
  overlay="gradient"
>
  <div className="text-center">
    <h2>Your Dashboard</h2>
    <p>Track your progress</p>
  </div>
</HeroSection>
```

#### Accessibility

- Uses semantic HTML (`<section>` with `role="banner"`)
- Background images are decorative (aria-hidden)
- Content is keyboard accessible
- Sufficient color contrast on all overlays

---

## Card Components

Flexible card components with multiple variants and eco theming.

### Card

**Location**: `components/ui/card.tsx`

**Description**: Base card component with support for multiple variants, hover effects, and gradients.

#### Props

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  gradient?: boolean;
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'elevated' \| 'outlined' \| 'glass'` | `'default'` | Card style variant |
| `padding` | `'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding size |
| `hover` | `boolean` | `false` | Enable hover lift effect |
| `gradient` | `boolean` | `false` | Apply gradient background |

#### Variants

**Default Card**
- Standard card with border and subtle shadow
- Best for: General content containers

```tsx
<Card variant="default" padding="md">
  <CardHeader>
    <CardTitle>Task Details</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Complete this task to earn points</p>
  </CardContent>
</Card>
```

**Elevated Card**
- Enhanced shadow for prominence
- Best for: Important content, featured items

```tsx
<Card variant="elevated" hover={true}>
  <CardContent>
    <h3>Featured Task</h3>
    <p>Double points today!</p>
  </CardContent>
</Card>
```

**Outlined Card**
- Transparent with eco-themed border
- Best for: Secondary content, subtle containers

```tsx
<Card variant="outlined" padding="lg">
  <CardContent>
    <p>Additional information</p>
  </CardContent>
</Card>
```

**Glass Card**
- Glassmorphism effect with backdrop blur
- Best for: Overlays, hero content, modern UI

```tsx
<Card variant="glass" gradient={true}>
  <CardContent>
    <h2>Welcome Back</h2>
    <p>Your stats at a glance</p>
  </CardContent>
</Card>
```

#### Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Keyboard accessible when interactive
- Sufficient color contrast

---

## Button Components

Eco-themed buttons with multiple variants and states.

### Button

**Location**: `components/ui/button.tsx`

**Description**: Flexible button component with eco theming, loading states, and icon support.

#### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'eco';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link' \| 'eco'` | `'default'` | Button style variant |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon'` | `'default'` | Button size |
| `loading` | `boolean` | `false` | Show loading spinner |
| `icon` | `React.ReactNode` | `undefined` | Icon element |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position |

#### Usage

```tsx
import { Button } from '@/components/ui/button';
import { Leaf, ArrowRight } from 'lucide-react';

// Primary button
<Button variant="default">
  Click Me
</Button>

// Eco gradient button
<Button variant="eco" size="lg">
  Complete Task
</Button>

// Button with icon
<Button variant="outline" icon={<Leaf />}>
  Eco Action
</Button>

// Loading state
<Button loading={true}>
  Processing...
</Button>

// Icon on right
<Button icon={<ArrowRight />} iconPosition="right">
  Next Step
</Button>
```

#### Accessibility

- Minimum 44x44px touch target
- Disabled state with aria-disabled
- Loading state with aria-busy
- Focus visible indicator
- Descriptive text or aria-label

---

## Form Components

Enhanced form inputs with eco theming and validation states.

### Input

**Location**: `components/ui/input.tsx`

**Description**: Text input component with floating labels, icons, and validation states.

#### Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'eco' | 'glass';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  error?: string;
  success?: boolean;
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'eco' \| 'glass'` | `'default'` | Input style variant |
| `icon` | `React.ReactNode` | `undefined` | Icon element |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position |
| `error` | `string` | `undefined` | Error message |
| `success` | `boolean` | `false` | Success state |

#### Usage

```tsx
import { Input } from '@/components/ui/input';
import { Mail, Lock } from 'lucide-react';

// Basic input
<Input 
  type="email" 
  placeholder="Email address"
/>

// With icon
<Input 
  type="email"
  icon={<Mail />}
  placeholder="Email address"
/>

// Error state
<Input 
  type="password"
  icon={<Lock />}
  error="Password is required"
/>

// Success state
<Input 
  type="email"
  icon={<Mail />}
  success={true}
  value="user@example.com"
/>

// Eco variant
<Input 
  variant="eco"
  placeholder="Wallet address"
/>
```

#### Accessibility

- Proper label association
- Error messages with aria-describedby
- Required fields with aria-required
- Invalid state with aria-invalid
- Sufficient color contrast

---

## Loading Components

Skeleton loaders and loading states for better perceived performance.

### Skeleton

**Location**: `components/ui/skeleton.tsx`

**Description**: Animated skeleton loader with shimmer effect.

#### Usage

```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Single skeleton
<Skeleton className="h-12 w-full" />

// Card skeleton
<div className="space-y-4">
  <Skeleton className="h-8 w-3/4" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-5/6" />
</div>

// Avatar skeleton
<Skeleton className="h-12 w-12 rounded-full" />
```

### LoadingSpinner

**Location**: `components/ui/spinner.tsx`

**Description**: Animated loading spinner with eco theming.

#### Props

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

#### Usage

```tsx
import { LoadingSpinner } from '@/components/ui/spinner';

<LoadingSpinner size="lg" />
```

### LoadingOverlay

**Location**: `components/ui/LoadingOverlay.tsx`

**Description**: Full-screen loading overlay with blur effect.

#### Props

```typescript
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}
```

#### Usage

```tsx
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

<LoadingOverlay 
  visible={isLoading} 
  message="Processing your request..."
/>
```

#### Accessibility

- Announces loading state to screen readers
- Uses aria-live for dynamic updates
- Prevents interaction during loading
- Respects prefers-reduced-motion

---

## Navigation Components

Responsive navigation components with mobile optimization.

### Header

**Location**: `components/layout/Header.tsx`

**Description**: Main navigation header with glassmorphism and sticky positioning.

#### Features

- Sticky header with backdrop blur
- Responsive mobile menu
- Language switcher integration
- User menu with avatar
- Active route indicators
- Touch-optimized buttons

#### Usage

```tsx
import { Header } from '@/components/layout/Header';

<Header />
```

### MobileBottomNav

**Location**: `components/layout/MobileBottomNav.tsx`

**Description**: Fixed bottom navigation for mobile devices.

#### Features

- Five primary actions
- Active state indicators
- Safe area support
- Touch-optimized (44x44px)
- Hidden on desktop

#### Usage

```tsx
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

<MobileBottomNav />
```

### Footer

**Location**: `components/layout/Footer.tsx`

**Description**: Site footer with nature-inspired background.

#### Features

- Gradient orb background
- Social media links
- Language switcher
- Legal links
- Responsive layout

#### Usage

```tsx
import { Footer } from '@/components/layout/Footer';

<Footer />
```

#### Accessibility

- Semantic HTML (nav, footer)
- Keyboard accessible links
- Skip links for main content
- ARIA labels for icon buttons
- Logical tab order

---

## Animation Components

Nature-inspired animations and transitions.

### NatureAnimations

**Location**: `components/ui/NatureAnimations.tsx`

**Description**: Decorative nature-inspired animation components.

#### Components

**LeafFloat**
```tsx
<LeafFloat>
  <Leaf className="w-8 h-8 text-eco-leaf" />
</LeafFloat>
```

**GrowAnimation**
```tsx
<GrowAnimation>
  <div>Content that grows in</div>
</GrowAnimation>
```

**WaveAnimation**
```tsx
<WaveAnimation>
  <div>Content that waves</div>
</WaveAnimation>
```

**PulseEco**
```tsx
<PulseEco>
  <div>Content that pulses</div>
</PulseEco>
```

### StateAnimations

**Location**: `components/ui/StateAnimations.tsx`

**Description**: Success and error state animations.

#### Usage

```tsx
import { SuccessAnimation, ErrorAnimation } from '@/components/ui/StateAnimations';

// Success
<SuccessAnimation>
  <CheckCircle className="w-16 h-16" />
</SuccessAnimation>

// Error
<ErrorAnimation>
  <XCircle className="w-16 h-16" />
</ErrorAnimation>
```

### RouteLoadingBar

**Location**: `components/ui/RouteLoadingBar.tsx`

**Description**: Progress bar for route transitions.

#### Usage

```tsx
import { RouteLoadingBar } from '@/components/ui/RouteLoadingBar';

// In layout
<RouteLoadingBar />
```

#### Accessibility

- Respects prefers-reduced-motion
- Announces state changes
- Non-intrusive animations
- Optional disable via settings

---

## Layout Components

Responsive layout utilities and containers.

### ResponsiveContainer

**Location**: `components/layout/ResponsiveContainer.tsx`

**Description**: Responsive container with max-width constraints.

#### Props

```typescript
interface ResponsiveContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

#### Usage

```tsx
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';

<ResponsiveContainer size="lg" padding={true}>
  <h1>Page Content</h1>
</ResponsiveContainer>
```

---

## Accessibility Components

Components for enhanced accessibility.

### SkipLinks

**Location**: `components/ui/SkipLinks.tsx`

**Description**: Skip navigation links for keyboard users.

#### Usage

```tsx
import { SkipLinks } from '@/components/ui/SkipLinks';

// In layout
<SkipLinks />
```

### AriaLive

**Location**: `components/ui/AriaLive.tsx`

**Description**: Announces dynamic content to screen readers.

#### Props

```typescript
interface AriaLiveProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}
```

#### Usage

```tsx
import { AriaLive } from '@/components/ui/AriaLive';

<AriaLive 
  message="Task completed successfully" 
  politeness="polite"
/>
```

### KeyboardShortcuts

**Location**: `components/ui/KeyboardShortcuts.tsx`

**Description**: Global keyboard shortcuts for navigation.

#### Shortcuts

- `Alt + H`: Home
- `Alt + D`: Dashboard
- `Alt + T`: Tasks
- `Alt + L`: Leaderboard
- `Alt + P`: Profile

#### Usage

```tsx
import { KeyboardShortcutsProvider } from '@/components/ui/KeyboardShortcuts';

// In root layout
<KeyboardShortcutsProvider>
  {children}
</KeyboardShortcutsProvider>
```

### AccessibilitySettings

**Location**: `components/ui/AccessibilitySettings.tsx`

**Description**: User-configurable accessibility preferences.

#### Features

- Animation toggle
- High contrast mode
- Font size adjustment
- Keyboard shortcuts help

#### Usage

```tsx
import { AccessibilitySettings } from '@/components/ui/AccessibilitySettings';

<AccessibilitySettings />
```

---

## Best Practices

### Component Usage

1. **Always use semantic HTML**: Use appropriate HTML elements (button, nav, main, etc.)
2. **Provide alt text**: All images should have descriptive alt text
3. **Use ARIA labels**: Icon buttons need aria-label
4. **Maintain contrast**: Ensure 4.5:1 contrast ratio for text
5. **Touch targets**: Minimum 44x44px for interactive elements

### Performance

1. **Lazy load**: Use dynamic imports for heavy components
2. **Optimize images**: Use Next.js Image component
3. **Code splitting**: Split large components into smaller chunks
4. **Memoization**: Use React.memo for expensive renders

### Accessibility

1. **Keyboard navigation**: All interactive elements must be keyboard accessible
2. **Screen readers**: Test with NVDA, JAWS, or VoiceOver
3. **Focus management**: Visible focus indicators on all interactive elements
4. **Motion preferences**: Respect prefers-reduced-motion
5. **Color contrast**: Test with contrast checking tools

### Internationalization

1. **Use translation keys**: Never hardcode user-facing text
2. **Test all languages**: Verify layouts with long translations
3. **Locale formatting**: Use locale-aware date/number formatting
4. **RTL support**: Consider right-to-left languages (future)

---

## Component Checklist

When creating new components, ensure:

- [ ] TypeScript interfaces defined
- [ ] Props documented with JSDoc
- [ ] Accessibility attributes added (ARIA, semantic HTML)
- [ ] Keyboard navigation supported
- [ ] Touch targets meet 44x44px minimum
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Responsive design tested
- [ ] Dark mode supported
- [ ] Translations used (no hardcoded text)
- [ ] Motion preferences respected
- [ ] Examples provided in documentation

---

## Additional Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

---

**Last Updated**: November 9, 2025
**Version**: 2.0.0
