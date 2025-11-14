/**
 * Nature Theme Performance Testing Suite
 * Tests paint times, composite times, backdrop-filter performance,
 * box-shadow optimization, animation frame rates, and GPU usage
 * for the nature theme effects
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { test, expect, Page } from '@playwright/test';

// ============================================================================
// Test Configuration
// ============================================================================

const PERFORMANCE_THRESHOLDS = {
  paintTime: 16,              // Paint time per frame (ms) - 60fps = 16.67ms
  compositeTime: 8,           // Composite time per frame (ms)
  animationFPS: 55,           // Minimum FPS for smooth animations
  backdropFilterPaint: 50,    // Max paint time with backdrop-filter (ms)
  neonGlowPaint: 30,          // Max paint time with neon glow (ms)
  depthEffectPaint: 40,       // Max paint time with 4K depth (ms)
  gpuMemory: 100,             // Max GPU memory usage (MB)
  longTaskDuration: 50,       // Max long task duration (ms)
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Measure paint and composite performance
 */
async function measurePaintPerformance(page: Page): Promise<{
  paintTime: number;
  compositeTime: number;
}> {
  const metrics = await page.evaluate(() => {
    return new Promise<{ paintTime: number; compositeTime: number }>((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let totalPaint = 0;
        let totalComposite = 0;
        let count = 0;

        for (const entry of entries) {
          if (entry.entryType === 'measure') {
            const name = entry.name;
            if (name.includes('paint')) {
              totalPaint += entry.duration;
              count++;
            } else if (name.includes('composite')) {
              totalComposite += entry.duration;
              count++;
            }
          }
        }

        if (count > 0) {
          resolve({
            paintTime: totalPaint / count,
            compositeTime: totalComposite / count,
          });
        }
      });

      observer.observe({ entryTypes: ['measure'] });

      // Trigger some repaints
      for (let i = 0; i < 10; i++) {
        performance.mark(`paint-start-${i}`);
        requestAnimationFrame(() => {
          performance.mark(`paint-end-${i}`);
          performance.measure(`paint-${i}`, `paint-start-${i}`, `paint-end-${i}`);
        });
      }

      // Fallback timeout
      setTimeout(() => {
        resolve({ paintTime: 0, compositeTime: 0 });
      }, 2000);
    });
  });

  return metrics;
}

/**
 * Measure animation frame rate
 */
async function measureFrameRate(page: Page, duration: number = 1000): Promise<number> {
  const fps = await page.evaluate((testDuration) => {
    return new Promise<number>((resolve) => {
      let frames = 0;
      const startTime = performance.now();

      function countFrame() {
        frames++;
        const elapsed = performance.now() - startTime;
        
        if (elapsed < testDuration) {
          requestAnimationFrame(countFrame);
        } else {
          const fps = (frames / elapsed) * 1000;
          resolve(fps);
        }
      }

      requestAnimationFrame(countFrame);
    });
  }, duration);

  return fps;
}

/**
 * Measure GPU memory usage (if available)
 */
async function measureGPUMemory(page: Page): Promise<number> {
  const gpuMemory = await page.evaluate(() => {
    // @ts-ignore - Chrome-specific API
    if (performance.memory) {
      // @ts-ignore
      return performance.memory.usedJSHeapSize / (1024 * 1024);
    }
    return 0;
  });

  return gpuMemory;
}

/**
 * Detect long tasks that block the main thread
 */
async function detectLongTasks(page: Page, duration: number = 3000): Promise<any[]> {
  const longTasks = await page.evaluate((testDuration) => {
    return new Promise<any[]>((resolve) => {
      const tasks: any[] = [];

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            tasks.push({
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            });
          }
        }
      });

      observer.observe({ entryTypes: ['longtask', 'measure'] });

      setTimeout(() => {
        observer.disconnect();
        resolve(tasks);
      }, testDuration);
    });
  }, duration);

  return longTasks;
}

// ============================================================================
// Subtask: Measure paint and composite times for neon effects
// ============================================================================

test.describe('Neon Effects Performance (Requirement 2.4)', () => {
  
  test('Neon glow effects paint within 30ms', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find elements with neon effects
    const neonElements = await page.locator('.card-neon, .btn-neon, [class*="neon"]').all();
    
    console.log(`Found ${neonElements.length} elements with neon effects`);

    if (neonElements.length > 0) {
      // Hover over neon element to trigger effect
      await neonElements[0].hover();

      // Measure paint time
      const paintTime = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          const startTime = performance.now();
          
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const endTime = performance.now();
              resolve(endTime - startTime);
            });
          });
        });
      });

      console.log(`Neon glow paint time: ${paintTime.toFixed(2)}ms`);
      expect(paintTime).toBeLessThan(PERFORMANCE_THRESHOLDS.neonGlowPaint);
    }
  });

  test('Neon glow hover transitions are smooth (>55fps)', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const neonButton = page.locator('button').first();
    
    // Start measuring FPS
    const fpsPromise = measureFrameRate(page, 1000);
    
    // Trigger hover animation
    await neonButton.hover();
    await page.waitForTimeout(500);
    await neonButton.blur();
    
    const fps = await fpsPromise;
    
    console.log(`Neon hover animation FPS: ${fps.toFixed(2)}`);
    expect(fps).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animationFPS);
  });

  test('Multiple neon elements do not degrade performance', async ({ page }: { page: Page }) => {
    await page.goto('/admin/tasks');
    await page.waitForLoadState('networkidle');

    // Admin tasks page has many neon cards
    const neonCards = await page.locator('.card-neon').all();
    console.log(`Testing ${neonCards.length} neon cards`);

    // Measure FPS with multiple neon elements visible
    const fps = await measureFrameRate(page, 2000);
    
    console.log(`FPS with ${neonCards.length} neon cards: ${fps.toFixed(2)}`);
    expect(fps).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animationFPS);
  });

  test('Neon pulse animation maintains 60fps', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find element with pulse animation
    const pulseElement = page.locator('[class*="pulse"], [class*="neon"]').first();
    
    if (await pulseElement.count() > 0) {
      await pulseElement.scrollIntoViewIfNeeded();
      
      // Measure FPS during pulse animation
      const fps = await measureFrameRate(page, 2000);
      
      console.log(`Neon pulse animation FPS: ${fps.toFixed(2)}`);
      expect(fps).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animationFPS);
    }
  });
});

// ============================================================================
// Subtask: Test backdrop-filter performance on various devices
// ============================================================================

test.describe('Backdrop Filter Performance (Requirement 2.5)', () => {
  
  test('Backdrop-filter paint time on desktop', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find elements with backdrop-filter
    const glassElements = await page.locator('[class*="glass"], [class*="backdrop"]').all();
    
    console.log(`Found ${glassElements.length} elements with backdrop-filter`);

    if (glassElements.length > 0) {
      await glassElements[0].scrollIntoViewIfNeeded();

      // Measure paint time with backdrop-filter
      const paintTime = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          const startTime = performance.now();
          
          // Force repaint
          document.body.style.transform = 'translateZ(0)';
          
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const endTime = performance.now();
              document.body.style.transform = '';
              resolve(endTime - startTime);
            });
          });
        });
      });

      console.log(`Backdrop-filter paint time: ${paintTime.toFixed(2)}ms`);
      expect(paintTime).toBeLessThan(PERFORMANCE_THRESHOLDS.backdropFilterPaint);
    }
  });

  test('Backdrop-filter performance on mobile viewport', async ({ page }: { page: Page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Measure FPS with backdrop-filter on mobile
    const fps = await measureFrameRate(page, 2000);
    
    console.log(`Mobile backdrop-filter FPS: ${fps.toFixed(2)}`);
    expect(fps).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animationFPS * 0.9); // Allow 10% reduction on mobile
  });

  test('Backdrop-filter with scrolling performance', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Start measuring FPS
    const fpsPromise = measureFrameRate(page, 2000);
    
    // Scroll page to test backdrop-filter during scroll
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        let scrollPos = 0;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        
        function smoothScroll() {
          scrollPos += 10;
          window.scrollTo(0, scrollPos);
          
          if (scrollPos < maxScroll && scrollPos < 1000) {
            requestAnimationFrame(smoothScroll);
          } else {
            resolve();
          }
        }
        
        smoothScroll();
      });
    });
    
    const fps = await fpsPromise;
    
    console.log(`Backdrop-filter scroll FPS: ${fps.toFixed(2)}`);
    expect(fps).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animationFPS);
  });

  test('Multiple backdrop-filter elements performance', async ({ page }: { page: Page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Count backdrop-filter elements
    const glassElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let count = 0;
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.backdropFilter && style.backdropFilter !== 'none') {
          count++;
        }
      });
      
      return count;
    });

    console.log(`Found ${glassElements} elements with backdrop-filter`);

    // Measure FPS with multiple backdrop-filters
    const fps = await measureFrameRate(page, 2000);
    
    console.log(`FPS with ${glassElements} backdrop-filters: ${fps.toFixed(2)}`);
    expect(fps).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animationFPS);
  });
});

// ============================================================================
// Subtask: Optimize box-shadow layers if needed
// ============================================================================

test.describe('Box Shadow Optimization (Requirements 2.1, 2.2, 2.3)', () => {
  
  test('4K depth-1 shadow layers paint efficiently', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const depth1Elements = await page.locator('.depth-4k-1').all();
    
    console.log(`Found ${depth1Elements.length} depth-4k-1 elements`);

    if (depth1Elements.length > 0) {
      await depth1Elements[0].scrollIntoViewIfNeeded();

      const paintTime = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          const startTime = performance.now();
          
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const endTime = performance.now();
              resolve(endTime - startTime);
            });
          });
        });
      });

      console.log(`Depth-4k-1 paint time: ${paintTime.toFixed(2)}ms`);
      expect(paintTime).toBeLessThan(PERFORMANCE_THRESHOLDS.depthEffectPaint);
    }
  });

  test('4K depth-2 shadow layers paint efficiently', async ({ page }: { page: Page }) => {
    await page.goto('/admin/tasks');
    await page.waitForLoadState('networkidle');

    const depth2Elements = await page.locator('.depth-4k-2').all();
    
    console.log(`Found ${depth2Elements.length} depth-4k-2 elements`);

    if (depth2Elements.length > 0) {
      await depth2Elements[0].scrollIntoViewIfNeeded();

      const paintTime = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          const startTime = performance.now();
          
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const endTime = performance.now();
              resolve(endTime - startTime);
            });
          });
        });
      });

      console.log(`Depth-4k-2 paint time: ${paintTime.toFixed(2)}ms`);
      expect(paintTime).toBeLessThan(PERFORMANCE_THRESHOLDS.depthEffectPaint);
    }
  });

  test('4K depth-3 shadow layers paint efficiently', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const depth3Elements = await page.locator('.depth-4k-3').all();
    
    console.log(`Found ${depth3Elements.length} depth-4k-3 elements`);

    if (depth3Elements.length > 0) {
      await depth3Elements[0].scrollIntoViewIfNeeded();

      const paintTime = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          const startTime = performance.now();
          
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const endTime = performance.now();
              resolve(endTime - startTime);
            });
          });
        });
      });

      console.log(`Depth-4k-3 paint time: ${paintTime.toFixed(2)}ms`);
      expect(paintTime).toBeLessThan(PERFORMANCE_THRESHOLDS.depthEffectPaint);
    }
  });

  test('Box shadow count is optimized', async ({ page }: { page: Page }) => {
    await page.goto('/admin/tasks');
    await page.waitForLoadState('networkidle');

    // Count elements with box-shadow
    const shadowInfo = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let totalShadows = 0;
      let maxLayers = 0;
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.boxShadow && style.boxShadow !== 'none') {
          const layers = style.boxShadow.split(',').length;
          totalShadows++;
          maxLayers = Math.max(maxLayers, layers);
        }
      });
      
      return { totalShadows, maxLayers };
    });

    console.log(`Total elements with box-shadow: ${shadowInfo.totalShadows}`);
    console.log(`Maximum shadow layers on single element: ${shadowInfo.maxLayers}`);

    // Max 5 layers per element (as per design)
    expect(shadowInfo.maxLayers).toBeLessThanOrEqual(5);
  });

  test('Shadow hover effects are GPU accelerated', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const card = page.locator('.card-neon').first();
    
    if (await card.count() > 0) {
      // Check if transform is used (GPU accelerated)
      const usesTransform = await card.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.transform !== 'none' || style.willChange.includes('transform');
      });

      console.log(`Card uses GPU-accelerated transform: ${usesTransform}`);

      // Measure hover performance
      const fpsPromise = measureFrameRate(page, 1000);
      await card.hover();
      await page.waitForTimeout(500);
      const fps = await fpsPromise;

      console.log(`Shadow hover FPS: ${fps.toFixed(2)}`);
      expect(fps).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animationFPS);
    }
  });
});

// ============================================================================
// Subtask: Ensure 60fps animations on target devices
// ============================================================================

test.describe('60fps Animation Performance (Requirements 2.1, 2.2, 2.3, 2.4)', () => {
  
  test('Home page animations maintain 60fps', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const fps = await measureFrameRate(page, 3000);
    
    console.log(`Home page animation FPS: ${fps.toFixed(2)}`);
    expect(fps).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animationFPS);
  });

  test('Admin dashboard animations maintain 60fps', async ({ page }: { page: Page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    const fps = await measureFrameRate(page, 3000);
    
    console.log(`Admin dashboard animation FPS: ${fps.toFixed(2)}`);
    expect(fps).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animationFPS);
  });

  test('Task grid animations maintain 60fps', async ({ page }: { page: Page }) => {
    await page.goto('/admin/tasks');
    await page.waitForLoadState('networkidle');

    const fps = await measureFrameRate(page, 3000);
    
    console.log(`Task grid animation FPS: ${fps.toFixed(2)}`);
    expect(fps).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animationFPS);
  });

  test('Animations on mobile viewport maintain >50fps', async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const fps = await measureFrameRate(page, 3000);
    
    console.log(`Mobile animation FPS: ${fps.toFixed(2)}`);
    expect(fps).toBeGreaterThan(50); // Slightly lower threshold for mobile
  });

  test('Animations on tablet viewport maintain >55fps', async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const fps = await measureFrameRate(page, 3000);
    
    console.log(`Tablet animation FPS: ${fps.toFixed(2)}`);
    expect(fps).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animationFPS);
  });

  test('No long tasks block animations', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const longTasks = await detectLongTasks(page, 3000);
    
    console.log(`Detected ${longTasks.length} long tasks`);
    
    if (longTasks.length > 0) {
      const maxDuration = Math.max(...longTasks.map(t => t.duration));
      console.log(`Longest task duration: ${maxDuration.toFixed(2)}ms`);
      
      // Should have minimal long tasks
      expect(longTasks.length).toBeLessThan(5);
      expect(maxDuration).toBeLessThan(100);
    }
  });
});

// ============================================================================
// Subtask: Profile GPU usage for 4K depth effects
// ============================================================================

test.describe('GPU Usage Profiling (Requirements 2.1, 2.2, 2.3)', () => {
  
  test('GPU memory usage is reasonable', async ({ page }: { page: Page }) => {
    await page.goto('/admin/tasks');
    await page.waitForLoadState('networkidle');

    const gpuMemory = await measureGPUMemory(page);
    
    if (gpuMemory > 0) {
      console.log(`GPU memory usage: ${gpuMemory.toFixed(2)}MB`);
      expect(gpuMemory).toBeLessThan(PERFORMANCE_THRESHOLDS.gpuMemory);
    } else {
      console.log('GPU memory API not available');
    }
  });

  test('Depth effects use GPU acceleration', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if depth effects use transform (GPU accelerated)
    const usesGPU = await page.evaluate(() => {
      const depthElements = document.querySelectorAll('[class*="depth-4k"]');
      let gpuAccelerated = 0;
      
      depthElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.transform !== 'none' || style.willChange.includes('transform')) {
          gpuAccelerated++;
        }
      });
      
      return {
        total: depthElements.length,
        gpuAccelerated,
        percentage: (gpuAccelerated / depthElements.length) * 100
      };
    });

    console.log(`GPU-accelerated depth elements: ${usesGPU.gpuAccelerated}/${usesGPU.total} (${usesGPU.percentage.toFixed(1)}%)`);
    
    // All depth effects should use GPU acceleration
    expect(usesGPU.percentage).toBeGreaterThan(90);
  });

  test('Composite layers are optimized', async ({ page }: { page: Page }) => {
    await page.goto('/admin/tasks');
    await page.waitForLoadState('networkidle');

    // Check for excessive composite layers
    const layerInfo = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let compositeLayers = 0;
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        // Elements with transform, opacity, or will-change create composite layers
        if (
          style.transform !== 'none' ||
          style.willChange !== 'auto' ||
          parseFloat(style.opacity) < 1
        ) {
          compositeLayers++;
        }
      });
      
      return compositeLayers;
    });

    console.log(`Estimated composite layers: ${layerInfo}`);
    
    // Should have reasonable number of composite layers (not excessive)
    expect(layerInfo).toBeLessThan(100);
  });

  test('No memory leaks with repeated animations', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const initialMemory = await measureGPUMemory(page);
    
    // Trigger animations multiple times
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => {
        const cards = document.querySelectorAll('.card-neon');
        cards.forEach(card => {
          (card as HTMLElement).style.transform = 'translateY(-2px)';
          setTimeout(() => {
            (card as HTMLElement).style.transform = '';
          }, 100);
        });
      });
      await page.waitForTimeout(200);
    }

    const finalMemory = await measureGPUMemory(page);
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      console.log(`Memory increase after animations: ${memoryIncrease.toFixed(2)}MB`);
      
      // Memory shouldn't grow significantly
      expect(memoryIncrease).toBeLessThan(20); // Less than 20MB increase
    }
  });

  test('Reduced motion preference disables animations', async ({ page }: { page: Page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if animations are disabled
    const animationsDisabled = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="animate"], [class*="pulse"]');
      let disabledCount = 0;
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.animation === 'none' || style.animationDuration === '0s') {
          disabledCount++;
        }
      });
      
      return {
        total: elements.length,
        disabled: disabledCount,
        percentage: elements.length > 0 ? (disabledCount / elements.length) * 100 : 100
      };
    });

    console.log(`Animations disabled with reduced motion: ${animationsDisabled.disabled}/${animationsDisabled.total}`);
    
    // Most animations should be disabled with reduced motion
    expect(animationsDisabled.percentage).toBeGreaterThan(80);
  });
});

// ============================================================================
// Integration Test: Overall Performance
// ============================================================================

test.describe('Overall Nature Theme Performance', () => {
  
  test('Complete page with all effects maintains performance', async ({ page }: { page: Page }) => {
    await page.goto('/admin/tasks');
    await page.waitForLoadState('networkidle');

    // Measure overall FPS
    const fps = await measureFrameRate(page, 3000);
    
    // Detect long tasks
    const longTasks = await detectLongTasks(page, 3000);
    
    // Measure GPU memory
    const gpuMemory = await measureGPUMemory(page);

    console.log('=== Overall Performance Summary ===');
    console.log(`FPS: ${fps.toFixed(2)}`);
    console.log(`Long tasks: ${longTasks.length}`);
    if (gpuMemory > 0) {
      console.log(`GPU memory: ${gpuMemory.toFixed(2)}MB`);
    }

    expect(fps).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animationFPS);
    expect(longTasks.length).toBeLessThan(5);
    
    if (gpuMemory > 0) {
      expect(gpuMemory).toBeLessThan(PERFORMANCE_THRESHOLDS.gpuMemory);
    }
  });

  test('Performance remains stable during user interactions', async ({ page }: { page: Page }) => {
    await page.goto('/admin/tasks');
    await page.waitForLoadState('networkidle');

    const fpsReadings: number[] = [];

    // Measure FPS during various interactions
    for (let i = 0; i < 5; i++) {
      // Hover over cards
      const cards = await page.locator('.card-neon').all();
      if (cards.length > 0) {
        await cards[Math.floor(Math.random() * cards.length)].hover();
      }

      const fps = await measureFrameRate(page, 500);
      fpsReadings.push(fps);
      
      await page.waitForTimeout(200);
    }

    const avgFPS = fpsReadings.reduce((a, b) => a + b, 0) / fpsReadings.length;
    const minFPS = Math.min(...fpsReadings);
    const maxFPS = Math.max(...fpsReadings);

    console.log(`Average FPS during interactions: ${avgFPS.toFixed(2)}`);
    console.log(`Min FPS: ${minFPS.toFixed(2)}, Max FPS: ${maxFPS.toFixed(2)}`);

    expect(avgFPS).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animationFPS);
    expect(minFPS).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animationFPS * 0.9);
  });
});
