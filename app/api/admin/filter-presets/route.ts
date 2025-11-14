import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getFilterPresets,
  saveFilterPreset,
  validateFilterCriteria,
  FilterCriteria,
} from '@/lib/admin/filters';
import { logAuditEvent } from '@/lib/admin/audit';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const presets = await getFilterPresets(session.user.id);

    return NextResponse.json({ presets });
  } catch (error) {
    console.error('Error fetching filter presets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter presets' },
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
    const { name, criteria } = body;

    if (!name || !criteria) {
      return NextResponse.json(
        { error: 'Name and criteria are required' },
        { status: 400 }
      );
    }

    // Validate criteria
    const validation = validateFilterCriteria(criteria as FilterCriteria[]);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid filter criteria', details: validation.errors },
        { status: 400 }
      );
    }

    const preset = await saveFilterPreset({
      name,
      criteria: criteria as FilterCriteria[],
      createdBy: session.user.id,
    });

    // Log audit event
    await logAuditEvent({
      action: 'filter_preset_created',
      adminId: session.user.id,
      adminEmail: session.user.email || '',
      affectedModel: 'FilterPreset',
      affectedId: preset.id,
      afterData: { name, criteria },
    });

    return NextResponse.json({ preset }, { status: 201 });
  } catch (error) {
    console.error('Error creating filter preset:', error);
    return NextResponse.json(
      { error: 'Failed to create filter preset' },
      { status: 500 }
    );
  }
}
