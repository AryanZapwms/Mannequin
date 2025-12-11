import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteProduct } from "./actions";
import { Edit2, Plus, Trash2 } from "lucide-react";

async function destroyProduct(formData: FormData) {
  "use server";
  const productId = formData.get("productId");
  if (typeof productId !== "string") {
    throw new Error("Product id is required");
  }
  await deleteProduct(productId);
}

export default async function ProductsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const query = typeof searchParams?.q === "string" ? searchParams.q : "";
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      `id, name, slug, price, compare_at_price, stock, status, is_featured, thumbnail_url,
      main_category:product_categories!products_main_category_id_fkey(id, name),
      sub_category:product_categories!products_sub_category_id_fkey(id, name)`
    )
    .order("created_at", { ascending: false });

  const products = (data ?? []).filter((product) => {
    if (!query) return true;
    const normalized = query.toLowerCase();
    return (
      product.name.toLowerCase().includes(normalized) ||
      product.slug.toLowerCase().includes(normalized) ||
      product.main_category?.name?.toLowerCase().includes(normalized) ||
      product.sub_category?.name?.toLowerCase().includes(normalized)
    );
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage catalog, stock levels, and merchandising.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        </Link>
      </div>

      <form className="flex w-full md:w-80">
        <Input
          name="q"
          placeholder="Search by name or category"
          defaultValue={query}
          className="rounded-r-none"
        />
        <Button type="submit" variant="secondary" className="rounded-l-none">
          Search
        </Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>All products</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-3 pr-4">Product</th>
                <th className="py-3 px-4">Main category</th>
                <th className="py-3 px-4">Sub category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="text-sm">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 overflow-hidden rounded-md bg-muted">
                          {product.thumbnail_url ? (
                            <Image
                              src={product.thumbnail_url}
                              alt={product.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[10px] uppercase text-muted-foreground">
                              No image
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-base">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-muted-foreground">
                      {product.main_category?.name ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {product.sub_category?.name ?? "—"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">₹{Number(product.price).toLocaleString()}</div>
                      {product.compare_at_price ? (
                        <div className="text-xs text-muted-foreground line-through">
                          ₹{Number(product.compare_at_price).toLocaleString()}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 px-4">{product.stock}</td>
                    <td className="py-3 px-4 capitalize">{product.status}</td>
                    <td className="py-3 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${product.id}`} className="inline-flex">
                          <Button variant="outline" size="icon" aria-label={`Edit ${product.name}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form action={destroyProduct}>
                          <input type="hidden" name="productId" value={product.id} />
                          <Button variant="destructive" size="icon" aria-label={`Delete ${product.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}
