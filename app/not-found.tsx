import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Home, SearchX } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found — Mannequin Care",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: { index: false },
};

const POPULAR_PAGES = [
  { label: "Shop", href: "/shop" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact", href: "/contact-us" },
  { label: "Wishlist", href: "/wishlist" },
];

export default function NotFound() {
  return (
    <main className="min-h-[70vh] w-full bg-brand-cream bg-glow-gold">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand-copper shadow-soft ring-8 ring-brand-gold-100/60 sm:h-20 sm:w-20">
          <SearchX className="h-8 w-8" strokeWidth={1.5} />
        </div>

        {/* Oversized 404, clamped so it can never overflow a phone */}
        <span
          aria-hidden
          className="select-none font-display text-[clamp(5rem,22vw,11rem)] font-light italic leading-[0.9] text-brand-sand"
        >
          404
        </span>

        <p className="mb-3 mt-4 font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
          <span aria-hidden className="mr-1.5 text-brand-gold-500">
            ✦
          </span>
          Lost your way
        </p>

        <h1 className="font-display text-display font-light italic text-brand-espresso">
          Page Not Found
        </h1>

        <p className="mx-auto mt-4 max-w-md font-body text-[15px] leading-[1.8] text-brand-body">
          We couldn&rsquo;t find the page you were looking for. It may have been moved, renamed, or
          the link might be out of date.
        </p>

        <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 rounded bg-brand-gold-500 px-7 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
          >
            <Home className="h-4 w-4" strokeWidth={1.75} />
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="group inline-flex items-center justify-center gap-2 rounded border border-brand-sand bg-white px-7 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold-500 hover:shadow-soft"
          >
            Browse Products
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* ── Popular pages ──────────────────────────────────────── */}
        <div className="mt-14 w-full border-t border-brand-sand pt-8">
          <p className="font-sub text-[11px] font-medium uppercase tracking-[0.15em] text-brand-mocha">
            Popular pages
          </p>
          <nav className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-3">
            {POPULAR_PAGES.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="font-body text-sm text-brand-espresso underline-offset-4 transition-colors hover:text-brand-copper hover:underline"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </main>
  );
}
