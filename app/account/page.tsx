import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { cn } from "@/lib/utils";
import { AddressManager } from "@/components/address-manager";
import { CalendarDays, ChevronRight, Mail, Package, Phone, User as UserIcon } from "lucide-react";

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
  const initials = fullName
    .split(" ")
    .map((segment: string) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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

        {/* ── Profile Card ──────────────────────────────────────── */}
        <div className="rounded-card border border-brand-sand bg-white p-5 shadow-soft sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            {/* Avatar */}
            <div
              className={cn(
                "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-gold-100 font-display text-2xl font-semibold text-brand-copper ring-4 ring-brand-gold-50 sm:h-24 sm:w-24",
                avatarUrl && "bg-transparent ring-brand-sand",
              )}
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                initials
              )}
            </div>

            {/* Name & quick info */}
            <div className="flex-1 space-y-1.5">
              <h2 className="font-display text-xl font-semibold text-brand-espresso sm:text-2xl">
                {fullName}
              </h2>
              <div className="flex items-center gap-2 font-body text-sm text-brand-body">
                <Mail className="h-3.5 w-3.5 text-brand-mocha/50" strokeWidth={1.75} />
                {user.email}
              </div>
              {phone && (
                <div className="flex items-center gap-2 font-body text-sm text-brand-body">
                  <Phone className="h-3.5 w-3.5 text-brand-mocha/50" strokeWidth={1.75} />
                  {phone}
                </div>
              )}
              {createdAt && (
                <div className="flex items-center gap-2 font-sub text-xs text-brand-mocha">
                  <CalendarDays className="h-3.5 w-3.5 text-brand-mocha/50" strokeWidth={1.75} />
                  Member since {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(createdAt)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Profile Details Card ──────────────────────────────── */}
        <div className="rounded-card border border-brand-sand bg-white p-5 shadow-soft sm:p-7">
          <h3 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold text-brand-espresso sm:text-xl">
            <UserIcon className="h-5 w-5 text-brand-copper" strokeWidth={1.75} />
            Profile Details
          </h3>

          <dl className="grid gap-4 text-sm">
            <div className="grid gap-1 rounded-thumb bg-brand-cream/60 p-3.5">
              <dt className="font-sub text-[11px] font-medium uppercase tracking-[0.12em] text-brand-mocha">
                User ID
              </dt>
              <dd className="break-all font-mono text-xs text-brand-body">
                {user._id.toString()}
              </dd>
            </div>

            <div className="grid gap-1 rounded-thumb bg-brand-cream/60 p-3.5">
              <dt className="font-sub text-[11px] font-medium uppercase tracking-[0.12em] text-brand-mocha">
                Email
              </dt>
              <dd className="font-body text-brand-espresso">{user.email}</dd>
            </div>

            {phone && (
              <div className="grid gap-1 rounded-thumb bg-brand-cream/60 p-3.5">
                <dt className="font-sub text-[11px] font-medium uppercase tracking-[0.12em] text-brand-mocha">
                  Phone
                </dt>
                <dd className="font-body text-brand-espresso">{phone}</dd>
              </div>
            )}

            {Object.keys(metadata).length > 0 && (
              <div className="grid gap-2 rounded-thumb bg-brand-cream/60 p-3.5">
                <dt className="font-sub text-[11px] font-medium uppercase tracking-[0.12em] text-brand-mocha">
                  Additional Information
                </dt>
                <dd className="space-y-2">
                  {Object.entries(metadata).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3">
                      <span className="w-28 shrink-0 font-sub text-xs font-medium capitalize text-brand-mocha">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="flex-1 break-words font-body text-sm text-brand-body">
                        {typeof value === "string" ? value : JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

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
