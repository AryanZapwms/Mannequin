"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getSessionUser } from "@/lib/auth-client";
import type { WishlistItem } from "@/lib/services/wishlist";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadWishlist = async () => {
      const user = await getSessionUser();

      if (user) {
        setUserId(user.id);
        try {
          const res = await fetch("/api/wishlist");
          if (!res.ok) throw new Error("Failed to load wishlist");
          
          const text = await res.text();
          const { items: wishlistItems } = text ? JSON.parse(text) : { items: [] };
          setItems(wishlistItems ?? []);
        } catch (error) {
          console.error("Error loading wishlist:", error);
        }
      }
      setLoading(false);
    };

    void loadWishlist();
  }, []);

  const handleRemoveItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/wishlist/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove from wishlist");
      setItems(items.filter(item => item.id !== itemId));
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (!userId) return;
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.product_id, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      toast.success("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <div className="flex items-center gap-3 font-sub text-sm font-medium uppercase tracking-widest text-brand-copper">
          <Heart className="h-4 w-4 animate-pulse fill-brand-gold-500 text-brand-gold-500" />
          Loading Wishlist...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pb-16">
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div className="relative mb-12 flex min-h-[40vh] items-center justify-center overflow-hidden bg-brand-espresso px-4 py-20 text-center">
        {/* Abstract Background Elements matching brand feel */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <Image
            src="https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=2070&auto=format&fit=crop"
            alt="Beauty Products Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-espresso/60 to-brand-espresso"></div>
        </div>
        
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-gold-500/30 bg-brand-gold-500/10 px-4 py-1.5 backdrop-blur-sm">
            <Heart className="h-3.5 w-3.5 fill-brand-gold-400 text-brand-gold-400" />
            <span className="font-sub text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold-200">
              Your Curated Selection
            </span>
          </div>
          <h1 className="mb-6 font-display text-4xl font-light italic text-white sm:text-5xl md:text-6xl">
            My <span className="text-brand-gold-300">Wishlist</span>
          </h1>
          <p className="mx-auto max-w-lg font-body text-brand-cream/80 sm:text-lg">
            Save your favorite Mannequin Care essentials and build your personalized routine.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!userId ? (
          <div className="mx-auto max-w-2xl rounded-card border border-brand-sand bg-white p-10 text-center shadow-soft sm:p-16">
            <Heart className="mx-auto mb-6 h-12 w-12 text-brand-gold-300" strokeWidth={1} />
            <h2 className="mb-3 font-display text-2xl font-medium text-brand-espresso">Sign in required</h2>
            <p className="mb-8 font-body text-brand-body">
              Please sign in to view and manage your saved items.
            </p>
            <Link
              href="/auth/login?next=/wishlist"
              className="inline-flex items-center gap-2 rounded bg-brand-gold-500 px-8 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-card border border-brand-sand bg-white p-10 text-center shadow-soft sm:p-16">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-cream text-brand-copper">
              <Heart className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h2 className="mb-3 font-display text-2xl font-medium text-brand-espresso">Your wishlist is empty</h2>
            <p className="mb-8 font-body text-brand-body">
              Discover our premium collection and save your favorites here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded bg-brand-gold-500 px-8 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-card border border-brand-sand bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-mocha shadow-sm backdrop-blur transition-colors hover:text-red-500"
                  aria-label="Remove from wishlist"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>

                <Link href={`/products/${item.product?.slug ?? item.product_id}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-brand-cream/50">
                    {item.product?.thumbnail_url ? (
                      <Image
                        src={item.product.thumbnail_url}
                        alt={item.product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-sub text-xs text-brand-mocha">
                        No Image
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <Link href={`/products/${item.product?.slug ?? item.product_id}`}>
                      <h3 className="line-clamp-2 font-display text-lg font-medium text-brand-espresso transition-colors hover:text-brand-copper">
                        {item.product?.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="mt-auto mb-5">
                    <span className="font-display text-lg text-brand-espresso">
                      ₹{(item.product?.price || 0).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex w-full items-center justify-center gap-2 rounded bg-brand-espresso px-4 py-3 font-sub text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition-all hover:bg-brand-copper"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
