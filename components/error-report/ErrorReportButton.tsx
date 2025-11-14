"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { ErrorReportModal } from "./ErrorReportModal";

interface ErrorReportButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  error?: {
    type?: string;
    message?: string;
    stack?: string;
  };
}

export function ErrorReportButton({ 
  variant = "outline", 
  size = "sm",
  className = "",
  error 
}: ErrorReportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        Report Error
      </Button>

      <ErrorReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialError={error}
      />
    </>
  );
}
