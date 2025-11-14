"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Twitter, Send } from "lucide-react";
import { useTranslations } from "next-intl";

interface SocialMediaConfirmationModalProps {
  isOpen: boolean;
  type: "twitter" | "telegram";
  username: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function SocialMediaConfirmationModal({
  isOpen,
  type,
  username,
  onConfirm,
  onCancel,
  isLoading,
}: SocialMediaConfirmationModalProps) {
  const t = useTranslations("profile.confirmation");
  const Icon = type === "twitter" ? Twitter : Send;
  const platformName = type === "twitter" ? "X (Twitter)" : "Telegram";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-emerald-600" />
            {platformName} - {t("title")}
          </DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-md">
            <p className="text-sm font-medium text-muted-foreground mb-1">{t("usernameLabel")}</p>
            <p className="text-lg font-bold text-gradient-eco">@{username}</p>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-md space-y-3">
            <h4 className="text-sm font-bold text-red-900 dark:text-red-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {t("critical.title")}
            </h4>
            <ul className="text-xs text-red-800 dark:text-red-200 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 font-bold mt-0.5">•</span>
                <span>{t("critical.permanent")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 font-bold mt-0.5">•</span>
                <span>{t("critical.cannotChange")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 font-bold mt-0.5">•</span>
                <span>{t("critical.verify")}</span>
              </li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {t("acknowledgement")}
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto gradient-eco-primary"
          >
            {isLoading ? t("confirming") : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
