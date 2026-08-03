"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { Order, ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/db/models/Order";
import { User } from "@/lib/db/models/User";
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

  if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`Invalid order status: ${status}`);
  }
  if (!(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) {
    throw new Error(`Invalid payment status: ${paymentStatus}`);
  }

  await requireStaff();

  await dbConnect();

  // First, get the current order details before updating
  const currentOrder = await Order.findById(orderId);
  if (!currentOrder) {
    throw new Error("Failed to fetch order: order not found");
  }

  const previousStatus = currentOrder.status;

  // Update the order status
  currentOrder.status = status as typeof currentOrder.status;
  currentOrder.paymentStatus = paymentStatus as typeof currentOrder.paymentStatus;
  await currentOrder.save();

  // Send email notification to customer if status changed
  if (previousStatus !== status) {
    try {
      const customer = currentOrder.userId
        ? await User.findById(currentOrder.userId).select("displayName phone email")
        : null;

      const customerEmail = customer?.email || currentOrder.shippingAddress?.email || "";
      const customerName = customer?.displayName || "Valued Customer";

      if (customerEmail) {
        const orderItems = (currentOrder.items || []).map((item) => ({
          name: (item.productSnapshot as any)?.name || "Unknown Product",
          quantity: item.quantity,
          price: item.unitPrice,
        }));

        const shippingAddress = currentOrder.shippingAddress as any;

        await sendOrderStatusUpdateEmail(customerEmail, {
          orderNumber: currentOrder.orderNumber || currentOrder._id.toString().slice(0, 8),
          customerName,
          status,
          paymentStatus,
          items: orderItems,
          total: currentOrder.grandTotal,
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
