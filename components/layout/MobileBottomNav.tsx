"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListTodo, Trophy, Wallet, UserCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("header");

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/tasks", label: t("tasks"), icon: ListTodo },
    { href: "/leaderboard", label: t("leaderboard"), icon: Trophy },
    { href: "/wallet", label: t("wallet"), icon: Wallet },
    { href: "/profile", label: t("profile"), icon: UserCircle },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="lg:hidden max-md:landscape:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-eco-leaf/20 backdrop-blur-xl bg-gradient-to-r from-white/95 via-emerald-50/90 to-white/95 dark:from-slate-900/95 dark:via-emerald-950/90 dark:to-slate-900/95 shadow-eco-lg pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 min-w-[44px] min-h-[44px] relative overflow-hidden group",
                active
                  ? "text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-eco-forest dark:hover:text-eco-leaf"
              )}
            >
              {/* Active background gradient */}
              {active && (
                <span className="absolute inset-0 bg-gradient-to-br from-eco-leaf via-eco-forest to-eco-leaf animate-gradient-x rounded-lg" />
              )}
              
              {/* Icon with animation */}
              <Icon 
                className={cn(
                  "h-5 w-5 relative z-10 transition-all duration-300",
                  active ? "scale-110" : "group-hover:scale-110"
                )} 
              />
              
              {/* Label */}
              <span 
                className={cn(
                  "text-[10px] font-medium relative z-10 transition-all duration-300",
                  active ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )}
              >
                {item.label}
              </span>

              {/* Active indicator dot */}
              {active && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full z-20 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
