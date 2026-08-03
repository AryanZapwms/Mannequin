"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { getSessionUser } from "@/lib/auth-client";
import { getGuestCart, clearGuestCart } from "@/lib/services/guest-cart";
import { BulkOrderModal } from "@/components/bulk-order-modal";
import type { CartItem } from "@/lib/services/cart";
import type { GuestCartItem } from "@/lib/services/guest-cart";
import { ShoppingBag, ArrowRight, ShieldCheck, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
      <label htmlFor={name} className="block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
        {label} {required && <span className="text-brand-copper">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-brand-sand bg-brand-cream/40 px-4 py-2.5 font-body text-sm text-brand-espresso transition-all placeholder:text-brand-mocha/50 focus:border-brand-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold-200"
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
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  // New customers set a password here; the account is created before payment
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailTaken, setEmailTaken] = useState(false);

  // Email verification — guests must confirm a code before they can order
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Stable across retries of the same checkout attempt, so a re-submit after a
  // network failure returns the original order instead of creating a second one.
  const idempotencyKeyRef = useRef<string | null>(null);

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
          const addressRes = await fetch("/api/addresses");
          if (addressRes.ok) {
            const { addresses } = await addressRes.json();
            const shippingAddresses = (addresses || []).filter((a: any) => a.type === "shipping");
            setSavedAddresses(shippingAddresses);
            
            const defaultAddress = shippingAddresses.find((a: any) => a.is_default) || shippingAddresses[0];
            if (defaultAddress) {
              setAddress((prev) => ({
                ...prev,
                full_name: defaultAddress.full_name,
                phone: defaultAddress.phone,
                street_address: defaultAddress.street_address,
                city: defaultAddress.city,
                state: defaultAddress.state,
                postal_code: defaultAddress.postal_code,
              }));
            }
          }
        } catch (error) {
          console.error("Error loading addresses:", error);
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

  // Count down the resend cooldown
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const updateAddress = (name: keyof AddressForm, value: string) => {
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Editing the email after verifying invalidates it — you can only order to
  // the address you actually proved you own.
  const isEmailVerified =
    emailVerified && verifiedEmail === address.email.trim().toLowerCase();

  const handleSendCode = async () => {
    const email = address.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address first.");
      return;
    }

    setSendingCode(true);
    setEmailTaken(false);

    try {
      const res = await fetch("/api/auth/verify-email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (payload.accountExists) setEmailTaken(true);
        if (payload.retryAfter) setResendIn(payload.retryAfter);
        throw new Error(payload.error || "Could not send the code");
      }

      setCodeSent(true);
      setVerificationCode("");
      setResendIn(60);
      toast.success(`We sent a 6-digit code to ${email}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send the code");
    } finally {
      setSendingCode(false);
    }
  };

  const handleConfirmCode = async () => {
    const email = address.email.trim().toLowerCase();
    if (!/^\d{6}$/.test(verificationCode.trim())) {
      toast.error("Enter the 6-digit code from your email.");
      return;
    }

    setVerifying(true);

    try {
      const res = await fetch("/api/auth/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode.trim() }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload.error || "Could not verify that code");
      }

      setEmailVerified(true);
      setVerifiedEmail(email);
      toast.success("Email verified — you're all set.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not verify that code");
    } finally {
      setVerifying(false);
    }
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

    // The server prices the cart with the code applied — a product-scoped
    // coupon can't be evaluated here without knowing what it covers.
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: couponCode.toUpperCase().trim(),
        cartItems: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      }),
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      setCouponError(payload.error || "Invalid or expired coupon code.");
      setDiscountAmount(0);
      setCouponApplied(false);
      return;
    }

    setDiscountAmount(payload.discount);
    setCouponApplied(true);
    toast.success(`Coupon applied! You save ₹${payload.discount.toFixed(2)}`);
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

    if (isGuest) {
      if (!address.email) {
        toast.error("Please enter your email address.");
        return;
      }
      if (!isEmailVerified) {
        toast.error("Please verify your email address before placing the order.");
        return;
      }
      if (password.length < 6) {
        toast.error("Please choose a password of at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("The two passwords don't match.");
        return;
      }
    }

    setProcessing(true);
    setEmailTaken(false);

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    try {
      // Create and sign into the account before taking payment, so the order is
      // owned by a real customer who can track it later.
      if (isGuest) {
        const registerRes = await fetch("/api/checkout/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: address.email,
            password,
            displayName: address.full_name,
            phone: address.phone,
          }),
        });

        if (!registerRes.ok) {
          const err = await registerRes.json().catch(() => ({}));
          if (registerRes.status === 409) {
            setEmailTaken(true);
            throw new Error(
              "You already have an account with this email. Please sign in to continue.",
            );
          }
          throw new Error(err.error || "Could not create your account");
        }

        const signInResult = await signIn("credentials", {
          email: address.email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          throw new Error(
            "Your account was created but sign-in failed. Please sign in and try again.",
          );
        }
      }

      let payment: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
      } | null = null;

      if (paymentMethod === "razorpay") {
        // The server prices the cart and creates the Razorpay order — the
        // amount is never chosen here.
        const orderRes = await fetch("/api/checkout/razorpay-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItems,
            couponCode: couponApplied ? couponCode : undefined,
            email: address.email || userEmail || "",
          }),
        });

        if (!orderRes.ok) {
          const err = await orderRes.json().catch(() => ({}));
          throw new Error(err.error || "Could not start payment");
        }

        const razorpayOrder = await orderRes.json();

        // Refuse to charge an amount the customer wasn't shown.
        if (Math.abs(razorpayOrder.pricing.total - total) >= 0.01) {
          throw new Error(
            "Prices in your cart have changed. Please review your order and try again.",
          );
        }

        payment = await new Promise((resolve, reject) => {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: "Mannequin Care",
            description: "Order Payment",
            order_id: razorpayOrder.razorpayOrderId,
            // Signature is verified server-side in /api/orders — a check here
            // would prove nothing, since the browser can lie about the result.
            handler: (response: any) =>
              resolve({
                razorpayOrderId: razorpayOrder.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            modal: {
              ondismiss: () => reject(new Error("Payment cancelled")),
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

      // Create the order server-side (prices and payment are re-verified there)
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cartItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
          shippingAddress: address,
          guestEmail: isGuest ? address.email : undefined,
          paymentMethod,
          couponCode: couponApplied ? couponCode : undefined,
          idempotencyKey: idempotencyKeyRef.current,
          ...(payment ?? {}),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Order creation failed");
      }

      const { orderId, guestToken } = await response.json();

      // Attempt finished — a later checkout must not reuse this key
      idempotencyKeyRef.current = null;

      // Clear guest cart from localStorage
      if (isGuest) {
        clearGuestCart();
        window.dispatchEvent(new Event("storage"));
      }

      router.push(
        guestToken
          ? `/order-confirmation/${orderId}?token=${guestToken}`
          : `/order-confirmation/${orderId}`,
      );
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
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <div className="flex items-center gap-3 font-sub text-sm font-medium uppercase tracking-widest text-brand-copper">
          <ShoppingBag className="h-4 w-4 animate-pulse fill-brand-gold-500 text-brand-gold-500" />
          Preparing Checkout...
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-brand-cream pt-16 pb-24">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white text-brand-copper shadow-soft">
            <ShoppingBag className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <h1 className="mb-3 font-display text-3xl font-medium text-brand-espresso sm:text-4xl">Your cart is empty</h1>
          <p className="mb-8 font-body text-brand-body">Add some products before checking out.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded bg-brand-gold-500 px-8 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
          >
            Browse Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pb-16">
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <BulkOrderModal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <header className="mb-8 flex flex-col gap-1">
          <p className="font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
            <span aria-hidden className="mr-1.5 text-brand-gold-500">✦</span>
            Secure Checkout
          </p>
          <h1 className="font-display text-display font-light italic text-brand-espresso">
            Checkout
          </h1>
        </header>

        <form onSubmit={handleCheckout}>
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            {/* Left — address + payment */}
            <div className="space-y-6">
              {/* Guest login prompt */}
              {isGuest && (
                <div className="rounded-card border border-brand-sand bg-brand-cream/60 p-5 text-sm text-brand-body shadow-soft">
                  <span className="font-semibold text-brand-espresso">Already have an account?</span>{" "}
                  <Link
                    href="/auth/login?next=/checkout"
                    className="font-medium text-brand-copper hover:underline"
                  >
                    Sign in
                  </Link>{" "}
                  to use your saved addresses — otherwise just fill in the details below and
                  we&rsquo;ll create your account as you check out.
                </div>
              )}

              {/* Address */}
              <div className="rounded-card border border-brand-sand bg-white p-6 shadow-soft sm:p-8">
                <h2 className="mb-6 font-display text-xl font-semibold text-brand-espresso">
                  Shipping Address
                </h2>
                
                {savedAddresses.length > 0 && (
                  <div className="mb-8 space-y-4">
                    <p className="font-sub text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-mocha">Select a saved address</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {savedAddresses.map((addr) => {
                        const isSelected = address.street_address === addr.street_address && address.postal_code === addr.postal_code;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => {
                              setAddress((prev) => ({
                                ...prev,
                                full_name: addr.full_name,
                                phone: addr.phone,
                                street_address: addr.street_address,
                                city: addr.city,
                                state: addr.state,
                                postal_code: addr.postal_code,
                              }));
                            }}
                            className={cn(
                              "relative cursor-pointer rounded-xl border p-4 transition-all duration-200",
                              isSelected
                                ? "border-brand-gold-400 bg-brand-gold-50 shadow-soft"
                                : "border-brand-sand/80 bg-white hover:border-brand-gold-200 hover:shadow-sm"
                            )}
                          >
                            {isSelected && (
                              <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold-500 text-brand-espresso shadow-sm">
                                <Check className="h-3 w-3" strokeWidth={3} />
                              </div>
                            )}
                            {addr.is_default && (
                              <span className="mb-2 inline-block rounded-full bg-brand-gold-500 px-2 py-0.5 font-sub text-[9px] font-bold uppercase tracking-wider text-brand-espresso shadow-sm">
                                Default
                              </span>
                            )}
                            <p className="font-display text-sm font-semibold text-brand-espresso">{addr.full_name}</p>
                            <p className="mt-1 line-clamp-2 font-body text-xs text-brand-body leading-relaxed">{addr.street_address}</p>
                            <p className="mt-1 font-body text-xs text-brand-body">{addr.city}, {addr.state} {addr.postal_code}</p>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-brand-sand" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 font-sub text-[10px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
                          Or enter a new address
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
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
                  {isGuest ? (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="email"
                          className="block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha"
                        >
                          Email <span className="text-brand-copper">*</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={address.email}
                            onChange={(e) => updateAddress("email", e.target.value)}
                            placeholder="your@email.com"
                            className="w-full flex-1 rounded-xl border border-brand-sand bg-brand-cream/40 px-4 py-2.5 font-body text-sm text-brand-espresso transition-all placeholder:text-brand-mocha/50 focus:border-brand-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold-200"
                          />
                          {isEmailVerified ? (
                            <span className="flex shrink-0 items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-4 font-sub text-[11px] font-semibold uppercase tracking-wider text-green-700">
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                              Verified
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendCode}
                              disabled={sendingCode || resendIn > 0}
                              className="shrink-0 rounded-xl bg-brand-espresso px-5 py-2.5 font-sub text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-all hover:bg-brand-copper hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand-espresso"
                            >
                              {sendingCode
                                ? "Sending…"
                                : resendIn > 0
                                  ? `Resend ${resendIn}s`
                                  : codeSent
                                    ? "Resend"
                                    : "Verify"}
                            </button>
                          )}
                        </div>
                        {!isEmailVerified && (
                          <p className="font-body text-xs text-brand-mocha">
                            We&rsquo;ll email you a 6-digit code to confirm this address before
                            your order is placed.
                          </p>
                        )}
                      </div>

                      {codeSent && !isEmailVerified && (
                        <div className="space-y-2 rounded-xl border border-brand-gold-200 bg-brand-gold-50 p-4">
                          <label
                            htmlFor="verification_code"
                            className="block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha"
                          >
                            Verification code
                          </label>
                          <div className="flex gap-2">
                            <input
                              id="verification_code"
                              name="verification_code"
                              type="text"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={6}
                              value={verificationCode}
                              onChange={(e) =>
                                setVerificationCode(e.target.value.replace(/\D/g, ""))
                              }
                              placeholder="000000"
                              className="w-40 rounded-xl border border-brand-sand bg-white px-4 py-2.5 text-center font-mono text-lg tracking-[0.4em] text-brand-espresso focus:border-brand-gold-500 focus:outline-none focus:ring-2 focus:ring-brand-gold-200"
                            />
                            <button
                              type="button"
                              onClick={handleConfirmCode}
                              disabled={verifying || verificationCode.length !== 6}
                              className="rounded-xl bg-brand-gold-500 px-5 py-2.5 font-sub text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all hover:bg-brand-gold-600 hover:shadow-gold disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {verifying ? "Checking…" : "Confirm"}
                            </button>
                          </div>
                          <p className="font-body text-xs text-brand-mocha">
                            Sent to {address.email}. Check your spam folder if it hasn&rsquo;t
                            arrived.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <AddressInput
                      label="Email"
                      name="email"
                      value={address.email}
                      onChange={updateAddress}
                      type="email"
                      required={false}
                      placeholder="your@email.com"
                    />
                  )}
                  <AddressInput
                    label="Street Address"
                    name="street_address"
                    value={address.street_address}
                    onChange={updateAddress}
                    placeholder="Building, street, locality"
                  />
                  <div className="grid gap-5 sm:grid-cols-3">
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

              {/* Create account (new customers only) */}
              {isGuest && (
                <div className="rounded-card border border-brand-sand bg-white p-6 shadow-soft sm:p-8">
                  <h2 className="mb-2 font-display text-xl font-semibold text-brand-espresso">
                    Create Your Account
                  </h2>
                  <p className="mb-6 font-body text-sm text-brand-body">
                    We&rsquo;ll set up an account with{" "}
                    <span className="font-medium text-brand-espresso">
                      {address.email || "your email"}
                    </span>{" "}
                    so you can track this order and check out faster next time.
                  </p>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="password"
                        className="block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha"
                      >
                        Password <span className="text-brand-copper">*</span>
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="new-password"
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full rounded-xl border border-brand-sand bg-brand-cream/40 px-4 py-2.5 font-body text-sm text-brand-espresso transition-all placeholder:text-brand-mocha/50 focus:border-brand-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="confirm_password"
                        className="block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha"
                      >
                        Confirm Password <span className="text-brand-copper">*</span>
                      </label>
                      <input
                        id="confirm_password"
                        name="confirm_password"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full rounded-xl border border-brand-sand bg-brand-cream/40 px-4 py-2.5 font-body text-sm text-brand-espresso transition-all placeholder:text-brand-mocha/50 focus:border-brand-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold-200"
                      />
                    </div>
                  </div>

                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className="mt-3 font-body text-xs text-red-500">
                      The two passwords don&rsquo;t match.
                    </p>
                  )}

                  {emailTaken && (
                    <div className="mt-4 rounded-xl border border-brand-blush bg-[rgba(249,199,199,0.25)] p-4 font-body text-sm text-brand-espresso">
                      An account already exists for {address.email}.{" "}
                      <Link
                        href="/auth/login?next=/checkout"
                        className="font-medium text-brand-copper underline"
                      >
                        Sign in
                      </Link>{" "}
                      to place this order — your cart will be waiting.
                    </div>
                  )}
                </div>
              )}

              {/* Payment */}
              <div className="rounded-card border border-brand-sand bg-white p-6 shadow-soft sm:p-8">
                <h2 className="mb-5 font-display text-xl font-semibold text-brand-espresso">
                  Payment Method
                </h2>
                <div className="space-y-4">
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
                  ].map((opt) => {
                    const isSelected = paymentMethod === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={cn(
                          "relative flex cursor-pointer items-start gap-4 rounded-xl border p-5 transition-all duration-200",
                          isSelected
                            ? "border-brand-gold-400 bg-brand-gold-50 shadow-soft"
                            : "border-brand-sand/80 bg-white hover:border-brand-gold-200 hover:shadow-sm"
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={opt.value}
                          checked={isSelected}
                          onChange={() => setPaymentMethod(opt.value)}
                          className="mt-0.5 h-4 w-4 rounded-full border-brand-sand text-brand-gold-500 focus:ring-brand-gold-300"
                        />
                        <div>
                          <p className="font-display text-sm font-semibold text-brand-espresso">{opt.label}</p>
                          <p className="mt-1 font-body text-xs text-brand-body">{opt.sublabel}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right — order summary */}
            <div className="h-fit space-y-6 lg:sticky lg:top-24">
              <div className="rounded-card border border-brand-sand bg-white p-6 shadow-soft sm:p-8">
                <h2 className="mb-6 font-display text-xl font-semibold text-brand-espresso">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="mb-5 space-y-4 border-b border-brand-sand/60 pb-5">
                  {cartItems.map((item, i) => (
                    <div key={(item as any).id ?? i} className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-brand-cream/50">
                        {item.product?.thumbnail_url ? (
                          <Image
                            src={item.product.thumbnail_url}
                            alt={item.product?.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center font-sub text-[10px] text-brand-mocha">Image</div>
                        )}
                      </div>
                      <div className="flex-1 font-body text-sm">
                        <p className="font-medium text-brand-espresso line-clamp-2 leading-snug">
                          {item.product?.name ?? "Product"}
                        </p>
                        <p className="mt-1 text-xs text-brand-mocha">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-display text-sm font-semibold text-brand-espresso">
                        ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="mb-5 border-b border-brand-sand/60 pb-5">
                  {couponApplied ? (
                    <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm">
                      <span className="font-medium text-green-800">
                        🎉 "{couponCode.toUpperCase()}" applied — −₹{discountAmount.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="font-sub text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <label className="font-sub text-[10px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
                        Promo Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter code"
                          className="flex-1 rounded-xl border border-brand-sand bg-brand-cream/40 px-4 py-2.5 font-body text-sm text-brand-espresso transition-all placeholder:text-brand-mocha/50 focus:border-brand-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold-200"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="rounded-xl bg-brand-espresso px-5 py-2.5 font-sub text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-all hover:bg-brand-copper hover:shadow-soft"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="font-body text-xs text-red-500">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 font-body text-sm text-brand-body">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-brand-espresso">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">−₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>
                      Shipping {subtotal >= 500 ? <span className="text-brand-copper">(Free)</span> : ""}
                    </span>
                    <span className="font-medium text-brand-espresso">{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax (5%)</span>
                    <span className="font-medium text-brand-espresso">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="mt-4 flex justify-between border-t border-brand-sand/60 pt-4 font-display text-lg font-semibold text-brand-espresso">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {subtotal < 500 && (
                  <p className="mt-4 rounded-lg bg-brand-cream/50 p-3 text-center font-body text-[13px] text-brand-mocha">
                    Add <span className="font-semibold text-brand-copper">₹{(500 - subtotal).toFixed(2)}</span> more to your cart to qualify for free shipping!
                  </p>
                )}

                <button
                  type="submit"
                  disabled={processing || (isGuest && !isEmailVerified)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold-500 px-6 py-4 font-sub text-xs font-semibold uppercase tracking-[0.1em] text-brand-espresso transition-all hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {processing ? (
                    "Processing…"
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Place Order — ₹{total.toFixed(2)}
                    </>
                  )}
                </button>

                {isGuest && !isEmailVerified && (
                  <p className="mt-3 text-center font-body text-xs text-brand-copper">
                    Verify your email address to place this order.
                  </p>
                )}

                <p className="mt-5 text-center font-body text-[11px] leading-relaxed text-brand-mocha">
                  By placing your order you agree to our{" "}
                  <Link href="/terms" className="text-brand-copper hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-brand-copper hover:underline">
                    Privacy Policy
                  </Link>
                  . Payments are processed securely.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
