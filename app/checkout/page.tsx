"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCartItems, clearCart } from "@/lib/services/cart";
import { createOrder, generateOrderNumber } from "@/lib/services/order";
import { getDefaultAddress } from "@/lib/services/address";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/services/email";
import { createRazorpayOrder, verifyPayment } from "@/lib/services/razorpay";
import { CheckoutForm, type CheckoutData } from "@/components/checkout-form";
import { BulkOrderModal } from "@/components/bulk-order-modal";
import type { CartItem } from "@/lib/services/cart";
import type { UserAddress } from "@/lib/services/address";
import Image from "next/image";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const supabase = createClient();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    const loadCheckout = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        redirect("/auth/login?next=/checkout");
      }

      setUserId(user.id);
      setUserEmail(user.email || null);
      setUserPhone(user.phone || null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserName(profile.display_name);
      }

      try {
        const items = await getCartItems(supabase, user.id);
        setCartItems(items);

        if (items.length > 5) {
          setShowBulkModal(true);
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadCheckout();
  }, [supabase]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );

  const shipping = 0;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + shipping + tax;

  const handleCheckoutSubmit = async (data: CheckoutData) => {
    if (!userId || !userEmail) return;

    setProcessing(true);

    try {
      let shippingAddress: UserAddress | null = null;

      if (data.shippingAddressId !== "new") {
        const { data: address } = await supabase
          .from("user_addresses")
          .select("*")
          .eq("id", data.shippingAddressId)
          .single();
        shippingAddress = address;
      }

      const orderNumber = generateOrderNumber();

      let paymentStatus: "pending" | "authorized" | "paid" | "failed" | "refunded" = "pending";
      let razorpayOrderId: string | null = null;

      if (data.paymentMethod === "razorpay") {
        const razorpayOrder = await createRazorpayOrder({
          amount: total,
          receipt: orderNumber,
          notes: {
            userId,
            orderNumber,
          },
        });

        razorpayOrderId = razorpayOrder.id;

        await new Promise<void>((resolve, reject) => {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: Math.round(total * 100),
            currency: "INR",
            name: "Mannequin Care",
            description: `Order ${orderNumber}`,
            order_id: razorpayOrderId,
            handler: async (response: any) => {
              try {
                const isValid = await verifyPayment(
                  razorpayOrderId!,
                  response.razorpay_payment_id,
                  response.razorpay_signature,
                );

                if (isValid) {
                  paymentStatus = "paid";
                  resolve();
                } else {
                  reject(new Error("Payment verification failed"));
                }
              } catch (error) {
                reject(error);
              }
            },
            prefill: {
              name: userName || "Customer",
              email: userEmail,
              contact: userPhone,
            },
          };

          const razorpay = new window.Razorpay(options);
          razorpay.on("payment.failed", () => {
            paymentStatus = "failed";
            reject(new Error("Payment failed"));
          });
          razorpay.open();
        });
      } else {
        paymentStatus = "pending";
      }

      const order = await createOrder(
        supabase,
        {
          order_number: orderNumber,
          user_id: userId,
          status: "pending",
          payment_status: paymentStatus,
          subtotal,
          discount_total: 0,
          tax_total: tax,
          shipping_total: shipping,
          grand_total: total,
          currency: "INR",
          payment_provider: data.paymentMethod,
          billing_address: shippingAddress,
          shipping_address: shippingAddress,
          notes: data.paymentMethod === "cod" ? "Cash on Delivery" : undefined,
        },
        cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.product?.price || 0,
          line_total: (item.product?.price || 0) * item.quantity,
          product_snapshot: {
            name: item.product?.name,
            price: item.product?.price,
            quantity: item.quantity,
          },
        })),
      );

      await sendOrderConfirmationEmail(userEmail, {
        orderNumber,
        customerName: userName || "Customer",
        items: cartItems.map((item) => ({
          name: item.product?.name || "Product",
          quantity: item.quantity,
          price: item.product?.price || 0,
        })),
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress: {
          fullName: shippingAddress?.full_name || "",
          streetAddress: shippingAddress?.street_address || "",
          city: shippingAddress?.city || "",
          state: shippingAddress?.state || "",
          postalCode: shippingAddress?.postal_code || "",
          country: shippingAddress?.country || "India",
          phone: shippingAddress?.phone || "",
        },
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          .toLocaleDateString(),
      });

      await sendAdminOrderNotification({
        orderNumber,
        customerName: userName || "Customer",
        customerEmail: userEmail,
        customerPhone: userPhone || "N/A",
        items: cartItems.map((item) => ({
          name: item.product?.name || "Product",
          quantity: item.quantity,
          price: item.product?.price || 0,
        })),
        total,
        shippingAddress: {
          fullName: shippingAddress?.full_name || "",
          streetAddress: shippingAddress?.street_address || "",
          city: shippingAddress?.city || "",
          state: shippingAddress?.state || "",
          postalCode: shippingAddress?.postal_code || "",
          country: shippingAddress?.country || "India",
          phone: shippingAddress?.phone || "",
        },
        paymentMethod: data.paymentMethod === "razorpay" ? "Razorpay" : "Cash on Delivery",
      });

      await clearCart(supabase, userId);

      router.push(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error instanceof Error ? error.message : "Checkout failed. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <p>Cart is empty. Redirecting to shop...</p>
      </div>
    );
  }

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      
      <BulkOrderModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
      />

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-semibold">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div>
            <CheckoutForm
              cartItems={cartItems}
              total={total}
              onSubmit={handleCheckoutSubmit}
              loading={processing}
            />
          </div>

          <div className="h-fit rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

            <div className="mb-6 space-y-3 border-b pb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-2">
                  <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-100">
                    {item.product?.thumbnail_url && (
                      <Image
                        src={item.product.thumbnail_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium line-clamp-1">
                      {item.product?.name}
                    </p>
                    <p className="text-gray-600">x{item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 font-semibold">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
