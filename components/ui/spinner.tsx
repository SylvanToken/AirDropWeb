import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "animate-spin",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      variant: {
        default: "text-primary",
        eco: "text-eco-leaf",
        muted: "text-muted-foreground",
        white: "text-white",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

function Spinner({ className, size, variant, label, ...props }: SpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)} {...props}>
      <Loader2 className={cn(spinnerVariants({ size, variant }))} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  )
}

// Full page loading overlay
function LoadingOverlay({ label }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" variant="eco" />
        {label && <p className="text-lg font-medium">{label}</p>}
      </div>
    </div>
  )
}

export { Spinner, LoadingOverlay, spinnerVariants }
