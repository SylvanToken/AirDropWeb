import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getFilterPresetById,
  updateFilterPreset,
  deleteFilterPreset,
  validateFilterCriteria,
  FilterCriteria,
} from '@/lib/admin/filters';
import { logAuditEvent } from '@/lib/admin/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preset = await getFilterPresetById(params.id, session.user.id);

    if (!preset) {
      return NextResponse.json(
        { error: 'Filter preset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ preset });
  } catch (error) {
    console.error('Error fetching filter preset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter preset' },
      { status: 500 }
    );
  }
}

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
    const { name, criteria } = body;

    // Validate criteria if provided
    if (criteria) {
      const validation = validateFilterCriteria(criteria as FilterCriteria[]);
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Invalid filter criteria', details: validation.errors },
          { status: 400 }
        );
      }
    }

    // Get old preset for audit log
    const oldPreset = await getFilterPresetById(params.id, session.user.id);
    if (!oldPreset) {
      return NextResponse.json(
        { error: 'Filter preset not found' },
        { status: 404 }
      );
    }

    const preset = await updateFilterPreset(params.id, session.user.id, {
      name,
      criteria: criteria as FilterCriteria[] | undefined,
    });

    if (!preset) {
      return NextResponse.json(
        { error: 'Filter preset not found' },
        { status: 404 }
      );
    }

    // Log audit event
    await logAuditEvent({
      action: 'filter_preset_updated',
      adminId: session.user.id,
      adminEmail: session.user.email || '',
      affectedModel: 'FilterPreset',
      affectedId: preset.id,
      beforeData: { name: oldPreset.name, criteria: oldPreset.criteria },
      afterData: { name: preset.name, criteria: preset.criteria },
    });

    return NextResponse.json({ preset });
  } catch (error) {
    console.error('Error updating filter preset:', error);
    return NextResponse.json(
      { error: 'Failed to update filter preset' },
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

    // Get preset for audit log before deletion
    const preset = await getFilterPresetById(params.id, session.user.id);
    if (!preset) {
      return NextResponse.json(
        { error: 'Filter preset not found' },
        { status: 404 }
      );
    }

    const success = await deleteFilterPreset(params.id, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete filter preset' },
        { status: 500 }
      );
    }

    // Log audit event
    await logAuditEvent({
      action: 'filter_preset_deleted',
      adminId: session.user.id,
      adminEmail: session.user.email || '',
      affectedModel: 'FilterPreset',
      affectedId: params.id,
      beforeData: { name: preset.name, criteria: preset.criteria },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting filter preset:', error);
    return NextResponse.json(
      { error: 'Failed to delete filter preset' },
      { status: 500 }
    );
  }
}
