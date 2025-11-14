"use client";

import { NextIntlClientProvider } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { locales, defaultLocale, isValidLocale, type Locale } from "@/lib/i18n/config";

// Import all locales statically
import enCommon from "@/locales/en/common.json";
import enAuth from "@/locales/en/auth.json";
import enTasks from "@/locales/en/tasks.json";
import enWallet from "@/locales/en/wallet.json";
import enDashboard from "@/locales/en/dashboard.json";
import enAdmin from "@/locales/en/admin.json";
import enProfile from "@/locales/en/profile.json";
import enLegal from "@/locales/en/legal.json";
import enHomepage from "@/locales/en/homepage.json";

import trCommon from "@/locales/tr/common.json";
import trAuth from "@/locales/tr/auth.json";
import trTasks from "@/locales/tr/tasks.json";
import trWallet from "@/locales/tr/wallet.json";
import trDashboard from "@/locales/tr/dashboard.json";
import trAdmin from "@/locales/tr/admin.json";
import trProfile from "@/locales/tr/profile.json";
import trLegal from "@/locales/tr/legal.json";
import trHomepage from "@/locales/tr/homepage.json";

import deCommon from "@/locales/de/common.json";
import deAuth from "@/locales/de/auth.json";
import deTasks from "@/locales/de/tasks.json";
import deWallet from "@/locales/de/wallet.json";
import deDashboard from "@/locales/de/dashboard.json";
import deAdmin from "@/locales/de/admin.json";
import deProfile from "@/locales/de/profile.json";
import deLegal from "@/locales/de/legal.json";
import deHomepage from "@/locales/de/homepage.json";

import zhCommon from "@/locales/zh/common.json";
import zhAuth from "@/locales/zh/auth.json";
import zhTasks from "@/locales/zh/tasks.json";
import zhWallet from "@/locales/zh/wallet.json";
import zhDashboard from "@/locales/zh/dashboard.json";
import zhAdmin from "@/locales/zh/admin.json";
import zhProfile from "@/locales/zh/profile.json";
import zhLegal from "@/locales/zh/legal.json";
import zhHomepage from "@/locales/zh/homepage.json";

import ruCommon from "@/locales/ru/common.json";
import ruAuth from "@/locales/ru/auth.json";
import ruTasks from "@/locales/ru/tasks.json";
import ruWallet from "@/locales/ru/wallet.json";
import ruDashboard from "@/locales/ru/dashboard.json";
import ruAdmin from "@/locales/ru/admin.json";
import ruProfile from "@/locales/ru/profile.json";
import ruLegal from "@/locales/ru/legal.json";
import ruHomepage from "@/locales/ru/homepage.json";

import esCommon from "@/locales/es/common.json";
import esAuth from "@/locales/es/auth.json";
import esTasks from "@/locales/es/tasks.json";
import esWallet from "@/locales/es/wallet.json";
import esDashboard from "@/locales/es/dashboard.json";
import esAdmin from "@/locales/es/admin.json";
import esProfile from "@/locales/es/profile.json";
import esLegal from "@/locales/es/legal.json";
import esHomepage from "@/locales/es/homepage.json";

import arCommon from "@/locales/ar/common.json";
import arAuth from "@/locales/ar/auth.json";
import arTasks from "@/locales/ar/tasks.json";
import arWallet from "@/locales/ar/wallet.json";
import arDashboard from "@/locales/ar/dashboard.json";
import arAdmin from "@/locales/ar/admin.json";
import arProfile from "@/locales/ar/profile.json";
import arLegal from "@/locales/ar/legal.json";
import arHomepage from "@/locales/ar/homepage.json";

import koCommon from "@/locales/ko/common.json";
import koAuth from "@/locales/ko/auth.json";
import koTasks from "@/locales/ko/tasks.json";
import koWallet from "@/locales/ko/wallet.json";
import koDashboard from "@/locales/ko/dashboard.json";
import koAdmin from "@/locales/ko/admin.json";
import koProfile from "@/locales/ko/profile.json";
import koLegal from "@/locales/ko/legal.json";
import koHomepage from "@/locales/ko/homepage.json";

const allMessages = {
  en: {
    ...enCommon,
    auth: enAuth,
    tasks: enTasks,
    wallet: enWallet,
    dashboard: enDashboard,
    admin: enAdmin,
    profile: enProfile,
    legal: enLegal,
    homepage: enHomepage,
  },
  tr: {
    ...trCommon,
    auth: trAuth,
    tasks: trTasks,
    wallet: trWallet,
    dashboard: trDashboard,
    admin: trAdmin,
    profile: trProfile,
    legal: trLegal,
    homepage: trHomepage,
  },
  de: {
    ...deCommon,
    auth: deAuth,
    tasks: deTasks,
    wallet: deWallet,
    dashboard: deDashboard,
    admin: deAdmin,
    profile: deProfile,
    legal: deLegal,
    homepage: deHomepage,
  },
  zh: {
    ...zhCommon,
    auth: zhAuth,
    tasks: zhTasks,
    wallet: zhWallet,
    dashboard: zhDashboard,
    admin: zhAdmin,
    profile: zhProfile,
    legal: zhLegal,
    homepage: zhHomepage,
  },
  ru: {
    ...ruCommon,
    auth: ruAuth,
    tasks: ruTasks,
    wallet: ruWallet,
    dashboard: ruDashboard,
    admin: ruAdmin,
    profile: ruProfile,
    legal: ruLegal,
    homepage: ruHomepage,
  },
  es: {
    ...esCommon,
    auth: esAuth,
    tasks: esTasks,
    wallet: esWallet,
    dashboard: esDashboard,
    admin: esAdmin,
    profile: esProfile,
    legal: esLegal,
    homepage: esHomepage,
  },
  ar: {
    ...arCommon,
    auth: arAuth,
    tasks: arTasks,
    wallet: arWallet,
    dashboard: arDashboard,
    admin: arAdmin,
    profile: arProfile,
    legal: arLegal,
    homepage: arHomepage,
  },
  ko: {
    ...koCommon,
    auth: koAuth,
    tasks: koTasks,
    wallet: koWallet,
    dashboard: koDashboard,
    admin: koAdmin,
    profile: koProfile,
    legal: koLegal,
    homepage: koHomepage,
  },
};

/**
 * Get locale from cookies
 */
function getLocaleFromCookie(): Locale | null {
  if (typeof document === "undefined") return null;
  
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "NEXT_LOCALE" && isValidLocale(value)) {
      return value as Locale;
    }
  }
  return null;
}

/**
 * Get locale from localStorage
 */
function getLocaleFromStorage(): Locale | null {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem("NEXT_LOCALE");
  if (stored && isValidLocale(stored)) {
    return stored as Locale;
  }
  return null;
}

/**
 * Get locale from browser language
 */
function getLocaleFromBrowser(): Locale | null {
  if (typeof navigator === "undefined") return null;
  
  const browserLang = navigator.language.split("-")[0];
  if (isValidLocale(browserLang)) {
    return browserLang as Locale;
  }
  return null;
}

/**
 * Determine initial locale with fallback chain:
 * 1. Cookie
 * 2. localStorage
 * 3. Browser language
 * 4. Default locale (en)
 */
function getInitialLocale(): Locale {
  return (
    getLocaleFromCookie() ||
    getLocaleFromStorage() ||
    getLocaleFromBrowser() ||
    defaultLocale
  );
}

/**
 * Save locale to both localStorage and cookie
 */
function persistLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  
  // Save to localStorage
  localStorage.setItem("NEXT_LOCALE", locale);
  
  // Save to cookie (1 year expiry)
  const maxAge = 365 * 24 * 60 * 60; // 1 year in seconds
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize locale on mount
  useEffect(() => {
    const initialLocale = getInitialLocale();
    setLocale(initialLocale);
    persistLocale(initialLocale);
    setIsInitialized(true);
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[I18n] Initialized with locale: ${initialLocale}`);
    }
  }, []);

  // Listen for locale change events
  useEffect(() => {
    const handleLocaleChange = (event: CustomEvent<{ locale: Locale }>) => {
      const newLocale = event.detail.locale;
      if (isValidLocale(newLocale)) {
        setLocale(newLocale);
        persistLocale(newLocale);
        
        if (process.env.NODE_ENV === "development") {
          console.log(`[I18n] Locale changed to: ${newLocale}`);
        }
      }
    };

    window.addEventListener("localeChange" as any, handleLocaleChange);
    return () => {
      window.removeEventListener("localeChange" as any, handleLocaleChange);
    };
  }, []);

  // Get messages with fallback to English
  const getMessages = useCallback(() => {
    const messages = allMessages[locale];
    
    if (!messages) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[I18n] Messages not found for locale: ${locale}, falling back to English`);
      }
      return allMessages[defaultLocale];
    }
    
    return messages;
  }, [locale]);

  // Custom error handler for missing translations
  const onError = useCallback((error: any) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[I18n] Translation error:`, error);
    }
  }, []);

  // Get missing message handler
  const getMessageFallback = useCallback(({ namespace, key }: { namespace?: string; key: string }) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[I18n] Missing translation: ${namespace ? `${namespace}.` : ''}${key} for locale: ${locale}`);
    }
    
    // Try to get from English fallback
    const fallbackMessages = allMessages[defaultLocale] as any;
    if (namespace && fallbackMessages[namespace]?.[key]) {
      return fallbackMessages[namespace][key];
    }
    
    // Return key as last resort
    return namespace ? `${namespace}.${key}` : key;
  }, [locale]);

  // Don't render until initialized to avoid hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={getMessages()}
      onError={onError}
      getMessageFallback={getMessageFallback}
      timeZone="UTC"
    >
      {children}
    </NextIntlClientProvider>
  );
}
