"use client";

import * as React from "react";
import { Leaf, Waves, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Leaf Float Animation - for decorative elements
export interface LeafFloatProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  size?: "sm" | "md" | "lg";
}

export const LeafFloat = React.forwardRef<HTMLDivElement, LeafFloatProps>(
  ({ delay = 0, size = "md", className, ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "text-eco-leaf/30 animate-leaf-float",
          sizeClasses[size],
          className
        )}
        style={{ animationDelay: `${delay}s` }}
        {...props}
      >
        <Leaf className="w-full h-full" />
      </div>
    );
  }
);
LeafFloat.displayName = "LeafFloat";

// Grow Animation - for success states
export interface GrowAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const GrowAnimation = React.forwardRef<HTMLDivElement, GrowAnimationProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("animate-grow", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GrowAnimation.displayName = "GrowAnimation";

// Wave Animation - for loading states
export interface WaveAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
}

export const WaveAnimation = React.forwardRef<HTMLDivElement, WaveAnimationProps>(
  ({ count = 3, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        {...props}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-eco-leaf animate-wave"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    );
  }
);
WaveAnimation.displayName = "WaveAnimation";

// Pulse Animation - for notifications
export interface PulseAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PulseAnimation = React.forwardRef<HTMLDivElement, PulseAnimationProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("animate-pulse-eco", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PulseAnimation.displayName = "PulseAnimation";

// Sparkle Effect - for special achievements
export interface SparkleEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
}

export const SparkleEffect = React.forwardRef<HTMLDivElement, SparkleEffectProps>(
  ({ count = 5, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative inline-block", className)}
        {...props}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Sparkles
            key={i}
            className={cn(
              "absolute text-eco-leaf animate-pulse-eco",
              "w-4 h-4"
            )}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
    );
  }
);
SparkleEffect.displayName = "SparkleEffect";

// Floating Leaves Background - decorative
export interface FloatingLeavesProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
}

export const FloatingLeaves = React.forwardRef<HTMLDivElement, FloatingLeavesProps>(
  ({ count = 8, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
        {...props}
      >
        {Array.from({ length: count }).map((_, i) => (
          <LeafFloat
            key={i}
            delay={i * 0.5}
            size={i % 3 === 0 ? "lg" : i % 2 === 0 ? "md" : "sm"}
            className="absolute"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    );
  }
);
FloatingLeaves.displayName = "FloatingLeaves";

// Success Growth Animation - combines grow with leaf
export interface SuccessGrowthProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  showLeaves?: boolean;
}

export const SuccessGrowth = React.forwardRef<HTMLDivElement, SuccessGrowthProps>(
  ({ children, showLeaves = true, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <GrowAnimation>{children}</GrowAnimation>
        {showLeaves && (
          <div className="absolute inset-0 pointer-events-none">
            <LeafFloat
              className="absolute -top-4 -right-4"
              delay={0}
              size="md"
            />
            <LeafFloat
              className="absolute -bottom-4 -left-4"
              delay={0.3}
              size="sm"
            />
          </div>
        )}
      </div>
    );
  }
);
SuccessGrowth.displayName = "SuccessGrowth";
