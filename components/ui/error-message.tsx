import { AlertCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorMessageProps {
  title?: string
  message: string
  variant?: "default" | "destructive"
  onDismiss?: () => void
}

export function ErrorMessage({
  title = "Error",
  message,
  variant = "destructive",
  onDismiss,
}: ErrorMessageProps) {
  return (
    <Alert variant={variant} className="relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded-md hover:bg-muted transition-colors"
          aria-label="Dismiss error"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </Alert>
  )
}

interface InlineErrorProps {
  message: string
}

export function InlineError({ message }: InlineErrorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-destructive">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
}
