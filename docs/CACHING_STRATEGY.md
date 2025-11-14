# Caching Strategy Guide

This document outlines the comprehensive caching strategies implemented in the Sylvan Token Airdrop Platform.

## Overview

The platform uses multiple caching layers to optimize performance:

1. **Browser Cache**: HTTP caching headers
2. **Service Worker**: Offline support and asset caching
3. **Client-Side Cache**: localStorage, sessionStorage, and memory cache
4. **CDN Cache**: Static asset delivery (future)

## Browser Caching

### Static Assets

Static assets are cached with long-term headers:

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/assets/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

### Cache Headers

- **Static Assets**: `public, max-age=31536000, immutable` (1 year)
- **Images**: Optimized by Next.js Image component
- **API Responses**: `no-cache` or short TTL
- **HTML Pages**: `no-cache` for dynamic content

## Service Worker Caching

### Installation

Service Worker is registered automatically:

```typescript
import { registerServiceWorker } from '@/lib/caching';

// Register on app load
registerServiceWorker();
```

### Caching Strategies

#### 1. Cache First (Static Assets)

Best for: CSS, JavaScript, fonts, images

```
Request → Cache → Network (if not cached) → Cache
```

#### 2. Network First (Dynamic Content)

Best for: API calls, HTML pages

```
Request → Network → Cache (fallback) → Offline page
```

#### 3. Stale While Revalidate (Balanced)

Best for: Frequently updated content

```
Request → Cache (immediate) + Network (background update)
```

### Route Configuration

```javascript
// public/sw.js
const ROUTE_STRATEGIES = [
  // Static assets - cache first
  {
    pattern: /\.(js|css|woff2?|ttf|otf|eot)$/,
    strategy: 'cache-first',
  },
  // Images - cache first
  {
    pattern: /\.(png|jpg|jpeg|svg|gif|webp|avif)$/,
    strategy: 'cache-first',
  },
  // API calls - network first
  {
    pattern: /\/api\//,
    strategy: 'network-first',
  },
  // Pages - network first
  {
    pattern: /\//,
    strategy: 'network-first',
  },
];
```

## Client-Side Caching

### Memory Cache

Fast, temporary cache for current session:

```typescript
import { apiCache } from '@/lib/caching';

// Cache API response
apiCache.set('/api/tasks', tasks, 5 * 60 * 1000); // 5 minutes

// Get cached response
const tasks = apiCache.get('/api/tasks');
```

### localStorage Cache

Persistent cache across sessions:

```typescript
import { setCache, getCache } from '@/lib/caching';

// Cache with 24-hour TTL
setCache('user_data', userData, {
  storage: 'local',
  ttl: 24 * 60 * 60 * 1000,
});

// Retrieve cached data
const userData = getCache('user_data', { storage: 'local' });
```

### sessionStorage Cache

Session-only cache:

```typescript
// Cache for current session
setCache('temp_data', data, {
  storage: 'session',
  ttl: 30 * 60 * 1000, // 30 minutes
});
```

## Translation Caching

Translations are cached for 24 hours:

```typescript
import { translationCache } from '@/lib/caching';

// Cache translations
translationCache.set('en', translations);

// Get cached translations
const translations = translationCache.get('en');

// Clear all translation cache
translationCache.clear();
```

## API Response Caching

### Basic Caching

```typescript
import { getCacheOrFetch } from '@/lib/caching';

const tasks = await getCacheOrFetch(
  'tasks_list',
  async () => {
    const response = await fetch('/api/tasks');
    return response.json();
  },
  { ttl: 5 * 60 * 1000 } // 5 minutes
);
```

### Stale-While-Revalidate

```typescript
import { getCacheWithRevalidate } from '@/lib/caching';

const tasks = await getCacheWithRevalidate(
  'tasks_list',
  async () => {
    const response = await fetch('/api/tasks');
    return response.json();
  },
  { ttl: 5 * 60 * 1000 }
);
```

## Image Caching

### Preloading

```typescript
import { imageCache } from '@/lib/caching';

// Preload single image
await imageCache.preload('/assets/heroes/forest-1.webp');

// Preload multiple images
await imageCache.preloadMultiple([
  '/assets/heroes/forest-1.webp',
  '/assets/heroes/ocean-1.webp',
  '/assets/heroes/mountain-1.webp',
]);
```

### Next.js Image Optimization

Next.js automatically caches optimized images:

```typescript
<Image
  src="/assets/heroes/forest-1.webp"
  alt="Forest"
  width={1920}
  height={1080}
  priority // Preload critical images
/>
```

## Cache Management

### Clear Expired Cache

Automatically runs every 5 minutes:

```typescript
import { clearExpiredCache } from '@/lib/caching';

// Manual cleanup
clearExpiredCache();
```

### Clear All Cache

```typescript
import { clearCache } from '@/lib/caching';

// Clear memory cache
clearCache({ storage: 'memory' });

// Clear localStorage
clearCache({ storage: 'local' });

// Clear sessionStorage
clearCache({ storage: 'session' });
```

### Cache Statistics

```typescript
import { getCacheStats } from '@/lib/caching';

const stats = getCacheStats();
console.log('Cache stats:', stats);
// { memory: 10, local: 5, session: 3 }
```

## Cache Versioning

### Version Management

```typescript
import { getCacheVersion, needsCacheUpdate, updateCacheVersion } from '@/lib/caching';

// Check current version
const version = getCacheVersion();

// Check if update needed
if (needsCacheUpdate()) {
  updateCacheVersion();
}
```

### Automatic Updates

Cache version is automatically checked and updated on page load.

## Best Practices

### DO

✅ Cache static assets with long TTL
✅ Use appropriate caching strategy for content type
✅ Set reasonable TTL values
✅ Clear expired cache regularly
✅ Version cache for updates
✅ Use Service Worker for offline support
✅ Preload critical resources
✅ Monitor cache size
✅ Test offline functionality

### DON'T

❌ Cache sensitive data in localStorage
❌ Use infinite TTL for dynamic content
❌ Cache without expiration
❌ Ignore cache size limits
❌ Cache authentication tokens
❌ Skip cache versioning
❌ Cache error responses
❌ Forget to handle cache failures

## Cache Configuration

### Recommended TTL Values

- **Static Assets**: 1 year (31536000s)
- **Images**: 1 year (31536000s)
- **Translations**: 24 hours (86400s)
- **API Responses**: 5 minutes (300s)
- **User Preferences**: Infinite
- **Session Data**: 30 minutes (1800s)

### Storage Limits

- **localStorage**: ~5-10MB per domain
- **sessionStorage**: ~5-10MB per domain
- **Cache API**: ~50MB+ (varies by browser)
- **Memory Cache**: Limited by available RAM

## Performance Metrics

### Target Metrics

- **Cache Hit Rate**: > 80%
- **Cache Miss Latency**: < 100ms
- **Storage Usage**: < 50% of limit
- **Cache Cleanup Time**: < 10ms

### Monitoring

```typescript
// Track cache performance
const startTime = performance.now();
const data = getCache('key');
const duration = performance.now() - startTime;

console.log('Cache lookup time:', duration, 'ms');
```

## Offline Support

### Service Worker Features

- ✅ Offline page access
- ✅ Static asset caching
- ✅ API response caching
- ✅ Background sync (future)
- ✅ Push notifications (future)

### Testing Offline

1. Open DevTools
2. Go to Application > Service Workers
3. Check "Offline" checkbox
4. Reload page
5. Verify cached content loads

## Troubleshooting

### Cache Not Working

1. Check Service Worker registration
2. Verify cache headers
3. Check browser support
4. Clear browser cache
5. Check console for errors

### Cache Not Updating

1. Check cache version
2. Verify TTL values
3. Clear expired cache
4. Force refresh (Ctrl+Shift+R)
5. Unregister Service Worker

### Storage Quota Exceeded

1. Clear old cache entries
2. Reduce cache size
3. Implement cache eviction
4. Use shorter TTL values
5. Monitor storage usage

## Security Considerations

### What to Cache

✅ Public static assets
✅ Public images
✅ Translations
✅ Public API responses
✅ User preferences (non-sensitive)

### What NOT to Cache

❌ Authentication tokens
❌ Personal data
❌ Payment information
❌ Private API responses
❌ Session IDs

## Future Improvements

- [ ] Implement CDN caching
- [ ] Add cache warming strategies
- [ ] Implement cache preloading
- [ ] Add cache analytics
- [ ] Implement background sync
- [ ] Add push notifications
- [ ] Implement cache compression
- [ ] Add cache encryption for sensitive data

## References

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
