import { NextRequest, NextResponse } from 'next/server';
import { checkApiPermission, updateRole, Permission } from '@/lib/admin/permissions';
import { logAuditEvent } from '@/lib/admin/audit';
import { prisma } from '@/lib/prisma';

// GET /api/admin/roles/[id] - Get role by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, error, userId } = await checkApiPermission('roles.manage');
  
  if (!authorized) {
    return error;
  }

  try {
    const role = await prisma.role.findUnique({
      where: { id: params.id },
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    await logAuditEvent({
      action: 'role.view',
      adminId: userId!,
      adminEmail: '',
      affectedModel: 'Role',
      affectedId: role.id,
    });

    return NextResponse.json({
      role: {
        id: role.id,
        name: role.name,
        permissions: JSON.parse(role.permissions),
      },
    });
  } catch (err) {
    console.error('Error fetching role:', err);
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/roles/[id] - Update role
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, error, userId } = await checkApiPermission('roles.manage');
  
  if (!authorized) {
    return error;
  }

  try {
    const body = await req.json();
    const { name, permissions } = body;

    // Get current role for audit log
    const currentRole = await prisma.role.findUnique({
      where: { id: params.id },
    });

    if (!currentRole) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    const updates: { name?: string; permissions?: Permission[] } = {};
    if (name) updates.name = name;
    if (permissions) updates.permissions = permissions as Permission[];

    const updatedRole = await updateRole(params.id, updates);
    
    await logAuditEvent({
      action: 'role.update',
      adminId: userId!,
      adminEmail: '',
      affectedModel: 'Role',
      affectedId: updatedRole.id,
      beforeData: {
        name: currentRole.name,
        permissions: JSON.parse(currentRole.permissions),
      },
      afterData: {
        name: updatedRole.name,
        permissions: updatedRole.permissions,
      },
    });

    return NextResponse.json({ role: updatedRole });
  } catch (err) {
    console.error('Error updating role:', err);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/roles/[id] - Delete role
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, error, userId } = await checkApiPermission('roles.manage');
  
  if (!authorized) {
    return error;
  }

  try {
    // Get role before deletion for audit log
    const role = await prisma.role.findUnique({
      where: { id: params.id },
      include: { users: true },
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if users are assigned to this role
    if (role.users.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role with assigned users' },
        { status: 400 }
      );
    }

    // Prevent deletion of default roles
    if (['Super Admin', 'Admin', 'Moderator'].includes(role.name)) {
      return NextResponse.json(
        { error: 'Cannot delete default roles' },
        { status: 400 }
      );
    }

    await prisma.role.delete({
      where: { id: params.id },
    });
    
    await logAuditEvent({
      action: 'role.delete',
      adminId: userId!,
      adminEmail: '',
      affectedModel: 'Role',
      affectedId: role.id,
      beforeData: {
        name: role.name,
        permissions: JSON.parse(role.permissions),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting role:', err);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
