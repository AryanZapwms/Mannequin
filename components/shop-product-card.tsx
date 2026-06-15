"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getSessionUser } from "@/lib/auth-client";
import { addToGuestCart } from "@/lib/services/guest-cart";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  thumbnail_url?: string;
  stock: number;
}

interface ShopProductCardProps {
  product: Product;
}

export function ShopProductCard({ product }: ShopProductCardProps) {
  const [isPending, startTransition] = useTransition();
  const [inWishlist, setInWishlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [heartPulse, setHeartPulse] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      const user = await getSessionUser();
      if (user) {
        const res = await fetch(`/api/wishlist?productId=${product.id}`);
        if (res.ok) {
          const { inWishlist: inList } = await res.json();
          setInWishlist(Boolean(inList));
        }
      }
    };

    void checkWishlist();
  }, [product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const user = await getSessionUser();

      const flashAdded = () => {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
      };

      if (!user) {
        addToGuestCart(product.id, 1, {
          id: product.id,
          name: product.name,
          price: product.price,
          thumbnail_url: product.thumbnail_url,
          stock: product.stock,
        });
        window.dispatchEvent(new Event("storage"));
        toast.success("Added to cart!");
        flashAdded();
        return;
      }

      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        });
        if (!res.ok) throw new Error("Failed to add to cart");
        toast.success("Added to cart!");
        flashAdded();
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error("Failed to add to cart");
      }
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const user = await getSessionUser();

      if (!user) {
        toast.error("Sign in to add items to wishlist");
        return;
      }

      try {
        if (inWishlist) {
          const items = await fetch("/api/wishlist").then((r) => r.json());
          const wishlistItem = (items.items ?? []).find(
            (item: { product_id: string }) => item.product_id === product.id,
          );

          if (wishlistItem) {
            const res = await fetch(`/api/wishlist/${wishlistItem.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to remove from wishlist");
            setInWishlist(false);
            toast.success("Removed from wishlist");
          }
        } else {
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id }),
          });
          if (!res.ok) {
            const { error } = await res.json();
            throw new Error(error || "Failed to update wishlist");
          }
          setInWishlist(true);
          toast.success("Added to wishlist");
        }
        setHeartPulse(true);
        setTimeout(() => setHeartPulse(false), 200);
      } catch (error) {
        const msg =
          error instanceof Error && error.message === "Product already in wishlist"
            ? "Already in your wishlist"
            : "Failed to update wishlist";
        toast.error(msg);
      }
    });
  };

  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block h-full overflow-hidden rounded-card border border-brand-sand bg-white shadow-soft transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-gold-400 hover:shadow-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute left-0 top-0 z-10 rounded-[0_0_8px_0] bg-brand-espresso px-2.5 py-1 font-mono text-xs text-white">
            -{discount}%
          </span>
        )}

        {/* NEW Badge */}
        <span className="absolute right-0 top-0 z-10 rounded-[0_0_0_8px] bg-brand-gold-500 px-2.5 py-1 font-sub text-[10px] font-bold uppercase tracking-[0.1em] text-brand-espresso">
          New
        </span>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          disabled={isPending}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-11 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur-sm transition-transform duration-150 hover:scale-[1.2] disabled:opacity-50"
        >
          <Heart
            className={cn(
              "h-[18px] w-[18px] transition-colors duration-200",
              heartPulse && "animate-spring-pop",
              inWishlist ? "fill-brand-blush stroke-brand-blush" : "stroke-brand-sand",
            )}
          />
        </button>

        {/* Product Image */}
        <div className="relative h-[280px] w-full overflow-hidden bg-brand-gold-50">
          {product.thumbnail_url ? (
            <Image
              src={product.thumbnail_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, (max-width: 1280px) 30vw, 22vw"
              className="object-contain p-5 transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <span className="font-display text-6xl font-semibold text-brand-sand">VE</span>
              <p className="font-sub text-[11px] font-normal text-brand-mocha">
                Product Image Coming Soon
              </p>
            </div>
          )}

          {/* Quick-add overlay */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-[rgba(61,43,31,0.85)] py-3 transition-transform duration-300 ease-out",
              isHovered && "translate-y-0",
            )}
          >
            <span className="font-sub text-[13px] font-semibold uppercase tracking-[0.1em] text-white">
              Quick Add
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-2.5 p-5">
          {/* Product Name */}
          <h3 className="line-clamp-2 min-h-[2.5rem] font-body text-[15px] font-semibold text-brand-espresso">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < 4 ? "fill-brand-gold-500 text-brand-gold-500" : "fill-brand-sand text-brand-sand",
                )}
              />
            ))}
            <span className="ml-1 font-sub text-xs font-light text-brand-mocha">(0 reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="font-mono text-xl text-brand-copper">
              ₹{product.price.toFixed(2)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="font-mono text-sm text-[#9E9E9E] line-through">
                ₹{product.compare_at_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isPending || product.stock <= 0}
            className={cn(
              "w-full rounded-lg px-3 py-3 font-sub text-[13px] font-semibold uppercase tracking-[0.08em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
              product.stock <= 0
                ? "border border-brand-sand bg-white text-brand-mocha"
                : justAdded
                  ? "bg-brand-sage text-brand-espresso"
                  : "bg-brand-gold-500 text-brand-espresso hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold",
            )}
          >
            {product.stock <= 0 ? "Out of Stock" : justAdded ? "✓ Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}
