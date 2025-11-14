import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300",
        "focus-visible:outline-none focus-visible:border-eco-leaf",
        "focus-visible:shadow-[0_0_0_3px_hsla(var(--eco-leaf),0.2),0_0_10px_hsla(var(--eco-leaf),0.3),0_0_20px_hsla(var(--eco-leaf),0.2),0_0_30px_hsla(var(--eco-leaf),0.1)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
