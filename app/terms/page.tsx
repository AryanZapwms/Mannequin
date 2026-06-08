import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | Mannequin Care",
  description: "Read the Terms & Conditions governing use of the Mannequin Care website and services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl">Terms &amp; Conditions</h1>
          <p className="mt-2 text-sm text-gray-400">Last updated: May 2025</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto max-w-3xl px-4 space-y-8 text-gray-700 text-sm leading-relaxed">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Mannequin Care website (&quot;Site&quot;) or purchasing our
              products, you agree to be bound by these Terms &amp; Conditions. If you do not agree,
              please do not use the Site.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">2. Use of the Site</h2>
            <p>You agree to use the Site only for lawful purposes. You must not:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Use the Site in any way that violates applicable local, national, or international law.</li>
              <li>Transmit unsolicited commercial communications.</li>
              <li>Attempt to gain unauthorised access to any part of the Site.</li>
              <li>Engage in scraping, data mining, or similar data-extraction activities.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">3. Orders and Payments</h2>
            <p>
              All prices are listed in Indian Rupees (₹) and are inclusive of applicable GST unless
              stated otherwise. We reserve the right to refuse or cancel any order at our discretion.
              Payment is processed securely through Razorpay or collected as Cash on Delivery (COD).
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">4. Shipping</h2>
            <p>
              We ship across India. Estimated delivery times are 3–7 business days. Delivery times
              are estimates only and not guaranteed. Mannequin Care is not responsible for delays
              caused by third-party couriers or force majeure events.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">5. Returns and Refunds</h2>
            <p>
              Our returns and refund policy is set out in our{" "}
              <Link href="/returns" className="text-black underline">
                Returns Policy
              </Link>
              , which forms part of these Terms.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">6. Intellectual Property</h2>
            <p>
              All content on the Site — including text, graphics, logos, product images, and
              software — is the property of Mannequin Care and is protected by Indian and
              international intellectual property laws. You may not reproduce, distribute, or create
              derivative works without our prior written consent.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">7. Disclaimer of Warranties</h2>
            <p>
              The Site and its content are provided &quot;as is&quot; without warranty of any kind. We do not
              warrant that the Site will be uninterrupted or error-free. Product results may vary
              between individuals.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Mannequin Care shall not be liable for any
              indirect, incidental, or consequential damages arising from your use of the Site or
              our products. Our total liability shall not exceed the value of the order that gave
              rise to the claim.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">9. Governing Law</h2>
            <p>
              These Terms are governed by the laws of India. Any disputes shall be subject to the
              exclusive jurisdiction of the courts of Mumbai, Maharashtra.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">10. Changes to Terms</h2>
            <p>
              We reserve the right to update these Terms at any time. Continued use of the Site
              after changes are posted constitutes your acceptance of the revised Terms.
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-5 text-sm">
            <p className="font-semibold text-gray-900">Questions?</p>
            <p className="mt-1">
              Email us at{" "}
              <a href="mailto:legal@mannequincare.in" className="text-black underline">
                legal@mannequincare.in
              </a>{" "}
              or visit our{" "}
              <Link href="/contact-us" className="text-black underline">
                Contact page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
