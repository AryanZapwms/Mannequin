import type { SupabaseClient } from "@supabase/supabase-js";

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

export async function createOrder(
  supabase: SupabaseClient,
  order: Omit<Order, "id" | "placed_at" | "updated_at">,
  items: Omit<OrderItem, "id" | "order_id">[],
): Promise<Order> {
  const { data: createdOrder, error: orderError } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single();

  if (orderError) throw orderError;

  const itemsToInsert = items.map((item) => ({
    ...item,
    order_id: createdOrder.id,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsToInsert);

  if (itemsError) throw itemsError;

  return getOrderById(supabase, createdOrder.id);
}

export async function getOrderById(
  supabase: SupabaseClient,
  orderId: string,
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", orderId)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserOrders(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 10,
  offset: number = 0,
): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("user_id", userId)
    .order("placed_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

export async function getAllOrders(
  supabase: SupabaseClient,
  limit: number = 50,
  offset: number = 0,
  filters?: { status?: OrderStatus; paymentStatus?: PaymentStatus },
): Promise<Order[]> {
  let query = supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("placed_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.paymentStatus) {
    query = query.eq("payment_status", filters.paymentStatus);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateOrderStatus(
  supabase: SupabaseClient,
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return getOrderById(supabase, orderId);
}

export async function updatePaymentStatus(
  supabase: SupabaseClient,
  orderId: string,
  paymentStatus: PaymentStatus,
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return getOrderById(supabase, orderId);
}

export async function updateRazorpayDetails(
  supabase: SupabaseClient,
  orderId: string,
  razorpayOrderId: string,
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_provider: "razorpay",
      notes: razorpayOrderId,
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return getOrderById(supabase, orderId);
}

export async function getOrderCount(supabase: SupabaseClient): Promise<number> {
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
}

export async function getOrdersByPaymentStatus(
  supabase: SupabaseClient,
  paymentStatus: PaymentStatus,
): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("payment_status", paymentStatus)
    .order("placed_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
