import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Otter Pizza privacy policy — how we handle your data",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-dark mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted mb-8">
        Last updated: 24 June 2026
      </p>

      <section className="space-y-4 text-dark leading-relaxed">
        <h2 className="text-xl font-semibold mt-8">1. Information We Collect</h2>
        <p>
          When you place an order, we collect your name, email address, phone
          number, and delivery address to process your order and communicate
          with you about its status.
        </p>
        <p>
          We use Google OAuth for staff authentication — only authorised email
          addresses from Otter Group domains can access the admin panel. We do
          not store Google passwords; authentication is handled entirely by
          Google.
        </p>

        <h2 className="text-xl font-semibold mt-8">2. Payment Processing</h2>
        <p>
          Payments are processed securely by HitPay, a licensed payment
          gateway in Singapore. We do not store your credit card or payment
          details on our servers.
        </p>

        <h2 className="text-xl font-semibold mt-8">3. How We Use Your Data</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>To process and fulfill your order</li>
          <li>To communicate order status updates</li>
          <li>To improve our products and services</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">4. Data Retention</h2>
        <p>
          Order data is retained for business records and legal compliance.
          You may request deletion of your personal data by contacting us.
        </p>

        <h2 className="text-xl font-semibold mt-8">5. Contact Us</h2>
        <p>
          For privacy-related inquiries, contact us at{" "}
          <a
            href="mailto:admin@otterpizza.com.sg"
            className="text-primary hover:underline"
          >
            admin@otterpizza.com.sg
          </a>
          .
        </p>
      </section>
    </div>
  );
}
