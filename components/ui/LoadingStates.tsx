"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Skeleton, 
  SkeletonCard, 
  SkeletonTable, 
  SkeletonTaskCard,
  SkeletonStatsCard,
  SkeletonLeaderboardRow 
} from "./skeleton";
import { WaveAnimation } from "./NatureAnimations";

// Inline Loading Spinner
export interface InlineLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export const InlineLoading = React.forwardRef<HTMLDivElement, InlineLoadingProps>(
  ({ size = "md", message, className, ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <Loader2 className={cn("text-eco-leaf animate-spin", sizeClasses[size])} />
        {message && (
          <span className="text-sm text-muted-foreground">{message}</span>
        )}
      </div>
    );
  }
);
InlineLoading.displayName = "InlineLoading";

// Centered Loading
export interface CenteredLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  variant?: "spinner" | "wave";
}

export const CenteredLoading = React.forwardRef<HTMLDivElement, CenteredLoadingProps>(
  ({ message, variant = "spinner", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-4 p-8",
          className
        )}
        {...props}
      >
        {variant === "spinner" ? (
          <Loader2 className="w-8 h-8 text-eco-leaf animate-spin" />
        ) : (
          <WaveAnimation count={3} />
        )}
        {message && (
          <p className="text-sm text-muted-foreground animate-fade-in-delay">
            {message}
          </p>
        )}
      </div>
    );
  }
);
CenteredLoading.displayName = "CenteredLoading";

// Full Page Loading
export interface FullPageLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export const FullPageLoading = React.forwardRef<HTMLDivElement, FullPageLoadingProps>(
  ({ message, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "min-h-screen flex items-center justify-center bg-background",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-eco-leaf animate-spin" />
            <div className="absolute inset-0 animate-pulse-eco">
              <div className="w-12 h-12 rounded-full border-2 border-eco-leaf/20" />
            </div>
          </div>
          {message && (
            <p className="text-sm text-muted-foreground animate-fade-in-delay">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }
);
FullPageLoading.displayName = "FullPageLoading";

// Button Loading State
export interface ButtonLoadingProps extends React.HTMLAttributes<HTMLSpanElement> {
  loading: boolean;
  children: React.ReactNode;
}

export const ButtonLoading = React.forwardRef<HTMLSpanElement, ButtonLoadingProps>(
  ({ loading, children, className, ...props }, ref) => {
    return (
      <span ref={ref} className={cn("inline-flex items-center gap-2", className)} {...props}>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </span>
    );
  }
);
ButtonLoading.displayName = "ButtonLoading";

// Skeleton Loaders Export
export {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonTaskCard,
  SkeletonStatsCard,
  SkeletonLeaderboardRow,
};
