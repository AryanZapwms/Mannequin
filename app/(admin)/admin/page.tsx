import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Package, ShoppingCart, Users2, Newspaper, Star } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [products, orders, users, blogs, reviews] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id, grand_total, status", { count: "exact" }).order("placed_at", { ascending: false }).limit(5),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }),
    supabase.from("product_reviews").select("id", { count: "exact", head: true }),
  ]);

  const [recentOrders, totalRevenue] = (() => {
    if (!orders.data) return [[], 0];
    const items = orders.data as Array<{ id: string; grand_total: number; status: string }>;
    const revenue = items.reduce((sum, item) => sum + (Number(item.grand_total) || 0), 0);
    return [items, revenue];
  })();

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Monitor store performance and keep track of orders, products, and customer engagement.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            ₹{totalRevenue.toLocaleString()} <ArrowUpRight className="h-3 w-3" />
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
                    <p className="text-sm font-semibold">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{order.status}</p>
                  </div>
                  <div className="text-right text-sm font-semibold">₹{Number(order.grand_total).toLocaleString()}</div>
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
