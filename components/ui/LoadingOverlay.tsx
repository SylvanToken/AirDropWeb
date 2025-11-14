"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { WaveAnimation } from "./NatureAnimations";

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  visible: boolean;
  message?: string;
  variant?: "spinner" | "wave" | "dots";
  blur?: boolean;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ visible, message, variant = "spinner", blur = true, className, ...props }, ref) => {
    if (!visible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/80",
          blur && "backdrop-blur-sm",
          "animate-fade-in",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-card shadow-eco-lg">
          {variant === "spinner" && (
            <Loader2 className="w-8 h-8 text-eco-leaf animate-spin" />
          )}
          {variant === "wave" && <WaveAnimation count={3} />}
          {variant === "dots" && (
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-eco-leaf animate-pulse-eco"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          )}
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
LoadingOverlay.displayName = "LoadingOverlay";

export { LoadingOverlay };
