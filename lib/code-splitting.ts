/**
 * Code Splitting Utilities
 * 
 * Provides utilities for dynamic imports and code splitting
 * to optimize bundle size and loading performance.
 */

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * Loading component for dynamic imports
 */
export const DefaultLoadingComponent = () => {
  return null;
};

/**
 * Error component for dynamic import failures
 */
export const DefaultErrorComponent = () => {
  return null;
};

/**
 * Dynamic import with default loading and error handling
 */
export function lazyLoad<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: ComponentType<any>;
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: options?.loading as any,
    ssr: options?.ssr ?? true,
  });
}

/**
 * Dynamic import for below-fold components (no SSR)
 */
export function lazyLoadBelowFold<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  loading?: ComponentType<any>
) {
  return dynamic(importFn, {
    loading: loading as any,
    ssr: false,
  });
}

/**
 * Dynamic import for admin components
 */
export function lazyLoadAdmin<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  return dynamic(importFn, {
    ssr: false, // Admin components don't need SSR
  });
}

/**
 * Dynamic import for modals and dialogs
 */
export function lazyLoadModal<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  return dynamic(importFn, {
    loading: () => null, // No loading state for modals
    ssr: false,
  });
}

/**
 * Preload a component for better UX
 */
export function preloadComponent(
  importFn: () => Promise<any>
): void {
  if (typeof window !== 'undefined') {
    // Preload on idle
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        importFn();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        importFn();
      }, 1);
    }
  }
}

/**
 * Preload multiple components
 */
export function preloadComponents(
  importFns: Array<() => Promise<any>>
): void {
  importFns.forEach(preloadComponent);
}

/**
 * Dynamic import with retry logic
 */
export function lazyLoadWithRetry<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  retries: number = 3
) {
  return dynamic(
    () => retryImport(importFn, retries),
    {
      ssr: true,
    }
  );
}

/**
 * Retry import function
 */
async function retryImport<T>(
  importFn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryImport(importFn, retries - 1, delay * 2);
  }
}

/**
 * Check if code splitting is supported
 */
export function supportsCodeSplitting(): boolean {
  return typeof window !== 'undefined' && 'import' in window;
}

/**
 * Get bundle size estimate (development only)
 */
export function estimateBundleSize(
  componentName: string
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Code Splitting] Loading component: ${componentName}`);
  }
}

/**
 * Lazy load chart components (heavy dependencies)
 */
export const lazyLoadChart = <P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) => lazyLoadBelowFold(importFn);

/**
 * Lazy load form components
 */
export const lazyLoadForm = <P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) => lazyLoad(importFn, { ssr: true });

/**
 * Lazy load animation components
 */
export const lazyLoadAnimation = <P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) => lazyLoadBelowFold(importFn);

/**
 * Component registry for preloading
 */
export const ComponentRegistry = {
  // Admin components
  admin: {
    TaskManager: () => import('@/components/admin/TaskManager'),
    UserTable: () => import('@/components/admin/UserTable'),
    StatsCard: () => import('@/components/admin/StatsCard'),
  },
  
  // Task components
  tasks: {
    TaskCard: () => import('@/components/tasks/TaskCard'),
    TaskList: () => import('@/components/tasks/TaskList'),
    TaskCompletionModal: () => import('@/components/tasks/TaskCompletionModal'),
  },
  
  // Profile components
  profile: {
    ProfileForm: () => import('@/components/profile/ProfileForm'),
    AvatarUpload: () => import('@/components/profile/AvatarUpload'),
    SocialMediaSetup: () => import('@/components/profile/SocialMediaSetup'),
  },
  
  // Wallet components
  wallet: {
    WalletSetup: () => import('@/components/wallet/WalletSetup'),
    WalletConfirmationModal: () => import('@/components/wallet/WalletConfirmationModal'),
  },
};

/**
 * Preload components for a specific route
 */
export function preloadRouteComponents(route: keyof typeof ComponentRegistry): void {
  const components = ComponentRegistry[route];
  if (components) {
    Object.values(components).forEach(preloadComponent);
  }
}

/**
 * Preload on hover (for links)
 */
export function preloadOnHover(
  route: keyof typeof ComponentRegistry
): {
  onMouseEnter: () => void;
  onTouchStart: () => void;
} {
  return {
    onMouseEnter: () => preloadRouteComponents(route),
    onTouchStart: () => preloadRouteComponents(route),
  };
}

/**
 * Preload on viewport (Intersection Observer)
 */
export function preloadOnViewport(
  element: HTMLElement,
  importFn: () => Promise<any>
): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          preloadComponent(importFn);
          observer.unobserve(element);
        }
      });
    },
    {
      rootMargin: '50px',
    }
  );

  observer.observe(element);
}

/**
 * Bundle size tracking (development only)
 */
export class BundleSizeTracker {
  private static sizes: Map<string, number> = new Map();

  static track(componentName: string, size: number): void {
    if (process.env.NODE_ENV === 'development') {
      this.sizes.set(componentName, size);
      console.log(`[Bundle Size] ${componentName}: ${(size / 1024).toFixed(2)}KB`);
    }
  }

  static getTotal(): number {
    return Array.from(this.sizes.values()).reduce((a, b) => a + b, 0);
  }

  static report(): void {
    if (process.env.NODE_ENV === 'development') {
      console.table(
        Array.from(this.sizes.entries()).map(([name, size]) => ({
          Component: name,
          'Size (KB)': (size / 1024).toFixed(2),
        }))
      );
      console.log(`Total: ${(this.getTotal() / 1024).toFixed(2)}KB`);
    }
  }
}

/**
 * Optimize imports for production
 */
export const optimizeImports = {
  // Lucide icons - import only what you need
  icons: () => import('lucide-react'),
  
  // Form utilities
  form: () => import('react-hook-form'),
  
  // Validation
  validation: () => import('zod'),
};

/**
 * Check if component should be lazy loaded
 */
export function shouldLazyLoad(
  position: 'above-fold' | 'below-fold',
  priority: 'high' | 'medium' | 'low'
): boolean {
  // Always load above-fold high priority components
  if (position === 'above-fold' && priority === 'high') {
    return false;
  }
  
  // Lazy load everything else
  return true;
}

/**
 * Get loading strategy based on priority
 */
export function getLoadingStrategy(
  priority: 'high' | 'medium' | 'low'
): {
  ssr: boolean;
  loading?: ComponentType<any>;
} {
  switch (priority) {
    case 'high':
      return { ssr: true };
    case 'medium':
      return { ssr: true };
    case 'low':
      return { ssr: false };
  }
}
