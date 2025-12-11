"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { CartItem } from "@/lib/services/cart";
import { getCartItems, removeFromCart, updateCartQuantity } from "@/lib/services/cart";
import type { GuestCartItem } from "@/lib/services/guest-cart";
import { getGuestCart, removeFromGuestCart, updateGuestCartQuantity } from "@/lib/services/guest-cart";
import { CartItemRow } from "@/components/cart-item-row";
import { ShoppingBag } from "lucide-react";

export default function CartPage() {
  const supabase = createClient();
  const [items, setItems] = useState<(CartItem | GuestCartItem)[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const loadCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        setIsGuest(false);
        try {
          const cartItems = await getCartItems(supabase, user.id);
          setItems(cartItems);
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
  }, [supabase]);

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    try {
      if (isGuest) {
        updateGuestCartQuantity(itemId, quantity);
        setItems(getGuestCart());
        window.dispatchEvent(new Event("storage"));
      } else if (userId) {
        startTransition(async () => {
          try {
            await updateCartQuantity(supabase, itemId, quantity);
            setItems(items.map(item => 
              item.id === itemId ? { ...item, quantity } : item
            ));
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
            await removeFromCart(supabase, itemId);
            setItems(items.filter(item => item.id !== itemId));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-semibold">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-6 text-gray-600">Your cart is empty</p>
          <Link
            href="/shop"
            className="inline-block rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="space-y-4">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          </div>

          <div className="h-fit rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
            
            <div className="space-y-3 border-b pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>₹0.00</span>
              </div>
            </div>

            <div className="mb-6 flex justify-between py-4 text-lg font-semibold">
              <span>Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <Link
              href="/checkout"
              className="block w-full rounded-md bg-black px-4 py-3 text-center font-medium text-white hover:bg-gray-800"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/shop"
              className="mt-3 block w-full rounded-md border border-gray-300 px-4 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
