import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/services/order";
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const adminSupabase = createAdminClient();
    const orderNumber = generateOrderNumber();

    const paymentStatus =
      paymentMethod === "razorpay" && razorpayPaymentId ? "paid" : "pending";

    // Create order via admin client (bypasses RLS — safe because this is server-side)
    const { data: createdOrder, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
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
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Insert order items
    const itemsToInsert = cartItems.map((item: any) => ({
      order_id: createdOrder.id,
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

    const { error: itemsError } = await adminSupabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Order items error:", itemsError);
      // Don't fail the whole request — order was created, items insertion failed
    }

    // Decrement stock for each product
    for (const item of cartItems) {
      if (item.product_id && item.quantity) {
        await adminSupabase.rpc("decrement_stock", {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        }).catch((e) => console.error("Stock decrement error:", e));
      }
    }

    // Clear cart for logged-in users
    if (user?.id) {
      await adminSupabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .catch((e) => console.error("Cart clear error:", e));
    }

    // Send confirmation emails
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
