# Role-Based Access Control (RBAC) Guide

## Overview

The Sylvan Token Airdrop Platform implements a comprehensive Role-Based Access Control (RBAC) system to manage admin permissions and restrict access to sensitive operations.

## Default Roles

### Super Admin
Full access to all platform features and settings.

**Permissions:**
- `users.view` - View user information
- `users.edit` - Edit user details
- `users.delete` - Delete users
- `tasks.view` - View tasks
- `tasks.create` - Create new tasks
- `tasks.edit` - Edit existing tasks
- `tasks.delete` - Delete tasks
- `campaigns.manage` - Manage campaigns
- `analytics.view` - View analytics dashboard
- `audit.view` - View audit logs
- `roles.manage` - Manage roles and permissions
- `workflows.manage` - Manage automated workflows
- `export.data` - Export platform data

### Admin
Standard admin access for day-to-day operations.

**Permissions:**
- `users.view`
- `users.edit`
- `tasks.view`
- `tasks.create`
- `tasks.edit`
- `campaigns.manage`
- `analytics.view`
- `export.data`

### Moderator
Read-only access for monitoring and support.

**Permissions:**
- `users.view`
- `tasks.view`
- `analytics.view`

## Usage

### Checking Permissions in Code

```typescript
import { hasPermission, checkPermission, getUserRole } from '@/lib/admin/permissions';

// Get user's role
const role = await getUserRole(userId);

// Check if user has permission (returns boolean)
if (hasPermission(role, 'users.edit')) {
  // User can edit users
}

// Check permission and throw error if denied
try {
  checkPermission(role, 'users.delete');
  // User can delete users
} catch (error) {
  // Permission denied
}
```

### Protecting API Routes

```typescript
import { checkApiPermission } from '@/lib/admin/permissions';

export async function DELETE(req: Request) {
  // Check permission
  const { authorized, error, userId, role } = await checkApiPermission('users.delete');
  
  if (!authorized) {
    return error; // Returns 401 or 403 response
  }
  
  // User is authorized, proceed with operation
  // ...
}
```

### Alternative Middleware Pattern

```typescript
import { requirePermission } from '@/lib/admin/permissions';

export async function POST(req: Request) {
  const permissionCheck = await requirePermission('tasks.create')(req);
  
  if (permissionCheck) {
    return permissionCheck; // Returns error response
  }
  
  // User is authorized
  // ...
}
```

## Managing Roles

### Get All Roles

```typescript
import { getRoles } from '@/lib/admin/permissions';

const roles = await getRoles();
```

### Create New Role

```typescript
import { createRole } from '@/lib/admin/permissions';

const newRole = await createRole('Content Manager', [
  'tasks.view',
  'tasks.create',
  'tasks.edit',
]);
```

### Update Role

```typescript
import { updateRole } from '@/lib/admin/permissions';

const updatedRole = await updateRole(roleId, {
  name: 'Senior Moderator',
  permissions: ['users.view', 'tasks.view', 'analytics.view', 'audit.view'],
});
```

### Assign Role to User

```typescript
import { assignRoleToUser } from '@/lib/admin/permissions';

await assignRoleToUser(userId, roleId);
```

## Initializing Default Roles

The default roles are automatically created when running the database seed:

```bash
npx prisma db seed
```

You can also initialize them programmatically:

```typescript
import { initializeDefaultRoles } from '@/lib/admin/permissions';

await initializeDefaultRoles();
```

## Permission List

| Permission | Description |
|------------|-------------|
| `users.view` | View user information and profiles |
| `users.edit` | Edit user details and settings |
| `users.delete` | Delete user accounts |
| `tasks.view` | View tasks and task details |
| `tasks.create` | Create new tasks |
| `tasks.edit` | Edit existing tasks |
| `tasks.delete` | Delete tasks |
| `campaigns.manage` | Create, edit, and delete campaigns |
| `analytics.view` | Access analytics dashboard |
| `audit.view` | View audit logs |
| `roles.manage` | Create and manage roles |
| `workflows.manage` | Create and manage automated workflows |
| `export.data` | Export platform data |

## Best Practices

1. **Principle of Least Privilege**: Assign users the minimum permissions needed for their role
2. **Regular Audits**: Review role assignments and permissions regularly
3. **Custom Roles**: Create custom roles for specific use cases rather than modifying default roles
4. **Permission Checks**: Always check permissions before performing sensitive operations
5. **Audit Logging**: All permission checks and role changes are logged in the audit system

## Security Considerations

- Permissions are checked on every API request
- Role changes take effect immediately
- Failed permission checks are logged in the audit log
- Super Admin role should be assigned sparingly
- Consider implementing 2FA for Super Admin accounts

## Database Schema

```prisma
model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  permissions String   // JSON array of Permission strings
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  users       User[]
}

model User {
  // ... other fields
  roleId      String?
  userRole    Role?    @relation(fields: [roleId], references: [id])
}
```

## Troubleshooting

### User has no role assigned
If a user doesn't have a role assigned, they will receive a 403 Forbidden error. Assign them a role:

```typescript
await assignRoleToUser(userId, roleId);
```

### Permission denied errors
Check that:
1. The user has a role assigned
2. The role includes the required permission
3. The permission string matches exactly (case-sensitive)

### Role not found
Ensure default roles are initialized:

```bash
npx prisma db seed
```

## Examples

### Protecting an Admin Page

```typescript
// app/admin/(dashboard)/users/page.tsx
import { getUserRole, hasPermission } from '@/lib/admin/permissions';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect('/admin/login');
  }
  
  const role = await getUserRole(session.user.id);
  
  if (!role || !hasPermission(role, 'users.view')) {
    return <div>Access Denied</div>;
  }
  
  // Render page
  return <div>Users List</div>;
}
```

### Conditional UI Elements

```typescript
// Show delete button only if user has permission
const role = await getUserRole(session.user.id);
const canDelete = role && hasPermission(role, 'users.delete');

return (
  <div>
    {canDelete && (
      <button onClick={handleDelete}>Delete User</button>
    )}
  </div>
);
```
