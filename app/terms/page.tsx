import type { Metadata } from "next";
import Link from "next/link";
import LegalPageHero from "@/components/LegalPageHero";
import RevealWrapper from "@/components/RevealWrapper";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Read the Terms & Conditions governing use of the Mannequin Care website and services.",
};

const link = "text-brand-copper underline underline-offset-2 transition-colors hover:text-brand-gold-600";
const heading = "mb-2 font-sub text-base font-semibold uppercase tracking-[0.05em] text-brand-espresso";
const body = "font-body text-sm leading-relaxed text-brand-body";
const list = "mt-2 list-disc space-y-1 pl-5 font-body text-sm leading-relaxed text-brand-body";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <LegalPageHero title="Terms & Conditions" lastUpdated="May 2025" />

      <section className="w-full bg-white">
        <RevealWrapper>
          <div className="mx-auto max-w-[760px] space-y-8 px-6 py-[clamp(48px,6vw,80px)]">
            <div>
              <h2 className={heading}>1. Acceptance of Terms</h2>
              <p className={body}>
                By accessing or using the Mannequin Care website (&quot;Site&quot;) or purchasing
                our products, you agree to be bound by these Terms &amp; Conditions. If you do not
                agree, please do not use the Site.
              </p>
            </div>

            <div>
              <h2 className={heading}>2. Use of the Site</h2>
              <p className={body}>You agree to use the Site only for lawful purposes. You must not:</p>
              <ul className={list}>
                <li>Use the Site in any way that violates applicable local, national, or international law.</li>
                <li>Transmit unsolicited commercial communications.</li>
                <li>Attempt to gain unauthorised access to any part of the Site.</li>
                <li>Engage in scraping, data mining, or similar data-extraction activities.</li>
              </ul>
            </div>

            <div>
              <h2 className={heading}>3. Orders and Payments</h2>
              <p className={body}>
                All prices are listed in Indian Rupees (₹) and are inclusive of applicable GST
                unless stated otherwise. We reserve the right to refuse or cancel any order at our
                discretion. Payment is processed securely through Razorpay or collected as Cash on
                Delivery (COD).
              </p>
            </div>

            <div>
              <h2 className={heading}>4. Shipping</h2>
              <p className={body}>
                We ship across India. Estimated delivery times are 3–7 business days. Delivery
                times are estimates only and not guaranteed. Mannequin Care is not responsible for
                delays caused by third-party couriers or force majeure events.
              </p>
            </div>

            <div>
              <h2 className={heading}>5. Returns and Refunds</h2>
              <p className={body}>
                Our returns and refund policy is set out in our{" "}
                <Link href="/returns" className={link}>
                  Returns Policy
                </Link>
                , which forms part of these Terms.
              </p>
            </div>

            <div>
              <h2 className={heading}>6. Intellectual Property</h2>
              <p className={body}>
                All content on the Site — including text, graphics, logos, product images, and
                software — is the property of Mannequin Care and is protected by Indian and
                international intellectual property laws. You may not reproduce, distribute, or
                create derivative works without our prior written consent.
              </p>
            </div>

            <div>
              <h2 className={heading}>7. Disclaimer of Warranties</h2>
              <p className={body}>
                The Site and its content are provided &quot;as is&quot; without warranty of any
                kind. We do not warrant that the Site will be uninterrupted or error-free. Product
                results may vary between individuals.
              </p>
            </div>

            <div>
              <h2 className={heading}>8. Limitation of Liability</h2>
              <p className={body}>
                To the maximum extent permitted by law, Mannequin Care shall not be liable for any
                indirect, incidental, or consequential damages arising from your use of the Site
                or our products. Our total liability shall not exceed the value of the order that
                gave rise to the claim.
              </p>
            </div>

            <div>
              <h2 className={heading}>9. Governing Law</h2>
              <p className={body}>
                These Terms are governed by the laws of India. Any disputes shall be subject to the
                exclusive jurisdiction of the courts of Mumbai, Maharashtra.
              </p>
            </div>

            <div>
              <h2 className={heading}>10. Changes to Terms</h2>
              <p className={body}>
                We reserve the right to update these Terms at any time. Continued use of the Site
                after changes are posted constitutes your acceptance of the revised Terms.
              </p>
            </div>

            <div className="rounded-card border border-brand-sand bg-brand-linen p-6">
              <p className="font-sub text-sm font-semibold text-brand-espresso">Questions?</p>
              <p className={`mt-1 ${body}`}>
                Email us at{" "}
                <a href="mailto:legal@mannequincare.in" className={link}>
                  legal@mannequincare.in
                </a>{" "}
                or visit our{" "}
                <Link href="/contact-us" className={link}>
                  Contact page
                </Link>
                .
              </p>
            </div>
          </div>
        </RevealWrapper>
      </section>
    </div>
  );
}
