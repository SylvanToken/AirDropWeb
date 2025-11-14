"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface WalletConfirmationModalProps {
  isOpen: boolean;
  walletAddress: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function WalletConfirmationModal({
  isOpen,
  walletAddress,
  onConfirm,
  onCancel,
  isLoading,
}: WalletConfirmationModalProps) {
  const t = useTranslations("wallet");
  const [allChecked, setAllChecked] = React.useState(false);
  const [checks, setChecks] = React.useState({
    doubleChecked: false,
    understandPermanent: false,
    haveAccess: false,
    understandBep20: false,
  });

  // Reset checkboxes when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setChecks({
        doubleChecked: false,
        understandPermanent: false,
        haveAccess: false,
        understandBep20: false,
      });
    }
  }, [isOpen]);

  React.useEffect(() => {
    const allAreChecked = Object.values(checks).every(Boolean);
    setAllChecked(allAreChecked);
  }, [checks]);

  const handleCheckChange = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmClick = () => {
    if (!allChecked) {
      return;
    }
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-eco-leaf/20 animate-in zoom-in-95 slide-in-from-bottom-4">
        {/* Header with Eco Theme */}
        <div className="p-6 border-b border-eco-leaf/10 bg-gradient-to-br from-eco-leaf/5 to-eco-forest/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-full shadow-sm">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-eco-forest dark:text-eco-leaf">{t("confirmation.title")}</h2>
              <p className="text-sm text-eco-forest/70 dark:text-eco-leaf/70">{t("confirmation.subtitle")}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Wallet Address Display with Eco Border */}
          <div className="p-4 bg-gradient-to-br from-eco-leaf/5 to-eco-forest/5 border-2 border-eco-leaf/30 rounded-lg">
            <p className="text-xs font-medium text-eco-forest/70 mb-2">{t("confirmation.addressLabel")}</p>
            <p className="text-sm font-mono text-eco-forest dark:text-eco-leaf break-all bg-white dark:bg-slate-800 p-3 rounded-lg border border-eco-leaf/20 shadow-sm">
              {walletAddress}
            </p>
          </div>

          {/* Critical Warning with Nature-Inspired Design */}
          <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-2 border-red-300 dark:border-red-700 rounded-lg space-y-2 shadow-sm">
            <h3 className="text-sm font-bold text-red-900 dark:text-red-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              {t("confirmation.criticalTitle")}
            </h3>
            <ul className="text-xs text-red-800 dark:text-red-200 space-y-1.5 list-disc list-inside ml-1">
              <li dangerouslySetInnerHTML={{ __html: t.raw("confirmation.criticalItems.permanentLock") }} />
              <li dangerouslySetInnerHTML={{ __html: t.raw("confirmation.criticalItems.cannotChange") }} />
              <li>{t("confirmation.criticalItems.rewardsDestination")}</li>
              <li>{t("confirmation.criticalItems.accessRequired")}</li>
              <li>{t("confirmation.criticalItems.verifyCorrect")}</li>
            </ul>
          </div>

          {/* Confirmation Checklist with Eco Theme */}
          <div className="p-4 bg-gradient-to-br from-eco-sky/10 to-eco-leaf/10 border border-eco-sky/30 rounded-lg space-y-2 shadow-sm">
            <h3 className="text-sm font-semibold text-eco-forest dark:text-eco-leaf flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-eco-sky" />
              {t("confirmation.checklistTitle")}
            </h3>
            <div className="space-y-2 text-xs text-eco-forest dark:text-eco-leaf/90">
              <label className="flex items-start gap-2 cursor-pointer hover:bg-eco-leaf/5 p-1 rounded transition-colors">
                <input 
                  type="checkbox" 
                  className="mt-0.5 accent-eco-leaf" 
                  checked={checks.doubleChecked}
                  onChange={() => handleCheckChange('doubleChecked')}
                  disabled={isLoading} 
                />
                <span>{t("confirmation.checklistItems.doubleChecked")}</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer hover:bg-eco-leaf/5 p-1 rounded transition-colors">
                <input 
                  type="checkbox" 
                  className="mt-0.5 accent-eco-leaf" 
                  checked={checks.understandPermanent}
                  onChange={() => handleCheckChange('understandPermanent')}
                  disabled={isLoading} 
                />
                <span>{t("confirmation.checklistItems.understandPermanent")}</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer hover:bg-eco-leaf/5 p-1 rounded transition-colors">
                <input 
                  type="checkbox" 
                  className="mt-0.5 accent-eco-leaf" 
                  checked={checks.haveAccess}
                  onChange={() => handleCheckChange('haveAccess')}
                  disabled={isLoading} 
                />
                <span>{t("confirmation.checklistItems.haveAccess")}</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer hover:bg-eco-leaf/5 p-1 rounded transition-colors">
                <input 
                  type="checkbox" 
                  className="mt-0.5 accent-eco-leaf" 
                  checked={checks.understandBep20}
                  onChange={() => handleCheckChange('understandBep20')}
                  disabled={isLoading} 
                />
                <span>{t("confirmation.checklistItems.understandBep20")}</span>
              </label>
            </div>
          </div>

          {/* Action Buttons with Eco Theme */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 border-eco-leaf/30 hover:bg-eco-leaf/5 hover:border-eco-leaf/50 transition-all duration-300"
            >
              {t("confirmation.cancelButton")}
            </Button>
            <Button
              type="button"
              onClick={handleConfirmClick}
              disabled={isLoading || !allChecked}
              className="flex-1 bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-leaf/90 hover:to-eco-forest/90 text-white shadow-eco hover:shadow-eco-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? t("confirmation.confirmingButton") : t("confirmation.confirmButton")}
            </Button>
          </div>
          
          {!allChecked && !isLoading && (
            <p className="text-xs text-center text-amber-600 dark:text-amber-400 pt-1">
              {t("confirmation.checkAllRequired")}
            </p>
          )}

          <p className="text-xs text-center text-eco-forest/60 dark:text-eco-leaf/60 pt-2">
            {t("confirmation.acknowledgement")}
          </p>
        </div>
      </div>
    </div>
  );
}
