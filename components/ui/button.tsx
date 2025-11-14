import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-leaf focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-eco-leaf to-eco-forest text-white shadow-[0_0_10px_hsla(var(--eco-leaf),0.3),0_0_20px_hsla(var(--eco-leaf),0.2),0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_hsla(var(--eco-leaf),0.5),0_0_30px_hsla(var(--eco-leaf),0.3),0_0_45px_hsla(var(--eco-leaf),0.2),0_8px_25px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 opacity-90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_0_10px_hsla(0,70%,50%,0.3),0_0_20px_hsla(0,70%,50%,0.2)] hover:shadow-[0_0_15px_hsla(0,70%,50%,0.5),0_0_30px_hsla(0,70%,50%,0.3)] hover:bg-destructive/90 opacity-90",
        outline:
          "border border-eco-leaf/30 bg-background hover:bg-eco-leaf/5 hover:text-accent-foreground hover:border-eco-leaf/50 hover:shadow-[0_0_10px_hsla(var(--eco-leaf),0.2)]",
        secondary:
          "bg-eco-earth text-secondary-foreground hover:bg-eco-earth/80 shadow-[0_0_8px_hsla(var(--eco-earth),0.2)] hover:shadow-[0_0_15px_hsla(var(--eco-earth),0.3)] opacity-90",
        ghost: "hover:bg-eco-leaf/10 hover:text-accent-foreground hover:shadow-[0_0_8px_hsla(var(--eco-leaf),0.15)]",
        link: "text-eco-leaf underline-offset-4 hover:underline hover:text-eco-leaf/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
