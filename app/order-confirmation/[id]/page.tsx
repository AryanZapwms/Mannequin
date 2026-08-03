"use client";

import { Suspense, useEffect, useState, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Order } from "@/lib/services/order";
import { ArrowRight, Check, MapPin, Package, Receipt, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

// useSearchParams needs a Suspense boundary to keep the route prerenderable
export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<OrderConfirmationSkeleton />}>
      <OrderConfirmation params={params} />
    </Suspense>
  );
}

function OrderConfirmation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // Guests carry a token from checkout; signed-in customers don't need one
  const guestToken = useSearchParams().get("token");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await fetch(
          guestToken
            ? `/api/orders/${id}?token=${encodeURIComponent(guestToken)}`
            : `/api/orders/${id}`,
        );
        if (!res.ok) throw new Error("Failed to load order");
        const { order: orderData } = await res.json();
        setOrder(orderData);
      } catch (error) {
        console.error("Error loading order:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [id, guestToken]);

  if (loading) {
    return <OrderConfirmationSkeleton />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="rounded-card border border-brand-sand bg-white p-8 text-center shadow-soft sm:p-12">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-cream text-brand-copper">
              <Package className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h1 className="mb-2 font-display text-2xl font-medium text-brand-espresso">
              Order not found
            </h1>
            <p className="mb-8 font-body text-brand-body">
              We couldn&apos;t find that order. It may have been removed, or the link may be incorrect.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded bg-brand-gold-500 px-6 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const shippingAddress = order.shipping_address as any;
  const placedAt = new Date(order.placed_at);

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 lg:py-14">

        {/* ── Confirmation Hero ─────────────────────────────────── */}
        <div className="animate-fade-up rounded-card border border-brand-gold-200 bg-gradient-to-b from-brand-gold-50 to-white p-8 text-center shadow-soft sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold-500 text-brand-espresso shadow-gold">
            <Check className="h-8 w-8" strokeWidth={2.5} />
          </div>
          <p className="font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
            <span aria-hidden className="mr-1.5 text-brand-gold-500">✦</span>
            Order Confirmed
          </p>
          <h1 className="mt-2 font-display text-display font-light italic text-brand-espresso">
            Thank you for your order
          </h1>
          <p className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-brand-body">
            We&apos;ve received your order and will send a confirmation email shortly.
            You can track its progress from your account at any time.
          </p>
        </div>

        {/* ── Order Summary ─────────────────────────────────────── */}
        <div className="rounded-card border border-brand-sand bg-white p-5 shadow-soft sm:p-7">
          <div className="flex flex-col gap-3 border-b border-brand-sand pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-sub text-[11px] font-medium uppercase tracking-[0.12em] text-brand-mocha">
                Order Number
              </p>
              <p className="mt-1 font-display text-2xl font-medium text-brand-espresso">
                {order.order_number}
              </p>
            </div>
            <p className="font-body text-sm text-brand-body">
              Placed on{" "}
              {placedAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            <SummaryStat label="Status">
              <StatusBadge value={order.status} />
            </SummaryStat>
            <SummaryStat label="Payment">
              <StatusBadge value={order.payment_status} />
            </SummaryStat>
            <SummaryStat label="Method">
              <span className="font-body text-sm font-medium capitalize text-brand-espresso">
                {order.payment_provider === "cod"
                  ? "Cash on Delivery"
                  : order.payment_provider || "Unknown"}
              </span>
            </SummaryStat>
            <SummaryStat label="Total">
              <span className="font-display text-lg font-medium text-brand-espresso">
                ₹{order.grand_total.toFixed(2)}
              </span>
            </SummaryStat>
          </dl>
        </div>

        {/* ── Order Items ───────────────────────────────────────── */}
        <div className="rounded-card border border-brand-sand bg-white p-5 shadow-soft sm:p-7">
          <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold text-brand-espresso sm:text-xl">
            <ShoppingBag className="h-5 w-5 text-brand-copper" strokeWidth={1.75} />
            Order Items
          </h2>

          <ul className="divide-y divide-brand-sand/60">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 py-3.5 first:pt-0">
                <div className="min-w-0">
                  <p className="font-body font-medium text-brand-espresso">
                    {item.product_snapshot?.name || "Product"}
                  </p>
                  <p className="mt-0.5 font-sub text-xs text-brand-mocha">
                    Qty {item.quantity}
                    <span className="mx-1.5 text-brand-sand">•</span>
                    ₹{item.unit_price.toFixed(2)} each
                  </p>
                </div>
                <p className="shrink-0 font-body font-medium text-brand-espresso">
                  ₹{item.line_total.toFixed(2)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2.5 rounded-thumb bg-brand-cream/60 p-4">
            <TotalRow label="Subtotal" value={order.subtotal} />
            {order.discount_total > 0 && (
              <TotalRow label="Discount" value={-order.discount_total} />
            )}
            <TotalRow label="Tax" value={order.tax_total} />
            <TotalRow
              label="Shipping"
              value={order.shipping_total}
              display={order.shipping_total === 0 ? "Free" : undefined}
            />
            <div className="flex items-center justify-between border-t border-brand-sand pt-3">
              <span className="font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso">
                Total
              </span>
              <span className="font-display text-xl font-semibold text-brand-espresso">
                ₹{order.grand_total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Shipping Address ──────────────────────────────────── */}
        {shippingAddress && (
          <div className="rounded-card border border-brand-sand bg-white p-5 shadow-soft sm:p-7">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-brand-espresso sm:text-xl">
              <MapPin className="h-5 w-5 text-brand-copper" strokeWidth={1.75} />
              Shipping Address
            </h2>
            <address className="space-y-1 not-italic">
              <p className="font-body font-medium text-brand-espresso">
                {shippingAddress.full_name}
              </p>
              <p className="font-body text-sm text-brand-body">{shippingAddress.street_address}</p>
              <p className="font-body text-sm text-brand-body">
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
              </p>
              <p className="font-body text-sm text-brand-body">{shippingAddress.country}</p>
              {shippingAddress.phone && (
                <p className="pt-1 font-sub text-xs text-brand-mocha">
                  Phone: {shippingAddress.phone}
                </p>
              )}
            </address>
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/orders"
            className="group inline-flex flex-1 items-center justify-center gap-2 rounded bg-brand-gold-500 px-6 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
          >
            <Receipt className="h-4 w-4" strokeWidth={1.75} />
            View My Orders
          </Link>
          <Link
            href="/shop"
            className="group inline-flex flex-1 items-center justify-center gap-2 rounded border border-brand-sand bg-white px-6 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold-500 hover:shadow-soft"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <dt className="font-sub text-[11px] font-medium uppercase tracking-[0.12em] text-brand-mocha">
        {label}
      </dt>
      <dd className="flex">{children}</dd>
    </div>
  );
}

/** Matches the status pill styling used on the orders list page */
function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-sub text-[11px] font-semibold uppercase tracking-wider",
        value === "completed" || value === "paid"
          ? "bg-[#E8F3E8] text-[#2E6B2E]"
          : value === "processing"
            ? "bg-[#E6F0FA] text-[#1E5B99]"
            : value === "pending"
              ? "bg-brand-gold-100 text-brand-espresso"
              : value === "cancelled" || value === "failed" || value === "refunded"
                ? "bg-[#FBE9E9] text-[#9E2A2B]"
                : "bg-brand-cream text-brand-mocha",
      )}
    >
      {value}
    </span>
  );
}

function TotalRow({
  label,
  value,
  display,
}: {
  label: string;
  value: number;
  display?: string;
}) {
  return (
    <div className="flex items-center justify-between font-body text-sm text-brand-body">
      <span>{label}</span>
      <span>{display ?? `₹${value.toFixed(2)}`}</span>
    </div>
  );
}

function OrderConfirmationSkeleton() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="mx-auto flex w-full max-w-3xl animate-pulse flex-col gap-6 px-4 py-10 sm:px-6 lg:py-14">
        <div className="rounded-card border border-brand-sand bg-white p-8 shadow-soft sm:p-10">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-brand-cream" />
          <div className="mx-auto mb-3 h-3 w-32 rounded bg-brand-cream" />
          <div className="mx-auto mb-4 h-9 w-72 max-w-full rounded bg-brand-cream" />
          <div className="mx-auto h-4 w-full max-w-sm rounded bg-brand-cream" />
        </div>

        {[0, 1].map((i) => (
          <div key={i} className="rounded-card border border-brand-sand bg-white p-5 shadow-soft sm:p-7">
            <div className="mb-5 h-6 w-40 rounded bg-brand-cream" />
            <div className="space-y-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex items-center justify-between gap-4">
                  <div className="h-4 w-2/5 rounded bg-brand-cream" />
                  <div className="h-4 w-16 rounded bg-brand-cream" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
