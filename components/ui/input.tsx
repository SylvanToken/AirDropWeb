import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-input placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-eco-leaf focus-visible:shadow-[0_0_0_3px_hsla(var(--eco-leaf),0.2),0_0_10px_hsla(var(--eco-leaf),0.3),0_0_20px_hsla(var(--eco-leaf),0.2),0_0_30px_hsla(var(--eco-leaf),0.1)]",
        eco: "border-eco-leaf/30 placeholder:text-eco-leaf/40 focus-visible:outline-none focus-visible:border-eco-leaf focus-visible:shadow-[0_0_0_3px_hsla(var(--eco-leaf),0.2),0_0_10px_hsla(var(--eco-leaf),0.3),0_0_20px_hsla(var(--eco-leaf),0.2),0_0_30px_hsla(var(--eco-leaf),0.1)]",
        error: "border-destructive placeholder:text-destructive/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2",
        success: "border-eco-leaf placeholder:text-eco-leaf/40 focus-visible:outline-none focus-visible:border-eco-leaf focus-visible:shadow-[0_0_0_3px_hsla(var(--eco-leaf),0.2),0_0_10px_hsla(var(--eco-leaf),0.3),0_0_20px_hsla(var(--eco-leaf),0.2),0_0_30px_hsla(var(--eco-leaf),0.1)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  error?: string
  success?: boolean
  label?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, iconLeft, iconRight, error, success, label, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    
    const inputVariant = error ? "error" : success ? "success" : variant || "eco"
    
    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(!!e.target.value)
    }
    
    const showSuccessIcon = success && !error
    const showErrorIcon = !!error
    
    if (label) {
      return (
        <div className="relative w-full">
          <input
            type={type}
            className={cn(
              inputVariants({ variant: inputVariant }),
              iconLeft && "pl-10",
              (iconRight || showSuccessIcon || showErrorIcon) && "pr-10",
              "peer",
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder=" "
            {...props}
          />
          <label
            className={cn(
              "absolute left-3 top-2.5 text-sm text-muted-foreground transition-all duration-300 pointer-events-none",
              "peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-background peer-focus:px-1",
              "peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-1",
              error && "peer-focus:text-destructive",
              success && !error && "peer-focus:text-eco-leaf",
              iconLeft && "left-10"
            )}
          >
            {label}
          </label>
          {iconLeft && (
            <div className="absolute left-3 top-2.5 text-muted-foreground [&_svg]:size-4">
              {iconLeft}
            </div>
          )}
          {showSuccessIcon && (
            <div className="absolute right-3 top-2.5 text-eco-leaf [&_svg]:size-4">
              <Check />
            </div>
          )}
          {showErrorIcon && (
            <div className="absolute right-3 top-2.5 text-destructive [&_svg]:size-4">
              <AlertCircle />
            </div>
          )}
          {iconRight && !showSuccessIcon && !showErrorIcon && (
            <div className="absolute right-3 top-2.5 text-muted-foreground [&_svg]:size-4">
              {iconRight}
            </div>
          )}
          {error && (
            <p className="mt-1 text-xs text-destructive">{error}</p>
          )}
        </div>
      )
    }
    
    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            inputVariants({ variant: inputVariant }),
            iconLeft && "pl-10",
            (iconRight || showSuccessIcon || showErrorIcon) && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {iconLeft && (
          <div className="absolute left-3 top-2.5 text-muted-foreground [&_svg]:size-4">
            {iconLeft}
          </div>
        )}
        {showSuccessIcon && (
          <div className="absolute right-3 top-2.5 text-eco-leaf [&_svg]:size-4">
            <Check />
          </div>
        )}
        {showErrorIcon && (
          <div className="absolute right-3 top-2.5 text-destructive [&_svg]:size-4">
            <AlertCircle />
          </div>
        )}
        {iconRight && !showSuccessIcon && !showErrorIcon && (
          <div className="absolute right-3 top-2.5 text-muted-foreground [&_svg]:size-4">
            {iconRight}
          </div>
        )}
        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
