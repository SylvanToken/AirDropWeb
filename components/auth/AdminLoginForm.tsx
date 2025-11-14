"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

export function AdminLoginForm() {
  const t = useTranslations("auth.admin");
  const tLogin = useTranslations("auth.login");
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        setError(tLogin("error"));
        setIsLoading(false);
        return;
      }

      // Verify admin role by fetching session
      const response = await fetch("/api/auth/session");
      const session = await response.json();

      if (session?.user?.role !== "ADMIN") {
        setError(t("error"));
        // Sign out the non-admin user
        await signIn("credentials", { redirect: false });
        setIsLoading(false);
        return;
      }

      // Redirect to admin dashboard on success
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(tLogin("error"));
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
    <Card className="w-full max-w-md shadow-eco border-eco bg-white">
      <CardHeader className="space-y-3 text-center">
        <div className="flex justify-center mb-2">
          <div className="relative">
            <Image
              src="/assets/images/sylvan-token-logo.png"
              alt="Sylvan Token"
              width={64}
              height={64}
              className="object-contain"
              priority
              unoptimized
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 gradient-eco-primary rounded-full flex items-center justify-center shadow-eco">
              <Shield className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
        <CardTitle className="text-center text-2xl text-gradient-eco">{t("title")}</CardTitle>
        <CardDescription className="text-center">
          {t("description")}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">{tLogin("emailLabel")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={tLogin("emailPlaceholder")}
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{tLogin("passwordLabel")}</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={tLogin("passwordPlaceholder")}
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
            className="w-full bg-slate-900 hover:bg-slate-800" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? t("submitting") : t("submitButton")}
          </Button>
          
          <p className="text-sm text-center text-muted-foreground">
            {t("notAdmin")}{" "}
            <a href="/login" className="text-slate-900 hover:underline font-medium">
              {t("userLogin")}
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
