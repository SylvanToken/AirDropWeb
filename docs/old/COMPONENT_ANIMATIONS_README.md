# Animation Components Guide

This guide covers all animation and micro-interaction components available in the Sylvan Token Airdrop Platform.

## Table of Contents

1. [Page Transitions](#page-transitions)
2. [Loading States](#loading-states)
3. [Nature-Inspired Animations](#nature-inspired-animations)
4. [Micro-Interactions](#micro-interactions)
5. [State Animations](#state-animations)
6. [Utility Components](#utility-components)

---

## Page Transitions

### PageTransition

Basic fade-in animation for page content.

```tsx
import { PageTransition } from "@/components/ui/animations";

export default function MyPage() {
  return (
    <PageTransition>
      <h1>Page Content</h1>
    </PageTransition>
  );
}
```

### PageSlideRight / PageSlideLeft

Slide animations for directional transitions.

```tsx
import { PageSlideRight, PageSlideLeft } from "@/components/ui/animations";

// Slide from right
<PageSlideRight>
  <div>Content slides in from right</div>
</PageSlideRight>

// Slide from left
<PageSlideLeft>
  <div>Content slides in from left</div>
</PageSlideLeft>
```

### PageScaleIn

Scale-in animation for modal-like content.

```tsx
import { PageScaleIn } from "@/components/ui/animations";

<PageScaleIn>
  <div>Content scales in</div>
</PageScaleIn>
```

### RouteLoadingBar

Automatic loading bar that appears during route changes.

```tsx
// Add to root layout
import { RouteLoadingBar } from "@/components/ui/animations";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RouteLoadingBar />
        {children}
      </body>
    </html>
  );
}
```

---

## Loading States

### InlineLoading

Small loading spinner for inline use.

```tsx
import { InlineLoading } from "@/components/ui/animations";

<InlineLoading size="sm" message="Loading..." />
<InlineLoading size="md" message="Processing..." />
<InlineLoading size="lg" message="Please wait..." />
```

### CenteredLoading

Centered loading indicator for content areas.

```tsx
import { CenteredLoading } from "@/components/ui/animations";

<CenteredLoading message="Loading data..." variant="spinner" />
<CenteredLoading message="Loading data..." variant="wave" />
```

### FullPageLoading

Full-page loading screen.

```tsx
import { FullPageLoading } from "@/components/ui/animations";

<FullPageLoading message="Initializing application..." />
```

### LoadingOverlay

Overlay that covers content while loading.

```tsx
import { LoadingOverlay } from "@/components/ui/animations";

const [loading, setLoading] = useState(false);

<LoadingOverlay 
  visible={loading} 
  message="Saving changes..." 
  variant="spinner"
  blur={true}
/>
```

### Skeleton Loaders

Pre-built skeleton loaders for common components.

```tsx
import { 
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonTaskCard,
  SkeletonStatsCard,
  SkeletonLeaderboardRow
} from "@/components/ui/animations";

// Generic skeleton
<Skeleton className="h-4 w-full" />

// Pre-built skeletons
<SkeletonCard />
<SkeletonTable />
<SkeletonTaskCard />
<SkeletonStatsCard />
<SkeletonLeaderboardRow />
```

### Progress Indicator

Animated progress bar.

```tsx
import { Progress } from "@/components/ui/animations";

<Progress value={75} variant="eco" size="md" showLabel />
```

---

## Nature-Inspired Animations

### LeafFloat

Floating leaf animation for decorative elements.

```tsx
import { LeafFloat } from "@/components/ui/animations";

<LeafFloat size="sm" delay={0} />
<LeafFloat size="md" delay={0.5} />
<LeafFloat size="lg" delay={1} />
```

### FloatingLeaves

Background decoration with multiple floating leaves.

```tsx
import { FloatingLeaves } from "@/components/ui/animations";

<div className="relative">
  <FloatingLeaves count={8} />
  <div>Your content here</div>
</div>
```

### GrowAnimation

Growth animation for success states.

```tsx
import { GrowAnimation } from "@/components/ui/animations";

<GrowAnimation>
  <div>Content grows in</div>
</GrowAnimation>
```

### SuccessGrowth

Combined grow animation with floating leaves.

```tsx
import { SuccessGrowth } from "@/components/ui/animations";

<SuccessGrowth showLeaves={true}>
  <div className="text-center">
    <CheckCircle className="w-16 h-16 text-eco-leaf" />
    <p>Task Completed!</p>
  </div>
</SuccessGrowth>
```

### WaveAnimation

Wave loading animation.

```tsx
import { WaveAnimation } from "@/components/ui/animations";

<WaveAnimation count={3} />
```

### PulseAnimation

Pulse animation for notifications.

```tsx
import { PulseAnimation } from "@/components/ui/animations";

<PulseAnimation>
  <div className="notification">New message!</div>
</PulseAnimation>
```

### SparkleEffect

Sparkle effect for achievements.

```tsx
import { SparkleEffect } from "@/components/ui/animations";

<SparkleEffect count={5}>
  <Trophy className="w-12 h-12" />
</SparkleEffect>
```

---

## Micro-Interactions

### Button Animations

Buttons automatically include hover, active, and loading states.

```tsx
import { Button } from "@/components/ui/button";

<Button variant="eco">Hover me!</Button>
<Button variant="default" loading>Loading...</Button>
<Button variant="outline">Outline button</Button>
```

### Card Hover Effects

Cards include lift effects on hover.

```tsx
import { Card } from "@/components/ui/card";

<Card variant="elevated">
  <CardContent>Hovers with lift effect</CardContent>
</Card>
```

### Input Focus Animations

Inputs include floating labels and focus rings.

```tsx
import { Input } from "@/components/ui/input";

<Input 
  label="Email" 
  variant="eco"
  success={isValid}
  error={errorMessage}
/>
```

### AnimatedIcon

Icons with hover animations.

```tsx
import { AnimatedIcon } from "@/components/ui/animations";
import { Heart } from "lucide-react";

<AnimatedIcon animation="scale">
  <Heart className="w-6 h-6" />
</AnimatedIcon>

<AnimatedIcon animation="rotate">
  <Settings className="w-6 h-6" />
</AnimatedIcon>

<AnimatedIcon animation="bounce">
  <Star className="w-6 h-6" />
</AnimatedIcon>
```

---

## State Animations

### StateAnimation

Animated state messages (success, error, warning, info).

```tsx
import { StateAnimation } from "@/components/ui/animations";

<StateAnimation type="success" message="Changes saved successfully!" />
<StateAnimation type="error" message="An error occurred" />
<StateAnimation type="warning" message="Please review your input" />
<StateAnimation type="info" message="Did you know..." />
```

---

## Utility Components

### ScrollToTop

Floating button that appears when scrolling down.

```tsx
import { ScrollToTop } from "@/components/ui/animations";

// Add to layout
export default function Layout({ children }) {
  return (
    <>
      {children}
      <ScrollToTop />
    </>
  );
}
```

---

## CSS Animation Classes

You can also use these utility classes directly in your components:

### Transitions
- `animate-fade-in` - Fade in animation
- `animate-slide-in-right` - Slide from right
- `animate-slide-in-left` - Slide from left
- `animate-scale-in` - Scale in animation

### Nature Animations
- `animate-leaf-float` - Floating leaf animation
- `animate-grow` - Growth animation
- `animate-wave` - Wave animation
- `animate-pulse-eco` - Eco-themed pulse

### Loading
- `animate-spin` - Spinning animation
- `animate-pulse` - Pulse animation
- `skeleton-shimmer` - Shimmer effect for skeletons

### Hover Effects
- `hover-lift` - Lift on hover
- `hover-scale` - Scale on hover
- `hover-glow` - Glow on hover
- `hover-eco` - Eco-themed hover effect

---

## Best Practices

1. **Performance**: Use CSS animations for simple effects, JavaScript for complex interactions
2. **Accessibility**: Respect `prefers-reduced-motion` - animations automatically reduce
3. **Consistency**: Use the same animation patterns throughout the app
4. **Timing**: Keep animations between 200-500ms for best UX
5. **Purpose**: Every animation should serve a purpose (feedback, guidance, delight)

---

## Examples

### Task Completion Flow

```tsx
import { SuccessGrowth, StateAnimation } from "@/components/ui/animations";

function TaskCompletionModal() {
  return (
    <div className="p-8">
      <SuccessGrowth showLeaves={true}>
        <CheckCircle className="w-16 h-16 text-eco-leaf mx-auto" />
      </SuccessGrowth>
      
      <StateAnimation 
        type="success" 
        message="Task completed! +50 points earned"
        className="mt-4"
      />
    </div>
  );
}
```

### Loading Data

```tsx
import { SkeletonTaskCard, CenteredLoading } from "@/components/ui/animations";

function TaskList() {
  const { data, loading } = useTasks();
  
  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonTaskCard />
        <SkeletonTaskCard />
        <SkeletonTaskCard />
      </div>
    );
  }
  
  return <div>{/* Render tasks */}</div>;
}
```

### Page with Transition

```tsx
import { PageTransition, FloatingLeaves } from "@/components/ui/animations";

export default function DashboardPage() {
  return (
    <PageTransition>
      <div className="relative min-h-screen">
        <FloatingLeaves count={6} />
        <div className="relative z-10">
          {/* Page content */}
        </div>
      </div>
    </PageTransition>
  );
}
```
