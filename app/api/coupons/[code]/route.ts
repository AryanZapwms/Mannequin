import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connect";
import { Coupon, isCouponRedeemable } from "@/lib/db/models/Coupon";

/**
 * Existence check for a code. Superseded for checkout by POST /api/coupons/validate,
 * which prices the cart and returns the real discount — a scoped coupon's value
 * can't be computed without knowing what's in the cart.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  await dbConnect();

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon || !isCouponRedeemable(coupon)) {
    return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 404 });
  }

  return NextResponse.json({
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      scoped: (coupon.productIds ?? []).length > 0,
      expiresAt: coupon.expiresAt,
    },
  });
}
