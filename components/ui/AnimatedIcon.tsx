import * as React from "react";
import { cn } from "@/lib/utils";

export interface AnimatedIconProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: "rotate" | "scale" | "bounce" | "pulse" | "spin";
}

const AnimatedIcon = React.forwardRef<HTMLDivElement, AnimatedIconProps>(
  ({ children, animation = "scale", className, ...props }, ref) => {
    const animationClasses = {
      rotate: "hover:rotate-12 transition-transform duration-300",
      scale: "hover:scale-110 transition-transform duration-300",
      bounce: "hover:animate-bounce",
      pulse: "hover:animate-pulse-eco",
      spin: "hover:animate-spin",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center",
          animationClasses[animation],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AnimatedIcon.displayName = "AnimatedIcon";

export { AnimatedIcon };
