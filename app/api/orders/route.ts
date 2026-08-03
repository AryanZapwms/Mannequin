import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/connect";
import { getCurrentUser } from "@/lib/auth-helpers";
import { Product } from "@/lib/db/models/Product";
import { CartItem } from "@/lib/db/models/CartItem";
import { Order as OrderModel } from "@/lib/db/models/Order";
import { Coupon } from "@/lib/db/models/Coupon";
import { createOrder, generateOrderNumber } from "@/lib/services/order";
import { priceCart, PricingError, amountsMatch } from "@/lib/services/pricing";
import { verifyPaymentSignature, fetchPayment } from "@/lib/services/razorpay";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
} from "@/lib/services/email";

class OutOfStockError extends Error {
  constructor(productName: string) {
    super(`${productName} is out of stock`);
    this.name = "OutOfStockError";
  }
}

class CouponExhaustedError extends Error {
  constructor() {
    super("This coupon has reached its usage limit");
    this.name = "CouponExhaustedError";
  }
}

/** Shapes the success payload; `guestToken` is only present for guest orders */
function orderResponse(order: {
  id: string;
  order_number: string;
  guestToken?: string | null;
}) {
  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.order_number,
    guestToken: order.guestToken ?? undefined,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cartItems,
      shippingAddress,
      paymentMethod,
      couponCode,
      idempotencyKey,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!shippingAddress) {
      return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
    }
    if (!paymentMethod || !["razorpay", "cod"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }
    if (typeof idempotencyKey !== "string" || idempotencyKey.length < 8) {
      return NextResponse.json({ error: "Missing idempotency key" }, { status: 400 });
    }

    const user = await getCurrentUser();

    await dbConnect();

    // ── Idempotency: a replayed request returns the original order ──────────
    const existing = await OrderModel.findOne({ idempotencyKey });
    if (existing) {
      return orderResponse({
        id: existing._id.toString(),
        order_number: existing.orderNumber,
        guestToken: existing.guestToken,
      });
    }

    // ── Re-price everything from the database ───────────────────────────────
    // Client-supplied amounts are ignored entirely.
    let pricing;
    try {
      pricing = await priceCart(cartItems, couponCode);
    } catch (err) {
      if (err instanceof PricingError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    // ── Verify payment before trusting `paid` ───────────────────────────────
    let paymentStatus: "pending" | "paid" = "pending";

    if (paymentMethod === "razorpay") {
      if (
        typeof razorpayOrderId !== "string" ||
        typeof razorpayPaymentId !== "string" ||
        typeof razorpaySignature !== "string"
      ) {
        return NextResponse.json({ error: "Payment details are missing" }, { status: 400 });
      }

      if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
        console.error("Razorpay signature mismatch", { razorpayOrderId, razorpayPaymentId });
        return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
      }

      // Signature only proves the ids belong together. Ask Razorpay what was
      // actually paid, so the amount can't be under-reported.
      let payment;
      try {
        payment = await fetchPayment(razorpayPaymentId);
      } catch (err) {
        console.error("Razorpay payment fetch failed:", err);
        return NextResponse.json({ error: "Could not confirm payment" }, { status: 502 });
      }

      const paidAmount = Number(payment?.amount ?? 0) / 100;
      const settled = payment?.status === "captured" || payment?.status === "authorized";

      if (!settled || payment?.order_id !== razorpayOrderId) {
        return NextResponse.json({ error: "Payment was not completed" }, { status: 400 });
      }
      if (!amountsMatch(paidAmount, pricing.total)) {
        console.error("Razorpay amount mismatch", { paidAmount, expected: pricing.total });
        return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
      }

      paymentStatus = "paid";
    }

    const orderNumber = generateOrderNumber();
    const guestToken = user?.id ? null : crypto.randomBytes(24).toString("hex");
    const guestEmail =
      (shippingAddress.email as string | undefined) || (body.guestEmail as string | undefined) || null;

    const orderItems = pricing.lines.map((line) => ({
      product_id: line.product_id,
      quantity: line.quantity,
      unit_price: line.unit_price,
      line_total: line.line_total,
      product_snapshot: {
        name: line.name,
        price: line.unit_price,
        quantity: line.quantity,
      },
    }));

    // --- Transaction: Order.create + Product.decrementStock + CartItem.deleteMany ---
    const session = await mongoose.startSession();
    let createdOrder;

    try {
      session.startTransaction();

      createdOrder = await createOrder(
        {
          order_number: orderNumber,
          user_id: user?.id ?? null,
          status: "pending",
          payment_status: paymentStatus,
          subtotal: pricing.subtotal,
          discount_total: pricing.discount,
          tax_total: pricing.tax,
          shipping_total: pricing.shipping,
          grand_total: pricing.total,
          currency: "INR",
          payment_provider: paymentMethod,
          billing_address: shippingAddress,
          shipping_address: shippingAddress,
          notes: paymentMethod === "cod" ? "Cash on Delivery" : undefined,
          razorpay_order_id: paymentMethod === "razorpay" ? razorpayOrderId : null,
          razorpay_payment_id: paymentMethod === "razorpay" ? razorpayPaymentId : null,
          idempotency_key: idempotencyKey,
          guest_token: guestToken,
          guest_email: user?.id ? null : guestEmail,
        },
        orderItems,
        { session },
      );

      // Decrement stock for each product inside the transaction
      for (const line of pricing.lines) {
        const updated = await Product.decrementStock(line.product_id, line.quantity, session);
        // decrementStock only matches when stock >= quantity, so null means
        // the product vanished or someone else took the last units.
        if (!updated) {
          throw new OutOfStockError(line.name);
        }
      }

      // Claim one redemption. The conditional match makes the usage limit hold
      // under concurrency instead of relying on the earlier read in priceCart.
      if (pricing.coupon_code) {
        const claimed = await Coupon.updateOne(
          {
            code: pricing.coupon_code,
            $or: [
              { usageLimit: null },
              { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
            ],
          },
          { $inc: { usedCount: 1 } },
          { session },
        );

        // matchedCount 0 with a real coupon means the limit was just exhausted.
        // Legacy SiteSetting codes have no document, so allow those through.
        if (claimed.matchedCount === 0) {
          const exists = await Coupon.exists({ code: pricing.coupon_code }).session(session);
          if (exists) throw new CouponExhaustedError();
        }
      }

      // Clear cart for logged-in users inside the transaction
      if (user?.id) {
        await CartItem.deleteMany({ userId: user.id }, { session });
      }

      await session.commitTransaction();
    } catch (txError: any) {
      await session.abortTransaction();

      // A concurrent retry with the same key won the race — return its order.
      if (txError?.code === 11000) {
        const winner = await OrderModel.findOne({
          $or: [{ idempotencyKey }, ...(razorpayPaymentId ? [{ razorpayPaymentId }] : [])],
        });
        if (winner) {
          return orderResponse({
            id: winner._id.toString(),
            order_number: winner.orderNumber,
            guestToken: winner.guestToken,
          });
        }
      }

      if (txError instanceof CouponExhaustedError) {
        if (paymentStatus === "paid") {
          console.error(
            `PAID BUT UNFULFILLED: payment ${razorpayPaymentId} for ₹${pricing.total} needs a refund — ${txError.message}`,
          );
        }
        return NextResponse.json({ error: txError.message }, { status: 409 });
      }

      if (txError instanceof OutOfStockError) {
        // The customer may already have paid — log loudly so it can be refunded.
        if (paymentStatus === "paid") {
          console.error(
            `PAID BUT UNFULFILLED: payment ${razorpayPaymentId} for ₹${pricing.total} needs a refund — ${txError.message}`,
          );
        }
        return NextResponse.json({ error: txError.message }, { status: 409 });
      }

      console.error("Order transaction error:", txError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    } finally {
      await session.endSession();
    }

    // --- Post-transaction: send emails (non-critical) ---
    const customerEmail = shippingAddress.email || user?.email || body.guestEmail || null;

    const emailItems = pricing.lines.map((line) => ({
      name: line.name,
      quantity: line.quantity,
      price: line.unit_price,
    }));
    const emailAddress = {
      fullName: shippingAddress.full_name || "",
      streetAddress: shippingAddress.street_address || "",
      city: shippingAddress.city || "",
      state: shippingAddress.state || "",
      postalCode: shippingAddress.postal_code || "",
      country: shippingAddress.country || "India",
      phone: shippingAddress.phone || "",
    };

    if (customerEmail) {
      await sendOrderConfirmationEmail(customerEmail, {
        orderNumber,
        customerName: shippingAddress.full_name || "Customer",
        items: emailItems,
        subtotal: pricing.subtotal,
        tax: pricing.tax,
        shipping: pricing.shipping,
        total: pricing.total,
        shippingAddress: emailAddress,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      }).catch((e) => console.error("Email error:", e));
    }

    await sendAdminOrderNotification({
      orderNumber,
      customerName: shippingAddress.full_name || "Guest",
      customerEmail: customerEmail || "N/A",
      customerPhone: shippingAddress.phone || "N/A",
      items: emailItems,
      total: pricing.total,
      shippingAddress: emailAddress,
      paymentMethod: paymentMethod === "razorpay" ? "Razorpay" : "Cash on Delivery",
    }).catch((e) => console.error("Admin email error:", e));

    return orderResponse({
      id: createdOrder.id,
      order_number: orderNumber,
      guestToken,
    });
  } catch (err) {
    console.error("Checkout API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
