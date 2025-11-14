"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface ErrorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialError?: {
    type?: string;
    message?: string;
    stack?: string;
  };
}

export function ErrorReportModal({ isOpen, onClose, initialError }: ErrorReportModalProps) {
  const [errorType, setErrorType] = useState(initialError?.type || "OTHER");
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState(initialError?.message || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!errorTitle.trim() || !errorMessage.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/error-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          errorType,
          errorTitle,
          errorMessage,
          stackTrace: initialError?.stack || null,
          pageUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit error report");
      }

      setIsSuccess(true);
      toast({
        title: "Report Submitted",
        description: "Thank you! We'll look into this issue.",
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit error report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrorType("OTHER");
    setErrorTitle("");
    setErrorMessage("");
    setIsSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Report an Error
          </DialogTitle>
          <DialogDescription>
            Help us improve by reporting any issues you encounter
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Report Submitted!</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for helping us improve the platform
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="errorType">Error Type</Label>
              <Select value={errorType} onValueChange={setErrorType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select error type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UI_ERROR">UI/Display Error</SelectItem>
                  <SelectItem value="API_ERROR">API/Connection Error</SelectItem>
                  <SelectItem value="TASK_ERROR">Task Completion Error</SelectItem>
                  <SelectItem value="PAYMENT_ERROR">Payment/Wallet Error</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="errorTitle">
                Error Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="errorTitle"
                placeholder="Brief description of the error"
                value={errorTitle}
                onChange={(e) => setErrorTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="errorMessage">
                Error Details <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="errorMessage"
                placeholder="Please describe what happened, what you were trying to do, and any error messages you saw..."
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
