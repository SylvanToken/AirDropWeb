import { NextRequest, NextResponse } from 'next/server';
import { checkApiPermission, assignRoleToUser } from '@/lib/admin/permissions';
import { logAuditEvent } from '@/lib/admin/audit';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/users/[id]/role - Assign role to user
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
    const { roleId } = body;

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Get current user data for audit log
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { userRole: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Assign role
    await assignRoleToUser(params.id, roleId);
    
    await logAuditEvent({
      action: 'user.role_assigned',
      adminId: userId!,
      adminEmail: '',
      affectedModel: 'User',
      affectedId: user.id,
      beforeData: {
        roleId: user.roleId,
        roleName: user.userRole?.name,
      },
      afterData: {
        roleId: role.id,
        roleName: role.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Role "${role.name}" assigned to user`,
    });
  } catch (err) {
    console.error('Error assigning role:', err);
    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id]/role - Remove role from user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, error, userId } = await checkApiPermission('roles.manage');
  
  if (!authorized) {
    return error;
  }

  try {
    // Get current user data for audit log
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { userRole: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove role
    await prisma.user.update({
      where: { id: params.id },
      data: { roleId: null },
    });
    
    await logAuditEvent({
      action: 'user.role_removed',
      adminId: userId!,
      adminEmail: '',
      affectedModel: 'User',
      affectedId: user.id,
      beforeData: {
        roleId: user.roleId,
        roleName: user.userRole?.name,
      },
      afterData: {
        roleId: null,
        roleName: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Role removed from user',
    });
  } catch (err) {
    console.error('Error removing role:', err);
    return NextResponse.json(
      { error: 'Failed to remove role' },
      { status: 500 }
    );
  }
}
