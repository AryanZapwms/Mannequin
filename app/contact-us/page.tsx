import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { sendEmail } from "@/lib/services/email";

export const metadata: Metadata = {
  title: "Contact Us | Mannequin Care",
  description:
    "Get in touch with the Mannequin Care team. We're here to help with orders, product questions, and anything else.",
};

async function handleContactForm(formData: FormData) {
  "use server";

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const subject = (formData.get("subject") as string | null)?.trim() ?? "Contact Form Inquiry";
  const message = (formData.get("message") as string | null)?.trim() ?? "";

  if (!name || !email || !message) {
    redirect("/contact-us?error=missing_fields");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    redirect("/contact-us?error=invalid_email");
  }

  try {
    // Send to admin
    await sendEmail({
      to: process.env.GMAIL_EMAIL || "admin@mannequincare.in",
      subject: `[Contact Form] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold; color: #555;">Name:</td><td style="padding: 8px;">${name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #555;">Subject:</td><td style="padding: 8px;">${subject}</td></tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f9f9f9; border-radius: 8px;">
            <p style="margin: 0; white-space: pre-wrap; color: #333;">${message}</p>
          </div>
        </div>
      `,
    });

    // Auto-reply to customer
    await sendEmail({
      to: email,
      subject: "We received your message — Mannequin Care",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
          <div style="background: #000; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">Mannequin Care</h1>
          </div>
          <div style="background: #fff; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hi ${name},</p>
            <p>Thank you for reaching out! We've received your message and will get back to you within <strong>24–48 hours</strong>.</p>
            <p style="color: #555;">Your message:</p>
            <blockquote style="border-left: 3px solid #000; padding-left: 12px; color: #555; margin: 16px 0;">${message}</blockquote>
            <p>In the meantime, feel free to explore our <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://mannequincare.in"}/shop" style="color: #000; font-weight: bold;">product range</a>.</p>
            <p>Warm regards,<br/><strong>The Mannequin Care Team</strong></p>
          </div>
          <p style="text-align: center; font-size: 12px; color: #999; margin-top: 16px;">
            © 2025 Mannequincare.in · <a href="mailto:info@mannequincare.in" style="color: #999;">info@mannequincare.in</a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Contact form email error:", err);
    redirect("/contact-us?error=send_failed");
  }

  redirect("/contact-us?success=true");
}

const contactDetails = [
  {
    icon: MapPin,
    label: "Address",
    value:
      "509, Peninsula Plaza Premises, Veera Desai Industrial Estate, Opposite YRF, Andheri West, Mumbai – 400053, Maharashtra, India",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+(91) 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@mannequincare.in",
    href: "mailto:info@mannequincare.in",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Monday – Saturday, 9:00 AM – 10:00 PM IST",
  },
];

export default async function ContactUsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const success = resolvedSearchParams?.success === "true";
  const error = resolvedSearchParams?.error;

  return (
    <div className="min-h-screen bg-white -mt-20 md:-mt-24">
      {/* Hero */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Get In Touch
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-500">
            Questions about an order, a product, or just want to say hello? We'd love to hear from
            you.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Our Details</h2>
                <p className="text-gray-500">Reach us any way that works for you.</p>
              </div>

              <div className="space-y-6">
                {contactDetails.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                      <Icon className="h-5 w-5 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="mt-0.5 text-sm text-gray-800 hover:text-black hover:underline"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-sm text-gray-800">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 aspect-video flex items-center justify-center text-gray-400 text-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.3!2d72.83!3d19.11!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA2JzM2LjAiTiA3MsKwNDknNDguMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mannequin Care Location"
                />
              </div>
            </div>

            {/* Form */}
            <div>
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Send a Message</h2>

                {success && (
                  <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                    ✅ Your message has been sent! We'll reply within 24–48 hours.
                  </div>
                )}
                {error === "missing_fields" && (
                  <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                    Please fill in all required fields.
                  </div>
                )}
                {error === "invalid_email" && (
                  <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                    Please enter a valid email address.
                  </div>
                )}
                {error === "send_failed" && (
                  <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                    Something went wrong sending your message. Please email us directly at{" "}
                    <a href="mailto:info@mannequincare.in" className="underline font-medium">
                      info@mannequincare.in
                    </a>
                    .
                  </div>
                )}

                <form action={handleContactForm} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Your name"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="your@email.com"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    >
                      <option value="Order Inquiry">Order Inquiry</option>
                      <option value="Product Question">Product Question</option>
                      <option value="Return / Refund">Return / Refund</option>
                      <option value="Wholesale / Bulk Order">Wholesale / Bulk Order</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-sm font-medium text-gray-700">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell us how we can help…"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
