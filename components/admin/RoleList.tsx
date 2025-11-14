'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Edit, Trash2, Users as UsersIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import RoleEditor from '@/components/admin/RoleEditor';
import UserRoleAssignment from '@/components/admin/UserRoleAssignment';
import type { Role } from '@/lib/admin/permissions';

export default function RoleList() {
  const t = useTranslations('admin.roles');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [creatingRole, setCreatingRole] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [assigningRole, setAssigningRole] = useState<Role | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(role: Role) {
    try {
      const response = await fetch(`/api/admin/roles/${role.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadRoles();
        setDeletingRole(null);
      } else {
        const data = await response.json();
        alert(data.error || t('deleteError'));
      }
    } catch (error) {
      console.error('Failed to delete role:', error);
      alert(t('deleteError'));
    }
  }

  function handleRoleSaved() {
    loadRoles();
    setEditingRole(null);
    setCreatingRole(false);
  }

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('list.title')}</CardTitle>
              <CardDescription>{t('list.description')}</CardDescription>
            </div>
            <Button onClick={() => setCreatingRole(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('createButton')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {roles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('empty')}
            </div>
          ) : (
            <div className="space-y-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{role.name}</h3>
                      <Badge variant="secondary">
                        {role.permissions.length} {t('permissions')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 5).map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 5} {t('more')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAssigningRole(role)}
                    >
                      <UsersIcon className="h-4 w-4 mr-2" />
                      {t('assignUsers')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingRole(role)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingRole(role)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Role Dialog */}
      <Dialog open={creatingRole} onOpenChange={setCreatingRole}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('createTitle')}</DialogTitle>
            <DialogDescription>{t('createDescription')}</DialogDescription>
          </DialogHeader>
          <RoleEditor onSaved={handleRoleSaved} onCancel={() => setCreatingRole(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('editTitle')}</DialogTitle>
            <DialogDescription>{t('editDescription')}</DialogDescription>
          </DialogHeader>
          <RoleEditor
            role={editingRole!}
            onSaved={handleRoleSaved}
            onCancel={() => setEditingRole(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Assign Users Dialog */}
      <Dialog open={!!assigningRole} onOpenChange={(open) => !open && setAssigningRole(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('assignTitle', { role: assigningRole?.name || '' })}</DialogTitle>
            <DialogDescription>{t('assignDescription')}</DialogDescription>
          </DialogHeader>
          <UserRoleAssignment
            role={assigningRole!}
            onClose={() => setAssigningRole(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingRole} onOpenChange={(open) => !open && setDeletingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialog.description', { role: deletingRole?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingRole && handleDelete(deletingRole)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
