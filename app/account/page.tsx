import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { cn } from "@/lib/utils";
import { AddressManager } from "@/components/address-manager";

export const metadata: Metadata = {
  title: "My Account — Mannequin Care",
  description: "Manage your profile, saved addresses, and account settings.",
  robots: { index: false },
};
import Link from "next/link";

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
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Account Settings</h1>
        <p className="text-sm text-muted-foreground">
          Review your profile details and keep your information up to date.
        </p>
      </header>
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:gap-10">
        <div
          className={cn(
            "flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xl font-semibold uppercase text-primary",
            avatarUrl && "bg-transparent",
          )}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={fullName}
              width={80}
              height={80}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 space-y-1">
          <h2 className="text-xl font-semibold">{fullName}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {phone ? <p className="text-sm text-muted-foreground">{phone}</p> : null}
          {createdAt ? (
            <p className="text-xs text-muted-foreground">
              Member since {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(createdAt)}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Profile Details</h3>
        <dl className="grid gap-3 text-sm text-muted-foreground">
          <div className="grid gap-1">
            <dt className="font-medium text-foreground">User ID</dt>
            <dd className="break-all">{user._id.toString()}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="font-medium text-foreground">Email</dt>
            <dd>{user.email}</dd>
          </div>
          {phone ? (
            <div className="grid gap-1">
              <dt className="font-medium text-foreground">Phone</dt>
              <dd>{phone}</dd>
            </div>
          ) : null}
          {Object.keys(metadata).length > 0 ? (
            <div className="grid gap-1">
              <dt className="font-medium text-foreground">Additional metadata</dt>
              <dd className="space-y-1">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="w-32 shrink-0 font-medium capitalize text-foreground">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="flex-1 break-words">
                      {typeof value === "string" ? value : JSON.stringify(value)}
                    </span>
                  </div>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">My Orders</h3>
        <Link
          href="/orders"
          className="inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          View My Orders
        </Link>
      </div>

      <AddressManager />
    </section>
  );
}
