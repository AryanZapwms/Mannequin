import { NextRequest, NextResponse } from "next/server";
import { priceCart, PricingError } from "@/lib/services/pricing";

/**
 * Prices the cart twice — with and without the code — so the browser shows the
 * exact discount the order API will apply. The client never computes it itself,
 * which matters for product-scoped coupons.
 */
export async function POST(request: NextRequest) {
  try {
    const { cartItems, code } = (await request.json()) ?? {};

    if (typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Enter a coupon code" }, { status: 400 });
    }

    const withCoupon = await priceCart(cartItems, code);

    if (withCoupon.discount <= 0) {
      return NextResponse.json(
        { error: "This coupon doesn't apply to any item in your cart" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      code: withCoupon.coupon_code,
      discount: withCoupon.discount,
      total: withCoupon.total,
      tax: withCoupon.tax,
      shipping: withCoupon.shipping,
    });
  } catch (err) {
    if (err instanceof PricingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Coupon validation error:", err);
    return NextResponse.json({ error: "Could not check that coupon" }, { status: 500 });
  }
}
