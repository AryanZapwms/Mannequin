"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendOrderStatusUpdateEmail } from "@/lib/services/email";

export async function updateOrderStatus(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as string;
  const paymentStatus = formData.get("paymentStatus") as string;

  if (!orderId || orderId.length === 0) {
    throw new Error("Order id is required");
  }

  if (!status || !paymentStatus) {
    throw new Error("Status and payment status are required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/orders");
  }

  // First, get the current order details before updating
  const { data: currentOrder, error: fetchError } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(*, product_snapshot)
    `)
    .eq("id", orderId)
    .single();

  if (fetchError) {
    console.error("Error fetching order:", fetchError);
    throw new Error(`Failed to fetch order: ${fetchError.message}`);
  }

  // Update the order status
  const { error } = await supabase
    .from("orders")
    .update({
      status,
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error("Error updating order status:", error);
    throw new Error(`Failed to update order: ${error.message}`);
  }

  // Send email notification to customer if status changed
  if (currentOrder.status !== status) {
    try {
      // Get customer profile information
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, phone, email: metadata->email")
        .eq("id", currentOrder.user_id)
        .single();

      const customerEmail = profile?.email || "";
      const customerName = profile?.display_name || "Valued Customer";

      if (customerEmail) {
        // Prepare order data for email
        const orderItems = (currentOrder.items || []).map((item: any) => ({
          name: item.product_snapshot?.name || "Unknown Product",
          quantity: item.quantity,
          price: item.unit_price,
        }));

        const shippingAddress = currentOrder.shipping_address as any;

        await sendOrderStatusUpdateEmail(customerEmail, {
          orderNumber: currentOrder.order_number || currentOrder.id.slice(0, 8),
          customerName,
          status,
          paymentStatus,
          items: orderItems,
          total: currentOrder.grand_total,
          shippingAddress: {
            fullName: shippingAddress?.full_name || "",
            streetAddress: shippingAddress?.street_address || "",
            city: shippingAddress?.city || "",
            state: shippingAddress?.state || "",
            postalCode: shippingAddress?.postal_code || "",
            country: shippingAddress?.country || "",
            phone: shippingAddress?.phone || "",
          },
        });
      }
    } catch (emailError) {
      console.error("Error sending status update email:", emailError);
      // Don't fail the status update if email fails
    }
  }

  revalidatePath("/admin/orders");
}
