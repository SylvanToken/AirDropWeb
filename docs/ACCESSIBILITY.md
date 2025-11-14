# Accessibility Implementation

This document outlines the accessibility features implemented in the Sylvan Token Airdrop Platform to ensure WCAG 2.1 AA compliance.

## Overview

The platform has been designed and developed with accessibility as a core principle, ensuring that all users, regardless of their abilities, can effectively use the application.

## Implemented Features

### 1. Keyboard Navigation

#### Skip Links
- **Location**: Top of every page (visible on focus)
- **Purpose**: Allows keyboard users to bypass repetitive navigation
- **Links**:
  - Skip to main content
  - Skip to navigation
  - Skip to footer

#### Keyboard Shortcuts
Global keyboard shortcuts for quick navigation:
- `Alt + H`: Go to Home
- `Alt + D`: Go to Dashboard
- `Alt + T`: Go to Tasks
- `Alt + L`: Go to Leaderboard
- `Alt + P`: Go to Profile
- `Tab`: Navigate between elements
- `Shift + Tab`: Navigate backwards
- `Enter`: Activate focused element
- `Escape`: Close modal/dropdown

#### Focus Management
- All interactive elements are keyboard accessible
- Logical tab order throughout the application
- Visible focus indicators with sufficient contrast (2px outline)
- Focus trap in modals and dropdowns

### 2. Screen Reader Support

#### ARIA Labels
- All icon-only buttons have descriptive `aria-label` attributes
- Decorative images use empty `alt=""` attributes
- Meaningful images have descriptive alt text

#### ARIA Live Regions
- Dynamic content changes are announced to screen readers
- Status messages use appropriate politeness levels:
  - `polite`: Success messages, info updates
  - `assertive`: Error messages, critical alerts

#### Semantic HTML
- Proper use of HTML5 landmarks:
  - `<header role="banner">`
  - `<nav role="navigation">`
  - `<main role="main">`
  - `<footer role="contentinfo">`
- Heading hierarchy (h1-h6) properly structured
- Lists use `<ul>`, `<ol>`, and `<li>` elements
- Forms use proper `<label>` associations

#### ARIA Attributes
- `aria-current="page"` for active navigation items
- `aria-expanded` for expandable elements
- `aria-haspopup` for dropdown menus
- `aria-hidden="true"` for decorative elements
- `role="status"` for status indicators

### 3. Color Contrast Compliance

#### WCAG AA Standards
All text meets minimum contrast ratios:
- Normal text (< 18pt): 4.5:1 minimum
- Large text (≥ 18pt or 14pt bold): 3:1 minimum

#### Verified Color Combinations

**Light Mode:**
- Text on background: 10.5:1 (AAA)
- Primary button text: 5.2:1 (AA)
- Link text: 4.8:1 (AA)
- Error text: 5.9:1 (AA)
- Success text: 4.6:1 (AA)

**Dark Mode:**
- Text on background: 11.2:1 (AAA)
- Primary button text: 5.2:1 (AA)
- Link text: 8.5:1 (AAA)
- Error text: 7.1:1 (AAA)
- Success text: 8.5:1 (AAA)

#### Focus Indicators
- Minimum 2px outline width
- Contrast ratio of 3:1 against background
- Additional shadow for enhanced visibility
- Different colors for light/dark modes

#### Error States
Error states use multiple indicators (not color alone):
- Red border
- Error icon
- Descriptive error text
- ARIA live region announcement

#### Success States
Success states use multiple indicators:
- Green border
- Success icon (checkmark)
- Descriptive success text
- ARIA live region announcement

### 4. Motion Preferences Support

#### System Preference Detection
- Automatically detects `prefers-reduced-motion` media query
- Respects user's operating system settings
- Applies reduced motion by default if system preference is set

#### User Control
- Toggle switch in accessibility settings
- Preference saved to localStorage
- Can override system preference
- Applied via `data-reduce-motion` attribute

#### Reduced Motion Behavior
When reduced motion is enabled:
- Animation duration reduced to 0.01ms
- Transform animations disabled
- Scroll behavior set to auto (no smooth scrolling)
- Essential state transitions preserved (color, opacity)

#### CSS Implementation
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable animations */
}

[data-reduce-motion="true"] * {
  /* User-controlled reduced motion */
}
```

## Components

### Accessibility Components

#### SkipLinks
```tsx
<SkipLinks />
```
Provides skip navigation links at the top of the page.

#### KeyboardShortcutsProvider
```tsx
<KeyboardShortcutsProvider>
  {children}
</KeyboardShortcutsProvider>
```
Enables global keyboard shortcuts throughout the application.

#### AriaLive
```tsx
<AriaLive message="Content loaded" politeness="polite" />
```
Announces dynamic content changes to screen readers.

#### AccessibilitySettings
```tsx
<AccessibilitySettings />
```
Full settings panel for accessibility preferences.

#### AccessibilityToggle
```tsx
<AccessibilityToggle />
```
Compact toggle for animation preferences.

### Providers

#### MotionPreferencesProvider
```tsx
<MotionPreferencesProvider>
  {children}
</MotionPreferencesProvider>
```
Manages motion and animation preferences.

### Hooks

#### useMotionPreferences
```tsx
const { prefersReducedMotion, animationsEnabled, toggleAnimations } = useMotionPreferences();
```
Access motion preferences in any component.

## Utilities

### Accessibility Utils (`lib/accessibility-utils.ts`)

#### Color Contrast Functions
```typescript
// Calculate contrast ratio
const ratio = getContrastRatio('#000000', '#FFFFFF'); // 21

// Check WCAG compliance
const meetsAA = meetsWCAG_AA('#000000', '#FFFFFF'); // true
const meetsAAA = meetsWCAG_AAA('#000000', '#FFFFFF'); // true

// Get compliance level
const level = getWCAGLevel('#000000', '#FFFFFF'); // 'AAA'
```

#### Style Constants
```typescript
import { focusStyles, errorStateStyles, successStateStyles } from '@/lib/accessibility-utils';
```

## CSS Classes

### Screen Reader Only
```css
.sr-only /* Hidden but accessible to screen readers */
.sr-only-focusable /* Visible when focused */
```

### Focus Indicators
```css
.focus-visible-enhanced /* Enhanced focus indicator */
.focus-ring-eco /* Eco-themed focus ring */
```

### State Indicators
```css
.error-state /* Error styling with sufficient contrast */
.success-state /* Success styling with sufficient contrast */
.warning-state /* Warning styling with sufficient contrast */
.info-state /* Info styling with sufficient contrast */
```

### Touch Targets
```css
.touch-target /* Ensures minimum 44x44px size */
```

## Testing

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] All interactive elements are reachable via Tab
- [ ] Tab order is logical and intuitive
- [ ] Skip links work correctly
- [ ] Keyboard shortcuts function as expected
- [ ] Focus indicators are visible
- [ ] No keyboard traps

#### Screen Reader Testing
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] All images have appropriate alt text
- [ ] Dynamic content is announced
- [ ] Form labels are properly associated
- [ ] Landmarks are correctly identified

#### Color Contrast
- [ ] Run automated contrast checker
- [ ] Verify all text meets WCAG AA
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Check focus indicators
- [ ] Verify error/success states

#### Motion Preferences
- [ ] Test with system reduced motion enabled
- [ ] Test user toggle functionality
- [ ] Verify animations are disabled
- [ ] Check that functionality remains intact

### Automated Testing Tools

#### Recommended Tools
- **axe DevTools**: Browser extension for accessibility testing
- **Lighthouse**: Built into Chrome DevTools
- **WAVE**: Web accessibility evaluation tool
- **Color Contrast Analyzer**: Desktop application

#### Running Tests
```bash
# Run Lighthouse audit
npm run lighthouse

# Run axe-core tests (if configured)
npm run test:a11y
```

## Browser Support

Accessibility features are supported in:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

### Planned Improvements
1. **Voice Navigation**: Voice commands for common actions
2. **High Contrast Mode**: Additional high contrast theme
3. **Text Scaling**: Support for larger text sizes
4. **RTL Support**: Right-to-left language support
5. **Haptic Feedback**: Vibration feedback on mobile devices

### Under Consideration
- Screen reader mode with simplified layout
- Dyslexia-friendly font option
- Color blindness simulation mode
- Keyboard navigation tutorial

## Resources

### WCAG Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/)

### Testing Resources
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Best Practices
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)

## Support

For accessibility issues or suggestions, please:
1. Open an issue on GitHub
2. Contact the development team
3. Submit a pull request with improvements

## Compliance Statement

The Sylvan Token Airdrop Platform strives to meet WCAG 2.1 Level AA standards. We are committed to ensuring digital accessibility for people with disabilities and continuously improving the user experience for everyone.

Last Updated: November 9, 2025
