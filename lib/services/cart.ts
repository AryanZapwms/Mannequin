import type { SupabaseClient } from "@supabase/supabase-js";

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

export async function getCartItems(
  supabase: SupabaseClient,
  userId: string,
): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      user_id,
      product_id,
      quantity,
      created_at,
      product:product_id(id, name, price, thumbnail_url, stock)
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addToCart(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
  quantity: number = 1,
): Promise<CartItem> {
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single();

  if (existingItem) {
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("id", existingItem.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("cart_items")
    .insert({ user_id: userId, product_id: productId, quantity })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCartQuantity(
  supabase: SupabaseClient,
  cartItemId: string,
  quantity: number,
): Promise<CartItem> {
  if (quantity <= 0) {
    return removeFromCart(supabase, cartItemId);
  }

  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFromCart(
  supabase: SupabaseClient,
  cartItemId: string,
): Promise<CartItem> {
  const { data, error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function clearCart(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}

export async function getCartTotal(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const items = await getCartItems(supabase, userId);
  return items.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
}

export async function getCartCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("cart_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return count || 0;
}
