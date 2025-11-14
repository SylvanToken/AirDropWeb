import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - Sylvan Token",
  description: "Privacy Policy for Sylvan Token Airdrop Platform",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/register">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Registration
        </Button>
      </Link>

      <div className="prose prose-emerald max-w-none">
        <h1 className="text-3xl font-bold text-gradient-eco mb-6">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: November 9, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Sylvan Token ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Airdrop Platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Personal Information</h3>
          <p className="mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Email address</li>
            <li>Username</li>
            <li>Password (encrypted)</li>
            <li>Wallet address</li>
            <li>Social media usernames (Twitter, Telegram)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Automatically Collected Information</h3>
          <p className="mb-4">
            When you access the Platform, we automatically collect certain information, including:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Login timestamps</li>
            <li>Task completion data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">
            We use the collected information for the following purposes:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>To create and manage your account</li>
            <li>To process task completions and award points</li>
            <li>To distribute tokens to verified wallet addresses</li>
            <li>To verify social media account ownership</li>
            <li>To prevent fraud and ensure platform security</li>
            <li>To communicate important updates about the platform</li>
            <li>To improve our services and user experience</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
          <p className="mb-4">
            We do not sell your personal information. We may share your information in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Public Leaderboard:</strong> Your username and points may be displayed on public leaderboards</li>
            <li><strong>Service Providers:</strong> We may share information with third-party service providers who assist in operating the Platform</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> Information may be transferred in connection with a merger or acquisition</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect your personal information, including:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Password encryption using industry-standard algorithms</li>
            <li>Secure database storage</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication</li>
          </ul>
          <p className="mb-4">
            However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
          <p className="mb-4">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. Account data may be retained even after account deletion for fraud prevention and legal compliance purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
          <p className="mb-4">
            Depending on your location, you may have certain rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Objection:</strong> Object to certain processing of your information</li>
            <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
          </ul>
          <p className="mb-4">
            Note: Certain information (wallet addresses, verified social media accounts) cannot be changed after verification due to security and fraud prevention measures.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to enhance your experience on the Platform. Cookies help us:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Maintain your login session</li>
            <li>Remember your language preferences</li>
            <li>Analyze platform usage and performance</li>
          </ul>
          <p className="mb-4">
            You can control cookies through your browser settings, but disabling cookies may affect platform functionality.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Third-Party Links</h2>
          <p className="mb-4">
            The Platform may contain links to third-party websites or services (such as Twitter, Telegram). We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
          <p className="mb-4">
            The Platform is not intended for users under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete such information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
          <p className="mb-4">
            Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using the Platform, you consent to such transfers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on the Platform and updating the "Last Updated" date. Your continued use of the Platform after such changes constitutes your acceptance of the updated Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us through our official social media channels.
          </p>
        </section>
      </div>
    </div>
  );
}
