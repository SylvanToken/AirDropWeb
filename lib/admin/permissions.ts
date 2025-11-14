import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export type Permission =
  | 'users.view'
  | 'users.edit'
  | 'users.delete'
  | 'tasks.view'
  | 'tasks.create'
  | 'tasks.edit'
  | 'tasks.delete'
  | 'campaigns.manage'
  | 'analytics.view'
  | 'audit.view'
  | 'roles.manage'
  | 'workflows.manage'
  | 'export.data';

export function hasPermission(userRole: Role, permission: Permission): boolean {
  return userRole.permissions.includes(permission);
}

export function checkPermission(userRole: Role, permission: Permission): void {
  if (!hasPermission(userRole, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

// Middleware for API routes
export function requirePermission(permission: Permission) {
  return async (req: Request) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { userRole: true },
    });

    if (!user?.userRole) {
      return Response.json({ error: 'No role assigned' }, { status: 403 });
    }

    const role: Role = {
      id: user.userRole.id,
      name: user.userRole.name,
      permissions: JSON.parse(user.userRole.permissions) as Permission[],
    };

    if (!hasPermission(role, permission)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    return null; // Permission granted
  };
}

// Helper to check permission in API routes
export async function checkApiPermission(
  permission: Permission
): Promise<{ authorized: boolean; error?: Response; userId?: string; role?: Role }> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return {
      authorized: false,
      error: Response.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { userRole: true },
  });

  if (!user?.userRole) {
    return {
      authorized: false,
      error: Response.json({ error: 'No role assigned' }, { status: 403 }),
    };
  }

  const role: Role = {
    id: user.userRole.id,
    name: user.userRole.name,
    permissions: JSON.parse(user.userRole.permissions) as Permission[],
  };

  if (!hasPermission(role, permission)) {
    return {
      authorized: false,
      error: Response.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return {
    authorized: true,
    userId: user.id,
    role,
  };
}

// Default roles
export const DEFAULT_ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    permissions: [
      'users.view',
      'users.edit',
      'users.delete',
      'tasks.view',
      'tasks.create',
      'tasks.edit',
      'tasks.delete',
      'campaigns.manage',
      'analytics.view',
      'audit.view',
      'roles.manage',
      'workflows.manage',
      'export.data',
    ] as Permission[],
  },
  ADMIN: {
    name: 'Admin',
    permissions: [
      'users.view',
      'users.edit',
      'tasks.view',
      'tasks.create',
      'tasks.edit',
      'campaigns.manage',
      'analytics.view',
      'export.data',
    ] as Permission[],
  },
  MODERATOR: {
    name: 'Moderator',
    permissions: [
      'users.view',
      'tasks.view',
      'analytics.view',
    ] as Permission[],
  },
};

export async function getRoles(): Promise<Role[]> {
  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' },
  });

  return roles.map(r => ({
    id: r.id,
    name: r.name,
    permissions: JSON.parse(r.permissions) as Permission[],
  }));
}

export async function createRole(
  name: string,
  permissions: Permission[]
): Promise<Role> {
  const role = await prisma.role.create({
    data: {
      name,
      permissions: JSON.stringify(permissions),
    },
  });

  return {
    id: role.id,
    name: role.name,
    permissions: JSON.parse(role.permissions) as Permission[],
  };
}

export async function updateRole(
  id: string,
  updates: { name?: string; permissions?: Permission[] }
): Promise<Role> {
  const role = await prisma.role.update({
    where: { id },
    data: {
      name: updates.name,
      permissions: updates.permissions ? JSON.stringify(updates.permissions) : undefined,
    },
  });

  return {
    id: role.id,
    name: role.name,
    permissions: JSON.parse(role.permissions) as Permission[],
  };
}

export async function getUserRole(userId: string): Promise<Role | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userRole: true },
  });

  if (!user?.userRole) {
    return null;
  }

  return {
    id: user.userRole.id,
    name: user.userRole.name,
    permissions: JSON.parse(user.userRole.permissions) as Permission[],
  };
}

export async function assignRoleToUser(
  userId: string,
  roleId: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { roleId },
  });
}

export async function initializeDefaultRoles(): Promise<void> {
  // Create Super Admin role
  await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      permissions: JSON.stringify(DEFAULT_ROLES.SUPER_ADMIN.permissions),
    },
  });

  // Create Admin role
  await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      permissions: JSON.stringify(DEFAULT_ROLES.ADMIN.permissions),
    },
  });

  // Create Moderator role
  await prisma.role.upsert({
    where: { name: 'Moderator' },
    update: {},
    create: {
      name: 'Moderator',
      permissions: JSON.stringify(DEFAULT_ROLES.MODERATOR.permissions),
    },
  });
}
