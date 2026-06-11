import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns Policy | Mannequin Care",
  description: "Understand our hassle-free returns and refund policy at Mannequin Care.",
};

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-white ">
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl">Returns Policy</h1>
          <p className="mt-2 text-sm text-gray-400">Last updated: May 2025</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto max-w-3xl px-4 space-y-8 text-gray-700 text-sm leading-relaxed">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">1. Our 30-Day Return Promise</h2>
            <p>
              We stand behind every product we sell. If you are not 100% satisfied with your
              purchase, you may return eligible items within <strong>30 days</strong> of the delivery
              date for a full refund or exchange — no questions asked.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">2. Eligibility</h2>
            <p>To be eligible for a return, your item must be:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Unused and in the same condition you received it.</li>
              <li>In its original packaging with all seals intact.</li>
              <li>Returned within 30 days of the delivery date.</li>
              <li>Accompanied by a valid order number or receipt.</li>
            </ul>
            <p className="mt-3">
              Opened or used personal care products are eligible for return only if the product is
              defective, damaged on arrival, or not as described.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">3. Non-Returnable Items</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gift cards and promotional vouchers.</li>
              <li>Items purchased during final-sale events (marked "No Returns").</li>
              <li>Products that show signs of use, damage, or tampering by the customer.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">4. How to Initiate a Return</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Email us at{" "}
                <a href="mailto:returns@mannequincare.in" className="text-black underline">
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
            <h2 className="mb-2 text-lg font-semibold text-gray-900">5. Refunds</h2>
            <p>
              Approved refunds are credited back to your original payment method. For COD orders,
              refunds are issued via bank transfer (NEFT/IMPS) within 7 business days.
            </p>
            <p className="mt-2">
              Shipping charges are non-refundable unless the return is due to our error (damaged or
              wrong item).
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">6. Exchanges</h2>
            <p>
              We offer free exchanges for defective or incorrect items. If you wish to exchange for
              a different product, a new order must be placed and the original item returned for a
              refund.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">7. Damaged or Defective Items</h2>
            <p>
              If your order arrives damaged or defective, please photograph the item and packaging
              and email{" "}
              <a href="mailto:support@mannequincare.in" className="text-black underline">
                support@mannequincare.in
              </a>{" "}
              within 48 hours of delivery. We will arrange a replacement or full refund at no cost
              to you.
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-5 text-sm">
            <p className="font-semibold text-gray-900">Still have questions?</p>
            <p className="mt-1">
              Contact us at{" "}
              <a href="mailto:support@mannequincare.in" className="text-black underline">
                support@mannequincare.in
              </a>{" "}
              or visit our{" "}
              <Link href="/contact-us" className="text-black underline">
                Contact Us
              </Link>{" "}
              page.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
