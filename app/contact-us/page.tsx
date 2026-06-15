import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { sendEmail } from "@/lib/services/email";
import RevealWrapper from "@/components/RevealWrapper";

export const metadata: Metadata = {
  title: "Contact Us",
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

const inputClasses =
  "w-full rounded-lg border border-brand-sand bg-brand-cream/40 px-4 py-2.5 font-body text-sm text-brand-espresso transition-all focus:border-brand-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold-200";

export default async function ContactUsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const success = resolvedSearchParams?.success === "true";
  const error = resolvedSearchParams?.error;

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="w-full bg-brand-cream bg-glow-gold">
        <div className="mx-auto max-w-[760px] px-6 py-[clamp(60px,8vw,100px)] text-center">
          <RevealWrapper>
            <p className="mb-4 flex items-center justify-center gap-2 font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
              <span aria-hidden className="text-brand-gold-500">
                ✦
              </span>
              We&rsquo;d Love to Hear from You
            </p>
            <h1 className="font-display text-display font-light italic text-brand-espresso">
              Get In Touch
            </h1>
            <p className="mx-auto mt-4 max-w-xl font-body text-base leading-[1.8] text-brand-body">
              Questions about an order, a product, or just want to say hello? We&rsquo;d love to
              hear from you.
            </p>
          </RevealWrapper>
        </div>
      </section>

      <section className="w-full bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-[clamp(60px,8vw,120px)]">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <RevealWrapper>
              <div className="space-y-8">
                <div>
                  <h2 className="mb-2 font-display text-heading font-semibold text-brand-espresso">
                    Our Details
                  </h2>
                  <p className="font-body text-sm text-brand-mocha">
                    Reach us any way that works for you.
                  </p>
                </div>

                <div className="space-y-6">
                  {contactDetails.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-gold-100">
                        <Icon className="h-5 w-5 text-brand-copper" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="font-sub text-[11px] font-medium uppercase tracking-[0.15em] text-brand-mocha">
                          {label}
                        </p>
                        {href ? (
                          <a
                            href={href}
                            className="mt-0.5 block font-body text-sm text-brand-espresso transition-colors hover:text-brand-copper"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="mt-0.5 font-body text-sm text-brand-espresso">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map */}
                <div className="aspect-video overflow-hidden rounded-feature border border-brand-sand shadow-soft">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.3!2d72.83!3d19.11!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA2JzM2LjAiTiA3MsKwNDknNDguMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                    className="h-full w-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mannequin Care Location"
                  />
                </div>
              </div>
            </RevealWrapper>

            {/* Form */}
            <RevealWrapper delay={120}>
              <div className="rounded-card border border-brand-sand bg-white p-8 shadow-card">
                <h2 className="mb-6 font-display text-heading font-semibold text-brand-espresso">
                  Send a Message
                </h2>

                {success && (
                  <div className="mb-6 rounded-lg border border-brand-sage bg-[rgba(181,201,168,0.15)] p-4 font-body text-sm text-brand-espresso">
                    ✅ Your message has been sent! We&rsquo;ll reply within 24–48 hours.
                  </div>
                )}
                {error === "missing_fields" && (
                  <div className="mb-6 rounded-lg border border-brand-blush bg-[rgba(249,199,199,0.25)] p-4 font-body text-sm text-brand-espresso">
                    Please fill in all required fields.
                  </div>
                )}
                {error === "invalid_email" && (
                  <div className="mb-6 rounded-lg border border-brand-blush bg-[rgba(249,199,199,0.25)] p-4 font-body text-sm text-brand-espresso">
                    Please enter a valid email address.
                  </div>
                )}
                {error === "send_failed" && (
                  <div className="mb-6 rounded-lg border border-brand-blush bg-[rgba(249,199,199,0.25)] p-4 font-body text-sm text-brand-espresso">
                    Something went wrong sending your message. Please email us directly at{" "}
                    <a href="mailto:info@mannequincare.in" className="font-medium text-brand-copper underline">
                      info@mannequincare.in
                    </a>
                    .
                  </div>
                )}

                <form action={handleContactForm} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="font-sub text-xs font-medium uppercase tracking-[0.1em] text-brand-mocha">
                        Full Name <span className="text-brand-copper">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Your name"
                        className={inputClasses}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="font-sub text-xs font-medium uppercase tracking-[0.1em] text-brand-mocha">
                        Email <span className="text-brand-copper">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="your@email.com"
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="font-sub text-xs font-medium uppercase tracking-[0.1em] text-brand-mocha">
                      Subject
                    </label>
                    <select id="subject" name="subject" className={inputClasses}>
                      <option value="Order Inquiry">Order Inquiry</option>
                      <option value="Product Question">Product Question</option>
                      <option value="Return / Refund">Return / Refund</option>
                      <option value="Wholesale / Bulk Order">Wholesale / Bulk Order</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="font-sub text-xs font-medium uppercase tracking-[0.1em] text-brand-mocha">
                      Message <span className="text-brand-copper">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell us how we can help…"
                      className={`${inputClasses} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded bg-brand-gold-500 px-6 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </RevealWrapper>
          </div>
        </div>
      </section>
    </div>
  );
}
