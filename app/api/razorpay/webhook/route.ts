import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { verifyWebhookSignature } from "@/lib/services/razorpay";

/**
 * Razorpay webhook — the out-of-band source of truth for payment state.
 *
 * The browser handler can be closed, lose network, or be killed mid-flow, so it
 * cannot be relied on to record payments. This endpoint reconciles whatever the
 * browser managed to report. Configure it in the Razorpay dashboard for the
 * `payment.captured` and `payment.failed` events.
 */
export async function POST(request: NextRequest) {
  // Signature is computed over the exact bytes — read the body as text, never
  // re-serialise it.
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const payment = event?.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;
  const razorpayPaymentId = payment?.id;

  if (!razorpayOrderId || !razorpayPaymentId) {
    // Nothing actionable, but acknowledge so Razorpay stops retrying.
    return NextResponse.json({ received: true });
  }

  try {
    await dbConnect();
    const order = await Order.findOne({ razorpayOrderId });

    if (!order) {
      // Payment succeeded but no order was ever recorded — the customer's
      // browser died between paying and POSTing. Needs manual follow-up.
      console.error(
        `ORPHANED PAYMENT: razorpay order ${razorpayOrderId} / payment ${razorpayPaymentId} ` +
          `for ₹${Number(payment.amount ?? 0) / 100} has no matching order`,
      );
      return NextResponse.json({ received: true });
    }

    switch (event.event) {
      case "payment.captured":
      case "order.paid":
        if (order.paymentStatus !== "paid") {
          order.paymentStatus = "paid";
          order.razorpayPaymentId = razorpayPaymentId;
          await order.save();
        }
        break;

      case "payment.failed":
        // Never downgrade an order the API already confirmed as paid.
        if (order.paymentStatus === "pending") {
          order.paymentStatus = "failed";
          await order.save();
        }
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    // 500 makes Razorpay retry, which is what we want for a transient failure.
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
