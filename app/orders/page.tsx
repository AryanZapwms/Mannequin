import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserOrders } from "@/lib/services/order";
import type { Order } from "@/lib/services/order";
import { ChevronRight, Package, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Orders — Mannequin Care",
  description: "View your order history and track the status of current orders.",
  robots: { index: false },
};

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?next=/orders");
  }

  const orders = await getUserOrders(user.id);

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:py-14">
        <header className="flex flex-col gap-1">
          <p className="font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
            <span aria-hidden className="mr-1.5 text-brand-gold-500">✦</span>
            Order History
          </p>
          <h1 className="font-display text-display font-light italic text-brand-espresso">
            My Orders
          </h1>
          <p className="mt-1 max-w-md font-body text-sm leading-relaxed text-brand-body">
            View your order history, track your purchases, and manage returns.
          </p>
        </header>

        {orders.length === 0 ? (
          <div className="rounded-card border border-brand-sand bg-white p-8 text-center shadow-soft sm:p-12">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-cream text-brand-copper">
              <Package className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h2 className="mb-2 font-display text-2xl font-medium text-brand-espresso">No orders yet</h2>
            <p className="mb-8 font-body text-brand-body">
              You haven't placed any orders yet. Start exploring our collections.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded bg-brand-gold-500 px-6 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const placedAt = new Date(order.placed_at);
  const itemsCount = order.items?.length || 0;

  return (
    <div className="group rounded-card border border-brand-sand bg-white p-5 shadow-soft transition-all duration-300 hover:border-brand-gold-200 hover:shadow-md sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-lg font-medium text-brand-espresso sm:text-xl">
              {order.order_number}
            </h3>
            <span className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 font-sub text-[11px] font-semibold uppercase tracking-wider",
              order.status === 'completed' ? 'bg-[#E8F3E8] text-[#2E6B2E]' :
              order.status === 'processing' ? 'bg-[#E6F0FA] text-[#1E5B99]' :
              order.status === 'pending' ? 'bg-brand-gold-100 text-brand-espresso' :
              order.status === 'cancelled' ? 'bg-[#FBE9E9] text-[#9E2A2B]' :
              'bg-brand-cream text-brand-mocha'
            )}>
              {order.status}
            </span>
          </div>
          <p className="font-body text-sm text-brand-body">
            Placed on {placedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} <span className="mx-1 text-brand-sand">•</span> {itemsCount} item{itemsCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-6 border-t border-brand-sand pt-4 sm:border-none sm:pt-0">
          <div className="text-left sm:text-right">
            <p className="font-display text-lg font-medium text-brand-espresso">₹{order.grand_total.toFixed(2)}</p>
            <p className="font-sub text-[11px] font-medium uppercase tracking-[0.05em] text-brand-mocha">
              {order.payment_status}
            </p>
          </div>

          <Link
            href={`/order-confirmation/${order.id}`}
            className="group/btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-sand bg-brand-cream text-brand-espresso transition-colors hover:border-brand-gold-500 hover:bg-brand-gold-500"
            aria-label="View Details"
          >
            <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}