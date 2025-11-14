"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { apiPost, getErrorMessage } from "@/lib/api-client";
import { ErrorMessage } from "@/components/ui/error-message";
import { useTranslations } from "next-intl";
import { TermsModal } from "@/components/legal/TermsModal";
import { PrivacyModal } from "@/components/legal/PrivacyModal";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError(t("passwordMismatch"));
      setIsLoading(false);
      return;
    }

    // Validate terms acceptance
    if (!formData.acceptedTerms) {
      setError(t("termsRequired"));
      setIsLoading(false);
      return;
    }

    // Validate Turnstile token if enabled
    const isTurnstileEnabled = process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === 'true';
    if (isTurnstileEnabled && !turnstileToken) {
      setError("Please complete the security verification");
      setIsLoading(false);
      return;
    }

    try {
      // Register user using API client (without confirmPassword)
      const { confirmPassword, acceptedTerms, ...registerData } = formData;
      await apiPost("/api/auth/register", { 
        ...registerData, 
        acceptedTerms,
        turnstileToken 
      });

      // Auto-login after successful registration
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but login failed, redirect to login page
        router.push("/login?registered=true");
      } else {
        // Both registration and login succeeded
        router.push("/dashboard");
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Card variant="glass" className="w-full shadow-eco-lg backdrop-blur-xl bg-card/80 border-2 border-eco-leaf/20">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-eco-leaf to-eco-forest p-1 animate-pulse-eco">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <Image
                src="/assets/images/sylvan-token-logo.png"
                alt="Sylvan Token"
                width={60}
                height={60}
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl bg-gradient-to-r from-eco-leaf to-eco-forest bg-clip-text text-transparent">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-base">
            {t("description")}
          </CardDescription>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <ErrorMessage 
              message={error} 
              onDismiss={() => setError("")}
            />
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t("usernameLabel")}</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder={t("usernamePlaceholder")}
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("passwordLabel")}</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("passwordHint")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmPasswordLabel")}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("confirmPasswordPlaceholder")}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Terms and Privacy Policy */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
              <input
                type="checkbox"
                id="acceptedTerms"
                name="acceptedTerms"
                checked={hasAcceptedTerms && hasAcceptedPrivacy}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setHasAcceptedTerms(false);
                    setHasAcceptedPrivacy(false);
                    setFormData({ ...formData, acceptedTerms: false });
                  }
                }}
                disabled={isLoading}
                className="mt-1 h-4 w-4 rounded border-eco-leaf/50 text-eco-leaf focus:ring-eco-leaf focus:ring-offset-2"
                required
              />
              <label htmlFor="acceptedTerms" className="text-sm text-foreground">
                {t("termsAgreement.text")}{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-eco-leaf hover:text-eco-forest underline font-medium transition-colors"
                >
                  {t("termsAgreement.terms")}
                </button>{" "}
                {t("termsAgreement.and")}{" "}
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-eco-leaf hover:text-eco-forest underline font-medium transition-colors"
                >
                  {t("termsAgreement.privacy")}
                </button>
              </label>
            </div>
          </div>

          {/* Turnstile Widget - Only show if enabled */}
          {process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === 'true' && (
            <div className="flex justify-center">
              <TurnstileWidget
                onVerify={(token) => {
                  setTurnstileToken(token);
                  setError(""); // Clear any previous errors
                }}
                onError={() => {
                  setTurnstileToken(null);
                  setError("Security verification failed. Please try again.");
                }}
                onExpire={() => {
                  setTurnstileToken(null);
                  setError("Security verification expired. Please verify again.");
                }}
                className="my-4"
              />
            </div>
          )}

          {/* Security Warning */}
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-lg space-y-2 animate-fade-in">
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {t("securityWarning.title")}
            </h4>
            <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1 list-disc list-inside">
              <li><strong>{t("securityWarning.keepSafe")}</strong></li>
              <li>{t("securityWarning.noRecovery")}</li>
              <li>{t("securityWarning.permanent")}</li>
              <li>{t("securityWarning.writeDown")}</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            variant="default" 
            size="lg"
            className="w-full group bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-leaf/90 hover:to-eco-forest/90" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isLoading ? t("submitting") : t("submitButton")}
          </Button>
          
          <p className="text-sm text-center text-muted-foreground">
            {t("hasAccount")}{" "}
            <Link 
              href="/login" 
              className="text-eco-leaf hover:text-eco-forest font-medium transition-colors hover:underline"
            >
              {t("signIn")}
            </Link>
          </p>
        </CardFooter>
      </form>

      {/* Modals */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setHasAcceptedTerms(true);
          if (hasAcceptedPrivacy) {
            setFormData({ ...formData, acceptedTerms: true });
          }
        }}
      />
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => {
          setHasAcceptedPrivacy(true);
          if (hasAcceptedTerms) {
            setFormData({ ...formData, acceptedTerms: true });
          }
        }}
      />
    </Card>
  );
}
