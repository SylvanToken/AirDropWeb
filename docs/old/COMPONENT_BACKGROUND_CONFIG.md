# Page Background Configuration

## Overview

The PageBackground component provides a full-page, fixed background image with configurable opacity settings for a watermark effect.

## Configuration

Edit `components/layout/PageBackground.tsx` to adjust the background appearance:

### Background Opacity

Controls how visible the background image is:

```typescript
const BACKGROUND_OPACITY = 70; // 70% visibility
```

**Values:**
- `0` = Completely transparent (invisible)
- `70` = Watermark effect (recommended for contain mode)
- `100` = Fully opaque (completely visible)

**Recommended Range:** 50-80 (for contain mode)

### Overlay Opacity

Controls the darkness of the overlay for better text readability:

```typescript
const OVERLAY_OPACITY = 30; // 30% overlay darkness
```

**Values:**
- `0` = No overlay (maximum background visibility)
- `30` = Light overlay (recommended for contain mode)
- `100` = Dark overlay (maximum text readability)

**Recommended Range:** 20-50 (for contain mode)

## Examples

### Subtle Watermark (Light)
```typescript
const BACKGROUND_OPACITY = 30;  // Light background
const OVERLAY_OPACITY = 60;     // Darker overlay
```
Result: Very subtle background, excellent text readability

### Balanced Watermark (Default - Contain Mode)
```typescript
const BACKGROUND_OPACITY = 70;  // Strong background
const OVERLAY_OPACITY = 30;     // Light overlay
```
Result: Visible background with full image, good text readability

### Prominent Background
```typescript
const BACKGROUND_OPACITY = 70;  // Strong background
const OVERLAY_OPACITY = 30;     // Light overlay
```
Result: Very visible background, may affect text readability

### Minimal Background
```typescript
const BACKGROUND_OPACITY = 20;  // Very light background
const OVERLAY_OPACITY = 70;     // Strong overlay
```
Result: Barely visible background, maximum text readability

## Tips

1. **Balance is Key**: Higher background opacity requires higher overlay opacity for readability
2. **Test on Different Screens**: Check appearance on various devices and screen sizes
3. **Consider Content**: Pages with lots of text may need higher overlay opacity
4. **Dark Mode**: Current settings work well for both light and dark modes
5. **Performance**: Opacity changes don't affect performance

## Technical Details

### Background Properties
- **Position**: Fixed (doesn't scroll with content)
- **Size**: Contain (entire image fits in viewport, no cropping)
- **Position**: Center (image centered in viewport)
- **Repeat**: No-repeat (image doesn't tile)
- **Attachment**: Fixed (stays in place during scroll)
- **Z-Index**: 0 (behind all content)
- **Cross-Browser**: Vendor prefixes included for maximum compatibility

### Overlay Properties
- **Gradient**: Top to bottom fade
- **Backdrop Blur**: 2px for subtle blur effect
- **Z-Index**: Inside background container

## Troubleshooting

### Background Too Visible
- Decrease `BACKGROUND_OPACITY`
- Increase `OVERLAY_OPACITY`

### Background Not Visible Enough
- Increase `BACKGROUND_OPACITY`
- Decrease `OVERLAY_OPACITY`

### Text Hard to Read
- Increase `OVERLAY_OPACITY`
- Consider decreasing `BACKGROUND_OPACITY`

### Background Changes Not Showing
- Clear browser cache
- Hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Restart development server

## Related Files

- `components/layout/PageBackground.tsx` - Main component
- `lib/hero-images.ts` - Image source configuration
- `app/layout.tsx` - Root layout integration

## Future Enhancements

- [ ] Add runtime configuration (no code changes needed)
- [ ] Per-page background customization
- [ ] User preference storage
- [ ] Admin panel controls
- [ ] Animated transitions between images
