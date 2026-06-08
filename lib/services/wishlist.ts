import type { SupabaseClient } from "@supabase/supabase-js";

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

export async function getWishlistItems(
  supabase: SupabaseClient,
  userId: string,
): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select(
      `
      id,
      user_id,
      product_id,
      created_at,
      product:product_id(id, name, slug, price, thumbnail_url, stock)
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addToWishlist(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
): Promise<WishlistItem> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .insert({ user_id: userId, product_id: productId })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Product already in wishlist");
    }
    throw error;
  }
  return data;
}

export async function removeFromWishlist(
  supabase: SupabaseClient,
  wishlistItemId: string,
): Promise<WishlistItem> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", wishlistItemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function isInWishlist(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("wishlist_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) throw error;
  return (count || 0) > 0;
}

export async function getWishlistCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("wishlist_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return count || 0;
}
