import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getWorkflows,
  createWorkflow,
  validateWorkflow,
  type Workflow,
} from '@/lib/admin/workflows';
import { logAuditEventFromRequest } from '@/lib/admin/audit';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflows = await getWorkflows();
    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Failed to fetch workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const workflowData: Omit<Workflow, 'id'> = {
      name: body.name,
      trigger: body.trigger,
      actions: body.actions,
      isActive: body.isActive ?? true,
    };

    // Validate workflow
    const validation = validateWorkflow(workflowData);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid workflow', errors: validation.errors },
        { status: 400 }
      );
    }

    const workflow = await createWorkflow(workflowData, session.user.id);
    
    // Log audit event
    await logAuditEventFromRequest(request, {
      action: 'workflow_created',
      affectedModel: 'Workflow',
      affectedId: workflow.id,
      afterData: {
        name: workflow.name,
        trigger: workflow.trigger,
        isActive: workflow.isActive,
      },
    });
    
    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    console.error('Failed to create workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}
