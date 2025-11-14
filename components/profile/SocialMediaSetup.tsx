"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Twitter, Send, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { SocialMediaConfirmationModal } from "./SocialMediaConfirmationModal";
import { useTranslations } from "next-intl";

interface SocialMediaSetupProps {
  type: "twitter" | "telegram";
  username: string | null;
  verified: boolean;
  onUpdate: () => void;
}

export function SocialMediaSetup({ type, username, verified, onUpdate }: SocialMediaSetupProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const t = useTranslations("profile.socialMedia");

  const Icon = type === "twitter" ? Twitter : Send;
  const platformName = type === "twitter" ? "X (Twitter)" : "Telegram";
  const placeholder = type === "twitter" ? "@username" : "@username";

  const validateUsername = (value: string): string | null => {
    const cleaned = value.trim().replace(/^@/, "");
    
    if (!cleaned) {
      return t("errors.required");
    }

    if (cleaned.length < 3) {
      return t("errors.tooShort");
    }

    if (cleaned.length > 30) {
      return t("errors.tooLong");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleaned)) {
      return t("errors.invalidFormat");
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateUsername(inputValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError("");

    try {
      const cleaned = inputValue.trim().replace(/^@/, "");
      
      const response = await fetch("/api/users/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          username: cleaned,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to update ${platformName} username`);
      }

      setShowConfirmModal(false);
      setInputValue("");
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.unknown"));
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
  };

  if (verified && username) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-eco-leaf" />
          <h3 className="text-lg font-semibold text-eco-forest">{platformName}</h3>
        </div>
        <div className="p-4 bg-gradient-to-br from-eco-leaf/10 to-eco-forest/10 border border-eco-leaf/20 rounded-lg neon-glow-green">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-eco-leaf mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-eco-forest mb-1">
                {t("verified")}
              </p>
              <p className="text-lg font-semibold text-eco-leaf">
                @{username}
              </p>
              <p className="text-xs text-eco-forest/70 mt-2">
                {t("permanentNote")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-eco-leaf" />
          <h3 className="text-lg font-semibold text-eco-forest">{platformName}</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md space-y-2">
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {t("warning.title")}
              </h4>
              <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                <li>{t("warning.permanent")}</li>
                <li>{t("warning.cannotChange")}</li>
                <li>{t("warning.doubleCheck")}</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Info className="w-4 h-4" />
                {t("info.title")}
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
                <li>{t("info.withoutAt")}</li>
                <li>{t("info.length")}</li>
                <li>{t("info.characters")}</li>
              </ul>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                {t("info.example")} <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">@sylvantoken</code>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${type}Username`}>{t("usernameLabel")}</Label>
              <Input
                id={`${type}Username`}
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                required
                disabled={isLoading}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                {t("usernameHelp")}
              </p>
            </div>

            <Button type="submit" className="w-full gradient-eco-primary" disabled={isLoading}>
              {isLoading ? t("processing") : t("continue")}
            </Button>
          </form>
      </div>

      <SocialMediaConfirmationModal
        isOpen={showConfirmModal}
        type={type}
        username={inputValue.trim().replace(/^@/, "")}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </>
  );
}
