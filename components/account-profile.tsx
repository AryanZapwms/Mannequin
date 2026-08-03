"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, ChevronRight, Mail, Package, Phone, User as UserIcon } from "lucide-react";

interface AccountProfileProps {
  userId: string;
  email: string;
  avatarUrl?: string | null;
  displayName?: string | null;
  phone?: string | null;
  createdAt?: string | null;
  metadata: Record<string, unknown>;
}

export function AccountProfile({
  userId,
  email,
  avatarUrl,
  displayName,
  phone,
  createdAt,
  metadata,
}: AccountProfileProps) {
  const [name, setName] = useState(displayName ?? "");
  const [phoneValue, setPhoneValue] = useState(phone ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fullName = name || email || "Account";
  const initials = fullName
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const createdAtDate = createdAt ? new Date(createdAt) : null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name, phone: phoneValue }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to update profile.");
      }

      setName(json.displayName ?? "");
      setPhoneValue(json.phone ?? "");
      setFeedback("Profile updated successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile.";
      setFeedback(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="rounded-card border border-brand-sand bg-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-gold-100 font-display text-2xl font-semibold text-brand-copper ring-4 ring-brand-gold-50 sm:h-24 sm:w-24"
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

          <div className="flex-1 space-y-1.5">
            <h2 className="font-display text-xl font-semibold text-brand-espresso sm:text-2xl">
              {fullName}
            </h2>
            <div className="flex items-center gap-2 font-body text-sm text-brand-body">
              <Mail className="h-3.5 w-3.5 text-brand-mocha/50" strokeWidth={1.75} />
              {email}
            </div>
            {phoneValue && (
              <div className="flex items-center gap-2 font-body text-sm text-brand-body">
                <Phone className="h-3.5 w-3.5 text-brand-mocha/50" strokeWidth={1.75} />
                {phoneValue}
              </div>
            )}
            {createdAtDate && (
              <div className="flex items-center gap-2 font-sub text-xs text-brand-mocha">
                <CalendarDays className="h-3.5 w-3.5 text-brand-mocha/50" strokeWidth={1.75} />
                Member since {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(createdAtDate)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-card border border-brand-sand bg-white p-5 shadow-soft sm:p-7">
        <h3 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold text-brand-espresso sm:text-xl">
          <UserIcon className="h-5 w-5 text-brand-copper" strokeWidth={1.75} />
          Profile Details
        </h3>

        <form onSubmit={handleSubmit} className="grid gap-4 text-sm">
          {/* <div className="grid gap-1 rounded-thumb bg-brand-cream/60 p-3.5">
            <dt className="font-sub text-[11px] font-medium uppercase tracking-[0.12em] text-brand-mocha">
              User ID
            </dt>
            <dd className="break-all font-mono text-xs text-brand-body">{userId}</dd>
          </div> */}

          <div className="grid gap-1 rounded-thumb bg-brand-cream/60 p-3.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" defaultValue={email} disabled />
          </div>

          <div className="grid gap-1 rounded-thumb bg-brand-cream/60 p-3.5">
            <Label htmlFor="displayName">Full name</Label>
            <Input
              id="displayName"
              name="displayName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Add your full name"
            />
          </div>

          <div className="grid gap-1 rounded-thumb bg-brand-cream/60 p-3.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={phoneValue}
              onChange={(event) => setPhoneValue(event.target.value)}
              placeholder="Add your phone number"
            />
          </div>

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

          {feedback && (
            <p className="text-sm text-brand-espresso">{feedback}</p>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </Button>
            
          </div>
        </form>
      </div>
    </>
  );
}
