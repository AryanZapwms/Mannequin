"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ResetPasswordForm({
  token,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { token: string }) {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Unable to reset password");
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="rounded-card border border-brand-sand bg-white p-6 shadow-soft sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-6 inline-block">
            <Image
              src="/logo.jpg"
              alt="Mannequin Care"
              width={1157}
              height={314}
              priority
              className="h-10 w-auto object-contain mix-blend-multiply sm:h-12"
            />
          </Link>
          <h1 className="font-display text-2xl font-semibold text-brand-espresso">Reset Your Password</h1>
          <p className="mt-2 font-body text-sm text-brand-mocha">
            Please enter your new password below.
          </p>
        </div>

        {success ? (
          <div className="text-center font-body text-sm text-brand-espresso">
            Your password has been updated. Redirecting you to login…
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
              <div className="space-y-1.5">
                <label htmlFor="password" className="block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="New password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-brand-sand bg-brand-cream/40 px-4 py-2.5 font-body text-sm text-brand-espresso transition-all placeholder:text-brand-mocha/50 focus:border-brand-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold-200"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="repeat-password" className="block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
                  Repeat Password
                </label>
                <input
                  id="repeat-password"
                  type="password"
                  placeholder="Repeat password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="w-full rounded-xl border border-brand-sand bg-brand-cream/40 px-4 py-2.5 font-body text-sm text-brand-espresso transition-all placeholder:text-brand-mocha/50 focus:border-brand-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold-200"
                />
              </div>

              {error && <p className="font-body text-sm text-red-500">{error}</p>}
              
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-xl bg-brand-gold-500 px-6 py-3.5 font-sub text-xs font-semibold uppercase tracking-[0.1em] text-brand-espresso transition-all hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isLoading ? "Saving..." : "Save New Password"}
              </button>
            </div>
            <div className="mt-6 text-center font-body text-sm text-brand-mocha">
              <Link href="/auth/login" className="font-medium text-brand-copper hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
