import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WalletSetup } from "@/components/wallet/WalletSetup";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Wallet, Shield, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function WalletPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const t = await getTranslations("wallet");

  // Get user's wallet status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  }) as {
    id: string;
    email: string;
    username: string;
    role: string;
    walletAddress: string | null;
    walletVerified: boolean;
    totalPoints: number;
    createdAt: Date;
    lastActive: Date;
  } | null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-eco-leaf/5 via-background to-background">
      <div className="max-w-[80%] mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t("setup.title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("setup.description")}
          </p>
        </div>
        <div className="space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-eco-leaf/20 shadow-eco hover:shadow-eco-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-eco-leaf/20 to-eco-forest/20 rounded-lg">
                  <Wallet className="w-5 h-5 text-eco-leaf" />
                </div>
                <div>
                  <p className="text-xs text-eco-forest/70 font-medium">BEP-20</p>
                  <p className="text-sm font-bold text-eco-forest">Binance Chain</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-eco-leaf/20 shadow-eco hover:shadow-eco-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-eco-sky/20 to-eco-leaf/20 rounded-lg">
                  <Shield className="w-5 h-5 text-eco-sky" />
                </div>
                <div>
                  <p className="text-xs text-eco-forest/70 font-medium">Secure</p>
                  <p className="text-sm font-bold text-eco-forest">Permanent Lock</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-eco-leaf/20 shadow-eco hover:shadow-eco-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-eco-earth/20 to-eco-leaf/20 rounded-lg">
                  <Coins className="w-5 h-5 text-eco-earth" />
                </div>
                <div>
                  <p className="text-xs text-eco-forest/70 font-medium">Rewards</p>
                  <p className="text-sm font-bold text-eco-forest">Airdrop Ready</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wallet Setup Component */}
          <WalletSetup
            initialWalletAddress={(user?.walletAddress as string | null) || null}
            initialWalletVerified={(user?.walletVerified as boolean) || false}
          />
        </div>
      </div>
    </div>
  );
}
