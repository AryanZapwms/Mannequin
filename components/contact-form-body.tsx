"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/**
 * Wraps the contact form fields so they can react to the server action's
 * pending state — `useFormStatus` only works inside a child of the <form>.
 */
export function ContactFormBody({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <>
      <fieldset
        disabled={pending}
        className="space-y-5 transition-opacity duration-200 disabled:pointer-events-none disabled:opacity-60"
      >
        {children}
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded bg-brand-gold-500 px-6 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-brand-sand disabled:text-brand-mocha disabled:shadow-none"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          "Send Message"
        )}
      </button>

      <p aria-live="polite" className="sr-only">
        {pending ? "Sending your message" : ""}
      </p>
    </>
  );
}
