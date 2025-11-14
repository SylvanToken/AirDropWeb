/**
 * Data Export E2E Tests
 * 
 * Tests CSV, Excel, and JSON export functionality including:
 * - Format validation
 * - Field selection
 * - Filtered exports
 * - Large dataset handling
 * - Email delivery for large exports
 */

import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';

// Test data setup
const TEST_ADMIN = {
  email: 'export-test-admin@test.com',
  password: 'TestPassword123!',
  username: 'exporttestadmin',
  role: 'ADMIN' as const,
};

test.describe('Data Export Tests', () => {
  test.beforeAll(async () => {
    // Create test admin user
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(TEST_ADMIN.password, 10);
    
    await prisma.user.upsert({
      where: { email: TEST_ADMIN.email },
      update: {},
      create: {
        email: TEST_ADMIN.email,
        password: hashedPassword,
        username: TEST_ADMIN.username,
        role: TEST_ADMIN.role,
        status: 'ACTIVE',
      },
    });

    // Create test data for exports
    await createTestData();
  });

  test.afterAll(async () => {
    // Cleanup test data
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'export-test',
        },
      },
    });
  });

  test.describe('CSV Export', () => {
    test('should export users to CSV format', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/users');

      // Open export dialog
      await page.click('button:has-text("Export")');
      
      // Select CSV format
      await page.click('input[value="csv"]');
      
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download")');
      const download = await downloadPromise;

      // Verify filename
      expect(download.suggestedFilename()).toMatch(/users_export_.*\.csv/);

      // Verify content
      const path = await download.path();
      const fs = await import('fs');
      const content = fs.readFileSync(path!, 'utf-8');
      
      // Check CSV structure
      const lines = content.split('\n');
      expect(lines.length).toBeGreaterThan(1); // Header + data
      
      // Verify headers
      const headers = lines[0].split(',');
      expect(headers).toContain('email');
      expect(headers).toContain('username');
      expect(headers).toContain('totalPoints');
    });

    test('should handle special characters in CSV', async ({ page }) => {
      // Create user with special characters
      await prisma.user.create({
        data: {
          email: 'special-chars-test@test.com',
          username: 'user,with"comma',
          password: 'hashedpassword',
          role: 'USER',
          status: 'ACTIVE',
        },
      });

      await loginAsAdmin(page);
      await page.goto('/admin/users');

      // Export to CSV
      await page.click('button:has-text("Export")');
      await page.click('input[value="csv"]');
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download")');
      const download = await downloadPromise;

      // Verify content escaping
      const path = await download.path();
      const fs = await import('fs');
      const content = fs.readFileSync(path!, 'utf-8');
      
      // Should properly escape commas and quotes
      expect(content).toContain('"user,with""comma"');
    });

    test('should respect field selection in CSV', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/users');

      // Open export dialog
      await page.click('button:has-text("Export")');
      await page.click('input[value="csv"]');
      
      // Select specific fields
      await page.uncheck('input[name="field-password"]');
      await page.uncheck('input[name="field-walletAddress"]');
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download")');
      const download = await downloadPromise;

      // Verify selected fields only
      const path = await download.path();
      const fs = await import('fs');
      const content = fs.readFileSync(path!, 'utf-8');
      
      const headers = content.split('\n')[0].split(',');
      expect(headers).not.toContain('password');
      expect(headers).not.toContain('walletAddress');
    });
  });

  test.describe('Excel Export', () => {
    test('should export users to Excel format', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/users');

      // Open export dialog
      await page.click('button:has-text("Export")');
      
      // Select Excel format
      await page.click('input[value="excel"]');
      
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download")');
      const download = await downloadPromise;

      // Verify filename
      expect(download.suggestedFilename()).toMatch(/users_export_.*\.xlsx/);

      // Verify it's a valid Excel file
      const path = await download.path();
      const fs = await import('fs');
      const buffer = fs.readFileSync(path!);
      
      // Excel files start with PK (ZIP signature)
      expect(buffer[0]).toBe(0x50); // 'P'
      expect(buffer[1]).toBe(0x4B); // 'K'
    });

    test('should handle large datasets in Excel', async ({ page }) => {
      // Create 100 test users
      const users = Array.from({ length: 100 }, (_, i) => ({
        email: `bulk-user-${i}@test.com`,
        username: `bulkuser${i}`,
        password: 'hashedpassword',
        role: 'USER' as const,
        status: 'ACTIVE' as const,
        totalPoints: Math.floor(Math.random() * 1000),
      }));

      await prisma.user.createMany({
        data: users,
      });

      await loginAsAdmin(page);
      await page.goto('/admin/users');

      // Export to Excel
      await page.click('button:has-text("Export")');
      await page.click('input[value="excel"]');
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download")');
      const download = await downloadPromise;

      // Verify file was created
      expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
      
      // Verify file size is reasonable (should be > 10KB for 100 users)
      const path = await download.path();
      const fs = await import('fs');
      const stats = fs.statSync(path!);
      expect(stats.size).toBeGreaterThan(10000);
    });
  });

  test.describe('JSON Export', () => {
    test('should export users to JSON format', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/users');

      // Open export dialog
      await page.click('button:has-text("Export")');
      
      // Select JSON format
      await page.click('input[value="json"]');
      
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download")');
      const download = await downloadPromise;

      // Verify filename
      expect(download.suggestedFilename()).toMatch(/users_export_.*\.json/);

      // Verify valid JSON
      const path = await download.path();
      const fs = await import('fs');
      const content = fs.readFileSync(path!, 'utf-8');
      
      const data = JSON.parse(content);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      
      // Verify structure
      const firstUser = data[0];
      expect(firstUser).toHaveProperty('email');
      expect(firstUser).toHaveProperty('username');
      expect(firstUser).toHaveProperty('totalPoints');
    });

    test('should preserve nested objects in JSON', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/users');

      // Export completions (has nested user and task objects)
      await page.goto('/admin/users');
      await page.click('button:has-text("Export")');
      
      // Change model to completions
      await page.selectOption('select[name="model"]', 'completions');
      await page.click('input[value="json"]');
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download")');
      const download = await downloadPromise;

      // Verify nested structure
      const path = await download.path();
      const fs = await import('fs');
      const content = fs.readFileSync(path!, 'utf-8');
      
      const data = JSON.parse(content);
      if (data.length > 0) {
        const firstCompletion = data[0];
        expect(firstCompletion).toHaveProperty('user');
        expect(firstCompletion).toHaveProperty('task');
        expect(firstCompletion.user).toHaveProperty('email');
        expect(firstCompletion.task).toHaveProperty('title');
      }
    });

    test('should format dates correctly in JSON', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/users');

      await page.click('button:has-text("Export")');
      await page.click('input[value="json"]');
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download")');
      const download = await downloadPromise;

      const path = await download.path();
      const fs = await import('fs');
      const content = fs.readFileSync(path!, 'utf-8');
      
      const data = JSON.parse(content);
      const firstUser = data[0];
      
      // Verify date format (ISO 8601)
      if (firstUser.createdAt) {
        expect(firstUser.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        
        // Should be parseable as Date
        const date = new Date(firstUser.createdAt);
        expect(date.toString()).not.toBe('Invalid Date');
      }
    });
  });

  test.describe('Filtered Exports', () => {
    test('should apply filters to export data', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/users');

      // Apply filter for active users only
      await page.click('button:has-text("Filters")');
      await page.selectOption('select[name="status"]', 'ACTIVE');
      await page.click('button:has-text("Apply Filters")');

      // Export filtered data
      await page.click('button:has-text("Export")');
      await page.click('input[value="json"]');
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download")');
      const download = await downloadPromise;

      // Verify all users are ACTIVE
      const path = await download.path();
      const fs = await import('fs');
      const content = fs.readFileSync(path!, 'utf-8');
      
      const data = JSON.parse(content);
      const allActive = data.every((user: any) => user.status === 'ACTIVE');
      expect(allActive).toBe(true);
    });

    test('should export with multiple filter criteria', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/users');

      // Apply multiple filters
      await page.click('button:has-text("Filters")');
      await page.selectOption('select[name="status"]', 'ACTIVE');
      await page.fill('input[name="minPoints"]', '100');
      await page.click('button:has-text("Apply Filters")');

      // Export
      await page.click('button:has-text("Export")');
      await page.click('input[value="json"]');
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download")');
      const download = await downloadPromise;

      // Verify filters applied
      const path = await download.path();
      const fs = await import('fs');
      const content = fs.readFileSync(path!, 'utf-8');
      
      const data = JSON.parse(content);
      const allMatch = data.every((user: any) => 
        user.status === 'ACTIVE' && user.totalPoints >= 100
      );
      expect(allMatch).toBe(true);
    });
  });

  test.describe('API Endpoint Tests', () => {
    test('should require authentication', async ({ request }) => {
      const response = await request.post('/api/admin/export', {
        data: {
          format: 'csv',
          model: 'users',
        },
      });

      expect(response.status()).toBe(401);
    });

    test('should require admin role', async ({ page, request }) => {
      // Create regular user
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await prisma.user.create({
        data: {
          email: 'regular-user@test.com',
          username: 'regularuser',
          password: hashedPassword,
          role: 'USER',
          status: 'ACTIVE',
        },
      });

      // Login as regular user
      await page.goto('/login');
      await page.fill('input[name="email"]', 'regular-user@test.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      // Try to export
      const response = await page.request.post('/api/admin/export', {
        data: {
          format: 'csv',
          model: 'users',
        },
      });

      expect(response.status()).toBe(403);
    });

    test('should validate request parameters', async ({ page }) => {
      await loginAsAdmin(page);

      // Missing format
      let response = await page.request.post('/api/admin/export', {
        data: {
          model: 'users',
        },
      });
      expect(response.status()).toBe(400);

      // Invalid format
      response = await page.request.post('/api/admin/export', {
        data: {
          format: 'invalid',
          model: 'users',
        },
      });
      expect(response.status()).toBe(400);

      // Invalid model
      response = await page.request.post('/api/admin/export', {
        data: {
          format: 'csv',
          model: 'invalid',
        },
      });
      expect(response.status()).toBe(400);
    });

    test('should log export operations in audit log', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/users');

      // Perform export
      await page.click('button:has-text("Export")');
      await page.click('input[value="csv"]');
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download")');
      await downloadPromise;

      // Check audit log
      await page.goto('/admin/audit');
      
      // Should see export_completed action
      await expect(page.locator('text=export_completed')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle database errors gracefully', async ({ page }) => {
      await loginAsAdmin(page);

      // Try to export with invalid filter that causes DB error
      const response = await page.request.post('/api/admin/export', {
        data: {
          format: 'csv',
          model: 'users',
          filters: [
            {
              field: 'nonexistent_field',
              operator: 'equals',
              value: 'test',
            },
          ],
        },
      });

      expect(response.status()).toBe(500);
      const body = await response.json();
      expect(body).toHaveProperty('error');
    });

    test('should handle empty datasets', async ({ page }) => {
      await loginAsAdmin(page);

      // Export with filter that returns no results
      const response = await page.request.post('/api/admin/export', {
        data: {
          format: 'csv',
          model: 'users',
          filters: [
            {
              field: 'email',
              operator: 'equals',
              value: 'nonexistent@example.com',
            },
          ],
        },
      });

      expect(response.status()).toBe(200);
      
      // Should return empty CSV (just headers)
      const content = await response.text();
      const lines = content.split('\n');
      expect(lines.length).toBeLessThanOrEqual(2); // Header + maybe empty line
    });
  });
});

// Helper functions
async function loginAsAdmin(page: any) {
  await page.goto('/admin/login');
  await page.fill('input[name="email"]', TEST_ADMIN.email);
  await page.fill('input[name="password"]', TEST_ADMIN.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/admin/dashboard');
}

async function createTestData() {
  // Create some test users with various statuses and points
  const testUsers = [
    {
      email: 'export-test-user1@test.com',
      username: 'exportuser1',
      password: 'hashedpassword',
      role: 'USER' as const,
      status: 'ACTIVE' as const,
      totalPoints: 150,
    },
    {
      email: 'export-test-user2@test.com',
      username: 'exportuser2',
      password: 'hashedpassword',
      role: 'USER' as const,
      status: 'ACTIVE' as const,
      totalPoints: 250,
    },
    {
      email: 'export-test-user3@test.com',
      username: 'exportuser3',
      password: 'hashedpassword',
      role: 'USER' as const,
      status: 'SUSPENDED' as const,
      totalPoints: 50,
    },
  ];

  await prisma.user.createMany({
    data: testUsers,
  });
}
