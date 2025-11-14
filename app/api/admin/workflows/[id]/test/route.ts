import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { executeWorkflow, type Workflow } from '@/lib/admin/workflows';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const testContext = body.context || {};

    // Fetch the workflow
    const workflowData = await prisma.workflow.findUnique({
      where: { id: params.id },
    });

    if (!workflowData) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    const workflow: Workflow = {
      id: workflowData.id,
      name: workflowData.name,
      trigger: JSON.parse(workflowData.trigger),
      actions: JSON.parse(workflowData.actions),
      isActive: true, // Force active for testing
    };

    // Execute workflow with test context
    const result = await executeWorkflow(workflow, {
      ...testContext,
      isTest: true,
      testExecutedBy: session.user.id,
      testExecutedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: result.success,
      actionsExecuted: result.actionsExecuted,
      actionsFailed: result.actionsFailed,
      errors: result.errors,
      executionTime: result.executionTime,
    });
  } catch (error) {
    console.error('Failed to test workflow:', error);
    return NextResponse.json(
      { error: 'Failed to test workflow' },
      { status: 500 }
    );
  }
}
