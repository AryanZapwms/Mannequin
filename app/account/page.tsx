import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { AccountProfile } from "@/components/account-profile";
import { AddressManager } from "@/components/address-manager";
import { ChevronRight, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "My Account — Mannequin Care",
  description: "Manage your profile, saved addresses, and account settings.",
  robots: { index: false },
};

export default async function AccountPage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect("/auth/login?next=/account");
  }

  await dbConnect();
  const user = await User.findById(sessionUser.id);

  if (!user) {
    redirect("/auth/login?next=/account");
  }

  const fullName = user.displayName || user.email || "Account";
  const avatarUrl = user.avatarUrl ?? undefined;
  const phone = user.phone;
  const createdAt = user.createdAt ? new Date(user.createdAt) : null;
  const metadata = (user.metadata ?? {}) as Record<string, unknown>;

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:py-14">

        {/* ── Page Header (no hero banner, just inline) ──────────── */}
        <header className="flex flex-col gap-1">
          <p className="font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
            <span aria-hidden className="mr-1.5 text-brand-gold-500">✦</span>
            My Account
          </p>
          <h1 className="font-display text-display font-light italic text-brand-espresso">
            Account Settings
          </h1>
          <p className="mt-1 max-w-md font-body text-sm leading-relaxed text-brand-body">
            Review your profile details and keep your information up to date.
          </p>
        </header>

        <AccountProfile
          userId={user._id.toString()}
          email={user.email}
          avatarUrl={avatarUrl}
          displayName={user.displayName ?? null}
          phone={phone ?? null}
          createdAt={createdAt ? createdAt.toISOString() : null}
          metadata={metadata}
        />

        {/* ── My Orders Card ────────────────────────────────────── */}
        <div className="rounded-card border border-brand-sand bg-white p-5 shadow-soft sm:p-7">
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-brand-espresso sm:text-xl">
            <Package className="h-5 w-5 text-brand-copper" strokeWidth={1.75} />
            My Orders
          </h3>
          <p className="mb-5 font-body text-sm text-brand-body">
            Track your orders, view purchase history, and manage returns.
          </p>
          <Link
            href="/orders"
            className="group inline-flex items-center gap-2 rounded bg-brand-gold-500 px-6 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
          >
            View My Orders
            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* ── Addresses ─────────────────────────────────────────── */}
        <AddressManager />
      </div>
    </div>
  );
}
