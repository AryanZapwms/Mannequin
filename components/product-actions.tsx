"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart, Minus, Plus, Share2, ShoppingCart } from "lucide-react";
import { getSessionUser } from "@/lib/auth-client";
import { addToGuestCart } from "@/lib/services/guest-cart";

interface ProductActionsProps {
  productId: string;
  productSlug: string;
  productName: string;
  productPrice: number;
  productThumbnailUrl?: string | null;
  maxStock: number;
  isOutOfStock: boolean;
  initialInWishlist?: boolean;
  initialWishlistItemId?: string | null;
}

export function ProductActions({
  productId,
  productSlug,
  productName,
  productPrice,
  productThumbnailUrl,
  maxStock,
  isOutOfStock,
  initialInWishlist = false,
  initialWishlistItemId = null,
}: ProductActionsProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(initialWishlistItemId);
  const [isPendingCart, startCartTransition] = useTransition();
  const [isPendingWishlist, startWishlistTransition] = useTransition();

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(maxStock || 99, q + 1));

  const handleAddToCart = () => {
    startCartTransition(async () => {
      try {
        const user = await getSessionUser();

        if (user) {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity }),
          });
          if (!res.ok) throw new Error("Failed to add to cart");
        } else {
          addToGuestCart(productId, quantity, {
            id: productId,
            name: productName,
            price: productPrice,
            thumbnail_url: productThumbnailUrl ?? undefined,
            stock: maxStock,
          });
          // Notify header to update guest cart count
          window.dispatchEvent(new Event("storage"));
        }

        toast.success(`${quantity} × ${productName} added to cart`);
      } catch (err) {
        console.error(err);
        toast.error("Failed to add to cart. Please try again.");
      }
    });
  };

  const handleWishlist = () => {
    startWishlistTransition(async () => {
      try {
        const user = await getSessionUser();

        if (!user) {
          router.push(`/auth/login?next=/products/${productSlug}`);
          return;
        }

        if (inWishlist && wishlistItemId) {
          const res = await fetch(`/api/wishlist/${wishlistItemId}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to remove from wishlist");
          setInWishlist(false);
          setWishlistItemId(null);
          toast.success("Removed from wishlist");
        } else {
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
          const body = await res.json();
          if (!res.ok) throw new Error(body?.error || "Failed to update wishlist");
          setInWishlist(true);
          setWishlistItemId(body.item.id);
          toast.success("Added to wishlist");
        }
      } catch (err: any) {
        const msg =
          err?.message === "Product already in wishlist"
            ? "Already in your wishlist"
            : "Failed to update wishlist";
        toast.error(msg);
      }
    });
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: productName, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // user cancelled share — no-op
    }
  };

  return (
    <div className="space-y-4 border-t border-brand-sand pt-6">
      {/* Quantity + Add to Cart */}
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded border border-brand-sand bg-white">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={decrement}
            disabled={quantity <= 1 || isOutOfStock}
            className="px-4 py-3 text-brand-espresso transition-colors hover:bg-brand-gold-50 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 select-none border-x border-brand-sand py-3 text-center font-mono text-sm text-brand-espresso">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={increment}
            disabled={quantity >= maxStock || isOutOfStock}
            className="px-4 py-3 text-brand-espresso transition-colors hover:bg-brand-gold-50 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isPendingCart}
          className="flex flex-1 items-center justify-center gap-2 rounded bg-brand-gold-500 px-6 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold disabled:cursor-not-allowed disabled:border disabled:border-brand-sand disabled:bg-white disabled:text-brand-mocha disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          <ShoppingCart className="h-5 w-5" />
          {isPendingCart ? "Adding…" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      {/* Wishlist + Share */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleWishlist}
          disabled={isPendingWishlist}
          className={`flex flex-1 items-center justify-center gap-2 rounded border px-6 py-3.5 font-sub text-sm font-semibold uppercase tracking-[0.06em] transition-all duration-200 ${
            inWishlist
              ? "border-brand-blush bg-brand-blush/20 text-brand-copper hover:bg-brand-blush/30"
              : "border-brand-sand text-brand-espresso hover:bg-white hover:shadow-soft"
          }`}
        >
          <Heart className={`h-5 w-5 ${inWishlist ? "fill-brand-blush text-brand-blush" : ""}`} />
          {isPendingWishlist
            ? "Updating…"
            : inWishlist
            ? "In Wishlist"
            : "Add to Wishlist"}
        </button>

        <button
          type="button"
          aria-label="Share product"
          onClick={handleShare}
          className="flex items-center justify-center gap-2 rounded border border-brand-sand px-5 py-3.5 text-brand-espresso transition-all duration-200 hover:bg-white hover:shadow-soft"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
