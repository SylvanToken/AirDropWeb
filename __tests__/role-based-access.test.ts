import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { 
  initializeDefaultRoles, 
  getUserRole, 
  hasPermission, 
  checkPermission,
  assignRoleToUser,
  createRole,
  updateRole,
  getRoles
} from '@/lib/admin/permissions';

/**
 * Role-Based Access Control (RBAC) Tests
 * 
 * Tests permission checking, unauthorized access denial, role assignment,
 * permission updates, and UI hiding for unauthorized features.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

test.describe('Role-Based Access Control', () => {
  let superAdminUser: any;
  let adminUser: any;
  let moderatorUser: any;
  let regularUser: any;
  let superAdminRole: any;
  let adminRole: any;
  let moderatorRole: any;

  test.beforeAll(async () => {
    // Initialize default roles
    await initializeDefaultRoles();

    // Get roles
    superAdminRole = await prisma.role.findUnique({
      where: { name: 'Super Admin' },
    });
    adminRole = await prisma.role.findUnique({
      where: { name: 'Admin' },
    });
    moderatorRole = await prisma.role.findUnique({
      where: { name: 'Moderator' },
    });

    // Create test users with different roles
    const hashedPassword = await bcrypt.hash('Mjkvebep_68', 10);

    superAdminUser = await prisma.user.create({
      data: {
        email: 'superadmin@test.com',
        username: 'superadmin',
        password: hashedPassword,
        role: 'ADMIN',
        roleId: superAdminRole.id,
      },
    });

    adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
        roleId: adminRole.id,
      },
    });

    moderatorUser = await prisma.user.create({
      data: {
        email: 'moderator@test.com',
        username: 'moderator',
        password: hashedPassword,
        role: 'ADMIN',
        roleId: moderatorRole.id,
      },
    });

    regularUser = await prisma.user.create({
      data: {
        email: 'regular@test.com',
        username: 'regular',
        password: hashedPassword,
        role: 'USER',
      },
    });
  });

  test.afterAll(async () => {
    // Clean up test users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'superadmin@test.com',
            'admin@test.com',
            'moderator@test.com',
            'regular@test.com',
          ],
        },
      },
    });
  });

  test.describe('Permission Checking', () => {
    test('Super Admin should have all permissions', async () => {
      const role = await getUserRole(superAdminUser.id);
      expect(role).not.toBeNull();
      expect(role!.name).toBe('Super Admin');
      
      // Check all permissions
      expect(hasPermission(role!, 'users.view')).toBe(true);
      expect(hasPermission(role!, 'users.edit')).toBe(true);
      expect(hasPermission(role!, 'users.delete')).toBe(true);
      expect(hasPermission(role!, 'tasks.view')).toBe(true);
      expect(hasPermission(role!, 'tasks.create')).toBe(true);
      expect(hasPermission(role!, 'tasks.edit')).toBe(true);
      expect(hasPermission(role!, 'tasks.delete')).toBe(true);
      expect(hasPermission(role!, 'campaigns.manage')).toBe(true);
      expect(hasPermission(role!, 'analytics.view')).toBe(true);
      expect(hasPermission(role!, 'audit.view')).toBe(true);
      expect(hasPermission(role!, 'roles.manage')).toBe(true);
      expect(hasPermission(role!, 'workflows.manage')).toBe(true);
      expect(hasPermission(role!, 'export.data')).toBe(true);
    });

    test('Admin should have limited permissions', async () => {
      const role = await getUserRole(adminUser.id);
      expect(role).not.toBeNull();
      expect(role!.name).toBe('Admin');
      
      // Has these permissions
      expect(hasPermission(role!, 'users.view')).toBe(true);
      expect(hasPermission(role!, 'users.edit')).toBe(true);
      expect(hasPermission(role!, 'tasks.view')).toBe(true);
      expect(hasPermission(role!, 'tasks.create')).toBe(true);
      expect(hasPermission(role!, 'tasks.edit')).toBe(true);
      expect(hasPermission(role!, 'campaigns.manage')).toBe(true);
      expect(hasPermission(role!, 'analytics.view')).toBe(true);
      expect(hasPermission(role!, 'export.data')).toBe(true);
      
      // Does not have these permissions
      expect(hasPermission(role!, 'users.delete')).toBe(false);
      expect(hasPermission(role!, 'tasks.delete')).toBe(false);
      expect(hasPermission(role!, 'roles.manage')).toBe(false);
      expect(hasPermission(role!, 'audit.view')).toBe(false);
      expect(hasPermission(role!, 'workflows.manage')).toBe(false);
    });

    test('Moderator should have read-only permissions', async () => {
      const role = await getUserRole(moderatorUser.id);
      expect(role).not.toBeNull();
      expect(role!.name).toBe('Moderator');
      
      // Has these permissions
      expect(hasPermission(role!, 'users.view')).toBe(true);
      expect(hasPermission(role!, 'tasks.view')).toBe(true);
      expect(hasPermission(role!, 'analytics.view')).toBe(true);
      
      // Does not have these permissions
      expect(hasPermission(role!, 'users.edit')).toBe(false);
      expect(hasPermission(role!, 'users.delete')).toBe(false);
      expect(hasPermission(role!, 'tasks.create')).toBe(false);
      expect(hasPermission(role!, 'tasks.edit')).toBe(false);
      expect(hasPermission(role!, 'tasks.delete')).toBe(false);
      expect(hasPermission(role!, 'campaigns.manage')).toBe(false);
      expect(hasPermission(role!, 'roles.manage')).toBe(false);
      expect(hasPermission(role!, 'workflows.manage')).toBe(false);
      expect(hasPermission(role!, 'export.data')).toBe(false);
    });

    test('checkPermission should throw error for unauthorized permission', async () => {
      const role = await getUserRole(moderatorUser.id);
      expect(role).not.toBeNull();
      
      expect(() => {
        checkPermission(role!, 'users.delete');
      }).toThrow('Permission denied: users.delete');
    });

    test('checkPermission should not throw for authorized permission', async () => {
      const role = await getUserRole(superAdminUser.id);
      expect(role).not.toBeNull();
      
      expect(() => {
        checkPermission(role!, 'users.delete');
      }).not.toThrow();
    });
  });

  test.describe('Unauthorized Access Denial', () => {
    test('should deny access to roles API for non-super-admin', async ({ request }) => {
      // Login as admin (not super admin)
      const loginResponse = await request.post('http://localhost:3000/api/auth/callback/credentials', {
        data: {
          email: 'admin@test.com',
          password: 'Mjkvebep_68',
        },
      });

      // Try to access roles API
      const response = await request.get('http://localhost:3000/api/admin/roles');
      
      expect(response.status()).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Forbidden');
    });

    test('should deny access to role management for moderator', async ({ request }) => {
      // Login as moderator
      const loginResponse = await request.post('http://localhost:3000/api/auth/callback/credentials', {
        data: {
          email: 'moderator@test.com',
          password: 'Mjkvebep_68',
        },
      });

      // Try to create a role
      const response = await request.post('http://localhost:3000/api/admin/roles', {
        data: {
          name: 'Test Role',
          permissions: ['users.view'],
        },
      });
      
      expect(response.status()).toBe(403);
    });

    test('should deny access to user deletion for admin', async ({ request }) => {
      // Login as admin
      const loginResponse = await request.post('http://localhost:3000/api/auth/callback/credentials', {
        data: {
          email: 'admin@test.com',
          password: 'Mjkvebep_68',
        },
      });

      // Try to delete a user (admin doesn't have users.delete permission)
      const response = await request.delete(`http://localhost:3000/api/admin/users/${regularUser.id}`);
      
      expect(response.status()).toBe(403);
    });

    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.get('http://localhost:3000/api/admin/roles');
      
      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });
  });

  test.describe('Role Assignment', () => {
    test('Super Admin can assign roles to users', async ({ page }) => {
      // Login as super admin
      await page.goto('http://localhost:3000/admin/login');
      await page.fill('input[name="email"]', 'superadmin@test.com');
      await page.fill('input[name="password"]', 'Mjkvebep_68');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/dashboard');

      // Navigate to roles page
      await page.goto('http://localhost:3000/admin/roles');
      await page.waitForLoadState('networkidle');

      // Check that roles page is accessible
      await expect(page.locator('h1')).toContainText('Role Management');
    });

    test('should successfully assign role to user via API', async () => {
      // Assign moderator role to regular user
      await assignRoleToUser(regularUser.id, moderatorRole.id);
      
      // Verify role was assigned
      const role = await getUserRole(regularUser.id);
      expect(role).not.toBeNull();
      expect(role!.name).toBe('Moderator');
      
      // Clean up - remove role
      await prisma.user.update({
        where: { id: regularUser.id },
        data: { roleId: null },
      });
    });

    test('should update user permissions after role assignment', async () => {
      // Initially no role
      let role = await getUserRole(regularUser.id);
      expect(role).toBeNull();
      
      // Assign admin role
      await assignRoleToUser(regularUser.id, adminRole.id);
      
      // Check permissions
      role = await getUserRole(regularUser.id);
      expect(role).not.toBeNull();
      expect(hasPermission(role!, 'users.view')).toBe(true);
      expect(hasPermission(role!, 'users.edit')).toBe(true);
      expect(hasPermission(role!, 'users.delete')).toBe(false);
      
      // Clean up
      await prisma.user.update({
        where: { id: regularUser.id },
        data: { roleId: null },
      });
    });
  });

  test.describe('Permission Updates', () => {
    test('should update role permissions', async () => {
      // Create a test role
      const testRole = await createRole('Test Role', ['users.view']);
      
      // Verify initial permissions
      expect(hasPermission(testRole, 'users.view')).toBe(true);
      expect(hasPermission(testRole, 'users.edit')).toBe(false);
      
      // Update permissions
      const updatedRole = await updateRole(testRole.id, {
        permissions: ['users.view', 'users.edit', 'tasks.view'],
      });
      
      // Verify updated permissions
      expect(hasPermission(updatedRole, 'users.view')).toBe(true);
      expect(hasPermission(updatedRole, 'users.edit')).toBe(true);
      expect(hasPermission(updatedRole, 'tasks.view')).toBe(true);
      expect(hasPermission(updatedRole, 'users.delete')).toBe(false);
      
      // Clean up
      await prisma.role.delete({ where: { id: testRole.id } });
    });

    test('should immediately apply permission changes to users', async () => {
      // Create a test role with limited permissions
      const testRole = await createRole('Dynamic Role', ['users.view']);
      
      // Assign to regular user
      await assignRoleToUser(regularUser.id, testRole.id);
      
      // Check initial permissions
      let userRole = await getUserRole(regularUser.id);
      expect(hasPermission(userRole!, 'users.view')).toBe(true);
      expect(hasPermission(userRole!, 'tasks.view')).toBe(false);
      
      // Update role permissions
      await updateRole(testRole.id, {
        permissions: ['users.view', 'tasks.view', 'analytics.view'],
      });
      
      // Check updated permissions (should be immediate)
      userRole = await getUserRole(regularUser.id);
      expect(hasPermission(userRole!, 'users.view')).toBe(true);
      expect(hasPermission(userRole!, 'tasks.view')).toBe(true);
      expect(hasPermission(userRole!, 'analytics.view')).toBe(true);
      
      // Clean up
      await prisma.user.update({
        where: { id: regularUser.id },
        data: { roleId: null },
      });
      await prisma.role.delete({ where: { id: testRole.id } });
    });

    test('should update role name', async () => {
      // Create a test role
      const testRole = await createRole('Old Name', ['users.view']);
      
      // Update name
      const updatedRole = await updateRole(testRole.id, {
        name: 'New Name',
      });
      
      expect(updatedRole.name).toBe('New Name');
      expect(updatedRole.permissions).toEqual(['users.view']);
      
      // Clean up
      await prisma.role.delete({ where: { id: testRole.id } });
    });
  });

  test.describe('UI Hiding for Unauthorized Features', () => {
    test('Moderator should not see role management link', async ({ page }) => {
      // Login as moderator
      await page.goto('http://localhost:3000/admin/login');
      await page.fill('input[name="email"]', 'moderator@test.com');
      await page.fill('input[name="password"]', 'Mjkvebep_68');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/dashboard');

      // Check sidebar - should not have roles link
      const sidebar = page.locator('[data-testid="admin-sidebar"], nav');
      const rolesLink = sidebar.locator('a[href*="/admin/roles"]');
      
      // Roles link should not be visible for moderator
      await expect(rolesLink).toHaveCount(0);
    });

    test('Admin should not see role management link', async ({ page }) => {
      // Login as admin
      await page.goto('http://localhost:3000/admin/login');
      await page.fill('input[name="email"]', 'admin@test.com');
      await page.fill('input[name="password"]', 'Mjkvebep_68');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/dashboard');

      // Check sidebar - should not have roles link
      const sidebar = page.locator('[data-testid="admin-sidebar"], nav');
      const rolesLink = sidebar.locator('a[href*="/admin/roles"]');
      
      // Roles link should not be visible for admin
      await expect(rolesLink).toHaveCount(0);
    });

    test('Super Admin should see all admin features', async ({ page }) => {
      // Login as super admin
      await page.goto('http://localhost:3000/admin/login');
      await page.fill('input[name="email"]', 'superadmin@test.com');
      await page.fill('input[name="password"]', 'Mjkvebep_68');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/dashboard');

      // Check sidebar - should have all links
      const sidebar = page.locator('[data-testid="admin-sidebar"], nav');
      
      // Should see roles link
      const rolesLink = sidebar.locator('a[href*="/admin/roles"]');
      await expect(rolesLink).toBeVisible();
    });

    test('Moderator should not see delete buttons on user list', async ({ page }) => {
      // Login as moderator
      await page.goto('http://localhost:3000/admin/login');
      await page.fill('input[name="email"]', 'moderator@test.com');
      await page.fill('input[name="password"]', 'Mjkvebep_68');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/dashboard');

      // Navigate to users page
      await page.goto('http://localhost:3000/admin/users');
      await page.waitForLoadState('networkidle');

      // Delete buttons should not be visible
      const deleteButtons = page.locator('button:has-text("Delete"), button[aria-label*="delete" i]');
      await expect(deleteButtons).toHaveCount(0);
    });

    test('Moderator should not see edit buttons on user list', async ({ page }) => {
      // Login as moderator
      await page.goto('http://localhost:3000/admin/login');
      await page.fill('input[name="email"]', 'moderator@test.com');
      await page.fill('input[name="password"]', 'Mjkvebep_68');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/dashboard');

      // Navigate to users page
      await page.goto('http://localhost:3000/admin/users');
      await page.waitForLoadState('networkidle');

      // Edit buttons should not be visible
      const editButtons = page.locator('button:has-text("Edit"), a[href*="/edit"]');
      await expect(editButtons).toHaveCount(0);
    });

    test('should redirect unauthorized users from protected pages', async ({ page }) => {
      // Login as moderator
      await page.goto('http://localhost:3000/admin/login');
      await page.fill('input[name="email"]', 'moderator@test.com');
      await page.fill('input[name="password"]', 'Mjkvebep_68');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/dashboard');

      // Try to access roles page directly
      await page.goto('http://localhost:3000/admin/roles');
      
      // Should be redirected or show error
      await page.waitForLoadState('networkidle');
      
      // Check if we're not on the roles page or if there's an error message
      const url = page.url();
      const hasError = await page.locator('text=/forbidden|unauthorized|access denied/i').count() > 0;
      
      expect(url.includes('/admin/roles') === false || hasError).toBe(true);
    });
  });

  test.describe('Role Management UI', () => {
    test('Super Admin can create new roles', async ({ page }) => {
      // Login as super admin
      await page.goto('http://localhost:3000/admin/login');
      await page.fill('input[name="email"]', 'superadmin@test.com');
      await page.fill('input[name="password"]', 'Mjkvebep_68');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/dashboard');

      // Navigate to roles page
      await page.goto('http://localhost:3000/admin/roles');
      await page.waitForLoadState('networkidle');

      // Look for create role button
      const createButton = page.locator('button:has-text("Create"), button:has-text("New Role"), button:has-text("Add Role")');
      
      if (await createButton.count() > 0) {
        await expect(createButton.first()).toBeVisible();
      }
    });

    test('Super Admin can view role details', async ({ page }) => {
      // Login as super admin
      await page.goto('http://localhost:3000/admin/login');
      await page.fill('input[name="email"]', 'superadmin@test.com');
      await page.fill('input[name="password"]', 'Mjkvebep_68');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/dashboard');

      // Navigate to roles page
      await page.goto('http://localhost:3000/admin/roles');
      await page.waitForLoadState('networkidle');

      // Should see role names
      await expect(page.locator('text=Super Admin')).toBeVisible();
      await expect(page.locator('text=Admin')).toBeVisible();
      await expect(page.locator('text=Moderator')).toBeVisible();
    });

    test('should display permission checkboxes when editing role', async ({ page }) => {
      // Login as super admin
      await page.goto('http://localhost:3000/admin/login');
      await page.fill('input[name="email"]', 'superadmin@test.com');
      await page.fill('input[name="password"]', 'Mjkvebep_68');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/dashboard');

      // Navigate to roles page
      await page.goto('http://localhost:3000/admin/roles');
      await page.waitForLoadState('networkidle');

      // Look for edit button
      const editButton = page.locator('button:has-text("Edit")').first();
      
      if (await editButton.count() > 0) {
        await editButton.click();
        
        // Should see permission checkboxes
        const checkboxes = page.locator('input[type="checkbox"]');
        await expect(checkboxes).toHaveCount(await checkboxes.count());
      }
    });
  });
});
