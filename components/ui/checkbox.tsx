"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-eco-leaf/30 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-eco-leaf data-[state=checked]:text-white data-[state=checked]:border-eco-leaf transition-all duration-300",
      "focus-visible:outline-none",
      "focus-visible:shadow-[0_0_0_2px_hsl(var(--background)),0_0_0_4px_hsla(var(--eco-leaf),0.5),0_0_10px_hsla(var(--eco-leaf),0.3)]",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("grid place-content-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
