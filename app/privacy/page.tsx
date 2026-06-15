import type { Metadata } from "next";
import Link from "next/link";
import LegalPageHero from "@/components/LegalPageHero";
import RevealWrapper from "@/components/RevealWrapper";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Mannequin Care collects, uses, and protects your personal data.",
};

const link = "text-brand-copper underline underline-offset-2 transition-colors hover:text-brand-gold-600";
const heading = "mb-2 font-sub text-base font-semibold uppercase tracking-[0.05em] text-brand-espresso";
const body = "font-body text-sm leading-relaxed text-brand-body";
const list = "list-disc space-y-1 pl-5 font-body text-sm leading-relaxed text-brand-body";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <LegalPageHero title="Privacy Policy" lastUpdated="May 2025" />

      <section className="w-full bg-white">
        <RevealWrapper>
          <div className="mx-auto max-w-[760px] space-y-8 px-6 py-[clamp(48px,6vw,80px)]">
            <div>
              <h2 className={heading}>1. Introduction</h2>
              <p className={body}>
                Mannequin Care (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to
                protecting your personal information. This Privacy Policy explains what data we
                collect, how we use it, and your rights under applicable Indian data protection
                law.
              </p>
            </div>

            <div>
              <h2 className={heading}>2. Information We Collect</h2>
              <p className={body}>We may collect the following categories of personal data:</p>
              <ul className={`mt-2 ${list}`}>
                <li><strong>Account data:</strong> name, email address, phone number, password (hashed).</li>
                <li><strong>Order data:</strong> billing/shipping addresses, items purchased, payment references.</li>
                <li><strong>Usage data:</strong> pages visited, browser type, IP address, device info (via cookies).</li>
                <li><strong>Communications:</strong> messages you send us via the contact form or email.</li>
              </ul>
            </div>

            <div>
              <h2 className={heading}>3. How We Use Your Data</h2>
              <ul className={list}>
                <li>To process and fulfil your orders.</li>
                <li>To send transactional emails (order confirmation, shipping updates).</li>
                <li>To respond to your inquiries and provide customer support.</li>
                <li>To improve our website and product offerings.</li>
                <li>To send marketing communications (only with your explicit consent).</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </div>

            <div>
              <h2 className={heading}>4. Legal Basis for Processing</h2>
              <p className={body}>
                We process your data on the following legal grounds: (a) performance of a
                contract when you place an order; (b) your consent for marketing communications;
                (c) our legitimate interests in running and improving our business; and (d)
                compliance with legal obligations.
              </p>
            </div>

            <div>
              <h2 className={heading}>5. Data Sharing</h2>
              <p className={body}>We do not sell your personal data. We share it only with:</p>
              <ul className={`mt-2 ${list}`}>
                <li><strong>Payment processors</strong> (Razorpay) to process transactions.</li>
                <li><strong>Shipping partners</strong> to deliver your orders.</li>
                <li><strong>Cloud service providers</strong> (Supabase) that host our platform.</li>
                <li><strong>Legal authorities</strong> when required by law.</li>
              </ul>
            </div>

            <div>
              <h2 className={heading}>6. Cookies</h2>
              <p className={body}>
                We use essential cookies to keep you logged in and maintain your cart. We may use
                analytics cookies (e.g., Google Analytics) to understand how visitors use our
                Site. You can disable cookies in your browser settings, though some features may
                not function correctly.
              </p>
            </div>

            <div>
              <h2 className={heading}>7. Data Retention</h2>
              <p className={body}>
                We retain your account data for as long as your account is active. Order data is
                retained for 7 years to comply with Indian accounting and tax laws. You may
                request deletion at any time (see Section 8).
              </p>
            </div>

            <div>
              <h2 className={heading}>8. Your Rights</h2>
              <p className={body}>You have the right to:</p>
              <ul className={`mt-2 ${list}`}>
                <li>Access the personal data we hold about you.</li>
                <li>Correct inaccurate or incomplete data.</li>
                <li>Request deletion of your data (&quot;right to be forgotten&quot;).</li>
                <li>Withdraw consent for marketing communications at any time.</li>
                <li>Lodge a complaint with the appropriate data protection authority.</li>
              </ul>
              <p className={`mt-2 ${body}`}>
                To exercise these rights, email{" "}
                <a href="mailto:privacy@mannequincare.in" className={link}>
                  privacy@mannequincare.in
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className={heading}>9. Security</h2>
              <p className={body}>
                We implement industry-standard security measures including SSL encryption, hashed
                passwords, and row-level database security. However, no method of internet
                transmission is 100% secure.
              </p>
            </div>

            <div>
              <h2 className={heading}>10. Changes to This Policy</h2>
              <p className={body}>
                We may update this Privacy Policy periodically. We will notify you of material
                changes by email or a notice on the Site.
              </p>
            </div>

            <div className="rounded-card border border-brand-sand bg-brand-linen p-6">
              <p className="font-sub text-sm font-semibold text-brand-espresso">
                Contact our Privacy Team
              </p>
              <p className={`mt-1 ${body}`}>
                Email:{" "}
                <a href="mailto:privacy@mannequincare.in" className={link}>
                  privacy@mannequincare.in
                </a>{" "}
                · See also:{" "}
                <Link href="/terms" className={link}>
                  Terms &amp; Conditions
                </Link>
              </p>
            </div>
          </div>
        </RevealWrapper>
      </section>
    </div>
  );
}
