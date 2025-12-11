"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/lib/services/cart";
import type { GuestCartItem } from "@/lib/services/guest-cart";
import { useState, useTransition } from "react";

interface CartItemRowProps {
  item: CartItem | (GuestCartItem & { id?: string });
  onUpdate: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItemRow({ item, onUpdate, onRemove }: CartItemRowProps) {
  const [isPending, startTransition] = useTransition();
  const product = item.product;
  const itemId = "id" in item ? item.id : item.product_id;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) return;
    startTransition(() => onUpdate(itemId, newQuantity));
  };

  const handleRemove = () => {
    startTransition(() => onRemove(itemId));
  };

  return (
    <div className="flex gap-4 border-b pb-4 last:border-b-0">
      <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-gray-100">
        {product?.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{product?.name}</h3>
        <p className="text-sm text-gray-600">
          ₹{(product?.price || 0).toFixed(2)} each
        </p>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isPending || item.quantity <= 1}
            className="disabled:opacity-50 rounded-md border border-gray-300 p-1 hover:bg-gray-100"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isPending || (product?.stock || 0) <= item.quantity}
            className="disabled:opacity-50 rounded-md border border-gray-300 p-1 hover:bg-gray-100"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <span className="font-semibold">
          ₹{((product?.price || 0) * item.quantity).toFixed(2)}
        </span>
        <button
          onClick={handleRemove}
          disabled={isPending}
          className="text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
