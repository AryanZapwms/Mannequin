"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { getSessionUser } from "@/lib/auth-client";
import { getGuestCart, clearGuestCart } from "@/lib/services/guest-cart";
import { createRazorpayOrder, verifyPayment } from "@/lib/services/razorpay";
import { BulkOrderModal } from "@/components/bulk-order-modal";
import type { CartItem } from "@/lib/services/cart";
import type { GuestCartItem } from "@/lib/services/guest-cart";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const TAX_RATE = 0.05;

type AddressForm = {
  full_name: string;
  email: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

function AddressInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = true,
  placeholder,
}: {
  label: string;
  name: keyof AddressForm;
  value: string;
  onChange: (name: keyof AddressForm, value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
      />
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<(CartItem | GuestCartItem)[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [address, setAddress] = useState<AddressForm>({
    full_name: "",
    email: "",
    phone: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  useEffect(() => {
    const loadCheckout = async () => {
      const user = await getSessionUser();

      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || null);
        setIsGuest(false);

        try {
          const profileRes = await fetch("/api/account/profile");
          const profile = profileRes.ok ? await profileRes.json() : null;

          const name = profile?.displayName || user.name || "";
          const phone = profile?.phone || "";
          setUserName(name);
          setUserPhone(phone);
          setAddress((prev) => ({
            ...prev,
            full_name: name,
            email: user.email || "",
            phone,
          }));
        } catch (error) {
          console.error("Error loading profile:", error);
        }

        try {
          const res = await fetch("/api/cart");
          const { items } = await res.json();
          setCartItems(items ?? []);
          if ((items ?? []).length > 5) setShowBulkModal(true);
        } catch (error) {
          console.error("Error loading cart:", error);
        }
      } else {
        setIsGuest(true);
        const guestItems = getGuestCart();
        setCartItems(guestItems);
        if (guestItems.length > 5) setShowBulkModal(true);
      }

      setLoading(false);
    };

    void loadCheckout();
  }, []);

  const updateAddress = (name: keyof AddressForm, value: string) => {
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const shipping = subtotal >= 500 ? 0 : 60;
  const tax = Math.round((subtotal - discountAmount) * TAX_RATE * 100) / 100;
  const total = subtotal - discountAmount + shipping + tax;

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;

    // Check coupon against site settings
    const res = await fetch(`/api/coupons/${encodeURIComponent(couponCode.toUpperCase().trim())}`);

    if (!res.ok) {
      setCouponError("Invalid or expired coupon code.");
      setDiscountAmount(0);
      setCouponApplied(false);
      return;
    }

    const { coupon } = await res.json();
    const couponData = coupon as { type: "percent" | "fixed"; value: number };
    let discount = 0;
    if (couponData.type === "percent") {
      discount = Math.round(subtotal * (couponData.value / 100) * 100) / 100;
    } else {
      discount = Math.min(couponData.value, subtotal);
    }

    setDiscountAmount(discount);
    setCouponApplied(true);
    toast.success(`Coupon applied! You save ₹${discount.toFixed(2)}`);
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscountAmount(0);
    setCouponApplied(false);
    setCouponError("");
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.full_name || !address.phone || !address.street_address || !address.city || !address.state || !address.postal_code) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setProcessing(true);

    try {
      let razorpayPaymentId: string | undefined;

      if (paymentMethod === "razorpay") {
        const razorpayOrder = await createRazorpayOrder({
          amount: total,
          receipt: `guest-${Date.now()}`,
          notes: { email: address.email || userEmail || "" },
        });

        await new Promise<void>((resolve, reject) => {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: Math.round(total * 100),
            currency: "INR",
            name: "Mannequin Care",
            description: "Order Payment",
            order_id: razorpayOrder.id,
            handler: async (response: any) => {
              const isValid = await verifyPayment(
                razorpayOrder.id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
              if (isValid) {
                razorpayPaymentId = response.razorpay_payment_id;
                resolve();
              } else {
                reject(new Error("Payment verification failed"));
              }
            },
            prefill: {
              name: address.full_name,
              email: address.email || userEmail || "",
              contact: address.phone,
            },
          };

          const razorpay = new window.Razorpay(options);
          razorpay.on("payment.failed", () => reject(new Error("Payment failed")));
          razorpay.open();
        });
      }

      // Create order via server-side API (bypasses RLS, supports guests)
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          shippingAddress: address,
          guestEmail: isGuest ? address.email : undefined,
          paymentMethod,
          razorpayPaymentId,
          subtotal,
          tax,
          shipping,
          total,
          discountTotal: discountAmount,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Order creation failed");
      }

      const { orderId } = await response.json();

      // Clear guest cart from localStorage
      if (isGuest) {
        clearGuestCart();
        window.dispatchEvent(new Event("storage"));
      }

      router.push(`/order-confirmation/${orderId}`);
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(
        err instanceof Error ? err.message : "Checkout failed. Please try again."
      );
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse space-y-3 text-center">
          <div className="h-8 w-48 rounded bg-gray-200 mx-auto" />
          <div className="h-4 w-32 rounded bg-gray-200 mx-auto" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Your cart is empty</h1>
        <p className="mb-6 text-gray-500">Add some products before checking out.</p>
        <Link
          href="/shop"
          className="inline-block rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <BulkOrderModal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} />

      <div className="container mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-3xl font-semibold text-gray-900">Checkout</h1>

        <form onSubmit={handleCheckout}>
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            {/* Left — address + payment */}
            <div className="space-y-8">
              {/* Guest login prompt */}
              {isGuest && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                  <span className="font-semibold">Have an account?</span>{" "}
                  <Link
                    href="/auth/login?next=/checkout"
                    className="underline font-medium"
                  >
                    Sign in
                  </Link>{" "}
                  to use saved addresses and track your orders.
                </div>
              )}

              {/* Address */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-gray-900">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <AddressInput
                      label="Full Name"
                      name="full_name"
                      value={address.full_name}
                      onChange={updateAddress}
                      placeholder="Priya Sharma"
                    />
                    <AddressInput
                      label="Phone"
                      name="phone"
                      value={address.phone}
                      onChange={updateAddress}
                      type="tel"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <AddressInput
                    label="Email"
                    name="email"
                    value={address.email}
                    onChange={updateAddress}
                    type="email"
                    required={isGuest}
                    placeholder="your@email.com"
                  />
                  <AddressInput
                    label="Street Address"
                    name="street_address"
                    value={address.street_address}
                    onChange={updateAddress}
                    placeholder="Building, street, locality"
                  />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <AddressInput
                      label="City"
                      name="city"
                      value={address.city}
                      onChange={updateAddress}
                      placeholder="Mumbai"
                    />
                    <AddressInput
                      label="State"
                      name="state"
                      value={address.state}
                      onChange={updateAddress}
                      placeholder="Maharashtra"
                    />
                    <AddressInput
                      label="Postal Code"
                      name="postal_code"
                      value={address.postal_code}
                      onChange={updateAddress}
                      placeholder="400053"
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-gray-900">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      value: "razorpay" as const,
                      label: "Pay Online",
                      sublabel: "Credit / Debit Card, UPI, Net Banking via Razorpay",
                    },
                    {
                      value: "cod" as const,
                      label: "Cash on Delivery",
                      sublabel: "Pay when your order arrives",
                    },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                        paymentMethod === opt.value
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.value}
                        checked={paymentMethod === opt.value}
                        onChange={() => setPaymentMethod(opt.value)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.sublabel}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — order summary */}
            <div className="h-fit space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-gray-900">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="mb-4 space-y-3 border-b pb-4">
                  {cartItems.map((item, i) => (
                    <div key={(item as any).id ?? i} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {item.product?.thumbnail_url && (
                          <Image
                            src={item.product.thumbnail_url}
                            alt={item.product?.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium line-clamp-1">
                          {item.product?.name ?? "Product"}
                        </p>
                        <p className="text-gray-500">×{item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">
                        ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="mb-4 border-b pb-4">
                  {couponApplied ? (
                    <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-2 text-sm">
                      <span className="font-medium text-green-800">
                        🎉 "{couponCode.toUpperCase()}" applied — −₹{discountAmount.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Coupon Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter code"
                          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-500">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>−₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Shipping {subtotal >= 500 ? "(Free)" : ""}
                    </span>
                    <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax (5%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {subtotal < 500 && (
                  <p className="mt-3 text-xs text-gray-400">
                    Add ₹{(500 - subtotal).toFixed(2)} more for free shipping.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={processing}
                  className="mt-6 w-full rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processing
                    ? "Processing…"
                    : `Place Order — ₹${total.toFixed(2)}`}
                </button>

                <p className="mt-3 text-center text-xs text-gray-400">
                  By placing your order you agree to our{" "}
                  <Link href="/terms" className="underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
