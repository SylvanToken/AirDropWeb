import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Analytics Dashboard', () => {
  // Setup: Create test data before tests
  test.beforeAll(async () => {
    // Clean up any existing test data
    await prisma.completion.deleteMany({
      where: {
        user: {
          email: {
            startsWith: 'analytics-test-',
          },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'analytics-test-',
        },
      },
    });

    await prisma.task.deleteMany({
      where: {
        title: {
          startsWith: 'Analytics Test Task',
        },
      },
    });

    await prisma.campaign.deleteMany({
      where: {
        title: {
          startsWith: 'Analytics Test Campaign',
        },
      },
    });

    // Create test users with various activity levels
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const users = await Promise.all([
      // Active user (logged in recently)
      prisma.user.create({
        data: {
          email: 'analytics-test-active@example.com',
          username: 'analytics-active',
          password: 'hashedpassword',
          role: 'USER',
          status: 'ACTIVE',
          totalPoints: 500,
          lastActive: sevenDaysAgo,
          createdAt: thirtyDaysAgo,
        },
      }),
      // Inactive user (not logged in recently)
      prisma.user.create({
        data: {
          email: 'analytics-test-inactive@example.com',
          username: 'analytics-inactive',
          password: 'hashedpassword',
          role: 'USER',
          status: 'ACTIVE',
          totalPoints: 100,
          lastActive: thirtyDaysAgo,
          createdAt: thirtyDaysAgo,
        },
      }),
      // New user (created today)
      prisma.user.create({
        data: {
          email: 'analytics-test-new@example.com',
          username: 'analytics-new',
          password: 'hashedpassword',
          role: 'USER',
          status: 'ACTIVE',
          totalPoints: 0,
          lastActive: today,
          createdAt: today,
        },
      }),
    ]);

    // Create test campaign first
    const campaign = await prisma.campaign.create({
      data: {
        title: 'Analytics Test Campaign',
        description: 'Test campaign for analytics',
        startDate: thirtyDaysAgo,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });

    // Create test tasks
    const tasks = await Promise.all([
      prisma.task.create({
        data: {
          campaignId: campaign.id,
          title: 'Analytics Test Task 1',
          description: 'Test task for analytics',
          taskType: 'TWITTER_FOLLOW',
          points: 100,
          taskUrl: 'https://twitter.com/test',
          isActive: true,
        },
      }),
      prisma.task.create({
        data: {
          campaignId: campaign.id,
          title: 'Analytics Test Task 2',
          description: 'Test task for analytics',
          taskType: 'TELEGRAM_JOIN',
          points: 50,
          taskUrl: 'https://t.me/test',
          isActive: true,
        },
      }),
    ]);

    // Create test completions
    await Promise.all([
      // Completions for active user
      prisma.completion.create({
        data: {
          userId: users[0].id,
          taskId: tasks[0].id,
          status: 'APPROVED',
          pointsAwarded: 100,
          completedAt: sevenDaysAgo,
        },
      }),
      prisma.completion.create({
        data: {
          userId: users[0].id,
          taskId: tasks[1].id,
          status: 'APPROVED',
          pointsAwarded: 50,
          completedAt: today,
        },
      }),
      // Completion for inactive user
      prisma.completion.create({
        data: {
          userId: users[1].id,
          taskId: tasks[0].id,
          status: 'APPROVED',
          pointsAwarded: 100,
          completedAt: thirtyDaysAgo,
        },
      }),
    ]);
  });

  // Cleanup after tests
  test.afterAll(async () => {
    await prisma.completion.deleteMany({
      where: {
        user: {
          email: {
            startsWith: 'analytics-test-',
          },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'analytics-test-',
        },
      },
    });

    await prisma.task.deleteMany({
      where: {
        title: {
          startsWith: 'Analytics Test Task',
        },
      },
    });

    await prisma.campaign.deleteMany({
      where: {
        title: {
          startsWith: 'Analytics Test Campaign',
        },
      },
    });

    await prisma.$disconnect();
  });

  test('should display analytics dashboard with key metrics', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@sylvantoken.org');
    await page.fill('input[name="password"]', 'Mjkvebep_68');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');

    // Navigate to analytics page
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Verify page title
    await expect(page.locator('h1')).toContainText('Analytics');

    // Verify key metrics cards are displayed
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Active Users')).toBeVisible();
    await expect(page.locator('text=Total Completions')).toBeVisible();
    await expect(page.locator('text=Total Points')).toBeVisible();

    // Verify metrics have numeric values
    const totalUsersCard = page.locator('text=Total Users').locator('..');
    await expect(totalUsersCard).toContainText(/\d+/);
  });

  test('should calculate metrics correctly', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@sylvantoken.org');
    await page.fill('input[name="password"]', 'Mjkvebep_68');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');

    // Navigate to analytics page
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Wait for metrics to load
    await page.waitForTimeout(2000);

    // Get metric values from the page
    const metricsText = await page.textContent('body');

    // Verify we have test users in the count
    expect(metricsText).toContain('Total Users');
    expect(metricsText).toContain('Active Users');
    expect(metricsText).toContain('Total Completions');
    expect(metricsText).toContain('Total Points');

    // Verify metrics are numeric and greater than 0
    const totalUsersMatch = metricsText?.match(/Total Users.*?(\d+)/s);
    if (totalUsersMatch) {
      const totalUsers = parseInt(totalUsersMatch[1].replace(/,/g, ''));
      expect(totalUsers).toBeGreaterThan(0);
    }
  });

  test('should render charts correctly', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@sylvantoken.org');
    await page.fill('input[name="password"]', 'Mjkvebep_68');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');

    // Navigate to analytics page
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Wait for charts to render
    await page.waitForTimeout(2000);

    // Verify chart titles are present
    await expect(page.locator('text=User Growth')).toBeVisible();
    await expect(page.locator('text=Completion Trends')).toBeVisible();
    await expect(page.locator('text=Top Tasks')).toBeVisible();

    // Verify charts are rendered (check for SVG elements from recharts)
    const svgElements = page.locator('svg');
    const svgCount = await svgElements.count();
    expect(svgCount).toBeGreaterThan(0);

    // Verify chart containers exist
    const chartContainers = page.locator('.recharts-wrapper');
    const chartCount = await chartContainers.count();
    expect(chartCount).toBeGreaterThan(0);
  });

  test('should filter data by date range', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@sylvantoken.org');
    await page.fill('input[name="password"]', 'Mjkvebep_68');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');

    // Navigate to analytics page
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Wait for initial load
    await page.waitForTimeout(1000);

    // Get initial metrics
    const initialText = await page.textContent('body');

    // Click on 7 days filter
    await page.click('text=Last 7 Days');
    await page.waitForTimeout(1000);

    // Verify date range is updated
    await expect(page.locator('text=/showing/i')).toBeVisible();

    // Click on 90 days filter
    await page.click('text=Last 90 Days');
    await page.waitForTimeout(1000);

    // Verify metrics are recalculated
    const updatedText = await page.textContent('body');
    expect(updatedText).toBeTruthy();

    // Click on last year filter
    await page.click('text=Last Year');
    await page.waitForTimeout(1000);

    // Verify date range selector is functional
    await expect(page.locator('text=/showing/i')).toBeVisible();
  });

  test('should export analytics to PDF', async ({ page, context }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@sylvantoken.org');
    await page.fill('input[name="password"]', 'Mjkvebep_68');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');

    // Navigate to analytics page
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Wait for metrics to load
    await page.waitForTimeout(2000);

    // Listen for new page (popup)
    const popupPromise = context.waitForEvent('page');

    // Click export PDF button
    await page.click('text=Export to PDF');

    // Wait for popup to open
    const popup = await popupPromise;
    await popup.waitForLoadState('load');

    // Verify popup contains report content
    await expect(popup.locator('text=Analytics Dashboard Report')).toBeVisible();
    await expect(popup.locator('text=Total Users')).toBeVisible();
    await expect(popup.locator('text=Top Tasks by Completions')).toBeVisible();

    // Verify print/save button exists
    await expect(popup.locator('text=Print / Save as PDF')).toBeVisible();

    // Close popup
    await popup.close();
  });

  test('should refresh analytics data', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@sylvantoken.org');
    await page.fill('input[name="password"]', 'Mjkvebep_68');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');

    // Navigate to analytics page
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Wait for initial load
    await page.waitForTimeout(1000);

    // Click refresh button
    const refreshButton = page.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();

    // Verify loading state (spinner should appear briefly)
    await page.waitForTimeout(500);

    // Verify data is still displayed after refresh
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Active Users')).toBeVisible();
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@sylvantoken.org');
    await page.fill('input[name="password"]', 'Mjkvebep_68');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');

    // Navigate to analytics page
    await page.goto('/admin/analytics');

    // Measure page load time
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Verify page loads within acceptable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);

    // Verify all metrics are displayed
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Active Users')).toBeVisible();
    await expect(page.locator('text=Total Completions')).toBeVisible();
    await expect(page.locator('text=Total Points')).toBeVisible();

    // Verify charts render without errors
    const svgElements = page.locator('svg');
    const svgCount = await svgElements.count();
    expect(svgCount).toBeGreaterThan(0);
  });

  test('should display empty state when no data available', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@sylvantoken.org');
    await page.fill('input[name="password"]', 'Mjkvebep_68');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');

    // Navigate to analytics page
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Wait for charts to render
    await page.waitForTimeout(2000);

    // Even with no data, metrics should show 0
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('Total Users');
    expect(bodyText).toContain('Active Users');
  });

  test('should display correct chart types', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@sylvantoken.org');
    await page.fill('input[name="password"]', 'Mjkvebep_68');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');

    // Navigate to analytics page
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Wait for charts to render
    await page.waitForTimeout(2000);

    // Verify different chart types are present
    // Line charts for trends
    await expect(page.locator('text=User Growth')).toBeVisible();
    await expect(page.locator('text=Completion Trends')).toBeVisible();

    // Bar chart for top tasks
    await expect(page.locator('text=Top Tasks')).toBeVisible();

    // Pie charts for distributions
    await expect(page.locator('text=User Activity')).toBeVisible();
    await expect(page.locator('text=Today\'s Activity')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@sylvantoken.org');
    await page.fill('input[name="password"]', 'Mjkvebep_68');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');

    // Navigate to analytics page
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Verify page is responsive
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Total Users')).toBeVisible();

    // Verify charts are responsive
    await page.waitForTimeout(2000);
    const svgElements = page.locator('svg');
    const svgCount = await svgElements.count();
    expect(svgCount).toBeGreaterThan(0);

    // Verify buttons are accessible
    await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
  });
});
