import Link from "next/link";
import { dbConnect } from "@/lib/db/connect";
import { Order, ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/db/models/Order";
import { User } from "@/lib/db/models/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "./actions";
import { Pagination } from "@/components/pagination";
import { CreditCard, MapPin, Package, Search, User as UserIcon } from "lucide-react";

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-orange-100 text-orange-800",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  authorized: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-orange-100 text-orange-800",
};

const money = (value: number) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const escapeRegex = (input: string) => input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async function OrdersPage({ searchParams }: { searchParams: any }) {
  const sp = await searchParams;
  const currentPage = Math.max(1, parseInt(sp?.page ?? "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const statusFilter = (ORDER_STATUSES as readonly string[]).includes(sp?.status)
    ? (sp.status as string)
    : "";
  const paymentFilter = (PAYMENT_STATUSES as readonly string[]).includes(sp?.payment)
    ? (sp.payment as string)
    : "";
  const query = typeof sp?.q === "string" ? sp.q.trim() : "";

  const filter: Record<string, unknown> = {};
  if (statusFilter) filter.status = statusFilter;
  if (paymentFilter) filter.paymentStatus = paymentFilter;
  if (query) {
    const rx = new RegExp(escapeRegex(query), "i");
    filter.$or = [
      { orderNumber: rx },
      { guestEmail: rx },
      { razorpayPaymentId: rx },
      { "shippingAddress.email": rx },
      { "shippingAddress.phone": rx },
      { "shippingAddress.full_name": rx },
    ];
  }

  await dbConnect();

  const [orderDocs, total] = await Promise.all([
    Order.find(filter).sort({ placedAt: -1 }).skip(offset).limit(PAGE_SIZE),
    Order.countDocuments(filter),
  ]);

  const userIds = orderDocs.filter((o) => o.userId).map((o) => o.userId!.toString());
  const userDocs = userIds.length
    ? await User.find({ _id: { $in: userIds } }).select("displayName phone email")
    : [];

  const profileMap = new Map(
    userDocs.map((u) => [
      u._id.toString(),
      { display_name: u.displayName ?? null, phone: u.phone ?? null, email: u.email ?? null },
    ]),
  );

  const entries = orderDocs.map((order) => {
    const shippingAddress = (order.shippingAddress ?? {}) as any;
    const profile = order.userId ? profileMap.get(order.userId.toString()) : null;

    return {
      id: order._id.toString(),
      order_number: order.orderNumber,
      status: order.status,
      payment_status: order.paymentStatus,
      payment_provider: order.paymentProvider ?? null,
      subtotal: order.subtotal ?? 0,
      discount_total: order.discountTotal ?? 0,
      tax_total: order.taxTotal ?? 0,
      shipping_total: order.shippingTotal ?? 0,
      grand_total: order.grandTotal ?? 0,
      placed_at: order.placedAt ? order.placedAt.toISOString() : null,
      notes: order.notes ?? null,
      razorpay_order_id: order.razorpayOrderId ?? null,
      razorpay_payment_id: order.razorpayPaymentId ?? null,
      shipping_address: shippingAddress,
      // Fall back to the address snapshot so guest orders aren't blank
      customer_name: profile?.display_name || shippingAddress.full_name || "Guest",
      customer_email: profile?.email || shippingAddress.email || order.guestEmail || null,
      customer_phone: profile?.phone || shippingAddress.phone || null,
      is_registered: Boolean(order.userId),
      items: (order.items ?? []).map((item, index) => ({
        key: `${order._id.toString()}-${index}`,
        name: (item.productSnapshot as any)?.name ?? "Unknown product",
        quantity: item.quantity ?? 0,
        unit_price: item.unitPrice ?? 0,
        line_total: item.lineTotal ?? 0,
      })),
      item_count: (order.items ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0),
    };
  });

  const buildFilterHref = (next: { status?: string; payment?: string }) => {
    const params = new URLSearchParams();
    const status = next.status ?? statusFilter;
    const payment = next.payment ?? paymentFilter;
    if (status) params.set("status", status);
    if (payment) params.set("payment", payment);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  const chipClass = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "border-black bg-black text-white"
        : "border-input bg-background text-muted-foreground hover:bg-gray-100 hover:text-foreground"
    }`;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Track customer orders, review what was purchased, and update fulfillment states.
        </p>
      </div>

      {/* ── Search + filters ──────────────────────────────────────── */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <form method="get" className="flex flex-col gap-2 sm:flex-row">
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            {paymentFilter && <input type="hidden" name="payment" value={paymentFilter} />}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Search order number, name, email, phone or payment id…"
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Search</Button>
              {(query || statusFilter || paymentFilter) && (
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/orders">Reset</Link>
                </Button>
              )}
            </div>
          </form>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Order status
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href={buildFilterHref({ status: "" })} className={chipClass(!statusFilter)}>
                All
              </Link>
              {ORDER_STATUSES.map((status) => (
                <Link
                  key={status}
                  href={buildFilterHref({ status })}
                  className={`${chipClass(statusFilter === status)} capitalize`}
                >
                  {status}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Payment status
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href={buildFilterHref({ payment: "" })} className={chipClass(!paymentFilter)}>
                All
              </Link>
              {PAYMENT_STATUSES.map((payment) => (
                <Link
                  key={payment}
                  href={buildFilterHref({ payment })}
                  className={`${chipClass(paymentFilter === payment)} capitalize`}
                >
                  {payment}
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Orders <span className="text-sm font-normal text-muted-foreground">({total})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {query || statusFilter || paymentFilter
                ? "No orders match these filters."
                : "No orders yet."}
            </p>
          ) : (
            entries.map((order) => (
              <div key={order.id} className="space-y-4 rounded-xl border p-4">
                {/* Header row */}
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-base font-semibold">
                      Order #{order.order_number ?? order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.placed_at
                        ? new Intl.DateTimeFormat("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(order.placed_at))
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${STATUS_COLORS[order.status] || "bg-gray-100"}`}
                    >
                      {order.status}
                    </span>
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${PAYMENT_COLORS[order.payment_status] || "bg-gray-100"}`}
                    >
                      {order.payment_status}
                    </span>
                    <span className="text-lg font-semibold">{money(order.grand_total)}</span>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  {/* Items */}
                  <div className="lg:col-span-2">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Package className="h-3.5 w-3.5" />
                      Items ({order.item_count})
                    </p>
                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium">Product</th>
                            <th className="px-3 py-2 text-right font-medium">Qty</th>
                            <th className="px-3 py-2 text-right font-medium">Unit</th>
                            <th className="px-3 py-2 text-right font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-3 py-3 text-muted-foreground">
                                No line items recorded.
                              </td>
                            </tr>
                          ) : (
                            order.items.map((item) => (
                              <tr key={item.key} className="border-t">
                                <td className="px-3 py-2">{item.name}</td>
                                <td className="px-3 py-2 text-right">{item.quantity}</td>
                                <td className="px-3 py-2 text-right">{money(item.unit_price)}</td>
                                <td className="px-3 py-2 text-right font-medium">
                                  {money(item.line_total)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Money breakdown */}
                    <dl className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <dt>Subtotal</dt>
                        <dd>{money(order.subtotal)}</dd>
                      </div>
                      {order.discount_total > 0 && (
                        <div className="flex justify-between text-green-700">
                          <dt>Discount</dt>
                          <dd>−{money(order.discount_total)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between text-muted-foreground">
                        <dt>Tax</dt>
                        <dd>{money(order.tax_total)}</dd>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <dt>Shipping</dt>
                        <dd>
                          {order.shipping_total === 0 ? "Free" : money(order.shipping_total)}
                        </dd>
                      </div>
                      <div className="flex justify-between border-t pt-1 font-semibold">
                        <dt>Total</dt>
                        <dd>{money(order.grand_total)}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Customer, address, payment */}
                  <div className="space-y-4 text-xs">
                    <div>
                      <p className="mb-1.5 flex items-center gap-1.5 font-semibold uppercase tracking-wide text-muted-foreground">
                        <UserIcon className="h-3.5 w-3.5" />
                        Customer
                      </p>
                      <p className="text-sm font-medium">
                        {order.customer_name}
                        {!order.is_registered && (
                          <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                            Guest
                          </span>
                        )}
                      </p>
                      {order.customer_email && (
                        <a
                          href={`mailto:${order.customer_email}`}
                          className="block text-muted-foreground underline hover:text-foreground"
                        >
                          {order.customer_email}
                        </a>
                      )}
                      {order.customer_phone && (
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="block text-muted-foreground hover:text-foreground"
                        >
                          {order.customer_phone}
                        </a>
                      )}
                    </div>

                    {order.shipping_address?.street_address && (
                      <div>
                        <p className="mb-1.5 flex items-center gap-1.5 font-semibold uppercase tracking-wide text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          Ship to
                        </p>
                        <address className="space-y-0.5 not-italic text-muted-foreground">
                          <p>{order.shipping_address.street_address}</p>
                          <p>
                            {order.shipping_address.city}, {order.shipping_address.state}{" "}
                            {order.shipping_address.postal_code}
                          </p>
                          <p>{order.shipping_address.country}</p>
                        </address>
                      </div>
                    )}

                    <div>
                      <p className="mb-1.5 flex items-center gap-1.5 font-semibold uppercase tracking-wide text-muted-foreground">
                        <CreditCard className="h-3.5 w-3.5" />
                        Payment
                      </p>
                      <p className="capitalize text-muted-foreground">
                        {order.payment_provider === "cod"
                          ? "Cash on Delivery"
                          : order.payment_provider || "Unknown"}
                      </p>
                      {order.razorpay_payment_id && (
                        <p className="break-all font-mono text-[11px] text-muted-foreground">
                          {order.razorpay_payment_id}
                        </p>
                      )}
                      {order.razorpay_order_id && (
                        <p className="break-all font-mono text-[11px] text-muted-foreground">
                          {order.razorpay_order_id}
                        </p>
                      )}
                      {order.notes && (
                        <p className="mt-1 text-muted-foreground">Note: {order.notes}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fulfilment controls */}
                <form action={updateOrderStatus} className="grid gap-4 border-t pt-4 md:grid-cols-3">
                  <input type="hidden" name="orderId" value={order.id} />
                  <div className="space-y-2">
                    <Label htmlFor={`status-${order.id}`}>Order status</Label>
                    <select
                      id={`status-${order.id}`}
                      name="status"
                      defaultValue={order.status ?? "pending"}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status} className="capitalize">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`payment-${order.id}`}>Payment status</Label>
                    <select
                      id={`payment-${order.id}`}
                      name="paymentStatus"
                      defaultValue={order.payment_status ?? "pending"}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {PAYMENT_STATUSES.map((payment) => (
                        <option key={payment} value={payment}>
                          {payment.charAt(0).toUpperCase() + payment.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="w-full">
                      Update order
                    </Button>
                  </div>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {total > PAGE_SIZE && (
        <div className="flex justify-center">
          <Pagination total={total} pageSize={PAGE_SIZE} currentPage={currentPage} />
        </div>
      )}
    </section>
  );
}
