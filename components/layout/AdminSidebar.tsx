"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Menu,
  X,
  Sparkles,
  BarChart3,
  Zap,
  FileText,
  Mail,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "from-blue-500 to-cyan-500",
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
    color: "from-indigo-500 to-purple-500",
  },
  {
    href: "/admin/campaigns",
    label: "Campaigns",
    icon: Calendar,
    color: "from-purple-500 to-pink-500",
  },
  {
    href: "/admin/tasks",
    label: "Tasks",
    icon: ListTodo,
    color: "from-green-500 to-emerald-500",
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    color: "from-amber-500 to-orange-500",
  },
  {
    href: "/admin/roles",
    label: "Roles",
    icon: Shield,
    color: "from-violet-500 to-purple-500",
  },
  {
    href: "/admin/workflows",
    label: "Workflows",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
  },
  {
    href: "/admin/audit",
    label: "Audit Log",
    icon: FileText,
    color: "from-red-500 to-rose-500",
  },
  {
    href: "/admin/emails",
    label: "Email Analytics",
    icon: Mail,
    color: "from-cyan-500 to-blue-500",
  },
  {
    href: "/admin/send-email",
    label: "Send Email",
    icon: Mail,
    color: "from-pink-500 to-rose-500",
  },
  {
    href: "/admin/verifications",
    label: "Verifications",
    icon: Sparkles,
    color: "from-eco-leaf to-eco-forest",
  },
  {
    href: "/admin/error-reports",
    label: "Error Reports",
    icon: AlertCircle,
    color: "from-red-500 to-pink-500",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("admin.sidebar");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-eco-leaf/20">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-eco-leaf to-eco-forest flex items-center justify-center text-white shadow-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">Admin Panel</p>
              <p className="text-xs text-muted-foreground">Sylvan Token</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 hover:bg-eco-leaf/10 hidden lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-eco-leaf to-eco-forest text-white shadow-[0_0_15px_rgba(156,184,110,0.4),0_0_30px_rgba(156,184,110,0.2)]"
                    : "text-slate-700 dark:text-slate-300 hover:bg-eco-leaf/10 hover:shadow-[0_0_10px_rgba(156,184,110,0.2)]",
                  collapsed && "justify-center"
                )}
              >
                {/* Icon with gradient background for inactive state */}
                {!isActive && !collapsed && (
                  <div className={cn(
                    "h-8 w-8 rounded-lg bg-gradient-to-br from-eco-leaf to-eco-forest flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all duration-200 group-hover:shadow-[0_0_10px_rgba(156,184,110,0.3)]"
                  )}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                )}
                
                {/* Icon for active state or collapsed */}
                {(isActive || collapsed) && (
                  <Icon className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "drop-shadow-sm text-white" : "text-eco-leaf"
                  )} />
                )}
                
                {!collapsed && (
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    isActive && "font-semibold"
                  )}>
                    {item.label}
                  </span>
                )}

                {/* Active indicator with neon glow */}
                {isActive && !collapsed && (
                  <div className="ml-auto">
                    <Sparkles className="h-4 w-4 animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-eco-forest text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-[0_0_10px_rgba(156,184,110,0.3)]">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions (only when not collapsed) */}
      {!collapsed && (
        <div className="p-3 border-t border-eco-leaf/20">
          <div className="p-3 rounded-lg bg-gradient-to-br from-eco-leaf/10 to-eco-forest/10 border border-eco-leaf/20">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("quickActions")}
            </p>
            <div className="space-y-1">
              <Link href="/admin/tasks">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs hover:bg-eco-leaf/10"
                >
                  <ListTodo className="h-3 w-3 mr-2" />
                  {t("createTask")}
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs hover:bg-eco-leaf/10"
                >
                  <Users className="h-3 w-3 mr-2" />
                  {t("viewUsers")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-eco-leaf/20 bg-gradient-to-b from-eco-leaf/5 to-eco-forest/5 dark:from-slate-900/50 dark:to-eco-forest/20 backdrop-blur-sm transition-all duration-300 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 right-4 lg:hidden z-40 h-14 w-14 rounded-full shadow-[0_0_20px_rgba(156,184,110,0.4),0_0_40px_rgba(156,184,110,0.2)] bg-gradient-to-br from-eco-leaf to-eco-forest text-white border-0 hover:from-eco-leaf/90 hover:to-eco-forest/90 hover:shadow-[0_0_25px_rgba(156,184,110,0.5),0_0_50px_rgba(156,184,110,0.3)]"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-950 border-r border-eco-leaf/20 z-50 lg:hidden flex flex-col transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-eco-leaf/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-eco-leaf to-eco-forest flex items-center justify-center text-white shadow-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">Admin Panel</p>
              <p className="text-xs text-muted-foreground">Sylvan Token</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="h-8 w-8 hover:bg-eco-leaf/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-eco-leaf to-eco-forest text-white shadow-[0_0_15px_rgba(156,184,110,0.4),0_0_30px_rgba(156,184,110,0.2)]"
                      : "text-slate-700 dark:text-slate-300 hover:bg-eco-leaf/10 hover:shadow-[0_0_10px_rgba(156,184,110,0.2)]"
                  )}
                >
                  {!isActive && (
                    <div className={cn(
                      "h-9 w-9 rounded-lg bg-gradient-to-br from-eco-leaf to-eco-forest flex items-center justify-center shadow-[0_0_8px_rgba(156,184,110,0.3)]"
                    )}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  )}
                  {isActive && <Icon className="h-5 w-5 shrink-0 text-white" />}
                  <span className={cn(
                    "text-sm font-medium",
                    isActive && "font-semibold"
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto">
                      <Sparkles className="h-4 w-4 animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Quick Actions */}
        <div className="p-3 border-t border-eco-leaf/20">
          <div className="p-3 rounded-lg bg-gradient-to-br from-eco-leaf/10 to-eco-forest/10 border border-eco-leaf/20">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("quickActions")}
            </p>
            <div className="space-y-1">
              <Link href="/admin/tasks">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs hover:bg-eco-leaf/10"
                >
                  <ListTodo className="h-3 w-3 mr-2" />
                  {t("createTask")}
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs hover:bg-eco-leaf/10"
                >
                  <Users className="h-3 w-3 mr-2" />
                  {t("viewUsers")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
