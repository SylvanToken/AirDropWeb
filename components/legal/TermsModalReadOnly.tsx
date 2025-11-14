"use client";

import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface TermsModalReadOnlyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModalReadOnly({ isOpen, onClose }: TermsModalReadOnlyProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("legal.terms");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-eco">
          <h2 className="text-2xl font-bold text-gradient-eco">{t("title")}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6 prose prose-emerald max-w-none"
        >
          <p className="text-sm text-muted-foreground mb-6">{t("lastUpdated")}</p>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">{t("section1.title")}</h3>
            <p>{t("section1.content")}</p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">{t("section2.title")}</h3>
            <p>{t("section2.content")}</p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">{t("section3.title")}</h3>
            <p className="mb-3">{t("section3.intro")}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t("section3.item1")}</li>
              <li>{t("section3.item2")}</li>
              <li>{t("section3.item3")}</li>
              <li>{t("section3.item4")}</li>
              <li>{t("section3.item5")}</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">{t("section4.title")}</h3>
            <p className="mb-3">{t("section4.intro")}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t("section4.item1")}</li>
              <li>{t("section4.item2")}</li>
              <li>{t("section4.item3")}</li>
              <li>{t("section4.item4")}</li>
              <li>{t("section4.item5")}</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">{t("section5.title")}</h3>
            <p className="mb-3">{t("section5.intro")}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t("section5.item1")}</li>
              <li>{t("section5.item2")}</li>
              <li>{t("section5.item3")}</li>
              <li>{t("section5.item4")}</li>
              <li>{t("section5.item5")}</li>
              <li>{t("section5.item6")}</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">{t("section6.title")}</h3>
            <p className="mb-3">{t("section6.intro")}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t("section6.item1")}</li>
              <li>{t("section6.item2")}</li>
              <li>{t("section6.item3")}</li>
              <li>{t("section6.item4")}</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">{t("section7.title")}</h3>
            <p>{t("section7.content")}</p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">{t("section8.title")}</h3>
            <p>{t("section8.content")}</p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">{t("section9.title")}</h3>
            <p>{t("section9.content")}</p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">{t("section10.title")}</h3>
            <p>{t("section10.content")}</p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">{t("section11.title")}</h3>
            <p>{t("section11.content")}</p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">{t("section12.title")}</h3>
            <p>{t("section12.content")}</p>
          </section>
        </div>

        {/* Footer - Only Close Button */}
        <div className="flex items-center justify-center gap-3 p-6 border-t border-eco bg-gray-50 dark:bg-slate-800/50">
          <Button
            onClick={onClose}
            className="gradient-eco-primary"
          >
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
