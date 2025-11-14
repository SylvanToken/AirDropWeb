"use client";

export function AdminClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background/50 flex flex-col relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
