/**
 * Caching Utilities
 * 
 * Provides client-side caching strategies for improved performance
 * including localStorage, sessionStorage, and in-memory caching.
 */

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  storage?: 'local' | 'session' | 'memory';
  prefix?: string;
}

/**
 * Cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * In-memory cache store
 */
const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Default cache configuration
 */
const DEFAULT_CONFIG: Required<CacheConfig> = {
  ttl: 5 * 60 * 1000, // 5 minutes
  storage: 'memory',
  prefix: 'sylvan_',
};

/**
 * Get cache key with prefix
 */
function getCacheKey(key: string, prefix: string): string {
  return `${prefix}${key}`;
}

/**
 * Check if cache entry is expired
 */
function isExpired(entry: CacheEntry<any>): boolean {
  return Date.now() - entry.timestamp > entry.ttl;
}

/**
 * Get item from cache
 */
export function getCache<T>(
  key: string,
  config: CacheConfig = {}
): T | null {
  const { storage, prefix } = { ...DEFAULT_CONFIG, ...config };
  const cacheKey = getCacheKey(key, prefix);

  try {
    if (storage === 'memory') {
      const entry = memoryCache.get(cacheKey);
      if (entry && !isExpired(entry)) {
        return entry.data as T;
      }
      memoryCache.delete(cacheKey);
      return null;
    }

    const storageObj = storage === 'local' ? localStorage : sessionStorage;
    const item = storageObj.getItem(cacheKey);
    
    if (!item) return null;

    const entry: CacheEntry<T> = JSON.parse(item);
    
    if (isExpired(entry)) {
      storageObj.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set item in cache
 */
export function setCache<T>(
  key: string,
  data: T,
  config: CacheConfig = {}
): void {
  const { ttl, storage, prefix } = { ...DEFAULT_CONFIG, ...config };
  const cacheKey = getCacheKey(key, prefix);

  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    ttl,
  };

  try {
    if (storage === 'memory') {
      memoryCache.set(cacheKey, entry);
      return;
    }

    const storageObj = storage === 'local' ? localStorage : sessionStorage;
    storageObj.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Remove item from cache
 */
export function removeCache(
  key: string,
  config: CacheConfig = {}
): void {
  const { storage, prefix } = { ...DEFAULT_CONFIG, ...config };
  const cacheKey = getCacheKey(key, prefix);

  try {
    if (storage === 'memory') {
      memoryCache.delete(cacheKey);
      return;
    }

    const storageObj = storage === 'local' ? localStorage : sessionStorage;
    storageObj.removeItem(cacheKey);
  } catch (error) {
    console.error('Cache remove error:', error);
  }
}

/**
 * Clear all cache entries with prefix
 */
export function clearCache(config: CacheConfig = {}): void {
  const { storage, prefix } = { ...DEFAULT_CONFIG, ...config };

  try {
    if (storage === 'memory') {
      const keysToDelete: string[] = [];
      memoryCache.forEach((_, key) => {
        if (key.startsWith(prefix)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => memoryCache.delete(key));
      return;
    }

    const storageObj = storage === 'local' ? localStorage : sessionStorage;
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < storageObj.length; i++) {
      const key = storageObj.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => storageObj.removeItem(key));
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

/**
 * Get or set cache (fetch if not cached)
 */
export async function getCacheOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  config: CacheConfig = {}
): Promise<T> {
  const cached = getCache<T>(key, config);
  
  if (cached !== null) {
    return cached;
  }

  const data = await fetchFn();
  setCache(key, data, config);
  return data;
}

/**
 * Cache with stale-while-revalidate strategy
 */
export async function getCacheWithRevalidate<T>(
  key: string,
  fetchFn: () => Promise<T>,
  config: CacheConfig = {}
): Promise<T> {
  const cached = getCache<T>(key, config);
  
  // Return cached data immediately if available
  if (cached !== null) {
    // Revalidate in background
    fetchFn().then(data => {
      setCache(key, data, config);
    }).catch(error => {
      console.error('Background revalidation error:', error);
    });
    
    return cached;
  }

  // Fetch and cache if not available
  const data = await fetchFn();
  setCache(key, data, config);
  return data;
}

/**
 * Translation cache utilities
 */
export const translationCache = {
  get: (locale: string) => 
    getCache(`translations_${locale}`, {
      storage: 'local',
      ttl: 24 * 60 * 60 * 1000, // 24 hours
    }),
  
  set: (locale: string, data: any) =>
    setCache(`translations_${locale}`, data, {
      storage: 'local',
      ttl: 24 * 60 * 60 * 1000,
    }),
  
  clear: () => {
    ['en', 'tr', 'de', 'zh', 'ru'].forEach(locale => {
      removeCache(`translations_${locale}`, { storage: 'local' });
    });
  },
};

/**
 * User preferences cache
 */
export const preferencesCache = {
  get: () =>
    getCache('user_preferences', {
      storage: 'local',
      ttl: Infinity, // Never expire
    }),
  
  set: (data: any) =>
    setCache('user_preferences', data, {
      storage: 'local',
      ttl: Infinity,
    }),
  
  clear: () =>
    removeCache('user_preferences', { storage: 'local' }),
};

/**
 * API response cache
 */
export const apiCache = {
  get: <T>(endpoint: string) =>
    getCache<T>(`api_${endpoint}`, {
      storage: 'memory',
      ttl: 5 * 60 * 1000, // 5 minutes
    }),
  
  set: <T>(endpoint: string, data: T, ttl?: number) =>
    setCache(`api_${endpoint}`, data, {
      storage: 'memory',
      ttl: ttl || 5 * 60 * 1000,
    }),
  
  remove: (endpoint: string) =>
    removeCache(`api_${endpoint}`, { storage: 'memory' }),
  
  clear: () =>
    clearCache({ storage: 'memory', prefix: 'sylvan_api_' }),
};

/**
 * Image cache utilities (for preloading)
 */
export const imageCache = {
  preload: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },
  
  preloadMultiple: async (sources: string[]): Promise<void> => {
    await Promise.all(sources.map(src => imageCache.preload(src)));
  },
};

/**
 * Cache statistics
 */
export function getCacheStats(): {
  memory: number;
  local: number;
  session: number;
} {
  try {
    return {
      memory: memoryCache.size,
      local: Object.keys(localStorage).filter(key => 
        key.startsWith(DEFAULT_CONFIG.prefix)
      ).length,
      session: Object.keys(sessionStorage).filter(key => 
        key.startsWith(DEFAULT_CONFIG.prefix)
      ).length,
    };
  } catch (error) {
    return { memory: 0, local: 0, session: 0 };
  }
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  // Clear memory cache
  const expiredKeys: string[] = [];
  memoryCache.forEach((entry, key) => {
    if (isExpired(entry)) {
      expiredKeys.push(key);
    }
  });
  expiredKeys.forEach(key => memoryCache.delete(key));

  // Clear localStorage
  try {
    const localKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(DEFAULT_CONFIG.prefix)) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const entry = JSON.parse(item);
            if (isExpired(entry)) {
              localKeys.push(key);
            }
          } catch {
            // Invalid entry, remove it
            localKeys.push(key);
          }
        }
      }
    }
    localKeys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing expired localStorage cache:', error);
  }

  // Clear sessionStorage
  try {
    const sessionKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(DEFAULT_CONFIG.prefix)) {
        const item = sessionStorage.getItem(key);
        if (item) {
          try {
            const entry = JSON.parse(item);
            if (isExpired(entry)) {
              sessionKeys.push(key);
            }
          } catch {
            // Invalid entry, remove it
            sessionKeys.push(key);
          }
        }
      }
    }
    sessionKeys.forEach(key => sessionStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing expired sessionStorage cache:', error);
  }
}

/**
 * Initialize cache cleanup on page load
 */
if (typeof window !== 'undefined') {
  // Clear expired cache on page load
  clearExpiredCache();
  
  // Set up periodic cleanup (every 5 minutes)
  setInterval(clearExpiredCache, 5 * 60 * 1000);
}

/**
 * Cache middleware for fetch requests
 */
export function createCachedFetch(
  ttl: number = 5 * 60 * 1000
): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const cacheKey = `fetch_${url}`;
    
    // Only cache GET requests
    if (init?.method && init.method !== 'GET') {
      return fetch(input, init);
    }
    
    // Check cache
    const cached = getCache<Response>(cacheKey, {
      storage: 'memory',
      ttl,
    });
    
    if (cached) {
      return Promise.resolve(cached);
    }
    
    // Fetch and cache
    const response = await fetch(input, init);
    const clonedResponse = response.clone();
    
    setCache(cacheKey, clonedResponse, {
      storage: 'memory',
      ttl,
    });
    
    return response;
  };
}

/**
 * Service Worker registration (for offline caching)
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister Service Worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const success = await registration.unregister();
    console.log('Service Worker unregistered:', success);
    return success;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
}

/**
 * Check if Service Worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Cache versioning for cache busting
 */
export const CACHE_VERSION = '1.0.0';

/**
 * Get cache version
 */
export function getCacheVersion(): string {
  return getCache('cache_version', { storage: 'local' }) || CACHE_VERSION;
}

/**
 * Set cache version
 */
export function setCacheVersion(version: string): void {
  setCache('cache_version', version, { storage: 'local', ttl: Infinity });
}

/**
 * Check if cache needs update
 */
export function needsCacheUpdate(): boolean {
  const currentVersion = getCacheVersion();
  return currentVersion !== CACHE_VERSION;
}

/**
 * Update cache version and clear old cache
 */
export function updateCacheVersion(): void {
  if (needsCacheUpdate()) {
    clearCache({ storage: 'local' });
    clearCache({ storage: 'session' });
    clearCache({ storage: 'memory' });
    setCacheVersion(CACHE_VERSION);
    console.log('Cache updated to version:', CACHE_VERSION);
  }
}

// Auto-update cache version on load
if (typeof window !== 'undefined') {
  updateCacheVersion();
}
