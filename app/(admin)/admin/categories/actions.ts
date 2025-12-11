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

  const slug = slugInput.trim() ? slugify(slugInput) : slugify(name);

  const { error } = await supabase.from("product_categories").insert({
    name: name.trim(),
    description: description.trim() || null,
    slug,
    parent_id: parentId,
    created_by: user.id,
  });

  if (error) {
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
