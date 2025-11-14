import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@sylvantoken.org';
const ADMIN_PASSWORD = 'Mjkvebep_68';

test.describe('Workflow Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');
  });

  test('should display workflows page', async ({ page }) => {
    await page.goto('/admin/workflows');
    await expect(page.locator('h1')).toContainText('Workflows');
  });

  test('should create a new workflow with user_registered trigger', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    // Click create workflow button
    await page.click('button:has-text("Create Workflow")');
    
    // Fill workflow details
    await page.fill('input[name="name"]', 'Welcome New Users');
    
    // Select trigger type
    await page.selectOption('select[name="triggerType"]', 'user_registered');
    
    // Add assign points action
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '100');
    
    // Save workflow
    await page.click('button:has-text("Save Workflow")');
    
    // Verify workflow was created
    await expect(page.locator('text=Welcome New Users')).toBeVisible();
  });

  test('should create workflow with task_completed trigger and conditions', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    await page.click('button:has-text("Create Workflow")');
    
    // Fill workflow details
    await page.fill('input[name="name"]', 'High Value Task Bonus');
    
    // Select trigger type
    await page.selectOption('select[name="triggerType"]', 'task_completed');
    
    // Add condition
    await page.click('button:has-text("Add Condition")');
    await page.fill('input[name="conditionField"]', 'taskPoints');
    await page.selectOption('select[name="conditionOperator"]', 'greater_than');
    await page.fill('input[name="conditionValue"]', '50');
    
    // Add action
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '25');
    
    // Save workflow
    await page.click('button:has-text("Save Workflow")');
    
    await expect(page.locator('text=High Value Task Bonus')).toBeVisible();
  });

  test('should test workflow execution', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    // Create a simple workflow first
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Test Workflow');
    await page.selectOption('select[name="triggerType"]', 'user_registered');
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '50');
    await page.click('button:has-text("Save Workflow")');
    
    // Find and test the workflow
    await page.click('button:has-text("Test"):near(:text("Test Workflow"))');
    
    // Fill test context
    await page.fill('input[name="userId"]', 'test-user-id');
    await page.fill('input[name="userEmail"]', 'test@example.com');
    
    // Execute test
    await page.click('button:has-text("Run Test")');
    
    // Verify test results
    await expect(page.locator('text=Test completed successfully')).toBeVisible();
    await expect(page.locator('text=Actions executed: 1')).toBeVisible();
  });

  test('should enable and disable workflow', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    // Create workflow
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Toggle Test Workflow');
    await page.selectOption('select[name="triggerType"]', 'user_registered');
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '10');
    await page.click('button:has-text("Save Workflow")');
    
    // Verify workflow is active by default
    const activeToggle = page.locator('input[type="checkbox"]:near(:text("Toggle Test Workflow"))');
    await expect(activeToggle).toBeChecked();
    
    // Disable workflow
    await activeToggle.click();
    await page.waitForTimeout(500);
    await expect(activeToggle).not.toBeChecked();
    
    // Enable workflow again
    await activeToggle.click();
    await page.waitForTimeout(500);
    await expect(activeToggle).toBeChecked();
  });

  test('should edit existing workflow', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    // Create workflow
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Edit Test Workflow');
    await page.selectOption('select[name="triggerType"]', 'user_registered');
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '20');
    await page.click('button:has-text("Save Workflow")');
    
    // Edit workflow
    await page.click('button:has-text("Edit"):near(:text("Edit Test Workflow"))');
    
    // Change name and points
    await page.fill('input[name="name"]', 'Updated Workflow Name');
    await page.fill('input[name="points"]', '30');
    
    // Save changes
    await page.click('button:has-text("Save Workflow")');
    
    // Verify changes
    await expect(page.locator('text=Updated Workflow Name')).toBeVisible();
  });

  test('should delete workflow', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    // Create workflow
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Delete Test Workflow');
    await page.selectOption('select[name="triggerType"]', 'user_registered');
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '15');
    await page.click('button:has-text("Save Workflow")');
    
    // Delete workflow
    await page.click('button:has-text("Delete"):near(:text("Delete Test Workflow"))');
    
    // Confirm deletion
    await page.click('button:has-text("Confirm")');
    
    // Verify workflow is deleted
    await expect(page.locator('text=Delete Test Workflow')).not.toBeVisible();
  });

  test('should validate workflow before saving', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    await page.click('button:has-text("Create Workflow")');
    
    // Try to save without name
    await page.click('button:has-text("Save Workflow")');
    
    // Verify validation error
    await expect(page.locator('text=Workflow name is required')).toBeVisible();
    
    // Fill name but no actions
    await page.fill('input[name="name"]', 'Invalid Workflow');
    await page.selectOption('select[name="triggerType"]', 'user_registered');
    await page.click('button:has-text("Save Workflow")');
    
    // Verify validation error
    await expect(page.locator('text=At least one action is required')).toBeVisible();
  });
});

test.describe('Workflow Triggers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');
  });

  test('should support user_registered trigger', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'User Registration Workflow');
    await page.selectOption('select[name="triggerType"]', 'user_registered');
    
    // Verify trigger-specific options are shown
    await expect(page.locator('text=This workflow will trigger when a new user registers')).toBeVisible();
    
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '100');
    await page.click('button:has-text("Save Workflow")');
    
    await expect(page.locator('text=User Registration Workflow')).toBeVisible();
  });

  test('should support task_completed trigger', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Task Completion Workflow');
    await page.selectOption('select[name="triggerType"]', 'task_completed');
    
    // Verify trigger-specific options
    await expect(page.locator('text=This workflow will trigger when a user completes a task')).toBeVisible();
    
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '50');
    await page.click('button:has-text("Save Workflow")');
    
    await expect(page.locator('text=Task Completion Workflow')).toBeVisible();
  });

  test('should support schedule trigger', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Scheduled Workflow');
    await page.selectOption('select[name="triggerType"]', 'schedule');
    
    // Verify schedule configuration options
    await expect(page.locator('text=Schedule Configuration')).toBeVisible();
    
    // Set interval
    await page.fill('input[name="scheduleInterval"]', '60');
    
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'send_email');
    await page.fill('input[name="emailTemplate"]', 'daily_summary');
    await page.click('button:has-text("Save Workflow")');
    
    await expect(page.locator('text=Scheduled Workflow')).toBeVisible();
  });
});

test.describe('Workflow Conditions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');
  });

  test('should evaluate equals condition', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Equals Condition Test');
    await page.selectOption('select[name="triggerType"]', 'task_completed');
    
    // Add equals condition
    await page.click('button:has-text("Add Condition")');
    await page.fill('input[name="conditionField"]', 'taskType');
    await page.selectOption('select[name="conditionOperator"]', 'equals');
    await page.fill('input[name="conditionValue"]', 'TWITTER_FOLLOW');
    
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '10');
    await page.click('button:has-text("Save Workflow")');
    
    // Test with matching condition
    await page.click('button:has-text("Test"):near(:text("Equals Condition Test"))');
    await page.fill('input[name="taskType"]', 'TWITTER_FOLLOW');
    await page.click('button:has-text("Run Test")');
    await expect(page.locator('text=Actions executed: 1')).toBeVisible();
  });

  test('should evaluate greater_than condition', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Greater Than Test');
    await page.selectOption('select[name="triggerType"]', 'task_completed');
    
    // Add greater_than condition
    await page.click('button:has-text("Add Condition")');
    await page.fill('input[name="conditionField"]', 'taskPoints');
    await page.selectOption('select[name="conditionOperator"]', 'greater_than');
    await page.fill('input[name="conditionValue"]', '50');
    
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '20');
    await page.click('button:has-text("Save Workflow")');
    
    // Test with value greater than threshold
    await page.click('button:has-text("Test"):near(:text("Greater Than Test"))');
    await page.fill('input[name="taskPoints"]', '100');
    await page.click('button:has-text("Run Test")');
    await expect(page.locator('text=Actions executed: 1')).toBeVisible();
  });

  test('should evaluate multiple conditions with AND logic', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'AND Logic Test');
    await page.selectOption('select[name="triggerType"]', 'task_completed');
    
    // Add first condition
    await page.click('button:has-text("Add Condition")');
    await page.fill('input[name="conditionField"]', 'taskPoints');
    await page.selectOption('select[name="conditionOperator"]', 'greater_than');
    await page.fill('input[name="conditionValue"]', '50');
    await page.selectOption('select[name="conditionLogic"]', 'AND');
    
    // Add second condition
    await page.click('button:has-text("Add Condition")');
    await page.fill('input[name="conditionField"]', 'userStatus');
    await page.selectOption('select[name="conditionOperator"]', 'equals');
    await page.fill('input[name="conditionValue"]', 'ACTIVE');
    
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '30');
    await page.click('button:has-text("Save Workflow")');
    
    await expect(page.locator('text=AND Logic Test')).toBeVisible();
  });

  test('should evaluate multiple conditions with OR logic', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'OR Logic Test');
    await page.selectOption('select[name="triggerType"]', 'task_completed');
    
    // Add first condition
    await page.click('button:has-text("Add Condition")');
    await page.fill('input[name="conditionField"]', 'taskPoints');
    await page.selectOption('select[name="conditionOperator"]', 'greater_than');
    await page.fill('input[name="conditionValue"]', '100');
    await page.selectOption('select[name="conditionLogic"]', 'OR');
    
    // Add second condition
    await page.click('button:has-text("Add Condition")');
    await page.fill('input[name="conditionField"]', 'taskType');
    await page.selectOption('select[name="conditionOperator"]', 'equals');
    await page.fill('input[name="conditionValue"]', 'TWITTER_FOLLOW');
    
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '15');
    await page.click('button:has-text("Save Workflow")');
    
    await expect(page.locator('text=OR Logic Test')).toBeVisible();
  });
});

test.describe('Workflow Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');
  });

  test('should execute assign_points action', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Assign Points Action');
    await page.selectOption('select[name="triggerType"]', 'user_registered');
    
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '100');
    
    await page.click('button:has-text("Save Workflow")');
    
    // Test the action
    await page.click('button:has-text("Test"):near(:text("Assign Points Action"))');
    await page.fill('input[name="userId"]', 'test-user-123');
    await page.click('button:has-text("Run Test")');
    
    await expect(page.locator('text=Actions executed: 1')).toBeVisible();
  });

  test('should execute update_status action', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Update Status Action');
    await page.selectOption('select[name="triggerType"]', 'user_registered');
    
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'update_status');
    await page.selectOption('select[name="status"]', 'ACTIVE');
    
    await page.click('button:has-text("Save Workflow")');
    
    await expect(page.locator('text=Update Status Action')).toBeVisible();
  });

  test('should execute send_email action', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Send Email Action');
    await page.selectOption('select[name="triggerType"]', 'user_registered');
    
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'send_email');
    await page.fill('input[name="emailTemplate"]', 'welcome_email');
    await page.fill('input[name="emailSubject"]', 'Welcome to Sylvan Token!');
    
    await page.click('button:has-text("Save Workflow")');
    
    await expect(page.locator('text=Send Email Action')).toBeVisible();
  });

  test('should execute multiple actions in sequence', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Multiple Actions');
    await page.selectOption('select[name="triggerType"]', 'user_registered');
    
    // Add first action
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '50');
    
    // Add second action
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'update_status');
    await page.selectOption('select[name="status"]', 'ACTIVE');
    
    // Add third action
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'send_email');
    await page.fill('input[name="emailTemplate"]', 'welcome_email');
    
    await page.click('button:has-text("Save Workflow")');
    
    // Test multiple actions
    await page.click('button:has-text("Test"):near(:text("Multiple Actions"))');
    await page.fill('input[name="userId"]', 'test-user-456');
    await page.fill('input[name="userEmail"]', 'test@example.com');
    await page.click('button:has-text("Run Test")');
    
    await expect(page.locator('text=Actions executed: 3')).toBeVisible();
  });
});

test.describe('Workflow Logging and Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');
  });

  test('should log workflow execution in audit logs', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    // Create and test a workflow
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Logging Test Workflow');
    await page.selectOption('select[name="triggerType"]', 'user_registered');
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '25');
    await page.click('button:has-text("Save Workflow")');
    
    // Test the workflow
    await page.click('button:has-text("Test"):near(:text("Logging Test Workflow"))');
    await page.fill('input[name="userId"]', 'test-user-789');
    await page.click('button:has-text("Run Test")');
    
    // Check audit logs
    await page.goto('/admin/audit');
    await page.fill('input[name="search"]', 'workflow_completed');
    
    await expect(page.locator('text=workflow_completed')).toBeVisible();
  });

  test('should handle action failures gracefully', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Error Handling Test');
    await page.selectOption('select[name="triggerType"]', 'user_registered');
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '40');
    await page.click('button:has-text("Save Workflow")');
    
    // Test with missing required context (should fail)
    await page.click('button:has-text("Test"):near(:text("Error Handling Test"))');
    // Don't provide userId - should cause error
    await page.click('button:has-text("Run Test")');
    
    // Verify error is displayed
    await expect(page.locator('text=Actions failed: 1')).toBeVisible();
    await expect(page.locator('text=userId is required')).toBeVisible();
  });

  test('should display workflow execution statistics', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    // Create workflow
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Stats Test Workflow');
    await page.selectOption('select[name="triggerType"]', 'user_registered');
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '35');
    await page.click('button:has-text("Save Workflow")');
    
    // Execute test multiple times
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Test"):near(:text("Stats Test Workflow"))');
      await page.fill('input[name="userId"]', `test-user-${i}`);
      await page.click('button:has-text("Run Test")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Close")');
    }
    
    // View workflow details/stats
    await page.click('text=Stats Test Workflow');
    
    // Verify statistics are displayed
    await expect(page.locator('text=Total Executions')).toBeVisible();
    await expect(page.locator('text=3')).toBeVisible();
  });

  test('should notify admins of workflow failures', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    await page.click('button:has-text("Create Workflow")');
    await page.fill('input[name="name"]', 'Notification Test');
    await page.selectOption('select[name="triggerType"]', 'user_registered');
    await page.click('button:has-text("Add Action")');
    await page.selectOption('select[name="actionType"]', 'assign_points');
    await page.fill('input[name="points"]', '45');
    await page.click('button:has-text("Save Workflow")');
    
    // Test with invalid context to trigger failure
    await page.click('button:has-text("Test"):near(:text("Notification Test"))');
    await page.click('button:has-text("Run Test")');
    
    // Verify error notification
    await expect(page.locator('text=Workflow execution failed')).toBeVisible();
  });
});
