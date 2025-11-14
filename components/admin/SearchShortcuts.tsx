'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Bookmark, Plus, Trash2, Search, Edit2, Check, X } from 'lucide-react';

interface SearchShortcut {
  id: string;
  name: string;
  query: string;
  model: 'user' | 'task' | 'completion' | 'campaign';
  description?: string;
  createdAt: Date;
}

interface SearchShortcutsProps {
  onShortcutSelect?: (shortcut: SearchShortcut) => void;
}

export default function SearchShortcuts({ onShortcutSelect }: SearchShortcutsProps) {
  const [shortcuts, setShortcuts] = useState<SearchShortcut[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newShortcut, setNewShortcut] = useState({
    name: '',
    query: '',
    model: 'user' as const,
    description: '',
  });

  // Load shortcuts from localStorage on mount
  useEffect(() => {
    loadShortcuts();
  }, []);

  const loadShortcuts = () => {
    try {
      const saved = localStorage.getItem('searchShortcuts');
      if (saved) {
        const parsed = JSON.parse(saved);
        setShortcuts(parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
        })));
      }
    } catch (error) {
      console.error('Failed to load shortcuts:', error);
    }
  };

  const saveShortcuts = (updatedShortcuts: SearchShortcut[]) => {
    try {
      localStorage.setItem('searchShortcuts', JSON.stringify(updatedShortcuts));
      setShortcuts(updatedShortcuts);
    } catch (error) {
      console.error('Failed to save shortcuts:', error);
    }
  };

  const createShortcut = () => {
    if (!newShortcut.name || !newShortcut.query) return;

    const shortcut: SearchShortcut = {
      id: `shortcut_${Date.now()}`,
      name: newShortcut.name,
      query: newShortcut.query,
      model: newShortcut.model,
      description: newShortcut.description,
      createdAt: new Date(),
    };

    const updated = [...shortcuts, shortcut];
    saveShortcuts(updated);

    // Reset form
    setNewShortcut({
      name: '',
      query: '',
      model: 'user',
      description: '',
    });
    setIsCreating(false);
  };

  const deleteShortcut = (id: string) => {
    const updated = shortcuts.filter((s) => s.id !== id);
    saveShortcuts(updated);
  };

  const updateShortcut = (id: string, updates: Partial<SearchShortcut>) => {
    const updated = shortcuts.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    saveShortcuts(updated);
    setEditingId(null);
  };

  const handleShortcutClick = (shortcut: SearchShortcut) => {
    if (onShortcutSelect) {
      onShortcutSelect(shortcut);
    }
  };

  // Predefined shortcuts for common searches
  const predefinedShortcuts: SearchShortcut[] = [
    {
      id: 'active_users',
      name: 'Active Users',
      query: 'status:ACTIVE',
      model: 'user',
      description: 'All active users',
      createdAt: new Date(),
    },
    {
      id: 'pending_completions',
      name: 'Pending Completions',
      query: 'status:PENDING',
      model: 'completion',
      description: 'Completions awaiting review',
      createdAt: new Date(),
    },
    {
      id: 'active_campaigns',
      name: 'Active Campaigns',
      query: 'isActive:true',
      model: 'campaign',
      description: 'Currently running campaigns',
      createdAt: new Date(),
    },
    {
      id: 'high_points',
      name: 'High Point Users',
      query: 'totalPoints:>1000',
      model: 'user',
      description: 'Users with over 1000 points',
      createdAt: new Date(),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Search Shortcuts
            </CardTitle>
            <CardDescription>Quick access to frequent searches</CardDescription>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Shortcut
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Search Shortcut</DialogTitle>
                <DialogDescription>
                  Save a frequently used search for quick access
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={newShortcut.name}
                    onChange={(e) =>
                      setNewShortcut({ ...newShortcut, name: e.target.value })
                    }
                    placeholder="e.g., Active Users"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Search Query</label>
                  <Input
                    value={newShortcut.query}
                    onChange={(e) =>
                      setNewShortcut({ ...newShortcut, query: e.target.value })
                    }
                    placeholder="e.g., status:ACTIVE"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Model</label>
                  <select
                    value={newShortcut.model}
                    onChange={(e) =>
                      setNewShortcut({
                        ...newShortcut,
                        model: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="user">Users</option>
                    <option value="task">Tasks</option>
                    <option value="campaign">Campaigns</option>
                    <option value="completion">Completions</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Description (optional)
                  </label>
                  <Input
                    value={newShortcut.description}
                    onChange={(e) =>
                      setNewShortcut({
                        ...newShortcut,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={createShortcut}>Create Shortcut</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {/* Predefined Shortcuts */}
            {predefinedShortcuts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                  Quick Searches
                </h3>
                <div className="space-y-2">
                  {predefinedShortcuts.map((shortcut) => (
                    <button
                      key={shortcut.id}
                      onClick={() => handleShortcutClick(shortcut)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{shortcut.name}</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {shortcut.model}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {shortcut.description}
                          </p>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {shortcut.query}
                          </code>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Shortcuts */}
            {shortcuts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                  My Shortcuts
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="p-3 rounded-lg border hover:bg-accent transition-colors group"
                    >
                      {editingId === shortcut.id ? (
                        <div className="space-y-2">
                          <Input
                            defaultValue={shortcut.name}
                            onBlur={(e) =>
                              updateShortcut(shortcut.id, { name: e.target.value })
                            }
                            className="mb-2"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <button
                            onClick={() => handleShortcutClick(shortcut)}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Search className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{shortcut.name}</span>
                              <Badge variant="outline" className="text-xs capitalize">
                                {shortcut.model}
                              </Badge>
                            </div>
                            {shortcut.description && (
                              <p className="text-xs text-muted-foreground mb-1">
                                {shortcut.description}
                              </p>
                            )}
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {shortcut.query}
                            </code>
                          </button>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(shortcut.id)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteShortcut(shortcut.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {shortcuts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No custom shortcuts yet</p>
                <p className="text-xs mt-1">
                  Create shortcuts for your frequent searches
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
