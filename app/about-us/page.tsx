import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Leaf, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Mannequin Care",
  description:
    "Learn about Mannequin Care — our story, mission, and commitment to natural skincare that truly works.",
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

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-amber-50 py-20 md:py-28">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-800">
                Our Story
              </span>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-5xl">
                Radiance Starts with{" "}
                <span className="text-amber-600">Self-Care</span>
              </h1>
              <p className="text-lg leading-relaxed text-gray-600">
                Mannequin Care was born in Mumbai from a simple belief — that everyone deserves
                access to effective, natural skincare without breaking the bank. We craft Vitamin E
                oils, creams, and hair treatments that deliver real, visible results.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white shadow transition-transform hover:-translate-y-0.5"
                >
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src="/hero-banner.png"
                alt="Mannequin Care products"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">Our Mission</h2>
          <p className="text-lg leading-relaxed text-gray-600">
            We believe true radiance begins with self-care. When you nurture your skin with love and
            attention, it becomes a reflection of the beauty within. Our mission is to make that
            journey simple, affordable, and genuinely effective — with transparent ingredients and
            formulas that stand behind every promise we make.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">What We Stand For</h2>
            <p className="text-gray-500">The principles that guide everything we do</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <Icon className="h-6 w-6 text-amber-700" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            {[
              { value: "10,000+", label: "Happy Customers" },
              { value: "50+", label: "Products in Range" },
              { value: "5 Years", label: "of Skincare Expertise" },
            ].map(({ value, label }) => (
              <div key={label} className="space-y-2">
                <p className="text-5xl font-extrabold text-gray-900">{value}</p>
                <p className="text-sm font-medium uppercase tracking-wider text-gray-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">Meet the Team</h2>
            <p className="text-gray-500">The people behind every bottle</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:max-w-3xl lg:mx-auto">
            {team.map(({ name, role, bio }) => (
              <div
                key={name}
                className="rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl font-bold text-amber-700">
                  {name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                <p className="mb-3 text-sm font-medium text-amber-600">{role}</p>
                <p className="text-sm leading-relaxed text-gray-500">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-16 text-white">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Start Your Journey?</h2>
          <p className="mb-8 text-gray-400">
            Explore our full range of natural skincare products crafted just for you.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-black shadow transition-transform hover:-translate-y-0.5"
          >
            Browse Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
