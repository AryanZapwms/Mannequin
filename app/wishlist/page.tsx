"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { WishlistItem } from "@/lib/services/wishlist";
import { getWishlistItems, removeFromWishlist } from "@/lib/services/wishlist";
import { addToCart } from "@/lib/services/cart";
import { Heart, ShoppingCart } from "lucide-react";

export default function WishlistPage() {
  const supabase = createClient();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        try {
          const wishlistItems = await getWishlistItems(supabase, user.id);
          setItems(wishlistItems);
        } catch (error) {
          console.error("Error loading wishlist:", error);
        }
      }
      setLoading(false);
    };

    void loadWishlist();
  }, [supabase]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromWishlist(supabase, itemId);
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
      await addToCart(supabase, userId, item.product_id, 1);
      toast.success("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading wishlist...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-semibold">My Wishlist</h1>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-6 text-gray-600">Sign in to create your wishlist</p>
          <Link
            href="/auth/login?next=/wishlist"
            className="inline-block rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-semibold">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-6 text-gray-600">Your wishlist is empty</p>
          <Link
            href="/shop"
            className="inline-block rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow-sm hover:bg-gray-100"
              >
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              </button>

              <Link href={`/products/${item.product_id}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {item.product?.thumbnail_url ? (
                    <Image
                      src={item.product.thumbnail_url}
                      alt={item.product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/products/${item.product_id}`}>
                  <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-gray-600">
                    {item.product?.name}
                  </h3>
                </Link>

                <div className="mb-3">
                  <span className="text-lg font-semibold text-gray-900">
                    ₹{(item.product?.price || 0).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
