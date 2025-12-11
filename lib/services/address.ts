import type { SupabaseClient } from "@supabase/supabase-js";

export type AddressType = "billing" | "shipping";

export interface UserAddress {
  id: string;
  user_id: string;
  type: AddressType;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export async function getAddresses(
  supabase: SupabaseClient,
  userId: string,
  type?: AddressType,
): Promise<UserAddress[]> {
  let query = supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getDefaultAddress(
  supabase: SupabaseClient,
  userId: string,
  type: AddressType,
): Promise<UserAddress | null> {
  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("type", type)
    .eq("is_default", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }
  return data;
}

export async function createAddress(
  supabase: SupabaseClient,
  userId: string,
  address: Omit<UserAddress, "id" | "user_id" | "created_at" | "updated_at">,
): Promise<UserAddress> {
  if (address.is_default) {
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", userId)
      .eq("type", address.type);
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .insert({ ...address, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAddress(
  supabase: SupabaseClient,
  addressId: string,
  updates: Partial<Omit<UserAddress, "id" | "user_id" | "created_at" | "updated_at">>,
): Promise<UserAddress> {
  const { data: address, error: fetchError } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("id", addressId)
    .single();

  if (fetchError) throw fetchError;

  if (updates.is_default && !address.is_default) {
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", address.user_id)
      .eq("type", address.type);
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .update(updates)
    .eq("id", addressId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAddress(
  supabase: SupabaseClient,
  addressId: string,
): Promise<void> {
  const { error } = await supabase.from("user_addresses").delete().eq("id", addressId);

  if (error) throw error;
}

export async function setDefaultAddress(
  supabase: SupabaseClient,
  addressId: string,
  type: AddressType,
): Promise<UserAddress> {
  const { data: address, error: fetchError } = await supabase
    .from("user_addresses")
    .select("user_id")
    .eq("id", addressId)
    .single();

  if (fetchError) throw fetchError;

  await supabase
    .from("user_addresses")
    .update({ is_default: false })
    .eq("user_id", address.user_id)
    .eq("type", type);

  const { data, error } = await supabase
    .from("user_addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
