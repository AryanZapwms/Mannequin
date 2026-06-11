import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/connect";
import { getCurrentUser } from "@/lib/auth-helpers";
import { Product } from "@/lib/db/models/Product";
import { CartItem } from "@/lib/db/models/CartItem";
import { createOrder, generateOrderNumber } from "@/lib/services/order";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
} from "@/lib/services/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cartItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      tax,
      shipping,
      total,
      razorpayPaymentId,
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

    // Get the current user (may be null for guests)
    const user = await getCurrentUser();

    await dbConnect();
    const orderNumber = generateOrderNumber();

    const paymentStatus =
      paymentMethod === "razorpay" && razorpayPaymentId ? "paid" : "pending";

    // Build order items from cart payload
    const orderItems = cartItems.map((item: any) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.product?.price ?? 0,
      line_total: (item.product?.price ?? 0) * item.quantity,
      product_snapshot: {
        name: item.product?.name,
        price: item.product?.price,
        quantity: item.quantity,
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
          subtotal: subtotal ?? 0,
          discount_total: body.discountTotal ?? 0,
          tax_total: tax ?? 0,
          shipping_total: shipping ?? 0,
          grand_total: total ?? 0,
          currency: "INR",
          payment_provider: paymentMethod,
          billing_address: shippingAddress,
          shipping_address: shippingAddress,
          notes: paymentMethod === "cod" ? "Cash on Delivery" : undefined,
        },
        orderItems,
        { session },
      );

      // Decrement stock for each product inside the transaction
      for (const item of cartItems) {
        if (item.product_id && item.quantity) {
          await Product.decrementStock(item.product_id, item.quantity, session);
        }
      }

      // Clear cart for logged-in users inside the transaction
      if (user?.id) {
        await CartItem.deleteMany({ userId: user.id }, { session });
      }

      await session.commitTransaction();
    } catch (txError) {
      await session.abortTransaction();
      console.error("Order transaction error:", txError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    } finally {
      await session.endSession();
    }

    // --- Post-transaction: send emails (non-critical, fire-and-forget) ---
    const customerEmail =
      shippingAddress.email ||
      user?.email ||
      body.guestEmail ||
      null;

    if (customerEmail) {
      await sendOrderConfirmationEmail(customerEmail, {
        orderNumber,
        customerName: shippingAddress.full_name || "Customer",
        items: cartItems.map((item: any) => ({
          name: item.product?.name || "Product",
          quantity: item.quantity,
          price: item.product?.price || 0,
        })),
        subtotal: subtotal ?? 0,
        tax: tax ?? 0,
        shipping: shipping ?? 0,
        total: total ?? 0,
        shippingAddress: {
          fullName: shippingAddress.full_name || "",
          streetAddress: shippingAddress.street_address || "",
          city: shippingAddress.city || "",
          state: shippingAddress.state || "",
          postalCode: shippingAddress.postal_code || "",
          country: shippingAddress.country || "India",
          phone: shippingAddress.phone || "",
        },
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      }).catch((e) => console.error("Email error:", e));
    }

    await sendAdminOrderNotification({
      orderNumber,
      customerName: shippingAddress.full_name || "Guest",
      customerEmail: customerEmail || "N/A",
      customerPhone: shippingAddress.phone || "N/A",
      items: cartItems.map((item: any) => ({
        name: item.product?.name || "Product",
        quantity: item.quantity,
        price: item.product?.price || 0,
      })),
      total: total ?? 0,
      shippingAddress: {
        fullName: shippingAddress.full_name || "",
        streetAddress: shippingAddress.street_address || "",
        city: shippingAddress.city || "",
        state: shippingAddress.state || "",
        postalCode: shippingAddress.postal_code || "",
        country: shippingAddress.country || "India",
        phone: shippingAddress.phone || "",
      },
      paymentMethod: paymentMethod === "razorpay" ? "Razorpay" : "Cash on Delivery",
    }).catch((e) => console.error("Admin email error:", e));

    return NextResponse.json({ orderId: createdOrder.id, orderNumber });
  } catch (err) {
    console.error("Checkout API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
