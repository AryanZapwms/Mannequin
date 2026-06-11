import { dbConnect } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { User } from "@/lib/db/models/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "./actions";
import { Pagination } from "@/components/pagination";

const PAGE_SIZE = 10;

export default async function OrdersPage({ searchParams }: { searchParams: any }) {
  const sp = await searchParams;
  const currentPage = Math.max(1, parseInt(sp?.page ?? "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  await dbConnect();

  const [orderDocs, total] = await Promise.all([
    Order.find().sort({ placedAt: -1 }).skip(offset).limit(PAGE_SIZE),
    Order.countDocuments(),
  ]);

  const userIds = orderDocs.filter((o) => o.userId).map((o) => o.userId!.toString());
  const userDocs = userIds.length
    ? await User.find({ _id: { $in: userIds } }).select("displayName phone email")
    : [];

  const profileMap = new Map<string, { display_name: string | null; phone: string | null; email: string | null }>();
  userDocs.forEach((u) => {
    profileMap.set(u._id.toString(), {
      display_name: u.displayName ?? null,
      phone: u.phone ?? null,
      email: u.email ?? null,
    });
  });

  const entries = orderDocs.map((order) => ({
    id: order._id.toString(),
    order_number: order.orderNumber,
    status: order.status,
    payment_status: order.paymentStatus,
    grand_total: order.grandTotal,
    placed_at: order.placedAt ? order.placedAt.toISOString() : null,
    user_id: order.userId ? order.userId.toString() : null,
    shipping_address: order.shippingAddress as any,
    item_count: (order.items ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0),
  }));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground">Track customer orders and update fulfillment states.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            Orders <span className="text-sm font-normal text-muted-foreground">({total})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            entries.map((order) => {
              const customer = order.user_id ? profileMap.get(order.user_id) : null;
              const shippingAddress = order.shipping_address;
              const statusColors: Record<string, string> = {
                pending: "bg-yellow-100 text-yellow-800",
                processing: "bg-blue-100 text-blue-800",
                completed: "bg-green-100 text-green-800",
                cancelled: "bg-red-100 text-red-800",
                refunded: "bg-orange-100 text-orange-800",
              };
              const paymentStatusColors: Record<string, string> = {
                pending: "bg-yellow-100 text-yellow-800",
                authorized: "bg-blue-100 text-blue-800",
                paid: "bg-green-100 text-green-800",
                failed: "bg-red-100 text-red-800",
                refunded: "bg-orange-100 text-orange-800",
              };

              return (
              <div key={order.id} className="rounded-xl border p-4 space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <p className="text-base font-semibold">Order #{order.order_number ?? order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.placed_at
                        ? new Intl.DateTimeFormat("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(order.placed_at))
                        : ""}
                    </p>
                    {customer && (
                      <div className="mt-2 text-xs space-y-1">
                        <p className="text-muted-foreground">Customer: {customer.display_name}</p>
                        <p className="text-muted-foreground">Email: {customer.email || 'N/A'}</p>
                        <p className="text-muted-foreground">Phone: {customer.phone || 'N/A'}</p>
                      </div>
                    )}
                    {shippingAddress && (
                      <div className="mt-2 text-xs text-muted-foreground space-y-1">
                        <p className="font-medium">Shipping Address:</p>
                        <p>{shippingAddress.full_name}</p>
                        <p>{shippingAddress.street_address}</p>
                        <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}</p>
                        <p>{shippingAddress.country}</p>
                        <p>Phone: {shippingAddress.phone}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">₹{Number(order.grand_total ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.item_count} items
                    </p>
                    <div className="mt-2 space-y-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                        {order.status}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ml-2 ${paymentStatusColors[order.payment_status] || 'bg-gray-100'}`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
                <form action={updateOrderStatus} className="mt-4 grid gap-4 md:grid-cols-3">
                  <input type="hidden" name="orderId" value={order.id} />
                  <div className="space-y-2">
                    <Label htmlFor={`status-${order.id}`}>Order status</Label>
                    <select
                      id={`status-${order.id}`}
                      name="status"
                      defaultValue={order.status ?? "pending"}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
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
                      <option value="pending">Pending</option>
                      <option value="authorized">Authorized</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="w-full">
                      Update order
                    </Button>
                  </div>
                </form>
              </div>
              );
            })
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
