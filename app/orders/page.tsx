import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserOrders } from "@/lib/services/order";
import type { Order } from "@/lib/services/order";

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
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">My Orders</h1>
        <p className="text-sm text-muted-foreground">
          View your order history and track your purchases.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">No orders yet</h2>
          <p className="mb-6 text-muted-foreground">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link
            href="/shop"
            className="inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}

function OrderCard({ order }: { order: Order }) {
  const placedAt = new Date(order.placed_at);
  const itemsCount = order.items?.length || 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{order.order_number}</h3>
            <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
              order.status === 'completed' ? 'bg-green-100 text-green-800' :
              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Placed on {placedAt.toLocaleDateString()} • {itemsCount} item{itemsCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-semibold">₹{order.grand_total.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {order.payment_status}
            </p>
          </div>

          <Link
            href={`/order-confirmation/${order.id}`}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}