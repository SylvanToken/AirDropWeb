"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export function LogoutButton({ variant = "outline", className }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    // Clear session background
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('sylvan-bg-gradient');
      } catch (error) {
        console.error('Error clearing session background:', error);
      }
    }
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return (
    <Button variant={variant} onClick={handleLogout} className={className}>
      Logout
    </Button>
  );
}
