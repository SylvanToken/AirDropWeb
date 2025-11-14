"use client";

import * as React from "react";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StateAnimationProps {
  type: "success" | "error" | "warning" | "info";
  message?: string;
  className?: string;
}

const StateAnimation = React.forwardRef<HTMLDivElement, StateAnimationProps>(
  ({ type, message, className }, ref) => {
    const config = {
      success: {
        icon: CheckCircle2,
        bgColor: "bg-eco-leaf/10",
        textColor: "text-eco-leaf",
        borderColor: "border-eco-leaf/30",
        animation: "animate-grow",
      },
      error: {
        icon: XCircle,
        bgColor: "bg-destructive/10",
        textColor: "text-destructive",
        borderColor: "border-destructive/30",
        animation: "animate-grow",
      },
      warning: {
        icon: AlertCircle,
        bgColor: "bg-eco-earth/10",
        textColor: "text-eco-earth",
        borderColor: "border-eco-earth/30",
        animation: "animate-pulse-eco",
      },
      info: {
        icon: Info,
        bgColor: "bg-eco-sky/10",
        textColor: "text-eco-sky",
        borderColor: "border-eco-sky/30",
        animation: "animate-fade-in",
      },
    };

    const { icon: Icon, bgColor, textColor, borderColor, animation } = config[type];

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 p-4 rounded-lg border",
          bgColor,
          borderColor,
          animation,
          className
        )}
      >
        <Icon className={cn("w-5 h-5 flex-shrink-0", textColor)} />
        {message && (
          <p className={cn("text-sm font-medium", textColor)}>{message}</p>
        )}
      </div>
    );
  }
);
StateAnimation.displayName = "StateAnimation";

export { StateAnimation };
