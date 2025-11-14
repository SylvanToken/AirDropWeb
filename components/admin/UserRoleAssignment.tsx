'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Role } from '@/lib/admin/permissions';

interface User {
  id: string;
  username: string;
  email: string;
  roleId: string | null;
  userRole: { name: string } | null;
}

interface UserRoleAssignmentProps {
  role: Role;
  onClose: () => void;
}

export default function UserRoleAssignment({ role, onClose }: UserRoleAssignmentProps) {
  const t = useTranslations('admin.roles.assign');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const query = search.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [search, users]);

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users?limit=1000');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setFilteredUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignRole(userId: string) {
    try {
      setAssigning(userId);
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: role.id }),
      });

      if (response.ok) {
        // Update local state
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, roleId: role.id, userRole: { name: role.name } }
              : user
          )
        );
      } else {
        const data = await response.json();
        alert(data.error || t('assignError'));
      }
    } catch (error) {
      console.error('Failed to assign role:', error);
      alert(t('assignError'));
    } finally {
      setAssigning(null);
    }
  }

  async function handleRemoveRole(userId: string) {
    try {
      setAssigning(userId);
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update local state
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, roleId: null, userRole: null } : user
          )
        );
      } else {
        const data = await response.json();
        alert(data.error || t('removeError'));
      }
    } catch (error) {
      console.error('Failed to remove role:', error);
      alert(t('removeError'));
    } finally {
      setAssigning(null);
    }
  }

  if (loading) {
    return <div className="py-8 text-center">{t('loading')}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="pl-9"
        />
      </div>

      {/* User List */}
      <ScrollArea className="h-[400px] border rounded-md">
        <div className="p-4 space-y-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? t('noResults') : t('noUsers')}
            </div>
          ) : (
            filteredUsers.map((user) => {
              const hasThisRole = user.roleId === role.id;
              const hasOtherRole = user.roleId && user.roleId !== role.id;

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{user.username}</p>
                      {hasThisRole && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          {t('assigned')}
                        </Badge>
                      )}
                      {hasOtherRole && (
                        <Badge variant="secondary">
                          {user.userRole?.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div>
                    {hasThisRole ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveRole(user.id)}
                        disabled={assigning === user.id}
                      >
                        {assigning === user.id ? t('removing') : t('remove')}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAssignRole(user.id)}
                        disabled={assigning === user.id}
                      >
                        {assigning === user.id ? t('assigning') : t('assign')}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {t('summary', {
            assigned: users.filter((u) => u.roleId === role.id).length,
            total: users.length,
          })}
        </span>
        <Button variant="outline" onClick={onClose}>
          {t('close')}
        </Button>
      </div>
    </div>
  );
}
