import type { ClientSession } from "mongoose";
import { dbConnect } from "@/lib/db/connect";
import { Order as OrderModel } from "@/lib/db/models/Order";

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_snapshot?: Record<string, any>;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  shipping_total: number;
  grand_total: number;
  currency: string;
  payment_provider?: string;
  billing_address?: Record<string, any>;
  shipping_address?: Record<string, any>;
  notes?: string;
  placed_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function toOrder(doc: any): Order {
  const id = doc._id.toString();
  return {
    id,
    order_number: doc.orderNumber,
    user_id: doc.userId ? doc.userId.toString() : undefined,
    status: doc.status,
    payment_status: doc.paymentStatus,
    subtotal: doc.subtotal,
    discount_total: doc.discountTotal,
    tax_total: doc.taxTotal,
    shipping_total: doc.shippingTotal,
    grand_total: doc.grandTotal,
    currency: doc.currency,
    payment_provider: doc.paymentProvider ?? undefined,
    billing_address: doc.billingAddress ?? undefined,
    shipping_address: doc.shippingAddress ?? undefined,
    notes: doc.notes ?? undefined,
    placed_at: (doc.placedAt ?? doc.createdAt ?? new Date()).toISOString(),
    updated_at: (doc.updatedAt ?? new Date()).toISOString(),
    items: (doc.items ?? []).map((item: any) => ({
      id: item._id.toString(),
      order_id: id,
      product_id: item.productId ? item.productId.toString() : undefined,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_total: item.lineTotal,
      product_snapshot: item.productSnapshot ?? undefined,
    })),
  };
}

export interface CreateOrderInput {
  order_number: string;
  user_id?: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  shipping_total: number;
  grand_total: number;
  currency: string;
  payment_provider?: string | null;
  billing_address?: Record<string, any> | null;
  shipping_address?: Record<string, any> | null;
  notes?: string | null;
}

export async function createOrder(
  order: CreateOrderInput,
  items: Omit<OrderItem, "id" | "order_id">[],
  options?: { session?: ClientSession },
): Promise<Order> {
  await dbConnect();

  const [created] = await OrderModel.create(
    [
      {
        orderNumber: order.order_number,
        userId: order.user_id ?? null,
        status: order.status,
        paymentStatus: order.payment_status,
        subtotal: order.subtotal,
        discountTotal: order.discount_total,
        taxTotal: order.tax_total,
        shippingTotal: order.shipping_total,
        grandTotal: order.grand_total,
        currency: order.currency,
        paymentProvider: order.payment_provider ?? null,
        billingAddress: order.billing_address ?? null,
        shippingAddress: order.shipping_address ?? null,
        notes: order.notes ?? null,
        items: items.map((item) => ({
          productId: item.product_id ?? null,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          lineTotal: item.line_total,
          productSnapshot: item.product_snapshot ?? null,
        })),
      },
    ],
    { session: options?.session },
  );

  return toOrder(created);
}

export async function getOrderById(orderId: string): Promise<Order> {
  await dbConnect();
  const doc = await OrderModel.findById(orderId);
  if (!doc) throw new Error("Order not found");
  return toOrder(doc);
}

export async function getUserOrders(
  userId: string,
  limit: number = 10,
  offset: number = 0,
): Promise<Order[]> {
  await dbConnect();
  const docs = await OrderModel.find({ userId })
    .sort({ placedAt: -1 })
    .skip(offset)
    .limit(limit);
  return docs.map(toOrder);
}

export async function getAllOrders(
  limit: number = 50,
  offset: number = 0,
  filters?: { status?: OrderStatus; paymentStatus?: PaymentStatus },
): Promise<Order[]> {
  await dbConnect();
  const filter: Record<string, unknown> = {};
  if (filters?.status) filter.status = filters.status;
  if (filters?.paymentStatus) filter.paymentStatus = filters.paymentStatus;

  const docs = await OrderModel.find(filter).sort({ placedAt: -1 }).skip(offset).limit(limit);
  return docs.map(toOrder);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  await dbConnect();
  const updated = await OrderModel.findByIdAndUpdate(orderId, { status }, { new: true });
  if (!updated) throw new Error("Order not found");
  return toOrder(updated);
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
): Promise<Order> {
  await dbConnect();
  const updated = await OrderModel.findByIdAndUpdate(
    orderId,
    { paymentStatus },
    { new: true },
  );
  if (!updated) throw new Error("Order not found");
  return toOrder(updated);
}

export async function updateRazorpayDetails(orderId: string, razorpayOrderId: string): Promise<Order> {
  await dbConnect();
  const updated = await OrderModel.findByIdAndUpdate(
    orderId,
    { paymentProvider: "razorpay", notes: razorpayOrderId },
    { new: true },
  );
  if (!updated) throw new Error("Order not found");
  return toOrder(updated);
}

export async function getOrderCount(): Promise<number> {
  await dbConnect();
  return OrderModel.countDocuments();
}

export async function getOrdersByPaymentStatus(paymentStatus: PaymentStatus): Promise<Order[]> {
  await dbConnect();
  const docs = await OrderModel.find({ paymentStatus }).sort({ placedAt: -1 });
  return docs.map(toOrder);
}
