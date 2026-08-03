import { dbConnect } from "@/lib/db/connect";
import { Coupon, isCouponRedeemable } from "@/lib/db/models/Coupon";
import { Product } from "@/lib/db/models/Product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CouponForm, type CouponProductOption } from "@/components/admin/coupon-form";
import { createCoupon, updateCoupon, toggleCoupon, deleteCoupon } from "./actions";
import { CalendarClock, Tag, Ticket, Trash2 } from "lucide-react";

/** Date input wants yyyy-MM-dd in local terms */
function toDateInput(date: Date | null | undefined): string {
  if (!date) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export default async function CouponsPage() {
  await dbConnect();

  const [couponDocs, productDocs] = await Promise.all([
    Coupon.find().sort({ createdAt: -1 }),
    Product.find().select("name").sort({ name: 1 }),
  ]);

  const products: CouponProductOption[] = productDocs.map((product) => ({
    id: product._id.toString(),
    name: product.name,
  }));
  const productNames = new Map(products.map((product) => [product.id, product.name]));

  const coupons = couponDocs.map((coupon) => {
    const productIds = (coupon.productIds ?? []).map((id) => id.toString());
    return {
      id: coupon._id.toString(),
      code: coupon.code,
      description: coupon.description ?? "",
      type: coupon.type as "percent" | "fixed",
      value: coupon.value,
      expiresAt: coupon.expiresAt ?? null,
      usageLimit: coupon.usageLimit ?? null,
      usedCount: coupon.usedCount ?? 0,
      isActive: coupon.isActive,
      productIds,
      productLabels: productIds.map((id) => productNames.get(id) ?? "Deleted product"),
      redeemable: isCouponRedeemable(coupon),
    };
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Promo Codes</h1>
        <p className="text-sm text-muted-foreground">
          Create discount codes, scope them to specific products, and set when they expire.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-muted-foreground" />
            New promo code
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a product first — a coupon needs something to discount.
            </p>
          ) : (
            <CouponForm products={products} action={createCoupon} submitLabel="Create coupon" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Existing codes{" "}
            <span className="text-sm font-normal text-muted-foreground">({coupons.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {coupons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No promo codes yet.</p>
          ) : (
            coupons.map((coupon) => (
              <details key={coupon.id} className="rounded-xl border">
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-gray-900 px-2 py-1 font-mono text-xs font-semibold text-white">
                        {coupon.code}
                      </span>
                      <span className="text-sm font-medium">
                        {coupon.type === "percent"
                          ? `${coupon.value}% off`
                          : `₹${coupon.value.toLocaleString("en-IN")} off`}
                      </span>
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          coupon.redeemable
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {coupon.isActive
                          ? coupon.redeemable
                            ? "Live"
                            : "Expired"
                          : "Paused"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" />
                        {coupon.productIds.length === 0
                          ? "All products"
                          : coupon.productLabels.slice(0, 2).join(", ") +
                            (coupon.productLabels.length > 2
                              ? ` +${coupon.productLabels.length - 2} more`
                              : "")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {coupon.expiresAt
                          ? `Expires ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(coupon.expiresAt)}`
                          : "No expiry"}
                      </span>
                      <span>
                        Used {coupon.usedCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <form action={toggleCoupon}>
                      <input type="hidden" name="couponId" value={coupon.id} />
                      <Button type="submit" variant="outline" size="sm">
                        {coupon.isActive ? "Pause" : "Activate"}
                      </Button>
                    </form>
                    <form action={deleteCoupon}>
                      <input type="hidden" name="couponId" value={coupon.id} />
                      <Button
                        type="submit"
                        variant="destructive"
                        size="icon"
                        aria-label={`Delete ${coupon.code}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </summary>

                <div className="border-t p-4">
                  <CouponForm
                    products={products}
                    action={updateCoupon}
                    submitLabel="Save changes"
                    initial={{
                      id: coupon.id,
                      code: coupon.code,
                      description: coupon.description,
                      type: coupon.type,
                      value: coupon.value,
                      expiresAt: toDateInput(coupon.expiresAt),
                      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
                      isActive: coupon.isActive,
                      productIds: coupon.productIds,
                    }}
                  />
                </div>
              </details>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
