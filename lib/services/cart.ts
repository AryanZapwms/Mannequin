import { dbConnect } from "@/lib/db/connect";
import { CartItem as CartItemModel } from "@/lib/db/models/CartItem";
import "@/lib/db/models/Product";

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    thumbnail_url?: string;
    stock: number;
  };
}

interface PopulatedProduct {
  _id: { toString(): string };
  name: string;
  price: number;
  thumbnailUrl?: string | null;
  stock: number;
}

function toCartItem(doc: any): CartItem {
  const product = doc.productId as PopulatedProduct | null | undefined;
  const rawProductId = doc.productId;
  const productId =
    product?._id?.toString?.() ??
    (rawProductId && typeof rawProductId.toString === "function"
      ? rawProductId.toString()
      : "");

  return {
    id: doc._id.toString(),
    user_id: doc.userId.toString(),
    product_id: productId,
    quantity: doc.quantity,
    created_at: (doc.createdAt ?? new Date()).toISOString(),
    product: product?._id
      ? {
          id: product._id.toString(),
          name: product.name,
          price: product.price,
          thumbnail_url: product.thumbnailUrl ?? undefined,
          stock: product.stock,
        }
      : undefined,
  };
}

export async function getCartItems(userId: string): Promise<CartItem[]> {
  await dbConnect();
  const docs = await CartItemModel.find({ userId })
    .populate("productId", "name price thumbnailUrl stock")
    .sort({ createdAt: -1 });
  return docs.map(toCartItem);
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number = 1,
): Promise<CartItem> {
  await dbConnect();

  const existing = await CartItemModel.findOne({ userId, productId });
  if (existing) {
    existing.quantity += quantity;
    await existing.save();
    await existing.populate("productId", "name price thumbnailUrl stock");
    return toCartItem(existing);
  }

  const created = await CartItemModel.create({ userId, productId, quantity });
  await created.populate("productId", "name price thumbnailUrl stock");
  return toCartItem(created);
}

export async function updateCartQuantity(
  userId: string,
  cartItemId: string,
  quantity: number,
): Promise<CartItem> {
  if (quantity <= 0) {
    return removeFromCart(userId, cartItemId);
  }

  await dbConnect();
  const updated = await CartItemModel.findOneAndUpdate(
    { _id: cartItemId, userId },
    { quantity },
    { new: true },
  ).populate("productId", "name price thumbnailUrl stock");

  if (!updated) throw new Error("Cart item not found");
  return toCartItem(updated);
}

export async function removeFromCart(userId: string, cartItemId: string): Promise<CartItem> {
  await dbConnect();
  const removed = await CartItemModel.findOneAndDelete({ _id: cartItemId, userId }).populate(
    "productId",
    "name price thumbnailUrl stock",
  );

  if (!removed) throw new Error("Cart item not found");
  return toCartItem(removed);
}

export async function clearCart(userId: string): Promise<void> {
  await dbConnect();
  await CartItemModel.deleteMany({ userId });
}

export async function getCartTotal(userId: string): Promise<number> {
  const items = await getCartItems(userId);
  return items.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
}

export async function getCartCount(userId: string): Promise<number> {
  await dbConnect();
  return CartItemModel.countDocuments({ userId });
}
