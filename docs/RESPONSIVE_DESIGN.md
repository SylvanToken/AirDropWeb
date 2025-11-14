# Responsive Design Implementation

This document outlines the comprehensive responsive design system implemented for the Sylvan Token Airdrop Platform.

## Overview

The platform follows a mobile-first design approach with support for screen sizes from 320px (small phones) to 4K displays (3840px). All interactive elements meet WCAG 2.1 AA accessibility standards with minimum 44x44px touch targets.

## Breakpoints

The platform uses the following breakpoints (defined in `tailwind.config.ts`):

```typescript
{
  xs: 320px,   // Small phones
  sm: 640px,   // Large phones
  md: 768px,   // Tablets
  lg: 1024px,  // Laptops
  xl: 1280px,  // Desktops
  2xl: 1536px, // Large desktops
  4k: 3840px   // 4K displays
}
```

## Key Features

### 1. Responsive Layouts

#### Grid Systems
- **Responsive Grid Utilities**: Pre-configured grid classes for common layouts
  - `.grid-responsive-2`: 1 column → 2 columns (sm)
  - `.grid-responsive-3`: 1 column → 2 columns (sm) → 3 columns (lg)
  - `.grid-responsive-4`: 1 column → 2 columns (sm) → 4 columns (lg)
  - `.grid-responsive-auto`: Auto-fit grid with responsive columns

#### Container System
- **ResponsiveContainer Component**: Flexible container with configurable max-width and padding
- **Container Widths**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Responsive Padding**: Automatically adjusts padding based on screen size

#### Typography
- **Responsive Text Classes**: Text sizes that scale across breakpoints
  - `.text-responsive-xs` through `.text-responsive-display`
  - Automatically adjusts from mobile to desktop sizes

### 2. Touch Optimizations

#### Touch Target Sizes
All interactive elements meet WCAG 2.1 AA standards:
- **Minimum**: 44x44px (`.touch-target`)
- **Comfortable**: 48x48px (default for buttons)
- **Large**: 56x56px (`.touch-target-lg`) for primary actions

#### Touch Feedback
- **TouchFeedback Component**: Provides visual feedback for touch interactions
- **Strength Levels**: subtle, normal, strong
- **Tap Highlight**: Custom eco-themed tap highlight color

#### Swipe Gestures
- **Swipeable Component**: Detects swipe gestures (left, right, up, down)
- **Configurable**: Threshold and timeout settings
- **Use Cases**: Mobile menu dismissal, card navigation

#### Touch Utilities (`lib/touch-utils.ts`)
```typescript
- isTouchDevice(): Detect touch capability
- addTouchFeedback(): Add touch feedback to elements
- detectSwipe(): Detect swipe gestures
- useSwipe(): React hook for swipe detection
```

### 3. Safe Area Support

#### Viewport Configuration
```typescript
viewport: {
  viewportFit: "cover", // Enable safe area support
}
```

#### Safe Area Classes
- `.safe-area-inset-top`: Padding for top notch
- `.safe-area-inset-bottom`: Padding for bottom notch
- `.safe-area-inset-left`: Padding for left notch
- `.safe-area-inset-right`: Padding for right notch
- `.safe-area-inset`: All sides
- `.pb-safe`: Bottom padding with safe area

#### Tailwind Spacing
```typescript
spacing: {
  'safe': 'env(safe-area-inset-bottom)',
  'safe-top': 'env(safe-area-inset-top)',
  'safe-bottom': 'env(safe-area-inset-bottom)',
  'safe-left': 'env(safe-area-inset-left)',
  'safe-right': 'env(safe-area-inset-right)',
}
```

### 4. Landscape Orientation

#### Landscape Optimizations
- **Hero Heights**: Reduced in landscape to prevent excessive vertical space
- **Mobile Bottom Nav**: Hidden in landscape on small screens
- **Compact Spacing**: Reduced vertical spacing in landscape mode
- **Grid Adjustments**: Optimized column counts for landscape tablets

#### Landscape Classes
- `.hero-landscape-sm/md/lg`: Landscape-optimized hero heights
- `.landscape-compact`: Reduced padding in landscape
- `.landscape-hide-mobile`: Hide on mobile landscape
- `.tablet-landscape-grid-3/4`: Tablet landscape grid layouts

#### Orientation Utilities (`lib/orientation-utils.ts`)
```typescript
- isLandscape(): Check if in landscape mode
- isPortrait(): Check if in portrait mode
- isMobileLandscape(): Check if mobile in landscape
- isTabletLandscape(): Check if tablet in landscape
- useOrientation(): React hook for orientation detection
```

## Component Usage

### ResponsiveContainer

```tsx
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';

<ResponsiveContainer maxWidth="xl" padding paddingSize="md">
  {/* Content */}
</ResponsiveContainer>
```

### ResponsiveGrid

```tsx
import { ResponsiveGrid } from '@/components/layout/ResponsiveContainer';

<ResponsiveGrid 
  cols={{ xs: 1, sm: 2, lg: 3, xl: 4 }}
  gap="md"
>
  {/* Grid items */}
</ResponsiveGrid>
```

### TouchFeedback

```tsx
import { TouchFeedback } from '@/components/ui/TouchFeedback';

<TouchFeedback strength="normal" touchTarget>
  <button>Click me</button>
</TouchFeedback>
```

### Swipeable

```tsx
import { Swipeable } from '@/components/ui/TouchFeedback';

<Swipeable
  onSwipeLeft={() => console.log('Swiped left')}
  onSwipeRight={() => console.log('Swiped right')}
  threshold={50}
>
  {/* Swipeable content */}
</Swipeable>
```

## Responsive Utilities

### Spacing
```css
.spacing-responsive: space-y-4 sm:space-y-6
.padding-responsive: p-4 sm:p-6 lg:p-8
.gap-responsive: gap-3 sm:gap-4 lg:gap-6
```

### Flex Layouts
```css
.flex-responsive: flex flex-col sm:flex-row
.flex-responsive-reverse: flex flex-col-reverse sm:flex-row
```

### Container
```css
.container-fluid: w-full px-4 sm:px-6 lg:px-8
.container-responsive: container mx-auto px-4 sm:px-6 lg:px-8
```

## Testing Guidelines

### Screen Sizes to Test
1. **Mobile Portrait**: 320px, 375px, 414px
2. **Mobile Landscape**: 568px, 667px, 736px
3. **Tablet Portrait**: 768px, 834px
4. **Tablet Landscape**: 1024px, 1112px
5. **Desktop**: 1280px, 1440px, 1920px
6. **4K**: 3840px

### Devices to Test
- iPhone SE (320px)
- iPhone 12/13/14 (390px)
- iPhone 12/13/14 Pro Max (428px)
- iPad (768px)
- iPad Pro (1024px)
- Desktop (1920px)

### Orientation Testing
- Test all pages in both portrait and landscape
- Verify hero heights adjust appropriately
- Check that mobile bottom nav hides in landscape
- Ensure touch targets remain accessible

### Touch Testing
- Verify all buttons are at least 44x44px
- Test swipe gestures on mobile menu
- Check touch feedback on interactive elements
- Ensure tap highlights are visible

### Safe Area Testing
- Test on devices with notches (iPhone X and newer)
- Verify header respects top safe area
- Check footer respects bottom safe area
- Test mobile bottom nav with safe area

## Performance Considerations

### CSS Optimization
- Use Tailwind's purge to remove unused classes
- Minimize custom CSS
- Use CSS containment where appropriate

### Image Optimization
- Use Next.js Image component
- Implement responsive images with srcset
- Use appropriate image sizes for breakpoints

### JavaScript Optimization
- Use React.memo for expensive components
- Implement code splitting for responsive utilities
- Lazy load below-fold content

## Accessibility

### WCAG 2.1 AA Compliance
- ✅ Minimum 44x44px touch targets
- ✅ Sufficient color contrast (4.5:1 for normal text)
- ✅ Keyboard navigation support
- ✅ Screen reader support with ARIA labels
- ✅ Focus indicators visible on all interactive elements

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast
```css
@media (prefers-contrast: high) {
  .border-eco {
    border-width: 3px;
  }
}
```

## Best Practices

### Mobile-First Approach
1. Design for mobile (320px) first
2. Add complexity for larger screens
3. Use progressive enhancement
4. Test on real devices

### Touch-Friendly Design
1. Ensure minimum 44x44px touch targets
2. Add adequate spacing between interactive elements
3. Provide visual feedback on touch
4. Support swipe gestures where appropriate

### Performance
1. Optimize images for different screen sizes
2. Use lazy loading for below-fold content
3. Minimize JavaScript for mobile devices
4. Use CSS containment for better performance

### Accessibility
1. Test with keyboard navigation
2. Test with screen readers
3. Verify color contrast
4. Support reduced motion preferences

## Future Enhancements

### Planned Features
1. **Adaptive Images**: Serve different image sizes based on device
2. **Network-Aware Loading**: Adjust quality based on connection speed
3. **Device-Specific Optimizations**: Optimize for specific device capabilities
4. **Advanced Gestures**: Pinch-to-zoom, long-press, etc.
5. **Responsive Typography**: Fluid typography that scales smoothly

### Potential Improvements
1. Implement container queries when widely supported
2. Add more landscape-specific layouts
3. Enhance touch feedback with haptic feedback
4. Add more swipe gesture patterns
5. Implement pull-to-refresh on mobile

## Resources

### Documentation
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Touch Target Sizes](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Safe Area Insets](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

### Tools
- [Responsive Design Checker](https://responsivedesignchecker.com/)
- [BrowserStack](https://www.browserstack.com/) - Cross-device testing
- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing

## Changelog

### 2025-11-09
- ✅ Implemented responsive layout system
- ✅ Added touch optimizations with 44x44px minimum targets
- ✅ Implemented safe area support for notched devices
- ✅ Optimized for landscape orientation
- ✅ Created comprehensive utility libraries
- ✅ Updated all major components for responsiveness
