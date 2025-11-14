import { NextRequest, NextResponse } from 'next/server';
import { checkApiPermission, getRoles, createRole, Permission } from '@/lib/admin/permissions';
import { logAuditEvent } from '@/lib/admin/audit';

// GET /api/admin/roles - Get all roles
export async function GET(req: NextRequest) {
  const { authorized, error, userId } = await checkApiPermission('roles.manage');
  
  if (!authorized) {
    return error;
  }

  try {
    const roles = await getRoles();
    
    await logAuditEvent({
      action: 'roles.list',
      adminId: userId!,
      adminEmail: '',
      affectedModel: 'Role',
    });

    return NextResponse.json({ roles });
  } catch (err) {
    console.error('Error fetching roles:', err);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// POST /api/admin/roles - Create new role
export async function POST(req: NextRequest) {
  const { authorized, error, userId } = await checkApiPermission('roles.manage');
  
  if (!authorized) {
    return error;
  }

  try {
    const body = await req.json();
    const { name, permissions } = body;

    if (!name || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Name and permissions array are required' },
        { status: 400 }
      );
    }

    const role = await createRole(name, permissions as Permission[]);
    
    await logAuditEvent({
      action: 'role.create',
      adminId: userId!,
      adminEmail: '',
      affectedModel: 'Role',
      affectedId: role.id,
      afterData: { name: role.name, permissions: role.permissions },
    });

    return NextResponse.json({ role }, { status: 201 });
  } catch (err) {
    console.error('Error creating role:', err);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}
