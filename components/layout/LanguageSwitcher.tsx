"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Check, ChevronDown } from "lucide-react";
import { locales, localeNames, localeFlags, isValidLocale, type Locale } from "@/lib/i18n/config";

const languages = locales.map((code) => ({
  code,
  name: localeNames[code],
  flag: localeFlags[code],
}));

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");
  const [isChanging, setIsChanging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0];
  
  // Load saved locale from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("NEXT_LOCALE");
      if (saved && isValidLocale(saved)) {
        setCurrentLocale(saved as Locale);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    setIsChanging(true);
    
    // Store language preference in localStorage and cookie
    if (typeof window !== "undefined") {
      localStorage.setItem("NEXT_LOCALE", newLocale);
      const maxAge = 365 * 24 * 60 * 60; // 1 year
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${maxAge}; SameSite=Lax`;
      
      // Dispatch custom event for locale change
      const event = new CustomEvent("localeChange", { detail: { locale: newLocale } });
      window.dispatchEvent(event);
    }
    
    setCurrentLocale(newLocale);
    setIsOpen(false);
    
    // Reload page to apply new language
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="sm" 
        className="gap-2 hover:bg-eco-leaf/10 dark:hover:bg-eco-leaf/20 transition-all duration-200 hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-xl leading-none">{currentLanguage.flag}</span>
        <span className="hidden sm:inline font-medium">
          {currentLanguage.name}
        </span>
        <ChevronDown 
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </Button>
      
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-40 md:hidden" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown menu */}
          <div 
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-eco-leaf/20 dark:border-eco-leaf/30 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="py-1">
              {languages.map((language, index) => {
                const isActive = currentLocale === language.code;
                return (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code as Locale)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-150 ${
                      isActive 
                        ? "bg-eco-leaf/10 dark:bg-eco-leaf/20 text-eco-forest dark:text-eco-leaf" 
                        : "hover:bg-eco-leaf/5 dark:hover:bg-eco-leaf/10"
                    } ${index === 0 ? "rounded-t-lg" : ""} ${
                      index === languages.length - 1 ? "rounded-b-lg" : ""
                    }`}
                    role="menuitem"
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span className="text-2xl flex-shrink-0">{language.flag}</span>
                    <span className="flex-1 font-medium">{language.name}</span>
                    {isActive && (
                      <Check className="h-4 w-4 text-eco-leaf dark:text-eco-leaf flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
