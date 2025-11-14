"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Shield, LogOut, LayoutDashboard, ListTodo, Users, Menu, X, Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useState, useEffect } from "react";
import AdvancedSearch from "@/components/admin/AdvancedSearch";
import SearchShortcuts from "@/components/admin/SearchShortcuts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminHeaderProps {
  user: {
    email?: string | null;
    username?: string;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchModel, setSearchModel] = useState<'user' | 'task' | 'completion' | 'campaign'>('user');

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    // Clear session background
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('sylvan-bg-gradient');
      } catch (error) {
        console.error('Error clearing session background:', error);
      }
    }
    await signOut({ callbackUrl: "/admin/login" });
  };

  const handleSearchResultSelect = (result: any) => {
    // Navigate to the appropriate page based on the search model
    switch (searchModel) {
      case 'user':
        router.push(`/admin/users/${result.id}`);
        break;
      case 'task':
        router.push(`/admin/tasks/${result.id}`);
        break;
      case 'campaign':
        router.push(`/admin/campaigns/${result.id}`);
        break;
    }
    setSearchOpen(false);
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/tasks", label: "Tasks", icon: ListTodo },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <header className="border-b border-eco-leaf/20 backdrop-blur-xl bg-gradient-to-r from-white/90 via-eco-leaf/5 to-white/90 dark:from-slate-900/90 dark:via-eco-forest/20 dark:to-slate-900/90 shadow-eco sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 group">
            <div className="relative group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out">
              <div className="absolute inset-0 bg-gradient-to-r from-eco-leaf to-eco-forest rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              <Image
                src="/assets/images/sylvan-token-logo.png"
                alt="Sylvan Token"
                width={40}
                height={40}
                className="object-contain relative z-10"
                priority
                unoptimized
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold bg-gradient-to-r from-eco-leaf via-eco-forest to-eco-leaf bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <Shield className="w-4 h-4 text-eco-leaf dark:text-eco-leaf" />
              </div>
              <p className="text-xs text-eco-forest dark:text-eco-leaf">Sylvan Token Airdrop</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 relative overflow-hidden group ${
                    isActive
                      ? "bg-gradient-to-r from-eco-leaf to-eco-forest text-white shadow-[0_0_15px_rgba(156,184,110,0.4),0_0_30px_rgba(156,184,110,0.2)]"
                      : "text-slate-700 dark:text-slate-300 hover:bg-eco-leaf/10 dark:hover:bg-eco-forest/20"
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-gradient-to-r from-eco-leaf via-eco-forest to-eco-leaf animate-gradient-x" />
                  )}
                  <Icon className={`w-4 h-4 relative z-10 ${isActive ? "text-white" : "text-eco-leaf group-hover:text-eco-forest group-hover:scale-110 transition-all duration-300"}`} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Global Search Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="gap-2 border-eco-leaf/30 hover:bg-eco-leaf/10 dark:hover:bg-eco-forest/20 hover:border-eco-leaf/50 transition-all duration-300 hover:shadow-[0_0_10px_rgba(156,184,110,0.3)]"
            >
              <SearchIcon className="w-4 h-4 text-eco-leaf" />
              <span className="hidden lg:inline">Search</span>
              <kbd className="hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            <LanguageSwitcher />
            
            {/* User Info - Desktop */}
            <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-eco-leaf/20">
              <div className="text-right">
                <p className="text-sm font-semibold text-eco-forest dark:text-eco-leaf">{user.username}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>

            {/* Logout Button - Desktop */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="hidden sm:flex gap-2 border-eco-leaf/30 hover:bg-eco-leaf/10 dark:hover:bg-eco-forest/20 hover:border-eco-leaf/50 transition-all duration-300 hover:shadow-[0_0_10px_rgba(156,184,110,0.3)]"
            >
              <LogOut className="w-4 h-4 text-eco-leaf" />
              <span className="hidden lg:inline">Logout</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden hover:bg-eco-leaf/10 dark:hover:bg-eco-forest/20"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-eco-leaf" /> : <Menu className="h-5 w-5 text-eco-leaf" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-eco-leaf/20 py-4 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start gap-3 transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-eco-leaf to-eco-forest text-white shadow-[0_0_15px_rgba(156,184,110,0.4),0_0_30px_rgba(156,184,110,0.2)]"
                          : "hover:bg-eco-leaf/10 dark:hover:bg-eco-forest/20"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-eco-leaf"}`} />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
              
              {/* Mobile User Info */}
              <div className="mt-4 pt-4 border-t border-eco-leaf/20">
                <div className="px-3 py-2 rounded-lg bg-eco-leaf/10 dark:bg-eco-forest/20">
                  <p className="font-semibold text-sm text-eco-forest dark:text-eco-leaf">{user.username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
              </div>

              {/* Mobile Logout */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-3 mt-2 border-eco-leaf/30 hover:bg-eco-leaf/10 dark:hover:bg-eco-forest/20"
              >
                <LogOut className="w-5 h-5 text-eco-leaf" />
                <span>Logout</span>
              </Button>
            </nav>
          </div>
        )}
      </div>

      {/* Global Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SearchIcon className="h-5 w-5" />
              Global Search
            </DialogTitle>
            <DialogDescription>
              Search across users, tasks, campaigns, and completions
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Search Area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search Model Selector */}
              <div className="flex gap-2">
                {(['user', 'task', 'campaign', 'completion'] as const).map((model) => (
                  <Button
                    key={model}
                    variant={searchModel === model ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSearchModel(model)}
                    className="capitalize"
                  >
                    {model}s
                  </Button>
                ))}
              </div>

              {/* Advanced Search Component */}
              <AdvancedSearch
                model={searchModel}
                onResultSelect={handleSearchResultSelect}
                placeholder={`Search ${searchModel}s...`}
              />
            </div>

            {/* Search Shortcuts Sidebar */}
            <div className="lg:col-span-1">
              <SearchShortcuts
                onShortcutSelect={(shortcut) => {
                  setSearchModel(shortcut.model);
                  // Trigger search with shortcut query
                  // This would require exposing a method from AdvancedSearch
                  // For now, we'll just switch the model
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
