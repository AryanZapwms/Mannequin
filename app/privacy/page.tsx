import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Mannequin Care",
  description: "Learn how Mannequin Care collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-400">Last updated: May 2025</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto max-w-3xl px-4 space-y-8 text-gray-700 text-sm leading-relaxed">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">1. Introduction</h2>
            <p>
              Mannequin Care (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your personal
              information. This Privacy Policy explains what data we collect, how we use it, and your
              rights under applicable Indian data protection law.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">2. Information We Collect</h2>
            <p>We may collect the following categories of personal data:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Account data:</strong> name, email address, phone number, password (hashed).</li>
              <li><strong>Order data:</strong> billing/shipping addresses, items purchased, payment references.</li>
              <li><strong>Usage data:</strong> pages visited, browser type, IP address, device info (via cookies).</li>
              <li><strong>Communications:</strong> messages you send us via the contact form or email.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process and fulfil your orders.</li>
              <li>To send transactional emails (order confirmation, shipping updates).</li>
              <li>To respond to your inquiries and provide customer support.</li>
              <li>To improve our website and product offerings.</li>
              <li>To send marketing communications (only with your explicit consent).</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">4. Legal Basis for Processing</h2>
            <p>
              We process your data on the following legal grounds: (a) performance of a contract when
              you place an order; (b) your consent for marketing communications; (c) our legitimate
              interests in running and improving our business; and (d) compliance with legal
              obligations.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">5. Data Sharing</h2>
            <p>We do not sell your personal data. We share it only with:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Payment processors</strong> (Razorpay) to process transactions.</li>
              <li><strong>Shipping partners</strong> to deliver your orders.</li>
              <li><strong>Cloud service providers</strong> (Supabase) that host our platform.</li>
              <li><strong>Legal authorities</strong> when required by law.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">6. Cookies</h2>
            <p>
              We use essential cookies to keep you logged in and maintain your cart. We may use
              analytics cookies (e.g., Google Analytics) to understand how visitors use our Site.
              You can disable cookies in your browser settings, though some features may not function
              correctly.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">7. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. Order data is
              retained for 7 years to comply with Indian accounting and tax laws. You may request
              deletion at any time (see Section 8).
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate or incomplete data.</li>
              <li>Request deletion of your data (&quot;right to be forgotten&quot;).</li>
              <li>Withdraw consent for marketing communications at any time.</li>
              <li>Lodge a complaint with the appropriate data protection authority.</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, email{" "}
              <a href="mailto:privacy@mannequincare.in" className="text-black underline">
                privacy@mannequincare.in
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">9. Security</h2>
            <p>
              We implement industry-standard security measures including SSL encryption, hashed
              passwords, and row-level database security. However, no method of internet transmission
              is 100% secure.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of material changes
              by email or a notice on the Site.
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-5 text-sm">
            <p className="font-semibold text-gray-900">Contact our Privacy Team</p>
            <p className="mt-1">
              Email:{" "}
              <a href="mailto:privacy@mannequincare.in" className="text-black underline">
                privacy@mannequincare.in
              </a>{" "}
              · See also:{" "}
              <Link href="/terms" className="text-black underline">
                Terms &amp; Conditions
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
