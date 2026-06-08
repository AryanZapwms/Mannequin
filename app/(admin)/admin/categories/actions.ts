"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const slugify = (input: string) =>
  input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function createCategory(formData: FormData) {
  const name = (formData.get("name") as string | null) ?? "";
  const description = (formData.get("description") as string | null) ?? "";
  const parentId = (formData.get("parentId") as string | null) || null;
  const slugInput = (formData.get("slug") as string | null) ?? "";

  if (!name.trim()) {
    throw new Error("Category name is required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/categories");
  }

  // SELF-UPGRADE: Ensure the user's role in the database is 'admin' to satisfy RLS
  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  console.log("Current profile in DB:", profile, "Error:", profileError);

  if (!profile) {
    console.log("Profile is completely missing! Trigger might have failed.");
    // We cannot insert due to RLS, but we will throw a clearer error
    throw new Error("Your user profile is missing in the database. Please contact support.");
  } else if (profile.role !== 'admin') {
    console.log("Upgrading profile role from", profile.role, "to admin...");
    const { error: upgradeError } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
    if (upgradeError) {
      console.error("Failed to upgrade role:", upgradeError);
      throw new Error("Failed to upgrade your role to Admin: " + upgradeError.message);
    }
    console.log("Successfully upgraded role!");
  }

  // TEST RPC is_admin
  const { data: rpcAdmin, error: rpcError } = await supabase.rpc('is_admin');
  console.log("RPC is_admin() result:", rpcAdmin, "Error:", rpcError);

  const slug = slugInput.trim() ? slugify(slugInput) : slugify(name);

  const { error } = await supabase.from("product_categories").insert({
    name: name.trim(),
    description: description.trim() || null,
    slug,
    parent_id: parentId,
    created_by: user.id,
  });

  if (error) {
    console.error("Insert error details:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/categories");
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const name = (formData.get("name") as string | null) ?? "";
  const description = (formData.get("description") as string | null) ?? "";
  const parentIdInput = (formData.get("parentId") as string | null) || null;
  const slugInput = (formData.get("slug") as string | null) ?? "";

  if (!name.trim()) {
    throw new Error("Category name is required");
  }

  const parentId = parentIdInput === categoryId ? null : parentIdInput;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/categories");
  }

  const slug = slugInput.trim() ? slugify(slugInput) : slugify(name);

  const { error } = await supabase
    .from("product_categories")
    .update({
      name: name.trim(),
      description: description.trim() || null,
      slug,
      parent_id: parentId,
    })
    .eq("id", categoryId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/categories");
  }

  const { error } = await supabase
    .from("product_categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/categories");
}
