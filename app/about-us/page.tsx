import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import RevealWrapper from "@/components/RevealWrapper";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Mannequin Care — our story, mission, and commitment to natural Vitamin E skincare that truly works.",
};

const values = [
  {
    icon: Leaf,
    title: "Natural Ingredients",
    description:
      "Every product is crafted with carefully sourced natural ingredients free from harmful chemicals, parabens, and sulfates.",
  },
  {
    icon: ShieldCheck,
    title: "Dermatologist Tested",
    description:
      "Our formulations are tested by certified dermatologists to ensure they are safe for all skin types including sensitive skin.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description:
      "Each batch is small-crafted in Mumbai with attention to detail and a genuine passion for skin and hair wellness.",
  },
  {
    icon: Sparkles,
    title: "Proven Results",
    description:
      "Visible results in weeks — our Vitamin E range has helped thousands of customers fade stretch marks and reveal glowing skin.",
  },
];

const team = [
  {
    name: "Priya Sharma",
    role: "Founder & Formulator",
    bio: "A certified cosmetologist with 12+ years of experience, Priya started Mannequin Care after struggling to find clean, affordable skincare that actually worked.",
  },
  {
    name: "Rajan Mehta",
    role: "Head of Operations",
    bio: "Rajan ensures every order reaches your door on time and every product meets our strict quality standards before it leaves our facility.",
  },
];

const stats = [
  { value: "10,000+", label: "Happy Customers" },
  { value: "50+", label: "Products in Range" },
  { value: "5 Years", label: "of Skincare Expertise" },
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-brand-cream bg-glow-gold">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:py-24 xl:py-28">
          <div>
            <RevealWrapper>
              <p className="mb-5 flex items-center gap-2 font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
                <span aria-hidden className="text-brand-gold-500">
                  ✦
                </span>
                Our Story
              </p>
            </RevealWrapper>
            <RevealWrapper delay={80}>
              <h1 className="font-display text-display font-light italic leading-[1.1] text-brand-espresso">
                Radiance Starts with{" "}
                <span className="text-brand-gold-500">Self-Care</span>
              </h1>
            </RevealWrapper>
            <RevealWrapper delay={160}>
              <p className="mt-6 max-w-[480px] font-body text-base leading-[1.8] text-brand-body">
                Mannequin Care was born in Mumbai from a simple belief — that everyone deserves
                access to effective, natural skincare without breaking the bank. We craft Vitamin E
                oils, creams, and hair treatments that deliver real, visible results.
              </p>
            </RevealWrapper>
            <RevealWrapper delay={240}>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded bg-brand-gold-500 px-9 py-4 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-2 rounded border border-brand-sand px-9 py-4 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:bg-white hover:shadow-soft"
                >
                  Contact Us
                </Link>
              </div>
            </RevealWrapper>
          </div>

          <RevealWrapper delay={120}>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-feature border border-brand-sand bg-brand-linen shadow-card">
              <Image
                src="/hero-banner.png"
                alt="Mannequin Care — Vitamin E skincare range"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-6"
                priority
              />
            </div>
          </RevealWrapper>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────── */}
      <section className="w-full bg-white">
        <div className="mx-auto max-w-[760px] px-6 py-[clamp(60px,8vw,120px)] text-center">
          <RevealWrapper>
            <p className="mb-4 font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
              Our Mission
            </p>
            <h2 className="font-display text-heading font-semibold italic text-brand-espresso">
              True radiance begins with self-care.
            </h2>
            <p className="mt-6 font-body text-base leading-[1.8] text-brand-body">
              We believe true radiance begins with self-care. When you nurture your skin with love
              and attention, it becomes a reflection of the beauty within. Our mission is to make
              that journey simple, affordable, and genuinely effective — with transparent
              ingredients and formulas that stand behind every promise we make.
            </p>
          </RevealWrapper>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────── */}
      <section className="w-full bg-brand-linen">
        <div className="mx-auto max-w-[1280px] px-6 py-[clamp(60px,8vw,120px)]">
          <RevealWrapper>
            <div className="mb-12 text-center">
              <p className="mb-3 font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
                What We Stand For
              </p>
              <h2 className="font-display text-heading font-semibold text-brand-espresso">
                The principles that guide everything we do
              </h2>
            </div>
          </RevealWrapper>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, description }, i) => (
              <RevealWrapper key={title} delay={i * 100}>
                <div className="h-full rounded-card border border-brand-sand bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-hover">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold-100">
                    <Icon className="h-6 w-6 text-brand-copper" strokeWidth={1.75} />
                  </div>
                  <h3 className="mb-2 font-sub text-base font-semibold text-brand-espresso">
                    {title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-brand-body">{description}</p>
                </div>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="w-full bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-[clamp(60px,8vw,120px)]">
          <div className="grid gap-10 text-center sm:grid-cols-3">
            {stats.map(({ value, label }, i) => (
              <RevealWrapper key={label} delay={i * 100}>
                <div className="space-y-2">
                  <p className="font-display text-5xl font-semibold italic text-brand-gold-600 md:text-6xl">
                    {value}
                  </p>
                  <p className="font-sub text-xs font-medium uppercase tracking-[0.2em] text-brand-mocha">
                    {label}
                  </p>
                </div>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────── */}
      <section className="w-full bg-brand-linen">
        <div className="mx-auto max-w-[1280px] px-6 py-[clamp(60px,8vw,120px)]">
          <RevealWrapper>
            <div className="mb-12 text-center">
              <p className="mb-3 font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
                Meet the Team
              </p>
              <h2 className="font-display text-heading font-semibold text-brand-espresso">
                The people behind every bottle
              </h2>
            </div>
          </RevealWrapper>
          <div className="mx-auto grid gap-6 sm:grid-cols-2 lg:max-w-3xl">
            {team.map(({ name, role, bio }, i) => (
              <RevealWrapper key={name} delay={i * 100}>
                <div className="h-full rounded-card border border-brand-sand bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-hover">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold-100 font-display text-2xl font-semibold italic text-brand-copper">
                    {name.charAt(0)}
                  </div>
                  <h3 className="font-sub text-lg font-semibold text-brand-espresso">{name}</h3>
                  <p className="mb-3 font-sub text-xs font-medium uppercase tracking-[0.15em] text-brand-gold-600">
                    {role}
                  </p>
                  <p className="font-body text-sm leading-relaxed text-brand-body">{bio}</p>
                </div>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="w-full bg-brand-espresso bg-grain">
        <div className="mx-auto max-w-[760px] px-6 py-[clamp(60px,8vw,120px)] text-center">
          <RevealWrapper>
            <h2 className="font-display text-heading font-semibold italic text-white">
              Ready to start your journey?
            </h2>
            <p className="mx-auto mt-4 max-w-md font-body text-sm leading-relaxed text-white/70">
              Explore our full range of Vitamin E skincare products crafted just for you.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded bg-brand-gold-500 px-9 py-4 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
            >
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </RevealWrapper>
        </div>
      </section>
    </div>
  );
}
