import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border bg-card shadow-sm hover:shadow-md",
        elevated: "bg-card shadow-eco hover:shadow-eco-lg hover:-translate-y-1 border border-eco-leaf/10",
        outlined: "border-2 border-eco-leaf/30 bg-transparent hover:bg-eco-leaf/5 hover:border-eco-leaf/50 hover:shadow-glow",
        glass: "bg-card/80 backdrop-blur-md border border-white/20 dark:border-black/20 shadow-eco-lg hover:bg-card/90 hover:shadow-glow",
        neon: "bg-gradient-to-br from-card/90 via-card/90 to-eco-leaf/5 border border-eco-leaf/30 backdrop-blur-[10px] shadow-[0_0_10px_hsla(var(--eco-leaf),0.2),0_0_20px_hsla(var(--eco-leaf),0.1),0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_15px_hsla(var(--eco-leaf),0.3),0_0_30px_hsla(var(--eco-leaf),0.2),0_8px_30px_rgba(0,0,0,0.15)] hover:border-eco-leaf/50 hover:-translate-y-0.5",
      },
      padding: {
        sm: "[&>*]:p-4",
        md: "[&>*]:p-6",
        lg: "[&>*]:p-8",
      },
      gradient: {
        true: "bg-gradient-to-br from-eco-leaf/10 via-card to-eco-sky/10",
        false: "",
      },
      organic: {
        true: "rounded-[2rem_1rem_2rem_1rem]",
        false: "",
      },
      aspectRatio: {
        auto: "aspect-auto",
        square: "aspect-square",
        video: "aspect-video",
        photo: "aspect-[4/3]",
        portrait: "aspect-[3/4]",
        landscape: "aspect-[4/3]",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      gradient: false,
      organic: false,
      aspectRatio: "none",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, gradient, organic, aspectRatio, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, gradient, organic, aspectRatio, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
