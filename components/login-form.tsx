"use client";

import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role ?? "customer";

      const nextUrl = searchParams.get("next");
      const destination =
        nextUrl ?? (role === "admin" || role === "staff" ? "/admin" : "/account");
      router.push(destination);
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
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
          <h1 className="font-display text-2xl font-semibold text-brand-espresso">Welcome Back</h1>
          <p className="mt-2 font-body text-sm text-brand-mocha">
            Enter your email and password to access your account.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-brand-sand bg-brand-cream/40 px-4 py-2.5 font-body text-sm text-brand-espresso transition-all placeholder:text-brand-mocha/50 focus:border-brand-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold-200"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="font-body text-xs text-brand-copper hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-brand-sand bg-brand-cream/40 px-4 py-2.5 font-body text-sm text-brand-espresso transition-all placeholder:text-brand-mocha/50 focus:border-brand-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold-200"
              />
            </div>

            {error && <p className="font-body text-sm text-red-500">{error}</p>}
            
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-brand-gold-500 px-6 py-3.5 font-sub text-xs font-semibold uppercase tracking-[0.1em] text-brand-espresso transition-all hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isLoading ? "Logging in..." : "Sign In"}
            </button>
          </div>
          <div className="mt-6 text-center font-body text-sm text-brand-mocha">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="font-medium text-brand-copper hover:underline"
            >
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
