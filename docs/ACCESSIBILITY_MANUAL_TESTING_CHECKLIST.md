# Accessibility Manual Testing Checklist

This checklist provides a comprehensive guide for manually testing accessibility features of the Sylvan Token Airdrop Platform. Use this checklist for regular accessibility audits and before major releases.

## Testing Overview

- **Frequency**: Before each major release, quarterly audits
- **Standards**: WCAG 2.1 Level AA
- **Time Required**: 2-4 hours for complete audit
- **Testers**: Minimum 2 people (1 with accessibility expertise)

---

## 1. Keyboard Navigation Testing

### General Keyboard Access

- [ ] All interactive elements are reachable via Tab key
- [ ] Tab order is logical (left-to-right, top-to-bottom)
- [ ] Shift+Tab moves focus backwards correctly
- [ ] No keyboard traps (can always move focus away)
- [ ] Enter key activates buttons and links
- [ ] Space key activates buttons and checkboxes
- [ ] Escape key closes modals and dropdowns

### Focus Indicators

- [ ] Focus indicators are visible on all interactive elements
- [ ] Focus indicators have sufficient contrast (3:1 minimum)
- [ ] Focus indicators are not obscured by other elements
- [ ] Focus indicators work in both light and dark modes
- [ ] Custom focus styles are consistent across components

### Skip Links

- [ ] Skip links appear when Tab is pressed on page load
- [ ] "Skip to main content" link works correctly
- [ ] "Skip to navigation" link works correctly
- [ ] "Skip to footer" link works correctly
- [ ] Skip links are visible when focused
- [ ] Skip links move focus to correct location

### Keyboard Shortcuts

Test each global keyboard shortcut:

- [ ] `Alt + H` - Navigate to Home
- [ ] `Alt + D` - Navigate to Dashboard
- [ ] `Alt + T` - Navigate to Tasks
- [ ] `Alt + L` - Navigate to Leaderboard
- [ ] `Alt + P` - Navigate to Profile
- [ ] Shortcuts work on all pages
- [ ] Shortcuts don't conflict with browser shortcuts
- [ ] Shortcuts are documented and discoverable

### Forms

- [ ] Tab moves between form fields in logical order
- [ ] Required fields are indicated
- [ ] Error messages appear when validation fails
- [ ] Focus moves to first error field on submit
- [ ] Can submit form using Enter key
- [ ] Can reset/cancel form using keyboard
- [ ] Dropdown menus work with arrow keys
- [ ] Checkboxes toggle with Space key
- [ ] Radio buttons navigate with arrow keys

### Modals and Dialogs

- [ ] Focus moves to modal when opened
- [ ] Focus is trapped within modal
- [ ] Tab cycles through modal elements only
- [ ] Escape key closes modal
- [ ] Focus returns to trigger element when closed
- [ ] Modal has proper ARIA attributes
- [ ] Background content is inert when modal is open

### Dropdowns and Menus

- [ ] Enter or Space opens dropdown
- [ ] Arrow keys navigate menu items
- [ ] Escape closes dropdown
- [ ] Focus returns to trigger when closed
- [ ] Selected item is indicated
- [ ] Can type to search/filter items

---

## 2. Screen Reader Testing

### NVDA (Windows) Testing

#### Setup
1. Download NVDA from https://www.nvaccess.org/
2. Install and launch NVDA
3. Open Chrome or Firefox
4. Navigate to platform

#### Tests

- [ ] Page title is announced on page load
- [ ] Landmarks are announced (header, nav, main, footer)
- [ ] Headings are announced with correct level
- [ ] Links are announced with descriptive text
- [ ] Buttons are announced with accessible names
- [ ] Form labels are announced with inputs
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] Dynamic content updates are announced
- [ ] Images have appropriate alt text
- [ ] Tables have proper headers (admin panel)
- [ ] Lists are announced as lists
- [ ] Current page is indicated in navigation

#### Navigation Commands
- [ ] `H` - Navigate by headings
- [ ] `K` - Navigate by links
- [ ] `B` - Navigate by buttons
- [ ] `F` - Navigate by form fields
- [ ] `D` - Navigate by landmarks
- [ ] `T` - Navigate by tables
- [ ] `L` - Navigate by lists

### JAWS (Windows) Testing

#### Setup
1. Launch JAWS
2. Open Chrome or Edge
3. Navigate to platform

#### Tests

- [ ] All NVDA tests (above) also pass with JAWS
- [ ] Forms mode activates correctly
- [ ] Virtual cursor works properly
- [ ] Link list feature shows all links
- [ ] Heading list feature shows all headings
- [ ] Table navigation works correctly
- [ ] ARIA live regions are announced

### VoiceOver (macOS/iOS) Testing

#### macOS Setup
1. Enable VoiceOver: Cmd + F5
2. Open Safari
3. Navigate to platform

#### macOS Tests

- [ ] All screen reader tests pass
- [ ] Rotor navigation works (Cmd + U)
- [ ] Web spots are identified
- [ ] Form controls are accessible
- [ ] Trackpad gestures work

#### iOS Setup
1. Enable VoiceOver in Settings > Accessibility
2. Open Safari
3. Navigate to platform

#### iOS Tests

- [ ] All screen reader tests pass
- [ ] Swipe gestures work correctly
- [ ] Rotor navigation works
- [ ] Form controls are accessible
- [ ] Touch targets are adequate
- [ ] Zoom works correctly

---

## 3. Color Contrast Testing

### Tools Needed
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools (Inspect > Accessibility)
- Color Contrast Analyzer (desktop app)

### Text Contrast

#### Light Mode
- [ ] Body text meets 4.5:1 minimum
- [ ] Heading text meets 4.5:1 minimum
- [ ] Link text meets 4.5:1 minimum
- [ ] Button text meets 4.5:1 minimum
- [ ] Muted text meets 4.5:1 minimum
- [ ] Error text meets 4.5:1 minimum
- [ ] Success text meets 4.5:1 minimum
- [ ] Warning text meets 4.5:1 minimum
- [ ] Info text meets 4.5:1 minimum

#### Dark Mode
- [ ] Body text meets 4.5:1 minimum
- [ ] Heading text meets 4.5:1 minimum
- [ ] Link text meets 4.5:1 minimum
- [ ] Button text meets 4.5:1 minimum
- [ ] Muted text meets 4.5:1 minimum
- [ ] Error text meets 4.5:1 minimum
- [ ] Success text meets 4.5:1 minimum
- [ ] Warning text meets 4.5:1 minimum
- [ ] Info text meets 4.5:1 minimum

### UI Component Contrast

- [ ] Focus indicators meet 3:1 minimum
- [ ] Input borders (focused) meet 3:1 minimum
- [ ] Button borders meet 3:1 minimum
- [ ] Icon colors meet 3:1 minimum
- [ ] Disabled elements are distinguishable
- [ ] Placeholder text meets 4.5:1 minimum

### Non-Text Contrast

- [ ] Icons meet 3:1 minimum
- [ ] Graphical objects meet 3:1 minimum
- [ ] UI component states meet 3:1 minimum
- [ ] Focus indicators meet 3:1 minimum

### Error States

- [ ] Errors use color + icon + text
- [ ] Error borders are visible
- [ ] Error icons are distinguishable
- [ ] Error text is readable
- [ ] Errors work without color

### Testing Process

For each element:
1. Use browser inspector to get colors
2. Enter colors in contrast checker
3. Verify ratio meets standard
4. Document any failures
5. Test in both light and dark modes

---

## 4. Semantic HTML and ARIA Testing

### Landmarks

- [ ] One `<header>` or `role="banner"` per page
- [ ] One `<main>` or `role="main"` per page
- [ ] One `<footer>` or `role="contentinfo"` per page
- [ ] Navigation uses `<nav>` or `role="navigation"`
- [ ] Complementary content uses `<aside>` or `role="complementary"`
- [ ] Landmarks have unique labels if multiple of same type

### Headings

- [ ] One `<h1>` per page
- [ ] Heading hierarchy is logical (no skipped levels)
- [ ] Headings describe content sections
- [ ] Headings are not used for styling only
- [ ] Heading levels increase by one

### Lists

- [ ] Unordered lists use `<ul>` and `<li>`
- [ ] Ordered lists use `<ol>` and `<li>`
- [ ] Description lists use `<dl>`, `<dt>`, `<dd>`
- [ ] Lists are not used for layout only
- [ ] Navigation menus use list markup

### Forms

- [ ] All inputs have associated `<label>` elements
- [ ] Labels use `for` attribute matching input `id`
- [ ] Required fields have `required` attribute
- [ ] Error messages use `aria-describedby`
- [ ] Invalid fields have `aria-invalid="true"`
- [ ] Fieldsets group related inputs
- [ ] Legends describe fieldset purpose

### Buttons and Links

- [ ] Buttons use `<button>` element
- [ ] Links use `<a>` element with `href`
- [ ] Icon buttons have `aria-label`
- [ ] Button purpose is clear from text/label
- [ ] Links describe destination
- [ ] External links are indicated

### Images

- [ ] Content images have descriptive `alt` text
- [ ] Decorative images have empty `alt=""`
- [ ] Complex images have extended descriptions
- [ ] Alt text is concise and meaningful
- [ ] Alt text doesn't include "image of" or "picture of"

### Tables

- [ ] Data tables use `<table>` element
- [ ] Tables have `<caption>` describing content
- [ ] Header cells use `<th>` element
- [ ] Header cells have `scope` attribute
- [ ] Complex tables use `id` and `headers` attributes
- [ ] Tables are not used for layout

### ARIA Attributes

- [ ] `aria-label` used for icon buttons
- [ ] `aria-labelledby` used for complex labels
- [ ] `aria-describedby` used for help text
- [ ] `aria-current="page"` on active nav items
- [ ] `aria-expanded` on expandable elements
- [ ] `aria-haspopup` on menu triggers
- [ ] `aria-hidden="true"` on decorative elements
- [ ] `aria-live` on dynamic content
- [ ] `role="alert"` on error messages
- [ ] `role="status"` on status updates
- [ ] `role="dialog"` on modals

---

## 5. Touch Target Testing

### Mobile Device Testing

Test on actual devices:
- [ ] iPhone (iOS)
- [ ] Android phone
- [ ] iPad (tablet)

### Touch Target Size

- [ ] All buttons are at least 44x44px
- [ ] All links are at least 44x44px (with padding)
- [ ] Form inputs are at least 44px tall
- [ ] Checkboxes have 44x44px touch area
- [ ] Radio buttons have 44x44px touch area
- [ ] Icon buttons are at least 44x44px
- [ ] Navigation items are at least 44px tall

### Touch Target Spacing

- [ ] Adequate spacing between touch targets (8px minimum)
- [ ] No overlapping touch areas
- [ ] Touch targets don't require precision
- [ ] Accidental touches are minimized

### Mobile Navigation

- [ ] Bottom navigation items are 56px+ tall
- [ ] Hamburger menu button is 44x44px+
- [ ] Mobile menu items are 48px+ tall
- [ ] Swipe gestures work correctly
- [ ] Pinch to zoom works (if applicable)

---

## 6. Motion Preferences Testing

### System Preference Testing

#### Windows
1. Settings > Accessibility > Visual effects
2. Turn on "Show animations in Windows"
3. Test platform

#### macOS
1. System Preferences > Accessibility > Display
2. Check "Reduce motion"
3. Test platform

#### iOS
1. Settings > Accessibility > Motion
2. Enable "Reduce Motion"
3. Test platform

### Tests

- [ ] System preference is detected automatically
- [ ] Animations are disabled when preference is set
- [ ] Page transitions are instant
- [ ] Hover effects are disabled
- [ ] Loading animations are simplified
- [ ] Scroll behavior is instant
- [ ] All functionality still works
- [ ] Color transitions are preserved
- [ ] Opacity transitions are preserved

### User Toggle Testing

- [ ] Accessibility settings panel is accessible
- [ ] Animation toggle is clearly labeled
- [ ] Toggle state is visible
- [ ] Toggle works correctly
- [ ] Setting persists across sessions
- [ ] Setting syncs across tabs
- [ ] Can override system preference
- [ ] Changes apply immediately

---

## 7. Responsive Design Testing

### Viewport Sizes

Test at these breakpoints:
- [ ] 320px (small phone)
- [ ] 375px (iPhone SE)
- [ ] 390px (iPhone 12)
- [ ] 768px (tablet portrait)
- [ ] 1024px (tablet landscape)
- [ ] 1280px (laptop)
- [ ] 1920px (desktop)
- [ ] 2560px (large desktop)

### Zoom Testing

- [ ] 100% zoom - default view
- [ ] 125% zoom - readable
- [ ] 150% zoom - readable
- [ ] 175% zoom - readable
- [ ] 200% zoom - readable
- [ ] No horizontal scrolling at any zoom level
- [ ] All content remains accessible
- [ ] Touch targets remain adequate

### Orientation Testing

- [ ] Portrait orientation works correctly
- [ ] Landscape orientation works correctly
- [ ] Layout adapts appropriately
- [ ] No content is cut off
- [ ] Navigation remains accessible

---

## 8. Language and Internationalization

### Language Switching

- [ ] Language switcher is accessible
- [ ] All languages are listed
- [ ] Current language is indicated
- [ ] Language change works correctly
- [ ] Language persists across sessions
- [ ] `lang` attribute updates on `<html>`

### Content Testing

For each language (en, tr, de, zh, ru):
- [ ] All UI text is translated
- [ ] No untranslated strings
- [ ] Text doesn't overflow containers
- [ ] Date format is appropriate
- [ ] Number format is appropriate
- [ ] Currency format is appropriate
- [ ] Text direction is correct

---

## 9. Browser Compatibility

### Desktop Browsers

- [ ] Chrome (latest) - Full functionality
- [ ] Firefox (latest) - Full functionality
- [ ] Safari (latest) - Full functionality
- [ ] Edge (latest) - Full functionality
- [ ] Chrome (previous version) - Full functionality
- [ ] Firefox (previous version) - Full functionality

### Mobile Browsers

- [ ] iOS Safari - Full functionality
- [ ] Chrome Mobile (Android) - Full functionality
- [ ] Samsung Internet - Full functionality
- [ ] Firefox Mobile - Full functionality

---

## 10. Automated Testing

### axe DevTools

1. Install axe DevTools browser extension
2. Open platform in browser
3. Run axe scan on each page
4. Review violations
5. Fix any issues found

Pages to test:
- [ ] Home page
- [ ] Login page
- [ ] Register page
- [ ] Dashboard
- [ ] Tasks page
- [ ] Leaderboard
- [ ] Profile page
- [ ] Wallet page
- [ ] Admin dashboard
- [ ] Admin users page
- [ ] Admin tasks page
- [ ] Terms page
- [ ] Privacy page

### Lighthouse

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Accessibility" category
4. Run audit
5. Review score and issues

Target scores:
- [ ] Accessibility: 95+ (100 ideal)
- [ ] Best Practices: 90+
- [ ] SEO: 90+

---

## 11. Documentation Review

- [ ] ACCESSIBILITY.md is up to date
- [ ] All features are documented
- [ ] Code examples are correct
- [ ] Links work correctly
- [ ] Screenshots are current
- [ ] Changelog is updated

---

## 12. Issue Tracking

### For Each Issue Found

1. **Document the issue**:
   - Page/component affected
   - WCAG criterion violated
   - Severity (Critical, High, Medium, Low)
   - Steps to reproduce
   - Expected behavior
   - Actual behavior

2. **Prioritize**:
   - Critical: Blocks access to core functionality
   - High: Significantly impacts usability
   - Medium: Impacts some users
   - Low: Minor inconvenience

3. **Create ticket**:
   - Add to issue tracker
   - Assign to developer
   - Set due date
   - Link to WCAG criterion

4. **Verify fix**:
   - Retest after fix
   - Verify no regression
   - Update documentation
   - Close ticket

---

## Testing Sign-off

### Tester Information

- **Tester Name**: ___________________________
- **Date**: ___________________________
- **Version Tested**: ___________________________
- **Browser/Device**: ___________________________

### Results Summary

- **Total Tests**: ___________________________
- **Tests Passed**: ___________________________
- **Tests Failed**: ___________________________
- **Critical Issues**: ___________________________
- **High Issues**: ___________________________
- **Medium Issues**: ___________________________
- **Low Issues**: ___________________________

### Compliance Status

- [ ] WCAG 2.1 Level A Compliant
- [ ] WCAG 2.1 Level AA Compliant
- [ ] WCAG 2.1 Level AAA Compliant (optional)

### Approval

- [ ] Accessibility testing complete
- [ ] All critical issues resolved
- [ ] All high issues resolved or documented
- [ ] Ready for release

**Signature**: ___________________________  
**Date**: ___________________________

---

## Resources

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Screen Readers
- [NVDA](https://www.nvaccess.org/) (Free, Windows)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Paid, Windows)
- VoiceOver (Built-in, macOS/iOS)

### Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Articles](https://webaim.org/articles/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

### Training
- [Web Accessibility by Google](https://www.udacity.com/course/web-accessibility--ud891)
- [Deque University](https://dequeuniversity.com/)
- [WebAIM Training](https://webaim.org/training/)
