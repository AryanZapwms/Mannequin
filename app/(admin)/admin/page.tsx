import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Package, ShoppingCart, Users2, Newspaper, Star } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [products, recentOrdersRes, allRevenueRes, users, blogs, reviews] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    // Recent 5 orders for display
    supabase
      .from("orders")
      .select("id, order_number, grand_total, status, placed_at", { count: "exact" })
      .order("placed_at", { ascending: false })
      .limit(5),
    // All orders — only grand_total needed for revenue sum
    supabase.from("orders").select("grand_total"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }),
    supabase.from("product_reviews").select("id", { count: "exact", head: true }),
  ]);

  const recentOrders = (recentOrdersRes.data ?? []) as Array<{
    id: string;
    order_number: string;
    grand_total: number;
    status: string;
    placed_at: string;
  }>;
  const totalOrders = recentOrdersRes.count ?? 0;
  const totalRevenue = (allRevenueRes.data ?? []).reduce(
    (sum, row) => sum + (Number(row.grand_total) || 0),
    0
  );

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
            <div className="text-2xl font-bold">{products.count ?? 0}</div>
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
            <div className="text-2xl font-bold">{users.count ?? 0}</div>
            <p className="text-xs text-muted-foreground">Profiles in Supabase</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogs.count ?? 0}</div>
            <p className="text-xs text-muted-foreground">Published and draft articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.count ?? 0}</div>
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
