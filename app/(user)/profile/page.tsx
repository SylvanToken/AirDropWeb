"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Wallet, CheckCircle, AlertCircle, Calendar, Trophy, Share2, Copy, Check } from "lucide-react";
import { LoadingState } from "@/components/ui/loading";
import { SocialMediaSetup } from "@/components/profile/SocialMediaSetup";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { EmailPreferences } from "@/components/profile/EmailPreferences";
import { TwitterConnectButton } from "@/components/twitter/TwitterConnectButton";
import { TwitterConnectionStatus } from "@/components/twitter/TwitterConnectionStatus";
import { useTranslations } from "next-intl";
import { formatDateTime } from "@/lib/i18n/formatting";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  walletAddress: string | null;
  walletVerified: boolean;
  twitterUsername: string | null;
  twitterVerified: boolean;
  telegramUsername: string | null;
  telegramVerified: boolean;
  referralCode: string | null;
  totalPoints: number;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locale, setLocale] = useState("en");
  const [copied, setCopied] = useState(false);
  const [twitterConnection, setTwitterConnection] = useState<{
    connected: boolean;
    username?: string;
    twitterId?: string;
    tokenExpired?: boolean;
  }>({ connected: false });
  const t = useTranslations("profile");

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") || "en";
    setLocale(savedLocale);
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchTwitterConnection();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/users/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTwitterConnection = async () => {
    try {
      const response = await fetch('/api/auth/twitter/status');
      if (response.ok) {
        const data = await response.json();
        setTwitterConnection({
          connected: data.connected,
          username: data.username,
          twitterId: data.twitterId,
          tokenExpired: data.tokenExpired,
        });
      } else {
        setTwitterConnection({ connected: false });
      }
    } catch (error) {
      console.error('Failed to fetch Twitter connection:', error);
      setTwitterConnection({ connected: false });
    }
  };

  const copyReferralCode = async () => {
    if (profile?.referralCode) {
      try {
        await navigator.clipboard.writeText(profile.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!profile) {
    return (
      <div className="max-w-[80%] mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">{t("error")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-eco-leaf/5 via-background to-background">
      <div className="max-w-[80%] mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-eco-forest via-eco-leaf to-eco-forest bg-clip-text text-transparent mb-2">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Avatar and Quick Stats */}
          <div className="space-y-6">
            {/* Avatar Upload */}
            <AvatarUpload
              currentAvatar={profile.avatarUrl}
              username={profile.username}
            />

            {/* Wallet Status Card */}
            <Card className="border-eco-leaf/20 shadow-eco hover:shadow-eco-lg transition-all duration-300 bg-card/90">
              <CardHeader className="space-y-1 bg-gradient-to-br from-eco-leaf/5 to-eco-forest/5 border-b border-eco-leaf/10 bg-opacity-90">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-eco-leaf" />
                  {t("wallet.title")}
                </CardTitle>
                <CardDescription className="text-eco-forest/70">
                  {t("wallet.description")}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 bg-opacity-90">
                {profile.walletVerified && profile.walletAddress ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-eco-leaf neon-glow-green">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{t("wallet.verified")}</span>
                    </div>
                    <div className="p-3 bg-eco-leaf/10 rounded-lg border border-eco-leaf/20">
                      <p className="text-xs font-mono text-eco-forest break-all">
                        {profile.walletAddress}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-sm font-medium">{t("wallet.notSet")}</p>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {t("wallet.notSetDescription")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Referral Code Card */}
            <Card className="border-eco-leaf/20 shadow-eco hover:shadow-eco-lg transition-all duration-300 bg-card/90">
              <CardHeader className="space-y-1 bg-gradient-to-br from-eco-leaf/5 to-eco-forest/5 border-b border-eco-leaf/10 bg-opacity-90">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-eco-leaf" />
                  {t("referral.title")}
                </CardTitle>
                <CardDescription className="text-eco-forest/70">
                  {t("referral.description")}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 bg-opacity-90">
                {profile.referralCode ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-eco-leaf/10 to-eco-forest/10 rounded-lg border border-eco-leaf/20">
                      <p className="text-2xl font-bold font-mono text-eco-forest text-center tracking-wider">
                        {profile.referralCode}
                      </p>
                    </div>
                    <button
                      onClick={copyReferralCode}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-eco-leaf to-eco-forest hover:from-eco-forest hover:to-eco-leaf text-white rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          {t("referral.copied")}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {t("referral.copyButton")}
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-300 text-center">
                      {t("referral.notGenerated")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Info and Social Media */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <Card className="border-eco-leaf/20 shadow-eco hover:shadow-eco-lg transition-all duration-300 bg-card/90">
              <CardHeader className="space-y-1 bg-gradient-to-br from-eco-leaf/5 to-eco-forest/5 border-b border-eco-leaf/10 bg-opacity-90">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-eco-forest to-eco-leaf bg-clip-text text-transparent">
                  {t("accountInfo.title")}
                </CardTitle>
                <CardDescription className="text-eco-forest/70">
                  {t("accountInfo.description")}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 bg-opacity-90">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-eco-forest font-medium text-sm">
                      <User className="w-4 h-4 text-eco-leaf" />
                      {t("accountInfo.username")}
                    </label>
                    <div className="px-4 py-3 bg-gradient-to-r from-eco-leaf/10 to-eco-forest/10 rounded-lg border border-eco-leaf/20 depth-4k-1 transition-all duration-300 hover:depth-4k-2">
                      <p className="text-eco-forest font-medium">{profile.username}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-eco-forest font-medium text-sm">
                      <Mail className="w-4 h-4 text-eco-leaf" />
                      {t("accountInfo.email")}
                    </label>
                    <div className="px-4 py-3 bg-gradient-to-r from-eco-leaf/10 to-eco-forest/10 rounded-lg border border-eco-leaf/20 depth-4k-1 transition-all duration-300 hover:depth-4k-2">
                      <p className="text-eco-forest font-medium break-all text-sm">{profile.email}</p>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-eco-forest font-medium text-sm">
                      <Calendar className="w-4 h-4 text-eco-leaf" />
                      {t("accountInfo.memberSince")}
                    </label>
                    <div className="px-4 py-3 bg-gradient-to-r from-eco-leaf/10 to-eco-forest/10 rounded-lg border border-eco-leaf/20 depth-4k-1 transition-all duration-300 hover:depth-4k-2">
                      <p className="text-eco-forest font-medium">
                        {formatDateTime(new Date(profile.createdAt), locale, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Total Points */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-eco-forest font-medium text-sm">
                      <Trophy className="w-4 h-4 text-eco-leaf" />
                      {t("accountInfo.totalPoints")}
                    </label>
                    <div className="px-4 py-3 bg-gradient-to-r from-eco-leaf/10 to-eco-forest/10 rounded-lg border border-eco-leaf/20 depth-4k-1 transition-all duration-300 hover:depth-4k-2">
                      <p className="text-2xl font-bold bg-gradient-to-r from-eco-forest to-eco-leaf bg-clip-text text-transparent">
                        {profile.totalPoints.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Accounts - Combined */}
            <Card className="border-eco-leaf/20 shadow-eco hover:shadow-eco-lg transition-all duration-300 bg-card/90">
              <CardHeader className="space-y-1 bg-gradient-to-br from-eco-leaf/5 to-eco-forest/5 border-b border-eco-leaf/10 bg-opacity-90">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-eco-forest to-eco-leaf bg-clip-text text-transparent">
                  {t("socialMedia.title")}
                </CardTitle>
                <CardDescription className="text-eco-forest/70">
                  {t("socialMedia.description")}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6 bg-opacity-90">
                {/* Twitter OAuth Connection Section */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-eco-forest">Twitter (OAuth)</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your Twitter account for automatic task verification
                  </p>
                  {twitterConnection.connected ? (
                    <TwitterConnectionStatus
                      connected={twitterConnection.connected}
                      username={twitterConnection.username}
                      twitterId={twitterConnection.twitterId}
                      tokenExpired={twitterConnection.tokenExpired}
                      onDisconnect={() => {
                        setTwitterConnection({ connected: false });
                      }}
                      onReconnect={() => {
                        window.location.href = '/api/auth/twitter/authorize';
                      }}
                    />
                  ) : (
                    <div className="p-4 border border-eco-leaf/20 rounded-lg bg-gradient-to-r from-eco-leaf/5 to-eco-forest/5">
                      <p className="text-sm text-muted-foreground mb-3">
                        Connect your Twitter account to enable automatic verification for follow, 
                        like, and retweet tasks. This will make completing Twitter tasks much faster!
                      </p>
                      <TwitterConnectButton
                        onSuccess={() => {
                          fetchTwitterConnection();
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Twitter Section (Legacy) */}
                <div className="space-y-3">
                  <SocialMediaSetup
                    type="twitter"
                    username={profile.twitterUsername}
                    verified={profile.twitterVerified}
                    onUpdate={fetchProfile}
                  />
                </div>

                {/* Telegram Section */}
                <div className="space-y-3">
                  <SocialMediaSetup
                    type="telegram"
                    username={profile.telegramUsername}
                    verified={profile.telegramVerified}
                    onUpdate={fetchProfile}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Email Preferences */}
            <EmailPreferences />
          </div>
        </div>
      </div>
    </div>
  );
}
