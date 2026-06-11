import { dbConnect } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { Order } from "@/lib/db/models/Order";
import { User } from "@/lib/db/models/User";
import { BlogPost } from "@/lib/db/models/BlogPost";
import { ProductReview } from "@/lib/db/models/ProductReview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Package, ShoppingCart, Users2, Newspaper, Star } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  await dbConnect();

  const [productCount, recentOrderDocs, totalOrders, allOrders, userCount, blogCount, reviewCount] =
    await Promise.all([
      Product.countDocuments(),
      Order.find().sort({ placedAt: -1 }).limit(5).select("orderNumber grandTotal status placedAt"),
      Order.countDocuments(),
      Order.find().select("grandTotal"),
      User.countDocuments(),
      BlogPost.countDocuments(),
      ProductReview.countDocuments(),
    ]);

  const recentOrders = recentOrderDocs.map((order) => ({
    id: order._id.toString(),
    order_number: order.orderNumber,
    grand_total: order.grandTotal,
    status: order.status,
    placed_at: (order.placedAt ?? new Date()).toString(),
  }));
  const totalRevenue = allOrders.reduce((sum, row) => sum + (Number(row.grandTotal) || 0), 0);

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Monitor store performance and keep track of orders, products, and customer engagement.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount}</div>
            <p className="text-xs text-muted-foreground">Published and draft products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">₹{totalRevenue.toLocaleString("en-IN")} revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogCount}</div>
            <p className="text-xs text-muted-foreground">Published and draft articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewCount}</div>
            <p className="text-xs text-muted-foreground">Customer feedback awaiting moderation</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent orders</CardTitle>
            <p className="text-sm text-muted-foreground">Latest activity across your store</p>
          </div>
          <Badge variant="secondary" className="gap-1">
            ₹{totalRevenue.toLocaleString("en-IN")} total <ArrowUpRight className="h-3 w-3" />
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">
                      Order {order.order_number ?? `#${order.id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {order.status} ·{" "}
                      {new Date(order.placed_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right text-sm font-semibold">
                    ₹{Number(order.grand_total).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              View all orders
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
