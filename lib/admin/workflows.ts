import { prisma } from '@/lib/prisma';
import { logAuditEvent } from './audit';

export interface Workflow {
  id: string;
  name: string;
  trigger: {
    type: 'user_registered' | 'task_completed' | 'schedule';
    conditions?: WorkflowCondition[];
    scheduleConfig?: {
      cron?: string;
      interval?: number; // minutes
    };
  };
  actions: Array<{
    type: 'send_email' | 'update_status' | 'assign_points' | 'create_notification';
    config: Record<string, any>;
  }>;
  isActive: boolean;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
  logic?: 'AND' | 'OR';
}

export interface WorkflowExecutionResult {
  success: boolean;
  actionsExecuted: number;
  actionsFailed: number;
  errors: string[];
  executionTime: number;
}

/**
 * Execute a workflow with the given context
 * Evaluates conditions and executes actions if conditions are met
 */
export async function executeWorkflow(
  workflow: Workflow,
  context: Record<string, any>
): Promise<WorkflowExecutionResult> {
  const startTime = Date.now();
  const result: WorkflowExecutionResult = {
    success: true,
    actionsExecuted: 0,
    actionsFailed: 0,
    errors: [],
    executionTime: 0,
  };

  try {
    // Check if workflow is active
    if (!workflow.isActive) {
      result.success = false;
      result.errors.push('Workflow is not active');
      return result;
    }

    // Log workflow start
    await logWorkflowEvent(workflow.id, 'workflow_started', context);

    // Check trigger conditions
    if (workflow.trigger.conditions && workflow.trigger.conditions.length > 0) {
      const conditionsMet = evaluateConditions(workflow.trigger.conditions, context);
      
      if (!conditionsMet) {
        await logWorkflowEvent(workflow.id, 'workflow_conditions_not_met', {
          context,
          conditions: workflow.trigger.conditions,
        });
        result.success = false;
        result.errors.push('Workflow conditions not met');
        return result;
      }
    }

    // Execute actions sequentially
    for (let i = 0; i < workflow.actions.length; i++) {
      const action = workflow.actions[i];
      
      try {
        await executeWorkflowAction(action, context, workflow.id);
        result.actionsExecuted++;
        
        await logWorkflowEvent(workflow.id, 'workflow_action_executed', {
          actionIndex: i,
          actionType: action.type,
          context,
        });
      } catch (error: any) {
        result.actionsFailed++;
        result.errors.push(`Action ${i} (${action.type}): ${error.message}`);
        
        console.error(`Workflow action failed:`, error);
        
        await logAuditEvent({
          action: 'workflow_action_failed',
          adminId: 'system',
          adminEmail: 'system',
          affectedModel: 'Workflow',
          affectedId: workflow.id,
          afterData: {
            workflowId: workflow.id,
            actionIndex: i,
            actionType: action.type,
            error: error.message,
            context,
          },
        });

        // Send notification to admins about failed action
        await notifyAdminsOfFailure(workflow, action, error, context);
      }
    }

    // Log workflow completion
    await logWorkflowEvent(workflow.id, 'workflow_completed', {
      context,
      actionsExecuted: result.actionsExecuted,
      actionsFailed: result.actionsFailed,
    });

    result.success = result.actionsFailed === 0;
  } catch (error: any) {
    result.success = false;
    result.errors.push(`Workflow execution failed: ${error.message}`);
    
    console.error('Workflow execution error:', error);
    
    await logAuditEvent({
      action: 'workflow_execution_failed',
      adminId: 'system',
      adminEmail: 'system',
      affectedModel: 'Workflow',
      affectedId: workflow.id,
      afterData: {
        workflowId: workflow.id,
        error: error.message,
        context,
      },
    });

    await notifyAdminsOfFailure(workflow, null, error, context);
  } finally {
    result.executionTime = Date.now() - startTime;
  }

  return result;
}

/**
 * Evaluate workflow conditions against context
 * Supports AND/OR logic between conditions
 */
function evaluateConditions(
  conditions: WorkflowCondition[],
  context: Record<string, any>
): boolean {
  if (conditions.length === 0) return true;

  let result = true;
  let currentLogic: 'AND' | 'OR' = 'AND';

  for (const condition of conditions) {
    const conditionResult = evaluateSingleCondition(condition, context);

    if (currentLogic === 'AND') {
      result = result && conditionResult;
    } else {
      result = result || conditionResult;
    }

    // Set logic for next condition
    currentLogic = condition.logic || 'AND';
  }

  return result;
}

/**
 * Evaluate a single condition
 */
function evaluateSingleCondition(
  condition: WorkflowCondition,
  context: Record<string, any>
): boolean {
  const contextValue = getNestedValue(context, condition.field);
  const expectedValue = condition.value;

  switch (condition.operator) {
    case 'equals':
      return contextValue === expectedValue;
    
    case 'not_equals':
      return contextValue !== expectedValue;
    
    case 'greater_than':
      return Number(contextValue) > Number(expectedValue);
    
    case 'less_than':
      return Number(contextValue) < Number(expectedValue);
    
    case 'contains':
      if (typeof contextValue === 'string') {
        return contextValue.includes(String(expectedValue));
      }
      if (Array.isArray(contextValue)) {
        return contextValue.includes(expectedValue);
      }
      return false;
    
    case 'in':
      if (Array.isArray(expectedValue)) {
        return expectedValue.includes(contextValue);
      }
      return false;
    
    case 'not_in':
      if (Array.isArray(expectedValue)) {
        return !expectedValue.includes(contextValue);
      }
      return true;
    
    default:
      return false;
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Execute a single workflow action
 */
async function executeWorkflowAction(
  action: Workflow['actions'][0],
  context: Record<string, any>,
  workflowId: string
): Promise<void> {
  switch (action.type) {
    case 'send_email':
      // Email functionality will be implemented in email-notifications spec
      // For now, log the email action
      console.log('Email action queued:', {
        to: context.userEmail || action.config.to,
        template: action.config.template,
        subject: action.config.subject,
        data: context,
      });
      break;

    case 'update_status':
      if (!context.userId) {
        throw new Error('userId is required for update_status action');
      }
      
      await prisma.user.update({
        where: { id: context.userId },
        data: { status: action.config.status },
      });
      
      await logAuditEvent({
        action: 'workflow_user_status_updated',
        adminId: 'system',
        adminEmail: 'system',
        affectedModel: 'User',
        affectedId: context.userId,
        beforeData: { status: context.userStatus },
        afterData: { status: action.config.status },
      });
      break;

    case 'assign_points':
      if (!context.userId) {
        throw new Error('userId is required for assign_points action');
      }
      
      const points = Number(action.config.points);
      if (isNaN(points) || points === 0) {
        throw new Error('Invalid points value');
      }

      await prisma.user.update({
        where: { id: context.userId },
        data: {
          totalPoints: { increment: points },
        },
      });
      
      await logAuditEvent({
        action: 'workflow_points_assigned',
        adminId: 'system',
        adminEmail: 'system',
        affectedModel: 'User',
        affectedId: context.userId,
        afterData: { 
          pointsAssigned: points,
          workflowId,
        },
      });
      break;

    case 'create_notification':
      // Notification functionality to be implemented
      // For now, log the notification
      console.log('Notification created:', {
        userId: context.userId,
        message: action.config.message,
        type: action.config.type || 'info',
      });
      break;

    default:
      throw new Error(`Unknown action type: ${(action as any).type}`);
  }
}

/**
 * Log workflow-specific events
 */
async function logWorkflowEvent(
  workflowId: string,
  event: string,
  data: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    action: event,
    adminId: 'system',
    adminEmail: 'system',
    affectedModel: 'Workflow',
    affectedId: workflowId,
    afterData: data,
  });
}

/**
 * Notify admins of workflow failures
 */
async function notifyAdminsOfFailure(
  workflow: Workflow,
  action: Workflow['actions'][0] | null,
  error: Error,
  context: Record<string, any>
): Promise<void> {
  try {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true },
    });

    // Log notification for each admin
    for (const admin of admins) {
      console.log(`Notification sent to admin ${admin.email}:`, {
        type: 'workflow_failure',
        workflowId: workflow.id,
        workflowName: workflow.name,
        action: action?.type,
        error: error.message,
        context,
      });
    }
  } catch (notifyError) {
    console.error('Failed to notify admins:', notifyError);
  }
}

export async function getWorkflows(): Promise<Workflow[]> {
  const workflows = await prisma.workflow.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return workflows.map(w => ({
    id: w.id,
    name: w.name,
    trigger: JSON.parse(w.trigger) as Workflow['trigger'],
    actions: JSON.parse(w.actions) as Workflow['actions'],
    isActive: w.isActive,
  }));
}

export async function createWorkflow(
  workflow: Omit<Workflow, 'id'>,
  createdBy: string
): Promise<Workflow> {
  const created = await prisma.workflow.create({
    data: {
      name: workflow.name,
      trigger: JSON.stringify(workflow.trigger),
      actions: JSON.stringify(workflow.actions),
      isActive: workflow.isActive,
      createdBy,
    },
  });

  return {
    id: created.id,
    name: created.name,
    trigger: JSON.parse(created.trigger) as Workflow['trigger'],
    actions: JSON.parse(created.actions) as Workflow['actions'],
    isActive: created.isActive,
  };
}

export async function updateWorkflow(
  id: string,
  updates: Partial<Omit<Workflow, 'id'>>
): Promise<Workflow> {
  const updated = await prisma.workflow.update({
    where: { id },
    data: {
      name: updates.name,
      trigger: updates.trigger ? JSON.stringify(updates.trigger) : undefined,
      actions: updates.actions ? JSON.stringify(updates.actions) : undefined,
      isActive: updates.isActive,
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    trigger: JSON.parse(updated.trigger) as Workflow['trigger'],
    actions: JSON.parse(updated.actions) as Workflow['actions'],
    isActive: updated.isActive,
  };
}

export async function deleteWorkflow(id: string): Promise<void> {
  await prisma.workflow.delete({
    where: { id },
  });
}

/**
 * Trigger workflows based on user registration event
 */
export async function triggerUserRegisteredWorkflows(
  userId: string,
  userEmail: string,
  userData: Record<string, any>
): Promise<void> {
  const workflows = await prisma.workflow.findMany({
    where: {
      isActive: true,
      trigger: {
        contains: '"type":"user_registered"',
      },
    },
  });

  const context = {
    userId,
    userEmail,
    ...userData,
    eventType: 'user_registered',
    timestamp: new Date().toISOString(),
  };

  for (const workflowData of workflows) {
    const workflow: Workflow = {
      id: workflowData.id,
      name: workflowData.name,
      trigger: JSON.parse(workflowData.trigger),
      actions: JSON.parse(workflowData.actions),
      isActive: workflowData.isActive,
    };

    // Execute workflow asynchronously
    executeWorkflow(workflow, context).catch(error => {
      console.error(`Failed to execute workflow ${workflow.id}:`, error);
    });
  }
}

/**
 * Trigger workflows based on task completion event
 */
export async function triggerTaskCompletedWorkflows(
  userId: string,
  taskId: string,
  completionData: Record<string, any>
): Promise<void> {
  const workflows = await prisma.workflow.findMany({
    where: {
      isActive: true,
      trigger: {
        contains: '"type":"task_completed"',
      },
    },
  });

  // Get user and task details
  const [user, task] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        totalPoints: true,
        status: true,
      },
    }),
    prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        points: true,
        taskType: true,
      },
    }),
  ]);

  if (!user || !task) return;

  const context = {
    userId: user.id,
    userEmail: user.email,
    username: user.username,
    userTotalPoints: user.totalPoints,
    userStatus: user.status,
    taskId: task.id,
    taskTitle: task.title,
    taskPoints: task.points,
    taskType: task.taskType,
    ...completionData,
    eventType: 'task_completed',
    timestamp: new Date().toISOString(),
  };

  for (const workflowData of workflows) {
    const workflow: Workflow = {
      id: workflowData.id,
      name: workflowData.name,
      trigger: JSON.parse(workflowData.trigger),
      actions: JSON.parse(workflowData.actions),
      isActive: workflowData.isActive,
    };

    // Execute workflow asynchronously
    executeWorkflow(workflow, context).catch(error => {
      console.error(`Failed to execute workflow ${workflow.id}:`, error);
    });
  }
}

/**
 * Execute scheduled workflows
 * This should be called by a cron job or scheduled task
 */
export async function executeScheduledWorkflows(): Promise<void> {
  const workflows = await prisma.workflow.findMany({
    where: {
      isActive: true,
      trigger: {
        contains: '"type":"schedule"',
      },
    },
  });

  const context = {
    eventType: 'schedule',
    timestamp: new Date().toISOString(),
  };

  for (const workflowData of workflows) {
    const workflow: Workflow = {
      id: workflowData.id,
      name: workflowData.name,
      trigger: JSON.parse(workflowData.trigger),
      actions: JSON.parse(workflowData.actions),
      isActive: workflowData.isActive,
    };

    // Check if workflow should run based on schedule
    const shouldRun = await shouldExecuteScheduledWorkflow(workflow);
    
    if (shouldRun) {
      executeWorkflow(workflow, context).catch(error => {
        console.error(`Failed to execute scheduled workflow ${workflow.id}:`, error);
      });
    }
  }
}

/**
 * Check if a scheduled workflow should execute now
 */
async function shouldExecuteScheduledWorkflow(workflow: Workflow): Promise<boolean> {
  // For now, return true for all scheduled workflows
  // In a production system, this would check the schedule configuration
  // and compare with the last execution time
  
  if (!workflow.trigger.scheduleConfig) {
    return false;
  }

  // TODO: Implement cron expression parsing or interval checking
  // For now, we'll execute all scheduled workflows when this function is called
  return true;
}

/**
 * Validate workflow configuration
 */
export function validateWorkflow(workflow: Omit<Workflow, 'id'>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate name
  if (!workflow.name || workflow.name.trim().length === 0) {
    errors.push('Workflow name is required');
  }

  // Validate trigger
  if (!workflow.trigger || !workflow.trigger.type) {
    errors.push('Workflow trigger type is required');
  }

  const validTriggerTypes = ['user_registered', 'task_completed', 'schedule'];
  if (workflow.trigger && !validTriggerTypes.includes(workflow.trigger.type)) {
    errors.push(`Invalid trigger type: ${workflow.trigger.type}`);
  }

  // Validate schedule config for scheduled workflows
  if (workflow.trigger?.type === 'schedule' && !workflow.trigger.scheduleConfig) {
    errors.push('Schedule configuration is required for scheduled workflows');
  }

  // Validate actions
  if (!workflow.actions || workflow.actions.length === 0) {
    errors.push('At least one action is required');
  }

  const validActionTypes = ['send_email', 'update_status', 'assign_points', 'create_notification'];
  workflow.actions?.forEach((action, index) => {
    if (!action.type) {
      errors.push(`Action ${index}: type is required`);
    } else if (!validActionTypes.includes(action.type)) {
      errors.push(`Action ${index}: invalid type ${action.type}`);
    }

    if (!action.config || Object.keys(action.config).length === 0) {
      errors.push(`Action ${index}: config is required`);
    }

    // Validate specific action configs
    if (action.type === 'update_status' && !action.config?.status) {
      errors.push(`Action ${index}: status is required for update_status action`);
    }

    if (action.type === 'assign_points') {
      const points = Number(action.config?.points);
      if (isNaN(points) || points === 0) {
        errors.push(`Action ${index}: valid points value is required for assign_points action`);
      }
    }

    if (action.type === 'send_email' && !action.config?.template && !action.config?.subject) {
      errors.push(`Action ${index}: template or subject is required for send_email action`);
    }
  });

  // Validate conditions
  if (workflow.trigger?.conditions) {
    workflow.trigger.conditions.forEach((condition, index) => {
      if (!condition.field) {
        errors.push(`Condition ${index}: field is required`);
      }
      if (!condition.operator) {
        errors.push(`Condition ${index}: operator is required`);
      }
      if (condition.value === undefined || condition.value === null) {
        errors.push(`Condition ${index}: value is required`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get workflow execution statistics
 */
export async function getWorkflowStats(workflowId: string): Promise<{
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  lastExecution?: Date;
}> {
  const logs = await prisma.auditLog.findMany({
    where: {
      affectedModel: 'Workflow',
      affectedId: workflowId,
      action: {
        in: ['workflow_completed', 'workflow_execution_failed'],
      },
    },
    orderBy: { timestamp: 'desc' },
  });

  const totalExecutions = logs.length;
  const successfulExecutions = logs.filter(log => log.action === 'workflow_completed').length;
  const failedExecutions = logs.filter(log => log.action === 'workflow_execution_failed').length;
  const lastExecution = logs.length > 0 ? logs[0].timestamp : undefined;

  return {
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    lastExecution,
  };
}
