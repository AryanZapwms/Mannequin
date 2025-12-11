"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getOrderById } from "@/lib/services/order";
import type { Order } from "@/lib/services/order";
import { CheckCircle } from "lucide-react";

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient();
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderData = await getOrderById(supabase, id);
        setOrder(orderData);
      } catch (error) {
        console.error("Error loading order:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [supabase, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8 text-center">
        <p className="mb-6">Order not found</p>
        <Link href="/shop" className="text-blue-600 hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const items = order.items || [];
  const shippingAddress = order.shipping_address as any;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600" />
        <h1 className="mb-2 text-3xl font-semibold text-green-900">
          Order Confirmed!
        </h1>
        <p className="mb-6 text-green-700">
          Thank you for your order. We'll send you an email confirmation shortly.
        </p>

        <div className="mb-8 rounded-lg bg-white p-6">
          <div className="mb-4 border-b pb-4">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="text-2xl font-semibold">{order.order_number}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium capitalize">{order.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment</p>
              <p className="font-medium capitalize">{order.payment_status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="font-medium">₹{order.grand_total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Method</p>
              <p className="font-medium capitalize">{order.payment_provider || "Unknown"}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-lg border border-gray-200 p-6 text-left">
          <h2 className="mb-4 font-semibold">Order Items</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between border-b pb-3 last:border-b-0">
                <div>
                  <p className="font-medium">{item.product_snapshot?.name}</p>
                  <p className="text-sm text-gray-600">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-medium">₹{item.line_total.toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t pt-4 text-right">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax:</span>
              <span>₹{order.tax_total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping:</span>
              <span>₹{order.shipping_total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total:</span>
              <span>₹{order.grand_total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {shippingAddress && (
          <div className="mb-8 rounded-lg border border-gray-200 p-6 text-left">
            <h2 className="mb-3 font-semibold">Shipping Address</h2>
            <p className="font-medium">{shippingAddress.full_name}</p>
            <p className="text-sm text-gray-600">{shippingAddress.street_address}</p>
            <p className="text-sm text-gray-600">
              {shippingAddress.city}, {shippingAddress.state}{" "}
              {shippingAddress.postal_code}
            </p>
            <p className="text-sm text-gray-600">{shippingAddress.country}</p>
            <p className="text-sm text-gray-600">Phone: {shippingAddress.phone}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Link
            href="/account"
            className="flex-1 rounded-md bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
          >
            View Account
          </Link>
          <Link
            href="/shop"
            className="flex-1 rounded-md border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
