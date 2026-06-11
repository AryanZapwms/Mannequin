import { dbConnect } from "@/lib/db/connect";
import { WishlistItem as WishlistItemModel } from "@/lib/db/models/WishlistItem";
import "@/lib/db/models/Product";

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    thumbnail_url?: string;
    stock: number;
  };
}

interface PopulatedProduct {
  _id: { toString(): string };
  name: string;
  slug: string;
  price: number;
  thumbnailUrl?: string | null;
  stock: number;
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}

function toWishlistItem(doc: any): WishlistItem {
  const product = doc.productId as PopulatedProduct | null | undefined;
  return {
    id: doc._id.toString(),
    user_id: doc.userId.toString(),
    product_id: product?._id ? product._id.toString() : doc.productId.toString(),
    created_at: (doc.createdAt ?? new Date()).toISOString(),
    product: product?._id
      ? {
          id: product._id.toString(),
          name: product.name,
          slug: product.slug,
          price: product.price,
          thumbnail_url: product.thumbnailUrl ?? undefined,
          stock: product.stock,
        }
      : undefined,
  };
}

export async function getWishlistItems(userId: string): Promise<WishlistItem[]> {
  await dbConnect();
  const docs = await WishlistItemModel.find({ userId })
    .populate("productId", "name slug price thumbnailUrl stock")
    .sort({ createdAt: -1 });
  return docs.map(toWishlistItem);
}

export async function addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
  await dbConnect();
  try {
    const created = await WishlistItemModel.create({ userId, productId });
    await created.populate("productId", "name slug price thumbnailUrl stock");
    return toWishlistItem(created);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw new Error("Product already in wishlist");
    }
    throw err;
  }
}

export async function removeFromWishlist(userId: string, wishlistItemId: string): Promise<WishlistItem> {
  await dbConnect();
  const removed = await WishlistItemModel.findOneAndDelete({ _id: wishlistItemId, userId }).populate(
    "productId",
    "name slug price thumbnailUrl stock",
  );

  if (!removed) throw new Error("Wishlist item not found");
  return toWishlistItem(removed);
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  await dbConnect();
  const count = await WishlistItemModel.countDocuments({ userId, productId });
  return count > 0;
}

export async function getWishlistCount(userId: string): Promise<number> {
  await dbConnect();
  return WishlistItemModel.countDocuments({ userId });
}
