"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

export function LoginForm() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const registered = searchParams.get("registered");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("error"));
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(t("error"));
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
          {registered && (
            <div className="p-4 text-sm text-eco-forest bg-eco-leaf/10 border border-eco-leaf/30 rounded-lg animate-fade-in">
              {t("successMessage")}
            </div>
          )}
          
          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg animate-fade-in">
              {error}
            </div>
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
            {t("noAccount")}{" "}
            <Link 
              href="/register" 
              className="text-eco-leaf hover:text-eco-forest font-medium transition-colors hover:underline"
            >
              {t("createAccount")}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
