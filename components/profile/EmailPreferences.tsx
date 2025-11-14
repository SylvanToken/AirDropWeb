"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mail, Bell, Wallet, Shield, Megaphone, Loader2, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmailPreferencesData {
  taskCompletions: boolean;
  walletVerifications: boolean;
  adminNotifications: boolean;
  marketingEmails: boolean;
}

export function EmailPreferences() {
  const [preferences, setPreferences] = useState<EmailPreferencesData>({
    taskCompletions: true,
    walletVerifications: true,
    adminNotifications: true,
    marketingEmails: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const t = useTranslations("profile");

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/users/email-preferences");
      if (response.ok) {
        const data = await response.json();
        setPreferences({
          taskCompletions: data.taskCompletions,
          walletVerifications: data.walletVerifications,
          adminNotifications: data.adminNotifications,
          marketingEmails: data.marketingEmails,
        });
      }
    } catch (error) {
      console.error("Failed to fetch email preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/users/email-preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        console.error("Failed to save email preferences");
      }
    } catch (error) {
      console.error("Error saving email preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof EmailPreferencesData) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (isLoading) {
    return (
      <Card className="border-eco-leaf/20 shadow-eco bg-card/90">
        <CardContent className="pt-6 bg-opacity-90">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-eco-leaf" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-eco-leaf/20 shadow-eco hover:shadow-eco-lg transition-all duration-300 bg-card/90">
      <CardHeader className="space-y-1 bg-gradient-to-br from-eco-leaf/5 to-eco-forest/5 border-b border-eco-leaf/10 bg-opacity-90">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-eco-forest to-eco-leaf bg-clip-text text-transparent flex items-center gap-2">
          <Mail className="w-6 h-6 text-eco-leaf" />
          {t("emailPreferences.title")}
        </CardTitle>
        <CardDescription className="text-eco-forest/70">
          {t("emailPreferences.description")}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6 bg-opacity-90">
        {/* Task Completion Emails */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-eco-leaf/20 bg-gradient-to-r from-eco-leaf/5 to-transparent hover:from-eco-leaf/10 transition-all duration-300 depth-4k-1 hover:depth-4k-2">
          <div className="flex items-start gap-3 flex-1">
            <Bell className="w-5 h-5 text-eco-leaf mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <Label
                htmlFor="taskCompletions"
                className="text-base font-semibold text-eco-forest cursor-pointer"
              >
                {t("emailPreferences.taskCompletions.title")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("emailPreferences.taskCompletions.description")}
              </p>
            </div>
          </div>
          <Switch
            id="taskCompletions"
            checked={preferences.taskCompletions}
            onCheckedChange={() => handleToggle("taskCompletions")}
            className="flex-shrink-0"
          />
        </div>

        {/* Wallet Verification Emails */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-eco-leaf/20 bg-gradient-to-r from-eco-leaf/5 to-transparent hover:from-eco-leaf/10 transition-all duration-300 depth-4k-1 hover:depth-4k-2">
          <div className="flex items-start gap-3 flex-1">
            <Wallet className="w-5 h-5 text-eco-leaf mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <Label
                htmlFor="walletVerifications"
                className="text-base font-semibold text-eco-forest cursor-pointer"
              >
                {t("emailPreferences.walletVerifications.title")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("emailPreferences.walletVerifications.description")}
              </p>
            </div>
          </div>
          <Switch
            id="walletVerifications"
            checked={preferences.walletVerifications}
            onCheckedChange={() => handleToggle("walletVerifications")}
            className="flex-shrink-0"
          />
        </div>

        {/* Admin Notifications */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-eco-leaf/20 bg-gradient-to-r from-eco-leaf/5 to-transparent hover:from-eco-leaf/10 transition-all duration-300 depth-4k-1 hover:depth-4k-2">
          <div className="flex items-start gap-3 flex-1">
            <Shield className="w-5 h-5 text-eco-leaf mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <Label
                htmlFor="adminNotifications"
                className="text-base font-semibold text-eco-forest cursor-pointer"
              >
                {t("emailPreferences.adminNotifications.title")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("emailPreferences.adminNotifications.description")}
              </p>
            </div>
          </div>
          <Switch
            id="adminNotifications"
            checked={preferences.adminNotifications}
            onCheckedChange={() => handleToggle("adminNotifications")}
            className="flex-shrink-0"
          />
        </div>

        {/* Marketing Emails */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-eco-leaf/20 bg-gradient-to-r from-eco-leaf/5 to-transparent hover:from-eco-leaf/10 transition-all duration-300 depth-4k-1 hover:depth-4k-2">
          <div className="flex items-start gap-3 flex-1">
            <Megaphone className="w-5 h-5 text-eco-leaf mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <Label
                htmlFor="marketingEmails"
                className="text-base font-semibold text-eco-forest cursor-pointer"
              >
                {t("emailPreferences.marketingEmails.title")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("emailPreferences.marketingEmails.description")}
              </p>
            </div>
          </div>
          <Switch
            id="marketingEmails"
            checked={preferences.marketingEmails}
            onCheckedChange={() => handleToggle("marketingEmails")}
            className="flex-shrink-0"
          />
        </div>

        {/* Important Note */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>{t("emailPreferences.note.title")}</strong>{" "}
            {t("emailPreferences.note.description")}
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-eco-forest to-eco-leaf hover:from-eco-forest/90 hover:to-eco-leaf/90 text-white font-semibold px-6"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("emailPreferences.saving")}
              </>
            ) : (
              t("emailPreferences.save")
            )}
          </Button>

          {saveSuccess && (
            <div className="flex items-center gap-2 text-eco-leaf animate-in fade-in slide-in-from-left-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">
                {t("emailPreferences.saved")}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
