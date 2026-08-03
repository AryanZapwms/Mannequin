import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createRazorpayOrder } from "@/lib/services/razorpay";
import { priceCart, PricingError } from "@/lib/services/pricing";

/**
 * Creates the Razorpay order the browser then pays. The amount is computed from
 * the database here, so the customer can never open the payment sheet for a
 * total they chose themselves.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItems, couponCode, email } = body ?? {};

    const user = await getCurrentUser();
    const pricing = await priceCart(cartItems, couponCode);

    const order = await createRazorpayOrder({
      amount: pricing.total,
      receipt: `rcpt_${Date.now().toString(36)}`,
      notes: {
        email: (email as string) || user?.email || "",
        userId: user?.id ?? "guest",
      },
    });

    return NextResponse.json({
      razorpayOrderId: order.id,
      // Paise, straight from Razorpay — the client passes this back untouched
      amount: order.amount,
      currency: order.currency,
      pricing: {
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        shipping: pricing.shipping,
        tax: pricing.tax,
        total: pricing.total,
      },
    });
  } catch (err) {
    if (err instanceof PricingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Razorpay order creation error:", err);
    return NextResponse.json({ error: "Could not start payment" }, { status: 500 });
  }
}
