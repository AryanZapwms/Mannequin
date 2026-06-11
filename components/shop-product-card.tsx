"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
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
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden bg-white transition-all duration-500 hover:shadow-2xl">
        {/* Badges Container */}
        <div className="absolute left-0 right-0 top-0 z-10 flex items-start justify-between p-4">
          {/* NEW Badge */}
          <span className="rounded-full bg-black px-3 py-1 text-[10px] font-medium tracking-wider text-white">
            NEW
          </span>

          {/* Discount Badge */}
          {discount > 0 && (
            <span className="rounded-full bg-black px-3 py-1 text-[10px] font-medium tracking-wider text-white">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          disabled={isPending}
          className={`absolute right-4 top-16 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white disabled:opacity-50 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-all duration-300 ${
              inWishlist ? "fill-black stroke-black" : "stroke-gray-700"
            }`}
          />
        </button>

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {product.thumbnail_url ? (
            <Image
              src={product.thumbnail_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-gray-300">
                <ShoppingCart className="mx-auto h-12 w-12 mb-2 stroke-1" />
                <p className="text-xs font-light tracking-wide">NO IMAGE</p>
              </div>
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${
            isHovered ? 'opacity-5' : 'opacity-0'
          }`} />
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2.5">
          {/* Product Name */}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-xs font-normal tracking-wide text-gray-900 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-2.5 w-2.5 ${
                  i < 4 ? "fill-gray-900 text-gray-900" : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
            <span className="ml-1 text-[10px] text-gray-400 font-light">(0)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-base font-medium text-gray-900 tracking-tight">
              ₹{product.price.toFixed(2)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-[11px] font-light text-gray-400 line-through">
                ₹{product.compare_at_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isPending || product.stock <= 0}
            className={`w-full border border-gray-900 px-3 py-2.5 text-[10px] font-medium tracking-widest transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
              product.stock <= 0 
                ? "bg-white text-gray-400 border-gray-300" 
                : "bg-white text-gray-900 hover:bg-gray-900 hover:text-white"
            }`}
          >
            {product.stock <= 0 ? "OUT OF STOCK" : "ADD TO CART"}
          </button>
        </div>
      </div>
    </Link>
  );
}