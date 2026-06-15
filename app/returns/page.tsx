import type { Metadata } from "next";
import Link from "next/link";
import LegalPageHero from "@/components/LegalPageHero";
import RevealWrapper from "@/components/RevealWrapper";

export const metadata: Metadata = {
  title: "Returns Policy",
  description: "Understand our hassle-free returns and refund policy at Mannequin Care.",
};

const link = "text-brand-copper underline underline-offset-2 transition-colors hover:text-brand-gold-600";
const heading = "mb-2 font-sub text-base font-semibold uppercase tracking-[0.05em] text-brand-espresso";
const body = "font-body text-sm leading-relaxed text-brand-body";
const list = "list-disc space-y-1 pl-5 font-body text-sm leading-relaxed text-brand-body";
const orderedList = "list-decimal space-y-2 pl-5 font-body text-sm leading-relaxed text-brand-body";

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <LegalPageHero title="Returns Policy" lastUpdated="May 2025" />

      <section className="w-full bg-white">
        <RevealWrapper>
          <div className="mx-auto max-w-[760px] space-y-8 px-6 py-[clamp(48px,6vw,80px)]">
            <div>
              <h2 className={heading}>1. Our 30-Day Return Promise</h2>
              <p className={body}>
                We stand behind every product we sell. If you are not 100% satisfied with your
                purchase, you may return eligible items within <strong>30 days</strong> of the
                delivery date for a full refund or exchange — no questions asked.
              </p>
            </div>

            <div>
              <h2 className={heading}>2. Eligibility</h2>
              <p className={body}>To be eligible for a return, your item must be:</p>
              <ul className={`mt-2 ${list}`}>
                <li>Unused and in the same condition you received it.</li>
                <li>In its original packaging with all seals intact.</li>
                <li>Returned within 30 days of the delivery date.</li>
                <li>Accompanied by a valid order number or receipt.</li>
              </ul>
              <p className={`mt-3 ${body}`}>
                Opened or used personal care products are eligible for return only if the product
                is defective, damaged on arrival, or not as described.
              </p>
            </div>

            <div>
              <h2 className={heading}>3. Non-Returnable Items</h2>
              <ul className={list}>
                <li>Gift cards and promotional vouchers.</li>
                <li>Items purchased during final-sale events (marked &quot;No Returns&quot;).</li>
                <li>Products that show signs of use, damage, or tampering by the customer.</li>
              </ul>
            </div>

            <div>
              <h2 className={heading}>4. How to Initiate a Return</h2>
              <ol className={orderedList}>
                <li>
                  Email us at{" "}
                  <a href="mailto:returns@mannequincare.in" className={link}>
                    returns@mannequincare.in
                  </a>{" "}
                  with your order number and reason for return.
                </li>
                <li>
                  Our team will respond within 2 business days with a return authorisation and
                  shipping instructions.
                </li>
                <li>Pack the item securely and drop it off at your nearest courier.</li>
                <li>
                  Once we receive and inspect the item, your refund will be processed within 5–7
                  business days.
                </li>
              </ol>
            </div>

            <div>
              <h2 className={heading}>5. Refunds</h2>
              <p className={body}>
                Approved refunds are credited back to your original payment method. For COD
                orders, refunds are issued via bank transfer (NEFT/IMPS) within 7 business days.
              </p>
              <p className={`mt-2 ${body}`}>
                Shipping charges are non-refundable unless the return is due to our error (damaged
                or wrong item).
              </p>
            </div>

            <div>
              <h2 className={heading}>6. Exchanges</h2>
              <p className={body}>
                We offer free exchanges for defective or incorrect items. If you wish to exchange
                for a different product, a new order must be placed and the original item returned
                for a refund.
              </p>
            </div>

            <div>
              <h2 className={heading}>7. Damaged or Defective Items</h2>
              <p className={body}>
                If your order arrives damaged or defective, please photograph the item and
                packaging and email{" "}
                <a href="mailto:support@mannequincare.in" className={link}>
                  support@mannequincare.in
                </a>{" "}
                within 48 hours of delivery. We will arrange a replacement or full refund at no
                cost to you.
              </p>
            </div>

            <div className="rounded-card border border-brand-sand bg-brand-linen p-6">
              <p className="font-sub text-sm font-semibold text-brand-espresso">
                Still have questions?
              </p>
              <p className={`mt-1 ${body}`}>
                Contact us at{" "}
                <a href="mailto:support@mannequincare.in" className={link}>
                  support@mannequincare.in
                </a>{" "}
                or visit our{" "}
                <Link href="/contact-us" className={link}>
                  Contact Us
                </Link>{" "}
                page.
              </p>
            </div>
          </div>
        </RevealWrapper>
      </section>
    </div>
  );
}
