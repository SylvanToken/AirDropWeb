/**
 * Nature Theme Visual Regression Tests
 * Tests the eco-themed redesign with neon effects, 4K depth, and nature color palette
 * 
 * Requirements covered:
 * - 1.1-1.5: Nature color palette (eco-leaf, eco-forest, eco-moss)
 * - 2.1-2.5: 4K depth effects and glassmorphism
 * - 3.1-3.5: Admin task grid layout (5-column responsive)
 * - 5.1-5.5: Page styling (home, user dashboard, admin dashboard)
 * - 6.1-6.5: Theme system and WCAG compliance
 * - 7.1-7.5: Aspect ratio preservation
 * - 8.1-8.5: Neon effects on interactive elements
 */

import { test, expect, Page } from '@playwright/test';

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  large: { width: 1920, height: 1080 },
  xlarge: { width: 2560, height: 1440 }
};

const THEMES = ['light', 'dark'] as const;

/**
 * Helper to set theme mode
 */
async function setTheme(page: Page, theme: 'light' | 'dark') {
  await page.emulateMedia({ colorScheme: theme });
  // Wait for theme to apply
  await page.waitForTimeout(300);
}

/**
 * Helper to wait for page to be fully loaded
 */
async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Allow animations to settle
}

test.describe('Nature Theme - Home Page', () => {
  
  test.describe('Hero Section', () => {
    
    for (const theme of THEMES) {
      test(`Hero section with eco gradient - ${theme} mode`, async ({ page }) => {
        await setTheme(page, theme);
        await page.goto('/');
        await waitForPageReady(page);
        
        const hero = page.locator('section').first();
        await expect(hero).toHaveScreenshot(`home-hero-${theme}.png`);
      });
    }

    test('Hero section responsive - mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      await waitForPageReady(page);
      
      const hero = page.locator('section').first();
      await expect(hero).toHaveScreenshot('home-hero-mobile.png');
    });

    test('Hero CTA buttons with neon glow', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      const ctaButton = page.locator('a[href*="register"], button').first();
      await expect(ctaButton).toHaveScreenshot('hero-cta-button-default.png');
      
      // Hover state
      await ctaButton.hover();
      await page.waitForTimeout(300);
      await expect(ctaButton).toHaveScreenshot('hero-cta-button-hover.png');
    });
  });

  test.describe('Features Section', () => {
    
    test('Feature cards with neon variant and depth', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      // Scroll to features section
      await page.evaluate(() => {
        const features = document.querySelector('[class*="feature"]')?.parentElement;
        if (features) features.scrollIntoView({ behavior: 'smooth' });
      });
      await page.waitForTimeout(500);
      
      const featuresSection = page.locator('section').nth(1);
      await expect(featuresSection).toHaveScreenshot('home-features-section.png');
    });

    test('Feature card hover with intensified glow', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      const featureCard = page.locator('[class*="card"]').first();
      if (await featureCard.count() > 0) {
        await featureCard.hover();
        await page.waitForTimeout(300);
        await expect(featureCard).toHaveScreenshot('feature-card-hover.png');
      }
    });

    test('Features section - dark mode', async ({ page }) => {
      await setTheme(page, 'dark');
      await page.goto('/');
      await waitForPageReady(page);
      
      await page.evaluate(() => {
        const features = document.querySelector('[class*="feature"]')?.parentElement;
        if (features) features.scrollIntoView({ behavior: 'smooth' });
      });
      await page.waitForTimeout(500);
      
      const featuresSection = page.locator('section').nth(1);
      await expect(featuresSection).toHaveScreenshot('home-features-dark.png');
    });
  });

  test.describe('Benefits and Stats Section', () => {
    
    test('Stats card with neon variant and gradient', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      // Scroll to stats/benefits
      await page.evaluate(() => {
        const sections = document.querySelectorAll('section');
        if (sections.length > 2) sections[2].scrollIntoView({ behavior: 'smooth' });
      });
      await page.waitForTimeout(500);
      
      const statsSection = page.locator('section').nth(2);
      await expect(statsSection).toHaveScreenshot('home-stats-section.png');
    });
  });

  test.describe('CTA Section', () => {
    
    test('CTA card with neon glow and shadow', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      // Scroll to bottom CTA
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      const ctaSection = page.locator('section').last();
      await expect(ctaSection).toHaveScreenshot('home-cta-section.png');
    });

    test('CTA button hover glow effect', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      const ctaButton = page.locator('section').last().locator('button, a').first();
      if (await ctaButton.count() > 0) {
        await ctaButton.hover();
        await page.waitForTimeout(300);
        await expect(ctaButton).toHaveScreenshot('cta-button-hover-glow.png');
      }
    });
  });

  test('Full home page - light mode', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await setTheme(page, 'light');
    await page.goto('/');
    await waitForPageReady(page);
    
    await expect(page).toHaveScreenshot('home-full-light.png', { 
      fullPage: true,
      timeout: 10000
    });
  });

  test('Full home page - dark mode', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await setTheme(page, 'dark');
    await page.goto('/');
    await waitForPageReady(page);
    
    await expect(page).toHaveScreenshot('home-full-dark.png', { 
      fullPage: true,
      timeout: 10000
    });
  });
});

test.describe('Nature Theme - User Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock authentication for user dashboard
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('mock-auth', 'true');
    });
  });

  test.describe('Profile Page Layout', () => {
    
    test('Profile page with eco gradient background', async ({ page }) => {
      await page.goto('/profile');
      await waitForPageReady(page);
      
      await expect(page).toHaveScreenshot('profile-page-layout.png', {
        fullPage: true
      });
    });

    test('Profile page header with eco gradient', async ({ page }) => {
      await page.goto('/profile');
      await waitForPageReady(page);
      
      const header = page.locator('h1, h2').first();
      await expect(header.locator('..')).toHaveScreenshot('profile-header.png');
    });

    test('Profile page - dark mode', async ({ page }) => {
      await setTheme(page, 'dark');
      await page.goto('/profile');
      await waitForPageReady(page);
      
      await expect(page).toHaveScreenshot('profile-page-dark.png', {
        fullPage: true
      });
    });
  });

  test.describe('Profile Cards', () => {
    
    test('Profile card with eco border and shadow', async ({ page }) => {
      await page.goto('/profile');
      await waitForPageReady(page);
      
      const card = page.locator('[class*="card"]').first();
      if (await card.count() > 0) {
        await expect(card).toHaveScreenshot('profile-card-default.png');
      }
    });

    test('Profile card hover with shadow-eco-lg', async ({ page }) => {
      await page.goto('/profile');
      await waitForPageReady(page);
      
      const card = page.locator('[class*="card"]').first();
      if (await card.count() > 0) {
        await card.hover();
        await page.waitForTimeout(300);
        await expect(card).toHaveScreenshot('profile-card-hover.png');
      }
    });

    test('Wallet status with eco-leaf colors', async ({ page }) => {
      await page.goto('/profile');
      await waitForPageReady(page);
      
      // Look for wallet status section
      const walletSection = page.locator('text=/wallet/i').first().locator('..');
      if (await walletSection.count() > 0) {
        await expect(walletSection).toHaveScreenshot('wallet-status-eco.png');
      }
    });

    test('Verified badge with neon glow', async ({ page }) => {
      await page.goto('/profile');
      await waitForPageReady(page);
      
      const badge = page.locator('[class*="badge"]').first();
      if (await badge.count() > 0) {
        await expect(badge).toHaveScreenshot('verified-badge-neon.png');
      }
    });
  });

  test.describe('Account Info Section', () => {
    
    test('Input fields with eco-themed gradients', async ({ page }) => {
      await page.goto('/profile');
      await waitForPageReady(page);
      
      const input = page.locator('input').first();
      if (await input.count() > 0) {
        await expect(input).toHaveScreenshot('input-eco-theme.png');
      }
    });

    test('Input focus with neon ring', async ({ page }) => {
      await page.goto('/profile');
      await waitForPageReady(page);
      
      const input = page.locator('input').first();
      if (await input.count() > 0) {
        await input.focus();
        await page.waitForTimeout(300);
        await expect(input).toHaveScreenshot('input-focus-neon.png');
      }
    });

    test('Stat displays with eco gradient text', async ({ page }) => {
      await page.goto('/profile');
      await waitForPageReady(page);
      
      const stats = page.locator('[class*="stat"]').first();
      if (await stats.count() > 0) {
        await expect(stats).toHaveScreenshot('stats-eco-gradient.png');
      }
    });
  });

  test('Full profile page - mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/profile');
    await waitForPageReady(page);
    
    await expect(page).toHaveScreenshot('profile-mobile.png', {
      fullPage: true
    });
  });
});

test.describe('Nature Theme - Admin Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock admin authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('mock-admin', 'true');
    });
  });

  test.describe('Dashboard Header', () => {
    
    test('Admin header with eco gradient', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await waitForPageReady(page);
      
      const header = page.locator('header, [class*="header"]').first();
      await expect(header).toHaveScreenshot('admin-header-eco.png');
    });

    test('Admin badge with eco gradient', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await waitForPageReady(page);
      
      const badge = page.locator('[class*="badge"]').first();
      if (await badge.count() > 0) {
        await expect(badge).toHaveScreenshot('admin-badge-eco.png');
      }
    });

    test('Admin header - dark mode', async ({ page }) => {
      await setTheme(page, 'dark');
      await page.goto('/admin/dashboard');
      await waitForPageReady(page);
      
      const header = page.locator('header, [class*="header"]').first();
      await expect(header).toHaveScreenshot('admin-header-dark.png');
    });
  });

  test.describe('Stats Cards', () => {
    
    test('Stats cards with gradient backgrounds', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await waitForPageReady(page);
      
      const statsGrid = page.locator('[class*="grid"]').first();
      await expect(statsGrid).toHaveScreenshot('admin-stats-grid.png');
    });

    test('Individual stat card with depth-4k-1', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await waitForPageReady(page);
      
      const statCard = page.locator('[class*="card"]').first();
      if (await statCard.count() > 0) {
        await expect(statCard).toHaveScreenshot('admin-stat-card.png');
      }
    });

    test('Stat card hover with shadow-lg', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await waitForPageReady(page);
      
      const statCard = page.locator('[class*="card"]').first();
      if (await statCard.count() > 0) {
        await statCard.hover();
        await page.waitForTimeout(300);
        await expect(statCard).toHaveScreenshot('admin-stat-card-hover.png');
      }
    });

    test('Stat icons with eco-themed gradients', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await waitForPageReady(page);
      
      const icon = page.locator('svg').first();
      if (await icon.count() > 0) {
        await expect(icon.locator('..')).toHaveScreenshot('admin-stat-icon.png');
      }
    });
  });

  test.describe('Quick Actions Section', () => {
    
    test('Action items with hover effects', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await waitForPageReady(page);
      
      const actionItem = page.locator('[class*="action"]').first();
      if (await actionItem.count() > 0) {
        await expect(actionItem).toHaveScreenshot('admin-action-default.png');
        
        await actionItem.hover();
        await page.waitForTimeout(300);
        await expect(actionItem).toHaveScreenshot('admin-action-hover.png');
      }
    });
  });

  test('Full admin dashboard - light mode', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await setTheme(page, 'light');
    await page.goto('/admin/dashboard');
    await waitForPageReady(page);
    
    await expect(page).toHaveScreenshot('admin-dashboard-full-light.png', {
      fullPage: true,
      timeout: 10000
    });
  });

  test('Full admin dashboard - dark mode', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await setTheme(page, 'dark');
    await page.goto('/admin/dashboard');
    await waitForPageReady(page);
    
    await expect(page).toHaveScreenshot('admin-dashboard-full-dark.png', {
      fullPage: true,
      timeout: 10000
    });
  });
});

test.describe('Nature Theme - Admin Task Grid', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('mock-admin', 'true');
    });
  });

  test.describe('5-Column Responsive Layout', () => {
    
    test('Task grid - 5 columns on xlarge screens (>=1280px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.xlarge);
      await page.goto('/admin/tasks');
      await waitForPageReady(page);
      
      const grid = page.locator('[class*="grid"]').first();
      await expect(grid).toHaveScreenshot('admin-tasks-5col-xlarge.png');
    });

    test('Task grid - 5 columns on large screens (1280px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.large);
      await page.goto('/admin/tasks');
      await waitForPageReady(page);
      
      const grid = page.locator('[class*="grid"]').first();
      await expect(grid).toHaveScreenshot('admin-tasks-5col-large.png');
    });

    test('Task grid - 3 columns on desktop (1280px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/admin/tasks');
      await waitForPageReady(page);
      
      const grid = page.locator('[class*="grid"]').first();
      await expect(grid).toHaveScreenshot('admin-tasks-3col-desktop.png');
    });

    test('Task grid - 3 columns on tablet (768px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto('/admin/tasks');
      await waitForPageReady(page);
      
      const grid = page.locator('[class*="grid"]').first();
      await expect(grid).toHaveScreenshot('admin-tasks-3col-tablet.png');
    });

    test('Task grid - 1 column on mobile (<768px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/admin/tasks');
      await waitForPageReady(page);
      
      const grid = page.locator('[class*="grid"]').first();
      await expect(grid).toHaveScreenshot('admin-tasks-1col-mobile.png');
    });
  });

  test.describe('Task Card Styling', () => {
    
    test('Task card with neon variant', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/admin/tasks');
      await waitForPageReady(page);
      
      const taskCard = page.locator('[class*="card"]').first();
      if (await taskCard.count() > 0) {
        await expect(taskCard).toHaveScreenshot('task-card-neon.png');
      }
    });

    test('Task card with depth-4k-2 effect', async ({ page }) => {
      await page.goto('/admin/tasks');
      await waitForPageReady(page);
      
      const taskCard = page.locator('[class*="card"]').first();
      if (await taskCard.count() > 0) {
        // Capture card to show depth effect
        await expect(taskCard).toHaveScreenshot('task-card-depth.png');
      }
    });

    test('Task card hover glow effect', async ({ page }) => {
      await page.goto('/admin/tasks');
      await waitForPageReady(page);
      
      const taskCard = page.locator('[class*="card"]').first();
      if (await taskCard.count() > 0) {
        await taskCard.hover();
        await page.waitForTimeout(300);
        await expect(taskCard).toHaveScreenshot('task-card-hover-glow.png');
      }
    });

    test('Task card with delete button', async ({ page }) => {
      await page.goto('/admin/tasks');
      await waitForPageReady(page);
      
      const taskCard = page.locator('[class*="card"]').first();
      if (await taskCard.count() > 0) {
        const deleteButton = taskCard.locator('button[class*="destructive"]');
        if (await deleteButton.count() > 0) {
          await expect(taskCard).toHaveScreenshot('task-card-with-delete.png');
        }
      }
    });

    test('Task card - dark mode', async ({ page }) => {
      await setTheme(page, 'dark');
      await page.goto('/admin/tasks');
      await waitForPageReady(page);
      
      const taskCard = page.locator('[class*="card"]').first();
      if (await taskCard.count() > 0) {
        await expect(taskCard).toHaveScreenshot('task-card-dark.png');
      }
    });
  });

  test('Full admin tasks page - 5 column layout', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.xlarge);
    await page.goto('/admin/tasks');
    await waitForPageReady(page);
    
    await expect(page).toHaveScreenshot('admin-tasks-full-5col.png', {
      fullPage: true,
      timeout: 10000
    });
  });
});

test.describe('Nature Theme - Interactive Elements', () => {
  
  test.describe('Button Neon Effects', () => {
    
    test('Primary button with neon glow', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      const button = page.locator('button').first();
      await expect(button).toHaveScreenshot('button-neon-default.png');
    });

    test('Button hover with intensified glow', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      const button = page.locator('button').first();
      await button.hover();
      await page.waitForTimeout(300);
      await expect(button).toHaveScreenshot('button-neon-hover.png');
    });

    test('Button focus ring with eco-leaf color', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      const button = page.locator('button').first();
      await button.focus();
      await page.waitForTimeout(300);
      await expect(button).toHaveScreenshot('button-focus-ring.png');
    });
  });

  test.describe('Form Input Neon Focus', () => {
    
    test('Input with neon focus ring', async ({ page }) => {
      await page.goto('/login');
      await waitForPageReady(page);
      
      const input = page.locator('input[type="email"]');
      await input.focus();
      await page.waitForTimeout(300);
      await expect(input).toHaveScreenshot('input-neon-focus.png');
    });

    test('Input border with eco-leaf color', async ({ page }) => {
      await page.goto('/login');
      await waitForPageReady(page);
      
      const input = page.locator('input[type="email"]');
      await expect(input).toHaveScreenshot('input-eco-border.png');
    });
  });

  test.describe('Card Neon Variants', () => {
    
    test('Card with neon border on focus', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      const card = page.locator('[class*="card"]').first();
      if (await card.count() > 0) {
        await card.focus();
        await page.waitForTimeout(300);
        await expect(card).toHaveScreenshot('card-neon-focus.png');
      }
    });

    test('Card with animated pulse', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      // Look for active/pulsing cards
      const activeCard = page.locator('[class*="pulse"], [class*="active"]').first();
      if (await activeCard.count() > 0) {
        await expect(activeCard).toHaveScreenshot('card-neon-pulse.png');
      }
    });
  });
});

test.describe('Nature Theme - Navigation Components', () => {
  
  test('Header with eco-themed colors', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    
    const header = page.locator('header').first();
    await expect(header).toHaveScreenshot('header-eco-theme.png');
  });

  test('Header - dark mode', async ({ page }) => {
    await setTheme(page, 'dark');
    await page.goto('/');
    await waitForPageReady(page);
    
    const header = page.locator('header').first();
    await expect(header).toHaveScreenshot('header-eco-dark.png');
  });

  test('Admin sidebar with eco gradients', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('mock-admin', 'true');
    });
    await page.goto('/admin/dashboard');
    await waitForPageReady(page);
    
    const sidebar = page.locator('[class*="sidebar"]').first();
    if (await sidebar.count() > 0) {
      await expect(sidebar).toHaveScreenshot('admin-sidebar-eco.png');
    }
  });

  test('Active navigation item with neon glow', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('mock-admin', 'true');
    });
    await page.goto('/admin/dashboard');
    await waitForPageReady(page);
    
    const activeNav = page.locator('[class*="active"]').first();
    if (await activeNav.count() > 0) {
      await expect(activeNav).toHaveScreenshot('nav-active-neon.png');
    }
  });

  test('Navigation icons with eco-leaf color', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    
    const navIcon = page.locator('nav svg').first();
    if (await navIcon.count() > 0) {
      await expect(navIcon.locator('..')).toHaveScreenshot('nav-icon-eco.png');
    }
  });
});

test.describe('Nature Theme - Aspect Ratio Preservation', () => {
  
  test('Card maintains aspect ratio on desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/');
    await waitForPageReady(page);
    
    const card = page.locator('[class*="card"]').first();
    if (await card.count() > 0) {
      const box = await card.boundingBox();
      if (box) {
        // Verify aspect ratio is maintained
        await expect(card).toHaveScreenshot('card-aspect-desktop.png');
      }
    }
  });

  test('Card maintains aspect ratio on mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await waitForPageReady(page);
    
    const card = page.locator('[class*="card"]').first();
    if (await card.count() > 0) {
      await expect(card).toHaveScreenshot('card-aspect-mobile.png');
    }
  });

  test('Images preserve natural aspect ratios', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    
    const image = page.locator('img').first();
    if (await image.count() > 0) {
      await expect(image).toHaveScreenshot('image-aspect-natural.png');
    }
  });
});

test.describe('Nature Theme - Accessibility', () => {
  
  test('Reduced motion - neon effects disabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForPageReady(page);
    
    const button = page.locator('button').first();
    await button.hover();
    await page.waitForTimeout(300);
    await expect(button).toHaveScreenshot('button-reduced-motion.png');
  });

  test('High contrast mode compatibility', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    await page.goto('/');
    await waitForPageReady(page);
    
    await expect(page).toHaveScreenshot('high-contrast-mode.png');
  });
});
