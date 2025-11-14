import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { I18nProvider } from "@/components/providers/I18nProvider"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { MotionPreferencesProvider } from "@/components/providers/MotionPreferencesProvider"
import { ThemeProvider, ThemeScript } from "@/components/providers/ThemeProvider"
import { SkipLinks } from "@/components/ui/SkipLinks"
import { KeyboardShortcutsProvider } from "@/components/ui/KeyboardShortcuts"
import { BrowserCompatibilityWarning } from "@/components/ui/BrowserCompatibilityWarning"
import { BrowserDetectionScript } from "@/components/ui/BrowserDetectionScript"
import { Toaster } from "@/components/ui/toaster"
import { SessionBackground } from "@/components/layout/SessionBackground"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sylvan Token Airdrop Platform",
  description: "Complete daily tasks and earn points for Sylvan Token airdrops",
  keywords: ["sylvan", "token", "airdrop", "crypto", "tasks", "rewards"],
  authors: [{ name: "Sylvan Token Team" }],
  creator: "Sylvan Token Team",
  publisher: "Sylvan Token",
  manifest: "/manifest.json",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // Enable safe area support for notched devices
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <BrowserDetectionScript />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <SessionBackground />
        <BrowserCompatibilityWarning />
        <ThemeProvider defaultTheme="system" enableSystem>
          <SessionProvider>
            <I18nProvider>
              <SkipLinks />
              <MotionPreferencesProvider>
                <KeyboardShortcutsProvider>
                  <div className="relative z-10">
                    {children}
                  </div>
                  <Toaster />
                </KeyboardShortcutsProvider>
              </MotionPreferencesProvider>
            </I18nProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
