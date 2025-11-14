"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { validateBEP20AddressWithMessage, maskWalletAddress } from "@/lib/wallet-validation";
import { WalletConfirmationModal } from "./WalletConfirmationModal";
import { useTranslations } from "next-intl";

interface WalletSetupProps {
  initialWalletAddress: string | null;
  initialWalletVerified: boolean;
}

export function WalletSetup({ initialWalletAddress, initialWalletVerified }: WalletSetupProps) {
  const [walletAddress, setWalletAddress] = useState(initialWalletAddress || "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tempWalletAddress, setTempWalletAddress] = useState("");
  const t = useTranslations("wallet");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate wallet address
    const validationError = validateBEP20AddressWithMessage(walletAddress);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Store temp address and show confirmation modal
    setTempWalletAddress(walletAddress);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log('[WalletSetup] Starting wallet confirmation process...');
      console.log('[WalletSetup] Wallet address:', tempWalletAddress);

      // Save wallet address
      console.log('[WalletSetup] Step 1: Saving wallet address...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch("/api/users/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: tempWalletAddress }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();
        console.log('[WalletSetup] Step 1 response:', { status: response.status, data });

        if (!response.ok) {
          // Provide detailed error messages based on error type
          let errorMessage = data.message || "Failed to save wallet address";
          
          if (data.error === "Wallet Already Set") {
            errorMessage = t("errors.walletAlreadySet");
          } else if (data.error === "Wallet In Use") {
            errorMessage = t("errors.walletInUse");
          } else if (data.error === "Invalid Address") {
            errorMessage = t("errors.invalidAddress");
          } else if (data.error === "Validation Error") {
            errorMessage = t("errors.validationError");
          }
          
          console.error('[WalletSetup] Step 1 failed:', errorMessage);
          throw new Error(errorMessage);
        }

        console.log('[WalletSetup] Step 1 successful, wallet saved');
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timeout. Please try again.');
        }
        throw fetchError;
      }

      // Verify wallet address
      console.log('[WalletSetup] Step 2: Verifying wallet address...');
      const verifyController = new AbortController();
      const verifyTimeoutId = setTimeout(() => verifyController.abort(), 30000);

      try {
        const verifyResponse = await fetch("/api/users/wallet", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          signal: verifyController.signal,
        });

        clearTimeout(verifyTimeoutId);

        const verifyData = await verifyResponse.json();
        console.log('[WalletSetup] Step 2 response:', { status: verifyResponse.status, data: verifyData });

        if (!verifyResponse.ok) {
          let errorMessage = verifyData.message || "Failed to verify wallet address";
          
          if (verifyData.error === "No Wallet") {
            errorMessage = t("errors.noWallet");
          } else if (verifyData.error === "Already Verified") {
            errorMessage = t("errors.alreadyVerified");
          }
          
          console.error('[WalletSetup] Step 2 failed:', errorMessage);
          throw new Error(errorMessage);
        }

        console.log('[WalletSetup] Step 2 successful, wallet verified');
      } catch (fetchError) {
        clearTimeout(verifyTimeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timeout. Please try again.');
        }
        throw fetchError;
      }

      console.log('[WalletSetup] Reloading page to show verified status...');

      // Success - reload page to show verified status
      window.location.href = window.location.href;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("errors.unknown");
      console.error('[WalletSetup] Error during confirmation:', err);
      setError(errorMessage);
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setTempWalletAddress("");
  };

  // If wallet is already verified, show read-only view
  if (initialWalletVerified && initialWalletAddress) {
    return (
      <Card className="border-eco-leaf/20 shadow-eco hover:shadow-eco-lg transition-all duration-300">
        <CardHeader className="space-y-1 bg-gradient-to-br from-eco-leaf/5 to-eco-forest/5 border-b border-eco-leaf/10">
          <CardTitle className="flex items-center gap-2 text-eco-forest">
            <CheckCircle className="w-5 h-5 text-eco-leaf" />
            {t("setup.verifiedTitle")}
          </CardTitle>
          <CardDescription className="text-eco-forest/70">
            {t("setup.verifiedDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="p-4 bg-gradient-to-br from-eco-leaf/10 to-eco-forest/10 border border-eco-leaf/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Wallet className="w-5 h-5 text-eco-leaf mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-eco-forest">{t("setup.verifiedLabel")}</p>
                <p className="text-sm text-eco-forest/80 font-mono mt-1 break-all">
                  {initialWalletAddress}
                </p>
                <p className="text-xs text-eco-forest/60 mt-2">
                  {t("setup.verifiedNote")}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-eco-sky/10 to-eco-leaf/10 border border-eco-sky/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-eco-sky mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-eco-forest">{t("setup.airdropInfoTitle")}</p>
                <p className="text-xs text-eco-forest/70 mt-1">
                  {t("setup.airdropInfoText")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-eco-leaf/20 shadow-eco hover:shadow-eco-lg transition-all duration-300">
        <CardHeader className="space-y-1 bg-gradient-to-br from-eco-leaf/5 to-eco-forest/5 border-b border-eco-leaf/10">
          <CardTitle className="flex items-center gap-2 text-eco-forest">
            <Wallet className="w-5 h-5 text-eco-leaf" />
            {t("setup.title")}
          </CardTitle>
          <CardDescription className="text-eco-forest/70">
            {t("setup.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Warning Box with Nature Icon */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-2 border-amber-300 dark:border-amber-700 rounded-lg space-y-2 shadow-sm">
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                {t("setup.warningTitle")}
              </h4>
              <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1.5 list-disc list-inside ml-1">
                <li dangerouslySetInnerHTML={{ __html: t.raw("setup.warningItems.bep20Only") }} />
                <li dangerouslySetInnerHTML={{ __html: t.raw("setup.warningItems.permanentLock") }} />
                <li dangerouslySetInnerHTML={{ __html: t.raw("setup.warningItems.cannotChange") }} />
                <li>{t("setup.warningItems.doubleCheck")}</li>
                <li>{t("setup.warningItems.rewardsDestination")}</li>
              </ul>
            </div>

            {/* Info Box with Eco Theme */}
            <div className="p-4 bg-gradient-to-br from-eco-sky/10 to-eco-leaf/10 border border-eco-sky/30 rounded-lg shadow-sm">
              <h4 className="text-sm font-semibold text-eco-forest flex items-center gap-2">
                <Info className="w-5 h-5 text-eco-sky" />
                {t("setup.infoTitle")}
              </h4>
              <p className="text-xs text-eco-forest/80 mt-2">
                {t("setup.infoDescription")}
              </p>
              <ul className="text-xs text-eco-forest/80 mt-2 space-y-1 list-disc list-inside ml-1">
                <li>{t("setup.infoItems.startsWith")} <code className="bg-eco-leaf/20 px-1.5 py-0.5 rounded text-eco-forest font-mono">0x</code></li>
                <li>{t("setup.infoItems.length")}</li>
                <li>{t("setup.infoItems.characters")}</li>
              </ul>
              <p className="text-xs text-eco-forest/80 mt-2">
                {t("setup.infoExample")} <code className="bg-eco-leaf/20 px-1.5 py-0.5 rounded text-[10px] font-mono text-eco-forest">0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb</code>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="walletAddress" className="text-eco-forest font-medium">
                {t("setup.walletLabel")}
              </Label>
              <Input
                id="walletAddress"
                name="walletAddress"
                type="text"
                placeholder={t("setup.walletPlaceholder")}
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value.trim())}
                required
                disabled={isLoading}
                className="font-mono text-sm border-eco-leaf/30 focus:border-eco-leaf focus:ring-eco-leaf/20"
              />
              <p className="text-xs text-eco-forest/60">
                {t("setup.walletHelp")}
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-leaf/90 hover:to-eco-forest/90 text-white shadow-eco hover:shadow-eco-lg transition-all duration-300 hover:scale-[1.02]" 
              disabled={isLoading}
            >
              {isLoading ? t("setup.processingButton") : t("setup.continueButton")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <WalletConfirmationModal
        isOpen={showConfirmModal}
        walletAddress={tempWalletAddress}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </>
  );
}
