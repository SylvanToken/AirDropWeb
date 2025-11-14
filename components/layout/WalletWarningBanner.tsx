"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WalletWarningBanner() {
  const [walletStatus, setWalletStatus] = useState<{
    hasWallet: boolean;
    isVerified: boolean;
  } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem("walletBannerDismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
      setIsLoading(false);
      return;
    }

    // Fetch wallet status (disable cache to get fresh data)
    fetch("/api/users/wallet", {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch wallet status');
        }
        return res.json();
      })
      .then((data) => {
        console.log('[WalletBanner] API Response:', data);
        const hasWallet = !!data.walletAddress;
        const isVerified = data.walletVerified === true;
        
        setWalletStatus({
          hasWallet,
          isVerified,
        });
        setIsLoading(false);
        
        // If wallet is verified, auto-dismiss permanently
        if (isVerified) {
          sessionStorage.setItem("walletBannerDismissed", "true");
          setIsDismissed(true);
        }
      })
      .catch((error) => {
        console.error('[WalletBanner] Error fetching wallet status:', error);
        // On error, don't show banner (fail silently)
        setIsLoading(false);
        setIsDismissed(true);
      });
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("walletBannerDismissed", "true");
  };

  // Don't show banner if:
  // 1. Still loading
  // 2. User dismissed it
  // 3. Wallet is verified
  // 4. No wallet status data (error case)
  if (isLoading || isDismissed || !walletStatus) {
    return null;
  }

  // Don't show if wallet is verified
  if (walletStatus.isVerified) {
    return null;
  }

  // Show warning only if wallet is not set
  if (!walletStatus.hasWallet) {
    return (
      <div className="bg-amber-500 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Action Required: Add Your Wallet Address
                </p>
                <p className="text-xs opacity-90 mt-0.5">
                  You need to add your BEP-20 wallet address to receive airdrop rewards
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/wallet">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white text-amber-900 hover:bg-amber-50"
                >
                  Add Wallet
                </Button>
              </Link>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-amber-600 rounded transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
