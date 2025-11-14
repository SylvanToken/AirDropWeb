"use client";

import { SessionProvider } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { I18nProvider } from "@/components/providers/I18nProvider";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <I18nProvider>
        <div className="min-h-screen bg-background/50 flex flex-col relative">
          <Header />
          <main 
            id="main-content"
            role="main"
            className="flex-1 relative z-10 pb-20 lg:pb-0"
          >
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <ScrollToTop />
        </div>
      </I18nProvider>
    </SessionProvider>
  );
}
