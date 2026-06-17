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
  const itemId = ("id" in item && item.id) ? item.id : item.product_id;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) return;
    startTransition(() => onUpdate(itemId, newQuantity));
  };

  const handleRemove = () => {
    startTransition(() => onRemove(itemId));
  };

  return (
    <div className="group flex gap-3 border-b border-brand-sand/60 py-5 transition-colors first:pt-0 last:border-b-0 last:pb-0 sm:gap-5">
      {/* Product image */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-thumb bg-brand-cream sm:h-28 sm:w-28">
        {product?.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 80px, 112px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-sub text-[10px] uppercase tracking-wider text-brand-mocha/40">
            No Image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row sm:gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="truncate font-display text-base font-semibold text-brand-espresso sm:text-lg">
            {product?.name}
          </h3>
          <p className="mt-0.5 font-mono text-xs text-brand-mocha sm:text-sm">
            ₹{(product?.price || 0).toFixed(2)} each
          </p>

          {/* Quantity controls */}
          <div className="mt-3 flex items-center gap-1">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isPending || item.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-sand bg-brand-cream/60 text-brand-espresso transition-all hover:border-brand-gold-400 hover:bg-brand-gold-50 disabled:opacity-40 disabled:hover:border-brand-sand disabled:hover:bg-brand-cream/60"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="flex h-8 w-10 items-center justify-center font-mono text-sm font-medium text-brand-espresso">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isPending || (product?.stock || 0) <= item.quantity}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-sand bg-brand-cream/60 text-brand-espresso transition-all hover:border-brand-gold-400 hover:bg-brand-gold-50 disabled:opacity-40 disabled:hover:border-brand-sand disabled:hover:bg-brand-cream/60"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Price & remove */}
        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-between">
          <span className="font-mono text-base font-semibold text-brand-copper sm:text-lg">
            ₹{((product?.price || 0) * item.quantity).toFixed(2)}
          </span>
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-sub text-[11px] uppercase tracking-wider text-brand-mocha/60 transition-all hover:bg-brand-blush/30 hover:text-red-600 disabled:opacity-40 sm:mt-2"
            aria-label="Remove item"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}
