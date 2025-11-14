/**
 * Image Optimization Utilities
 * 
 * Provides utilities for optimized image loading with blur placeholders,
 * responsive sizes, and lazy loading configurations.
 */

import type { ImageProps } from 'next/image';

/**
 * Generate a blur data URL for placeholder
 * This is a tiny base64-encoded image that serves as a blur placeholder
 */
export const DEFAULT_BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABmQAAA//9k=';

/**
 * Generate a green-tinted blur placeholder for eco-themed images
 */
export const ECO_BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAABAwMEAwAAAAAAAAAAAAABAAIDBAURBhIhMUFRYf/EABUBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AyQAZkAAA//9k=';

/**
 * Image size configurations for different use cases
 */
export const IMAGE_SIZES = {
  hero: {
    mobile: { width: 768, height: 1024 },
    tablet: { width: 1024, height: 768 },
    desktop: { width: 1920, height: 1080 },
  },
  card: {
    small: { width: 320, height: 240 },
    medium: { width: 640, height: 480 },
    large: { width: 1024, height: 768 },
  },
  avatar: {
    small: { width: 32, height: 32 },
    medium: { width: 64, height: 64 },
    large: { width: 128, height: 128 },
  },
  logo: {
    small: { width: 120, height: 40 },
    medium: { width: 180, height: 60 },
    large: { width: 240, height: 80 },
  },
} as const;

/**
 * Responsive image sizes string for Next.js Image component
 */
export const RESPONSIVE_SIZES = {
  hero: '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px',
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  avatar: '(max-width: 640px) 32px, (max-width: 1024px) 64px, 128px',
  logo: '(max-width: 640px) 120px, (max-width: 1024px) 180px, 240px',
  full: '100vw',
  half: '50vw',
  third: '33vw',
} as const;

/**
 * Image quality settings for different use cases
 */
export const IMAGE_QUALITY = {
  low: 50,
  medium: 75,
  high: 85,
  max: 95,
} as const;

/**
 * Get optimized image props for hero images
 */
export function getHeroImageProps(
  src: string,
  priority: boolean = false
): Partial<ImageProps> {
  return {
    src,
    alt: '', // Decorative images should have empty alt
    fill: true,
    className: 'object-cover',
    priority,
    quality: IMAGE_QUALITY.high,
    sizes: RESPONSIVE_SIZES.hero,
    placeholder: 'blur',
    blurDataURL: ECO_BLUR_DATA_URL,
  };
}

/**
 * Get optimized image props for card images
 */
export function getCardImageProps(
  src: string,
  alt: string,
  priority: boolean = false
): Partial<ImageProps> {
  return {
    src,
    alt,
    fill: true,
    className: 'object-cover',
    priority,
    quality: IMAGE_QUALITY.medium,
    sizes: RESPONSIVE_SIZES.card,
    placeholder: 'blur',
    blurDataURL: DEFAULT_BLUR_DATA_URL,
  };
}

/**
 * Get optimized image props for avatar images
 */
export function getAvatarImageProps(
  src: string,
  alt: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): Partial<ImageProps> {
  const dimensions = IMAGE_SIZES.avatar[size];
  
  return {
    src,
    alt,
    width: dimensions.width,
    height: dimensions.height,
    className: 'rounded-full object-cover',
    quality: IMAGE_QUALITY.medium,
    sizes: RESPONSIVE_SIZES.avatar,
    placeholder: 'blur',
    blurDataURL: DEFAULT_BLUR_DATA_URL,
  };
}

/**
 * Get optimized image props for logo images
 */
export function getLogoImageProps(
  src: string,
  alt: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): Partial<ImageProps> {
  const dimensions = IMAGE_SIZES.logo[size];
  
  return {
    src,
    alt,
    width: dimensions.width,
    height: dimensions.height,
    quality: IMAGE_QUALITY.high,
    sizes: RESPONSIVE_SIZES.logo,
    priority: true, // Logos are typically above the fold
  };
}

/**
 * Check if an image should be lazy loaded based on its position
 */
export function shouldLazyLoad(position: 'above-fold' | 'below-fold'): boolean {
  return position === 'below-fold';
}

/**
 * Get loading strategy for an image
 */
export function getLoadingStrategy(
  priority: boolean
): 'eager' | 'lazy' {
  return priority ? 'eager' : 'lazy';
}

/**
 * Convert image path to WebP format
 */
export function toWebP(imagePath: string): string {
  return imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
}

/**
 * Get fallback image path (JPEG)
 */
export function getFallbackImage(imagePath: string): string {
  return imagePath.replace(/\.webp$/i, '.jpg');
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  basePath: string,
  sizes: number[]
): string {
  return sizes
    .map(size => `${basePath}?w=${size} ${size}w`)
    .join(', ');
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, as: 'image' = 'image'): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  link.type = 'image/webp';
  document.head.appendChild(link);
}

/**
 * Lazy load images using Intersection Observer
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  callback?: () => void
): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    img.src = src;
    callback?.();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          img.classList.remove('lazy');
          observer.unobserve(img);
          callback?.();
        }
      });
    },
    {
      rootMargin: '50px',
    }
  );

  observer.observe(img);
}

/**
 * Get optimized image configuration based on viewport
 */
export function getOptimizedImageConfig(
  type: 'hero' | 'card' | 'avatar' | 'logo',
  viewport: 'mobile' | 'tablet' | 'desktop' = 'desktop'
): { width: number; height: number; quality: number } {
  const qualityMap = {
    hero: IMAGE_QUALITY.high,
    card: IMAGE_QUALITY.medium,
    avatar: IMAGE_QUALITY.medium,
    logo: IMAGE_QUALITY.high,
  };

  const quality = qualityMap[type];

  // For hero images, use viewport-specific sizes
  if (type === 'hero') {
    return {
      ...IMAGE_SIZES.hero[viewport],
      quality,
    };
  }

  // For card images
  if (type === 'card') {
    return {
      ...IMAGE_SIZES.card.medium,
      quality,
    };
  }

  // For avatar images
  if (type === 'avatar') {
    return {
      ...IMAGE_SIZES.avatar.medium,
      quality,
    };
  }

  // For logo images
  return {
    ...IMAGE_SIZES.logo.medium,
    quality,
  };
}

/**
 * Image format support detection
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}

export function supportsAVIF(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }
  return false;
}

/**
 * Get best supported image format
 */
export function getBestImageFormat(): 'avif' | 'webp' | 'jpeg' {
  if (supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'jpeg';
}
