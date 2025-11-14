# Image Optimization Guide

This document outlines the image optimization strategies implemented in the Sylvan Token Airdrop Platform.

## Overview

The platform uses Next.js Image component with advanced optimization techniques to ensure fast loading times and excellent user experience across all devices.

## Image Formats

### Supported Formats (in order of preference)

1. **AVIF** - Best compression, modern browsers
2. **WebP** - Good compression, wide browser support
3. **JPEG** - Fallback for older browsers

Next.js automatically serves the best format based on browser support.

## Image Optimization Features

### 1. Responsive Images

Images are served in multiple sizes based on device:
- Mobile: 320px, 640px, 750px, 828px
- Tablet: 1080px, 1200px
- Desktop: 1920px, 2048px, 3840px

### 2. Blur Placeholders

All images use blur placeholders for better perceived performance:
- **Default**: Neutral gray blur
- **Eco Theme**: Green-tinted blur for nature images

### 3. Lazy Loading

Images below the fold are lazy loaded:
- Uses native browser lazy loading
- Intersection Observer for custom implementations
- 50px margin for preloading before viewport

### 4. Priority Loading

Critical images are prioritized:
- Hero images on home page
- Logo images
- Above-the-fold content

### 5. Caching Strategy

Static images are cached for 1 year:
- `Cache-Control: public, max-age=31536000, immutable`
- CDN-friendly headers
- Optimized for repeat visits

## Usage Examples

### Hero Images

```typescript
import { getHeroImageProps } from '@/lib/image-optimization';

<Image {...getHeroImageProps('/assets/heroes/forest-1.webp', true)} />
```

### Card Images

```typescript
import { getCardImageProps } from '@/lib/image-optimization';

<Image {...getCardImageProps('/assets/images/card.webp', 'Card description')} />
```

### Avatar Images

```typescript
import { getAvatarImageProps } from '@/lib/image-optimization';

<Image {...getAvatarImageProps('/assets/avatars/user.webp', 'User name', 'medium')} />
```

### Logo Images

```typescript
import { getLogoImageProps } from '@/lib/image-optimization';

<Image {...getLogoImageProps('/assets/logo.webp', 'Sylvan Token', 'medium')} />
```

## Image Preparation Guidelines

### Hero Images

- **Format**: WebP with JPEG fallback
- **Dimensions**: 1920x1080 (desktop), 768x1024 (mobile)
- **Quality**: 85%
- **File Size**: < 200KB per image
- **Optimization**: Use tools like Squoosh or ImageOptim

### Card Images

- **Format**: WebP with JPEG fallback
- **Dimensions**: 640x480
- **Quality**: 75%
- **File Size**: < 100KB per image

### Avatar Images

- **Format**: WebP with JPEG fallback
- **Dimensions**: 128x128
- **Quality**: 75%
- **File Size**: < 20KB per image

### Logo Images

- **Format**: SVG (preferred) or WebP
- **Dimensions**: 240x80
- **Quality**: 85%
- **File Size**: < 10KB

## Performance Metrics

### Target Metrics

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **Image Load Time**: < 1s on 3G

### Optimization Checklist

- [ ] All images use Next.js Image component
- [ ] Hero images have priority loading
- [ ] Below-fold images are lazy loaded
- [ ] All images have blur placeholders
- [ ] Images are served in WebP/AVIF format
- [ ] Responsive sizes are configured
- [ ] Cache headers are set correctly
- [ ] Images are compressed to target file sizes

## Tools and Resources

### Image Optimization Tools

- **Squoosh**: https://squoosh.app/ (Web-based)
- **ImageOptim**: https://imageoptim.com/ (Mac)
- **TinyPNG**: https://tinypng.com/ (Web-based)
- **Sharp**: https://sharp.pixelplumbing.com/ (Node.js)

### Testing Tools

- **Lighthouse**: Built into Chrome DevTools
- **WebPageTest**: https://www.webpagetest.org/
- **PageSpeed Insights**: https://pagespeed.web.dev/

### Conversion Commands

Convert JPEG to WebP:
```bash
cwebp -q 85 input.jpg -o output.webp
```

Convert PNG to WebP:
```bash
cwebp -q 85 input.png -o output.webp
```

Batch convert (requires ImageMagick):
```bash
mogrify -format webp -quality 85 *.jpg
```

## Browser Support

### WebP Support
- Chrome: 23+
- Firefox: 65+
- Safari: 14+
- Edge: 18+

### AVIF Support
- Chrome: 85+
- Firefox: 93+
- Safari: 16+
- Edge: 85+

### Fallback Strategy

Next.js automatically handles fallbacks:
1. Try AVIF
2. Try WebP
3. Fall back to JPEG/PNG

## Monitoring

### Key Metrics to Monitor

1. **Image Load Time**: Track via Performance API
2. **Cache Hit Rate**: Monitor CDN analytics
3. **Format Distribution**: Check which formats are served
4. **Bandwidth Usage**: Monitor total image bandwidth

### Performance Budget

- **Hero Images**: 200KB max
- **Card Images**: 100KB max
- **Avatar Images**: 20KB max
- **Total Page Weight**: < 2MB including images

## Best Practices

### DO

✅ Use Next.js Image component for all images
✅ Provide appropriate alt text for content images
✅ Use empty alt for decorative images
✅ Set priority for above-the-fold images
✅ Use blur placeholders for better UX
✅ Optimize images before uploading
✅ Use responsive sizes configuration
✅ Test on slow connections

### DON'T

❌ Use regular `<img>` tags
❌ Serve images larger than needed
❌ Skip image optimization
❌ Use priority for all images
❌ Forget alt text for content images
❌ Use high quality for all images
❌ Ignore mobile optimization
❌ Skip testing on real devices

## Troubleshooting

### Images Not Loading

1. Check file path is correct
2. Verify image exists in public folder
3. Check Next.js Image configuration
4. Verify image format is supported

### Slow Image Loading

1. Check image file size
2. Verify compression is applied
3. Check network conditions
3. Verify lazy loading is working
4. Check CDN configuration

### Layout Shift Issues

1. Always specify width and height
2. Use `fill` prop with container sizing
3. Add blur placeholder
4. Reserve space with aspect ratio

### Blur Placeholder Not Showing

1. Verify blurDataURL is provided
2. Check placeholder prop is set to 'blur'
3. Ensure image is not priority loaded
4. Check browser support

## Future Improvements

- [ ] Implement responsive image art direction
- [ ] Add automatic image optimization pipeline
- [ ] Implement progressive image loading
- [ ] Add image CDN integration
- [ ] Implement automatic WebP/AVIF conversion
- [ ] Add image performance monitoring
- [ ] Implement image lazy loading threshold tuning
- [ ] Add support for animated WebP

## References

- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [MDN Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
