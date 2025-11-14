"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Twitter, Send, Leaf, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { TermsModalReadOnly } from "@/components/legal/TermsModalReadOnly";
import { PrivacyModalReadOnly } from "@/components/legal/PrivacyModalReadOnly";

export function Footer() {
  const t = useTranslations("homepage.footer");
  const currentYear = new Date().getFullYear();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const footerLinks = [
    { href: "#", label: t("links.terms"), onClick: () => setShowTermsModal(true) },
    { href: "#", label: t("links.privacy"), onClick: () => setShowPrivacyModal(true) },
  ];

  return (
    <footer 
      id="footer"
      role="contentinfo"
      className="relative border-t border-eco-leaf/20 bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-emerald-50/80 dark:from-slate-900/80 dark:via-emerald-950/60 dark:to-slate-900/80 mt-auto backdrop-blur-md overflow-hidden"
    >
      {/* Nature-inspired background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-eco-leaf rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-eco-moss rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-eco-sky rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4 py-8 pb-safe relative z-10">
        <div className="flex flex-col gap-8">
          {/* Main Footer Content */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Branding */}
            <div className="flex items-center gap-3 group">
              <div className="relative animate-leaf-float">
                <div className="absolute inset-0 bg-gradient-eco-primary rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                {/* Enhanced visibility with shadow */}
                <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 rounded-full blur-sm" />
                <Image
                  src="/assets/images/sylvan-token-logo.png"
                  alt="Sylvan Token"
                  width={40}
                  height={40}
                  className="relative z-10 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)]"
                  unoptimized
                />
              </div>
              <div className="text-sm">
                <p className="font-bold text-lg bg-gradient-to-r from-eco-leaf via-eco-forest to-eco-leaf bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_1px_2px_rgba(255,255,255,0.1)]">
                  Sylvan Token
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Leaf className="w-3 h-3" />
                  {t("branding.tagline")}
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              {footerLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="text-sm text-emerald-700 dark:text-emerald-300 hover:text-eco-forest dark:hover:text-eco-leaf transition-colors duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-eco-primary group-hover:w-full transition-all duration-300" />
                </button>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <Link
                href="https://twitter.com/sylvantoken"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 text-emerald-600 dark:text-emerald-400 hover:from-emerald-200 hover:to-teal-200 dark:hover:from-emerald-800 dark:hover:to-teal-800 transition-all duration-300 hover:scale-110 hover:rotate-6 shadow-eco hover:shadow-eco-lg"
                aria-label={t("social.twitter")}
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="https://t.me/sylvantoken"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900 dark:to-cyan-900 text-teal-600 dark:text-teal-400 hover:from-teal-200 hover:to-cyan-200 dark:hover:from-teal-800 dark:hover:to-cyan-800 transition-all duration-300 hover:scale-110 hover:rotate-6 shadow-eco hover:shadow-eco-lg"
                aria-label={t("social.telegram")}
              >
                <Send className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-eco-leaf/20">
            {/* Copyright */}
            <div className="text-xs text-emerald-700 dark:text-emerald-300 text-center sm:text-left">
              <p className="font-medium flex items-center gap-1 justify-center sm:justify-start">
                {t("copyright", { year: currentYear })}
                <span className="text-emerald-600 dark:text-emerald-400">•</span>
                <span className="flex items-center gap-1">
                  {t("branding.madeWith")} <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse-eco" /> {t("branding.forNature")}
                </span>
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 justify-center sm:justify-start">
                <Leaf className="w-3 h-3" />
                {t("branding.greenerFuture")}
              </p>
            </div>


          </div>
        </div>
      </div>

      {/* Modals */}
      <TermsModalReadOnly
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      <PrivacyModalReadOnly
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </footer>
  );
}
