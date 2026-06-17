"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getSessionUser } from "@/lib/auth-client";
import type { CartItem } from "@/lib/services/cart";
import type { GuestCartItem } from "@/lib/services/guest-cart";
import { getGuestCart, removeFromGuestCart, updateGuestCartQuantity } from "@/lib/services/guest-cart";
import { CartItemRow } from "@/components/cart-item-row";
import { ArrowRight, ShoppingBag, Truck } from "lucide-react";
import RevealWrapper from "@/components/RevealWrapper";

export default function CartPage() {
  const [items, setItems] = useState<(CartItem | GuestCartItem)[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const loadCart = async () => {
      const user = await getSessionUser();

      if (user) {
        setUserId(user.id);
        setIsGuest(false);
        try {
          const res = await fetch("/api/cart");
          const { items: cartItems } = await res.json();
          setItems(cartItems ?? []);
        } catch (error) {
          console.error("Error loading cart:", error);
        }
      } else {
        setIsGuest(true);
        const guestCart = getGuestCart();
        setItems(guestCart);
      }
      setLoading(false);
    };

    void loadCart();
  }, []);

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    try {
      if (isGuest) {
        updateGuestCartQuantity(itemId, quantity);
        setItems(getGuestCart());
        window.dispatchEvent(new Event("storage"));
      } else if (userId) {
        startTransition(async () => {
          try {
            const res = await fetch(`/api/cart/${itemId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ quantity }),
            });
            if (!res.ok) throw new Error("Failed to update quantity");
            setItems(items.map(item => {
              const currentItemId = "id" in item ? item.id : item.product_id;
              return currentItemId === itemId ? { ...item, quantity } : item;
            }));
          } catch (error) {
            console.error("Error updating quantity:", error);
            toast.error("Failed to update quantity");
          }
        });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = (itemId: string) => {
    try {
      if (isGuest) {
        removeFromGuestCart(itemId);
        setItems(getGuestCart());
        window.dispatchEvent(new Event("storage"));
        toast.success("Item removed from cart");
      } else if (userId) {
        startTransition(async () => {
          try {
            const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to remove item");
            setItems(items.filter(item => {
              const currentItemId = "id" in item ? item.id : item.product_id;
              return currentItemId !== itemId;
            }));
            toast.success("Item removed from cart");
          } catch (error) {
            console.error("Error removing item:", error);
            toast.error("Failed to remove item");
          }
        });
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );
  const shipping = subtotal >= 500 ? 0 : 60;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const freeShippingRemaining = 500 - subtotal;
  const freeShippingProgress = Math.min((subtotal / 500) * 100, 100);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream bg-glow-gold">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-brand-sand border-t-brand-gold-500" />
          <p className="font-sub text-sm uppercase tracking-[0.1em] text-brand-mocha">Loading your cart…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <section className="w-full bg-brand-cream bg-glow-gold">
        <div className="mx-auto max-w-[760px] px-6 py-[clamp(48px,6vw,80px)] text-center">
          <RevealWrapper>
            <p className="mb-4 flex items-center justify-center gap-2 font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
              <span aria-hidden className="text-brand-gold-500">
                ✦
              </span>
              Your Selection
            </p>
            <h1 className="font-display text-display font-light italic text-brand-espresso">
              Shopping Cart
            </h1>
            {items.length > 0 && (
              <p className="mx-auto mt-4 max-w-md font-body text-base leading-[1.8] text-brand-body">
                You have {items.length} {items.length === 1 ? "item" : "items"} in your cart.
                {subtotal >= 500
                  ? " You qualify for free shipping! ✨"
                  : ` Add ₹${freeShippingRemaining.toFixed(0)} more for free shipping.`}
              </p>
            )}
          </RevealWrapper>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <section className="w-full bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-[clamp(40px,6vw,80px)] sm:px-6">
          {items.length === 0 ? (
            <RevealWrapper>
              <div className="mx-auto max-w-lg rounded-card border border-brand-sand bg-white p-10 text-center shadow-card sm:p-14">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-gold-50">
                  <ShoppingBag className="h-9 w-9 text-brand-gold-600" strokeWidth={1.5} />
                </div>
                <h2 className="font-display text-heading font-semibold text-brand-espresso">
                  Your cart is empty
                </h2>
                <p className="mx-auto mt-3 max-w-xs font-body text-sm leading-relaxed text-brand-body">
                  Looks like you haven&rsquo;t added anything yet. Explore our collection and find something you love.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center gap-2 rounded bg-brand-gold-500 px-9 py-4 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
                  >
                    Browse Products
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </RevealWrapper>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
              {/* ── Cart Items ──────────────────────────────────── */}
              <RevealWrapper>
                <div className="rounded-card border border-brand-sand bg-white p-4 shadow-soft sm:p-6 lg:p-8">
                  <div className="mb-5 flex items-center justify-between border-b border-brand-sand pb-4">
                    <h2 className="font-display text-xl font-semibold text-brand-espresso sm:text-2xl">
                      Cart Items
                    </h2>
                    <span className="rounded-full bg-brand-gold-100 px-3 py-1 font-sub text-xs font-medium text-brand-mocha">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="space-y-0">
                    {items.map((item) => {
                      const currentItemId = "id" in item ? item.id : item.product_id;
                      return (
                        <CartItemRow
                          key={currentItemId}
                          item={item}
                          onUpdate={handleUpdateQuantity}
                          onRemove={handleRemoveItem}
                        />
                      );
                    })}
                  </div>
                </div>
              </RevealWrapper>

              {/* ── Order Summary ──────────────────────────────── */}
              <RevealWrapper delay={120}>
                <div className="h-fit rounded-card border border-brand-sand bg-white p-5 shadow-card sm:p-6 lg:sticky lg:top-24">
                  <h2 className="font-display text-xl font-semibold text-brand-espresso sm:text-2xl">
                    Order Summary
                  </h2>

                  {/* Free shipping progress bar */}
                  {subtotal < 500 && (
                    <div className="mt-5 rounded-thumb bg-brand-gold-50 p-3.5">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4 text-brand-copper" strokeWidth={1.75} />
                        <p className="font-sub text-[12px] text-brand-mocha">
                          Add{" "}
                          <span className="font-semibold text-brand-copper">
                            ₹{freeShippingRemaining.toFixed(0)}
                          </span>{" "}
                          more for free shipping
                        </p>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-sand">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-gold-400 to-brand-gold-600 transition-all duration-500 ease-out"
                          style={{ width: `${freeShippingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {subtotal >= 500 && (
                    <div className="mt-5 flex items-center gap-2 rounded-thumb bg-brand-sage/20 p-3 font-sub text-[12px] text-brand-espresso">
                      <Truck className="h-4 w-4 text-brand-sage" strokeWidth={1.75} />
                      <span>You qualify for <span className="font-semibold">free shipping!</span> ✨</span>
                    </div>
                  )}

                  <div className="mt-5 space-y-3 border-b border-brand-sand pb-5">
                    <div className="flex justify-between font-body text-sm text-brand-body">
                      <span>Subtotal</span>
                      <span className="font-mono text-brand-espresso">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-body text-sm text-brand-body">
                      <span>Shipping</span>
                      <span className="font-mono text-brand-espresso">
                        {shipping === 0 ? (
                          <span className="font-sub text-xs font-medium uppercase tracking-wider text-brand-sage">Free</span>
                        ) : (
                          `₹${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-body text-sm text-brand-body">
                      <span>Tax (5% GST)</span>
                      <span className="font-mono text-brand-espresso">₹{tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between py-5">
                    <span className="font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso">
                      Estimated Total
                    </span>
                    <span className="font-mono text-2xl text-brand-copper">
                      ₹{(subtotal + shipping + tax).toFixed(2)}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    className="block w-full rounded bg-brand-gold-500 px-4 py-4 text-center font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
                  >
                    Proceed to Checkout
                  </Link>

                  <Link
                    href="/shop"
                    className="group mt-3 flex w-full items-center justify-center gap-2 rounded border border-brand-sand px-4 py-4 text-center font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:bg-brand-cream hover:shadow-soft"
                  >
                    Continue Shopping
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>

                  {/* Trust badges */}
                  <div className="mt-5 flex items-center justify-center gap-4 border-t border-brand-sand pt-5">
                    <div className="flex items-center gap-1.5 font-sub text-[10px] uppercase tracking-[0.1em] text-brand-mocha">
                      <svg className="h-4 w-4 text-brand-gold-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Secure
                    </div>
                    <div className="h-3 w-px bg-brand-sand" />
                    <div className="flex items-center gap-1.5 font-sub text-[10px] uppercase tracking-[0.1em] text-brand-mocha">
                      <svg className="h-4 w-4 text-brand-gold-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verified
                    </div>
                    <div className="h-3 w-px bg-brand-sand" />
                    <div className="flex items-center gap-1.5 font-sub text-[10px] uppercase tracking-[0.1em] text-brand-mocha">
                      <svg className="h-4 w-4 text-brand-gold-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" />
                      </svg>
                      COD
                    </div>
                  </div>
                </div>
              </RevealWrapper>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
