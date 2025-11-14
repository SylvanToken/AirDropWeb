# CSS and JavaScript Optimization Guide

This document outlines the CSS and JavaScript optimization strategies implemented in the Sylvan Token Airdrop Platform.

## CSS Optimization

### Tailwind CSS Purging

Tailwind CSS automatically purges unused classes in production builds.

#### Configuration

```typescript
// tailwind.config.ts
content: [
  './pages/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './app/**/*.{ts,tsx}',
  './src/**/*.{ts,tsx}',
]
```

#### Best Practices

- Use standard Tailwind classes when possible
- Avoid dynamic class names (e.g., `text-${color}-500`)
- Use safelist for dynamic classes if needed
- Keep custom CSS minimal

### Custom CSS Minimization

Custom CSS in `globals.css` is automatically minified in production.

#### Guidelines

- Use CSS custom properties for theming
- Leverage Tailwind utilities instead of custom CSS
- Group related styles in `@layer` directives
- Remove unused custom styles regularly

### CSS Loading Strategy

1. **Critical CSS**: Inlined in HTML head
2. **Above-fold CSS**: Loaded with high priority
3. **Below-fold CSS**: Lazy loaded
4. **Print CSS**: Loaded only when printing

### Performance Metrics

- **CSS Bundle Size**: < 50KB (gzipped)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s

## JavaScript Optimization

### Code Splitting

The platform uses Next.js automatic code splitting and dynamic imports.

#### Automatic Code Splitting

Next.js automatically splits code by:
- Pages (each page is a separate bundle)
- Shared code (common chunks)
- Third-party libraries (vendor chunks)

#### Dynamic Imports

Use dynamic imports for:
- Below-fold components
- Modal dialogs
- Admin panels
- Heavy libraries

```typescript
import { lazyLoad, lazyLoadBelowFold } from '@/lib/code-splitting';

// Below-fold component
const TaskList = lazyLoadBelowFold(() => import('@/components/tasks/TaskList'));

// Modal component
const TaskModal = lazyLoad(() => import('@/components/tasks/TaskModal'), {
  ssr: false
});
```

### Bundle Size Optimization

#### Current Bundle Sizes (Target)

- **Main Bundle**: < 200KB (gzipped)
- **Page Bundles**: < 50KB each (gzipped)
- **Vendor Bundle**: < 150KB (gzipped)
- **Total Initial Load**: < 300KB (gzipped)

#### Optimization Techniques

1. **Tree Shaking**: Remove unused code
2. **Minification**: Compress JavaScript
3. **Compression**: Gzip/Brotli compression
4. **Code Splitting**: Split into smaller chunks
5. **Lazy Loading**: Load on demand

### Import Optimization

#### Optimized Imports

```typescript
// ✅ Good - Import only what you need
import { Button } from '@/components/ui/button';
import { CheckIcon } from 'lucide-react';

// ❌ Bad - Import everything
import * as Icons from 'lucide-react';
```

#### Package Optimization

Next.js config optimizes these packages:
```javascript
experimental: {
  optimizePackageImports: ['@/components', 'lucide-react'],
}
```

### Component Lazy Loading

#### When to Lazy Load

- ✅ Below-fold components
- ✅ Modal dialogs
- ✅ Admin panels
- ✅ Charts and graphs
- ✅ Heavy third-party libraries
- ❌ Above-fold content
- ❌ Critical UI components
- ❌ Small components

#### Example Usage

```typescript
// Lazy load admin components
const AdminDashboard = lazyLoadAdmin(
  () => import('@/app/admin/(dashboard)/dashboard/page')
);

// Lazy load modal
const ConfirmModal = lazyLoadModal(
  () => import('@/components/ui/ConfirmModal')
);

// Lazy load chart
const StatsChart = lazyLoadChart(
  () => import('@/components/admin/StatsChart')
);
```

### Preloading Strategy

#### Link Prefetching

Next.js automatically prefetches links in viewport:
```typescript
<Link href="/dashboard" prefetch={true}>
  Dashboard
</Link>
```

#### Component Preloading

Preload components on hover:
```typescript
import { preloadOnHover } from '@/lib/code-splitting';

<Link 
  href="/admin" 
  {...preloadOnHover('admin')}
>
  Admin Panel
</Link>
```

#### Route Preloading

Preload route components:
```typescript
import { preloadRouteComponents } from '@/lib/code-splitting';

// Preload admin components when user hovers admin link
preloadRouteComponents('admin');
```

### Third-Party Library Optimization

#### Optimized Libraries

- **Next.js**: Automatic optimization
- **React**: Production build
- **Tailwind CSS**: Purged and minified
- **lucide-react**: Tree-shakeable icons
- **next-intl**: Static imports

#### Heavy Libraries

For heavy libraries, use dynamic imports:
```typescript
// Chart library
const Chart = dynamic(() => import('recharts'), {
  ssr: false,
  loading: () => <ChartSkeleton />
});

// PDF viewer
const PDFViewer = dynamic(() => import('react-pdf'), {
  ssr: false
});
```

## Performance Monitoring

### Metrics to Track

1. **Bundle Size**: Monitor total and per-page sizes
2. **Load Time**: Track initial and subsequent loads
3. **Time to Interactive**: Measure interactivity delay
4. **First Contentful Paint**: Track first render
5. **Largest Contentful Paint**: Monitor main content load

### Tools

- **Next.js Bundle Analyzer**: Visualize bundle sizes
- **Lighthouse**: Performance audits
- **WebPageTest**: Real-world performance testing
- **Chrome DevTools**: Network and performance analysis

### Bundle Analysis

Install and run bundle analyzer:
```bash
npm install @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

Run analysis:
```bash
ANALYZE=true npm run build
```

## Best Practices

### DO

✅ Use dynamic imports for below-fold content
✅ Lazy load modal dialogs
✅ Split large components into smaller ones
✅ Use Next.js Image component
✅ Minimize custom CSS
✅ Use Tailwind utilities
✅ Optimize third-party imports
✅ Monitor bundle sizes
✅ Use code splitting
✅ Preload critical resources

### DON'T

❌ Import entire libraries
❌ Use large inline styles
❌ Load everything on initial page load
❌ Ignore bundle size warnings
❌ Use heavy libraries for simple tasks
❌ Skip lazy loading for heavy components
❌ Forget to analyze bundles
❌ Use dynamic class names with Tailwind
❌ Add unnecessary dependencies
❌ Skip performance testing

## Optimization Checklist

### CSS

- [ ] Tailwind purging is configured
- [ ] Custom CSS is minimized
- [ ] Unused styles are removed
- [ ] CSS is properly layered
- [ ] Critical CSS is inlined
- [ ] Print styles are separate

### JavaScript

- [ ] Code splitting is implemented
- [ ] Dynamic imports are used
- [ ] Bundle sizes are monitored
- [ ] Third-party libraries are optimized
- [ ] Tree shaking is working
- [ ] Minification is enabled
- [ ] Compression is enabled

### Performance

- [ ] Lighthouse score > 90
- [ ] Bundle size < 300KB (gzipped)
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] TTI < 3.5s
- [ ] CLS < 0.1

## Troubleshooting

### Large Bundle Size

1. Run bundle analyzer
2. Identify large dependencies
3. Use dynamic imports
4. Consider alternatives
5. Remove unused code

### Slow Page Load

1. Check bundle sizes
2. Verify code splitting
3. Check network requests
4. Optimize images
5. Enable compression

### High Time to Interactive

1. Reduce JavaScript execution
2. Use code splitting
3. Defer non-critical scripts
4. Optimize third-party scripts
5. Use service workers

## Future Improvements

- [ ] Implement service worker for caching
- [ ] Add resource hints (preconnect, dns-prefetch)
- [ ] Optimize font loading
- [ ] Implement HTTP/2 server push
- [ ] Add progressive web app features
- [ ] Implement advanced caching strategies
- [ ] Add performance monitoring
- [ ] Optimize critical rendering path

## References

- [Next.js Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web.dev Performance](https://web.dev/fast/)
- [Tailwind CSS Optimization](https://tailwindcss.com/docs/optimizing-for-production)
- [Bundle Size Optimization](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
