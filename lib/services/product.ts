import type { HydratedDocument } from "mongoose";
import type { ProductDoc } from "@/lib/db/models/Product";

export interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  thumbnail_url?: string;
  stock: number;
}

export function toShopProduct(doc: HydratedDocument<ProductDoc>): ShopProduct {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    price: doc.price,
    compare_at_price: doc.compareAtPrice ?? undefined,
    thumbnail_url: doc.thumbnailUrl ?? undefined,
    stock: doc.stock,
  };
}
