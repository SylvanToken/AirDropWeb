import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Use - Sylvan Token",
  description: "Terms of Use for Sylvan Token Airdrop Platform",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/register">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Registration
        </Button>
      </Link>

      <div className="prose prose-emerald max-w-none">
        <h1 className="text-3xl font-bold text-gradient-eco mb-6">Terms of Use</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: November 9, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using the Sylvan Token Airdrop Platform ("Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Use, please do not use the Platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
          <p className="mb-4">
            You must be at least 18 years old to use this Platform. By using the Platform, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
          <p className="mb-4">
            To participate in the airdrop program, you must create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Maintain the security of your password and account</li>
            <li>Accept responsibility for all activities that occur under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Task Completion and Rewards</h2>
          <p className="mb-4">
            The Platform allows you to complete various tasks to earn points and participate in the Sylvan Token airdrop:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Tasks must be completed genuinely and in accordance with the task requirements</li>
            <li>Points are awarded upon successful verification of task completion</li>
            <li>We reserve the right to verify task completion and revoke points for fraudulent activity</li>
            <li>Token distribution is subject to campaign rules and may change without notice</li>
            <li>We do not guarantee any specific value or utility of distributed tokens</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Prohibited Activities</h2>
          <p className="mb-4">
            You agree not to engage in any of the following prohibited activities:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Creating multiple accounts or using automated systems (bots)</li>
            <li>Providing false information or impersonating others</li>
            <li>Attempting to manipulate or exploit the point system</li>
            <li>Engaging in fraudulent task completion</li>
            <li>Violating any applicable laws or regulations</li>
            <li>Interfering with the Platform's operation or security</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Wallet and Social Media Verification</h2>
          <p className="mb-4">
            To receive tokens, you must verify your wallet address and complete social media verifications:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Wallet addresses and social media accounts are permanently locked after verification</li>
            <li>You are responsible for ensuring the accuracy of your wallet address</li>
            <li>We are not responsible for tokens sent to incorrect addresses</li>
            <li>Social media accounts must be genuine and owned by you</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
          <p className="mb-4">
            All content on the Platform, including text, graphics, logos, and software, is the property of Sylvan Token and is protected by intellectual property laws. You may not use, reproduce, or distribute any content without our express written permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
          <p className="mb-4">
            THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
          <p className="mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, SYLVAN TOKEN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Modifications to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on the Platform. Your continued use of the Platform after such modifications constitutes your acceptance of the updated Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
          <p className="mb-4">
            We reserve the right to suspend or terminate your account at any time, with or without notice, for any reason, including violation of these Terms. Upon termination, your right to use the Platform will immediately cease.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us through our official social media channels.
          </p>
        </section>
      </div>
    </div>
  );
}
