"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  LayoutDashboard,
  ListTodo,
  Wallet,
  UserCircle,
  Menu,
  X,
  Trophy,
} from "lucide-react";
import { WalletWarningBanner } from "@/components/layout/WalletWarningBanner";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Swipeable } from "@/components/ui/TouchFeedback";
import Image from "next/image";

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const t = useTranslations("header");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/users/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.avatarUrl) {
            setAvatarUrl(data.avatarUrl);
          }
        })
        .catch((error) => console.error("Failed to fetch avatar:", error));
    }
  }, [session?.user?.id]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (status === "loading") {
    return null;
  }

  // Show simplified header for non-authenticated users
  if (!session) {
    return (
      <header
        id="navigation"
        role="banner"
        className="border-b border-eco-leaf/20 backdrop-blur-xl bg-gradient-to-r from-white/95 via-eco-leaf/5 to-white/95 dark:from-slate-900/95 dark:via-eco-forest/20 dark:to-slate-900/95 shadow-eco sticky top-0 z-[100] transition-all duration-300 safe-area-inset-top"
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-10 h-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out">
                  <div className="absolute inset-0 bg-gradient-eco-primary rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  {/* Enhanced visibility with shadow */}
                  <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 rounded-full blur-sm" />
                  <Image 
                    src="/assets/images/sylvan-token-logo.png" 
                    alt="Sylvan Token" 
                    width={40}
                    height={40}
                    className="relative z-10 w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]"
                    priority
                    unoptimized
                  />
                </div>
                <span className="font-bold text-lg hidden sm:inline bg-gradient-to-r from-eco-leaf via-eco-forest to-eco-leaf bg-clip-text text-transparent animate-gradient-x drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_1px_2px_rgba(255,255,255,0.1)]">
                  Sylvan Token
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>
    );
  }

  const handleLogout = async () => {
    // Clear session background
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('sylvan-bg-gradient');
      } catch (error) {
        console.error('Error clearing session background:', error);
      }
    }
    await signOut({ callbackUrl: "/login" });
  };

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/tasks", label: t("tasks"), icon: ListTodo },
    { href: "/leaderboard", label: t("leaderboard"), icon: Trophy },
    { href: "/wallet", label: t("wallet"), icon: Wallet },
    { href: "/profile", label: t("profile"), icon: UserCircle },
  ];

  return (
    <>
      <WalletWarningBanner />
      <header
        id="navigation"
        role="banner"
        className="border-b border-eco-leaf/20 backdrop-blur-xl bg-gradient-to-r from-white/95 via-eco-leaf/5 to-white/95 dark:from-slate-900/95 dark:via-eco-forest/20 dark:to-slate-900/95 shadow-eco sticky top-0 z-[100] transition-all duration-300 safe-area-inset-top"
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="relative w-10 h-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out">
                  <div className="absolute inset-0 bg-gradient-eco-primary rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  {/* Enhanced visibility with shadow */}
                  <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 rounded-full blur-sm" />
                  <Image 
                    src="/assets/images/sylvan-token-logo.png" 
                    alt="Sylvan Token" 
                    width={40}
                    height={40}
                    className="relative z-10 w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]"
                    priority
                    unoptimized
                  />
                </div>
                <span className="font-bold text-lg hidden sm:inline bg-gradient-to-r from-eco-leaf via-eco-forest to-eco-leaf bg-clip-text text-transparent animate-gradient-x drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_1px_2px_rgba(255,255,255,0.1)]">
                  Sylvan Token
                </span>
              </Link>

              <nav
                className="hidden lg:flex items-center gap-1"
                role="navigation"
                aria-label="Main navigation"
              >
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 transition-all duration-300 relative overflow-hidden group ${
                          active
                            ? "gradient-eco-primary text-white shadow-[0_0_15px_rgba(156,184,110,0.4),0_0_30px_rgba(156,184,110,0.2)] hover:shadow-[0_0_20px_rgba(156,184,110,0.5),0_0_40px_rgba(156,184,110,0.3)]"
                            : "hover:bg-eco-leaf/10 dark:hover:bg-eco-forest/20"
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        {active && (
                          <span
                            className="absolute inset-0 bg-gradient-to-r from-eco-leaf via-eco-forest to-eco-leaf animate-gradient-x"
                            aria-hidden="true"
                          />
                        )}
                        <Icon
                          className={`h-4 w-4 relative z-10 ${
                            active
                              ? "text-white"
                              : "text-eco-leaf group-hover:text-eco-forest group-hover:scale-110 transition-all duration-300"
                          }`}
                          aria-hidden="true"
                        />
                        <span className="relative z-10">{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSwitcher />

              <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-eco-leaf/20">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-eco-leaf/30 flex-shrink-0">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={session.user.username}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-eco-leaf to-eco-forest">
                      <span className="text-sm font-bold text-white">
                        {getInitials(session.user.username)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-right">
                  <p className="font-semibold text-eco-forest dark:text-eco-leaf">
                    {session.user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex gap-2 border-eco-leaf/30 hover:bg-eco-leaf/10 hover:border-eco-leaf/50 transition-all duration-300 hover:shadow-[0_0_10px_rgba(156,184,110,0.3)]"
              >
                <LogOut className="h-4 w-4 text-eco-leaf" />
                <span className="hidden lg:inline">{t("logout")}</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden hover:bg-eco-leaf/10 dark:hover:bg-eco-forest/20 touch-target"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-eco-leaf" />
                ) : (
                  <Menu className="h-6 w-6 text-eco-leaf" />
                )}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <Swipeable
              onSwipeUp={() => setMobileMenuOpen(false)}
              className="lg:hidden border-t border-eco-leaf/20 py-4 animate-in slide-in-from-top duration-300"
            >
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
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
                          active
                            ? "gradient-eco-primary text-white shadow-[0_0_15px_rgba(156,184,110,0.4),0_0_30px_rgba(156,184,110,0.2)]"
                            : "hover:bg-eco-leaf/10 dark:hover:bg-eco-forest/20"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${active ? "text-white" : "text-eco-leaf"}`}
                        />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}

                <div className="mt-4 pt-4 border-t border-eco-leaf/20">
                  <div className="px-3 py-2 rounded-lg bg-eco-leaf/10 dark:bg-eco-forest/20 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-eco-leaf/30 flex-shrink-0">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={session.user.username}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-eco-leaf to-eco-forest">
                          <span className="text-base font-bold text-white">
                            {getInitials(session.user.username)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-eco-forest dark:text-eco-leaf">
                        {session.user.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start gap-3 mt-2 border-eco-leaf/30 hover:bg-eco-leaf/10"
                >
                  <LogOut className="h-5 w-5 text-eco-leaf" />
                  <span>{t("logout")}</span>
                </Button>
              </nav>
            </Swipeable>
          )}
        </div>
      </header>
    </>
  );
}
