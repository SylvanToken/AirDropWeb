import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <Loader2
      className={cn("animate-spin text-primary", sizeClasses[size], className)}
    />
  );
}

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message = "Loading...", fullScreen = false }: LoadingStateProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            {/* Animated logo with multiple effects */}
            <div className="relative w-32 h-32 animate-bounce-slow">
              <Image
                src="/assets/images/loading.png"
                alt="Loading"
                width={128}
                height={128}
                className="animate-pulse-slow"
                priority
              />
              {/* Rotating ring around logo */}
              <div className="absolute inset-0 rounded-full border-4 border-eco-leaf/30 border-t-eco-leaf animate-spin" />
              {/* Pulsing glow effect */}
              <div className="absolute inset-0 rounded-full bg-eco-leaf/20 animate-ping" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6">
      <div className="relative">
        {/* Animated logo with multiple effects */}
        <div className="relative w-24 h-24 animate-bounce-slow">
          <Image
            src="/assets/images/loading.png"
            alt="Loading"
            width={96}
            height={96}
            className="animate-pulse-slow"
            priority
          />
          {/* Rotating ring around logo */}
          <div className="absolute inset-0 rounded-full border-4 border-eco-leaf/30 border-t-eco-leaf animate-spin" />
          {/* Pulsing glow effect */}
          <div className="absolute inset-0 rounded-full bg-eco-leaf/20 animate-ping" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}

interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
}

export function LoadingButton({ children, loading = false }: LoadingButtonProps) {
  return (
    <>
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="h-10 bg-muted animate-pulse rounded flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
      <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
      <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
    </div>
  );
}