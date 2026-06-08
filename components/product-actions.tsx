"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart, Minus, Plus, Share2, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addToCart } from "@/lib/services/cart";
import { addToGuestCart } from "@/lib/services/guest-cart";
import { addToWishlist, removeFromWishlist } from "@/lib/services/wishlist";

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
  const supabase = createClient();
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
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await addToCart(supabase, user.id, productId, quantity);
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
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push(`/auth/login?next=/products/${productSlug}`);
          return;
        }

        if (inWishlist && wishlistItemId) {
          await removeFromWishlist(supabase, wishlistItemId);
          setInWishlist(false);
          setWishlistItemId(null);
          toast.success("Removed from wishlist");
        } else {
          const item = await addToWishlist(supabase, user.id, productId);
          setInWishlist(true);
          setWishlistItemId(item.id);
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
    <div className="space-y-4 border-t border-gray-200 pt-6">
      {/* Quantity + Add to Cart */}
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-md border border-gray-300">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={decrement}
            disabled={quantity <= 1 || isOutOfStock}
            className="px-4 py-2 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 border-x border-gray-300 py-2 text-center text-sm font-medium select-none">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={increment}
            disabled={quantity >= maxStock || isOutOfStock}
            className="px-4 py-2 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isPendingCart}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
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
          className={`flex flex-1 items-center justify-center gap-2 rounded-md border-2 px-6 py-3 font-medium transition-colors ${
            inWishlist
              ? "border-red-400 bg-red-50 text-red-600 hover:bg-red-100"
              : "border-gray-300 text-gray-900 hover:bg-gray-50"
          }`}
        >
          <Heart className={`h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
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
          className="flex items-center justify-center gap-2 rounded-md border-2 border-gray-300 px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
