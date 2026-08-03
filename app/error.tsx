"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error monitoring service here (e.g. Sentry)
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <main className="min-h-[70vh] w-full bg-brand-cream bg-glow-gold">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
        <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-white text-brand-copper shadow-soft ring-8 ring-brand-blush/25">
          <AlertTriangle className="h-9 w-9" strokeWidth={1.5} />
        </div>

        <p className="mb-3 font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
          <span aria-hidden className="mr-1.5 text-brand-gold-500">
            ✦
          </span>
          Unexpected error
        </p>

        <h1 className="font-display text-display font-light italic text-brand-espresso">
          Something Went Wrong
        </h1>

        <p className="mx-auto mt-4 max-w-md font-body text-[15px] leading-[1.8] text-brand-body">
          An unexpected error occurred on our end. Nothing you did caused it. Try reloading the
          page — if it keeps happening, our team is on it.
        </p>

        {/* Digest only. The raw error message is never shown to customers. */}
        {error.digest && (
          <p className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-thumb border border-brand-sand bg-white px-4 py-2">
            <span className="font-sub text-[11px] font-medium uppercase tracking-[0.12em] text-brand-mocha">
              Error ID
            </span>
            <span className="break-all font-mono text-xs text-brand-espresso">{error.digest}</span>
          </p>
        )}

        <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded bg-brand-gold-500 px-7 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded border border-brand-sand bg-white px-7 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold-500 hover:shadow-soft"
          >
            <Home className="h-4 w-4" strokeWidth={1.75} />
            Back to Home
          </Link>
        </div>

        <p className="mt-12 border-t border-brand-sand pt-8 font-body text-sm text-brand-body">
          Need a hand?{" "}
          <Link
            href="/contact-us"
            className="font-medium text-brand-copper underline-offset-4 hover:underline"
          >
            Contact our team
          </Link>{" "}
          and we&rsquo;ll sort it out.
        </p>
      </div>
    </main>
  );
}
