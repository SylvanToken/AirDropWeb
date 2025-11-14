'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Role, Permission } from '@/lib/admin/permissions';

interface RoleEditorProps {
  role?: Role;
  onSaved: () => void;
  onCancel: () => void;
}

const PERMISSION_GROUPS = {
  users: {
    label: 'User Management',
    permissions: ['users.view', 'users.edit', 'users.delete'] as Permission[],
  },
  tasks: {
    label: 'Task Management',
    permissions: ['tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete'] as Permission[],
  },
  campaigns: {
    label: 'Campaign Management',
    permissions: ['campaigns.manage'] as Permission[],
  },
  analytics: {
    label: 'Analytics',
    permissions: ['analytics.view'] as Permission[],
  },
  audit: {
    label: 'Audit Logs',
    permissions: ['audit.view'] as Permission[],
  },
  workflows: {
    label: 'Workflows',
    permissions: ['workflows.manage'] as Permission[],
  },
  roles: {
    label: 'Role Management',
    permissions: ['roles.manage'] as Permission[],
  },
  export: {
    label: 'Data Export',
    permissions: ['export.data'] as Permission[],
  },
};

export default function RoleEditor({ role, onSaved, onCancel }: RoleEditorProps) {
  const t = useTranslations('admin.roles.form');
  const [name, setName] = useState(role?.name || '');
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    role?.permissions || []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role) {
      setName(role.name);
      setSelectedPermissions(role.permissions);
    }
  }, [role]);

  function togglePermission(permission: Permission) {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  }

  function toggleGroup(groupPermissions: Permission[]) {
    const allSelected = groupPermissions.every((p) => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !groupPermissions.includes(p)));
    } else {
      setSelectedPermissions((prev) => [
        ...prev,
        ...groupPermissions.filter((p) => !prev.includes(p)),
      ]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(t('nameRequired'));
      return;
    }

    if (selectedPermissions.length === 0) {
      setError(t('permissionsRequired'));
      return;
    }

    try {
      setSaving(true);

      const url = role ? `/api/admin/roles/${role.id}` : '/api/admin/roles';
      const method = role ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          permissions: selectedPermissions,
        }),
      });

      if (response.ok) {
        onSaved();
      } else {
        const data = await response.json();
        setError(data.error || t('saveError'));
      }
    } catch (error) {
      console.error('Failed to save role:', error);
      setError(t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role Name */}
      <div className="space-y-2">
        <Label htmlFor="name">{t('name')}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('namePlaceholder')}
          disabled={saving}
        />
      </div>

      {/* Permissions */}
      <div className="space-y-4">
        <Label>{t('permissions')}</Label>
        <div className="space-y-4">
          {Object.entries(PERMISSION_GROUPS).map(([key, group]) => {
            const allSelected = group.permissions.every((p) =>
              selectedPermissions.includes(p)
            );
            const someSelected = group.permissions.some((p) =>
              selectedPermissions.includes(p)
            );

            return (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`group-${key}`}
                      checked={allSelected}
                      onCheckedChange={() => toggleGroup(group.permissions)}
                      disabled={saving}
                      className={someSelected && !allSelected ? 'opacity-50' : ''}
                    />
                    <Label
                      htmlFor={`group-${key}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {group.label}
                    </Label>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 ml-6">
                    {group.permissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission}
                          checked={selectedPermissions.includes(permission)}
                          onCheckedChange={() => togglePermission(permission)}
                          disabled={saving}
                        />
                        <Label
                          htmlFor={permission}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {permission}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? t('saving') : role ? t('update') : t('create')}
        </Button>
      </div>
    </form>
  );
}
