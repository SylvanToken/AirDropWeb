import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  updateWorkflow,
  deleteWorkflow,
  validateWorkflow,
  getWorkflowStats,
  type Workflow,
} from '@/lib/admin/workflows';
import { logAuditEventFromRequest } from '@/lib/admin/audit';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: Partial<Omit<Workflow, 'id'>> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.trigger !== undefined) updates.trigger = body.trigger;
    if (body.actions !== undefined) updates.actions = body.actions;
    if (body.isActive !== undefined) updates.isActive = body.isActive;

    // Validate if we're updating the workflow structure
    if (updates.trigger || updates.actions) {
      const fullWorkflow: Omit<Workflow, 'id'> = {
        name: updates.name || body.name,
        trigger: updates.trigger || body.trigger,
        actions: updates.actions || body.actions,
        isActive: updates.isActive ?? body.isActive ?? true,
      };

      const validation = validateWorkflow(fullWorkflow);
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Invalid workflow', errors: validation.errors },
          { status: 400 }
        );
      }
    }

    // Get workflow before update for audit trail
    const workflowBefore = await prisma.workflow.findUnique({
      where: { id: params.id },
      select: { name: true, trigger: true, actions: true, isActive: true },
    });

    const workflow = await updateWorkflow(params.id, updates);
    
    // Log audit event
    await logAuditEventFromRequest(request, {
      action: 'workflow_updated',
      affectedModel: 'Workflow',
      affectedId: params.id,
      beforeData: workflowBefore ? {
        name: workflowBefore.name,
        trigger: JSON.parse(workflowBefore.trigger),
        actions: JSON.parse(workflowBefore.actions),
        isActive: workflowBefore.isActive,
      } : undefined,
      afterData: {
        name: workflow.name,
        trigger: workflow.trigger,
        actions: workflow.actions,
        isActive: workflow.isActive,
      },
    });
    
    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Failed to update workflow:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get workflow before deletion for audit trail
    const workflowBefore = await prisma.workflow.findUnique({
      where: { id: params.id },
      select: { name: true, trigger: true, actions: true, isActive: true },
    });

    await deleteWorkflow(params.id);
    
    // Log audit event (security-sensitive)
    await logAuditEventFromRequest(request, {
      action: 'workflow_deleted',
      affectedModel: 'Workflow',
      affectedId: params.id,
      beforeData: workflowBefore ? {
        name: workflowBefore.name,
        trigger: JSON.parse(workflowBefore.trigger),
        actions: JSON.parse(workflowBefore.actions),
        isActive: workflowBefore.isActive,
      } : undefined,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete workflow:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getWorkflowStats(params.id);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch workflow stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow stats' },
      { status: 500 }
    );
  }
}
