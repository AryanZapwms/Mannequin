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

const parsePrice = (value: FormDataEntryValue | null) => {
  const numeric = typeof value === "string" ? Number(value) : 0;
  return Number.isFinite(numeric) ? numeric : 0;
};

const parseBoolean = (value: FormDataEntryValue | null) => value === "on" || value === "true";

export async function createProduct(formData: FormData) {
  const name = (formData.get("name") as string | null) ?? "";
  const slugInput = (formData.get("slug") as string | null) ?? "";
  const description = (formData.get("description") as string | null) ?? "";
  const sku = (formData.get("sku") as string | null) ?? "";
  const thumbnailUrl = (formData.get("thumbnailUrl") as string | null) ?? "";
  const status = (formData.get("status") as string | null) ?? "draft";
  const mainCategoryId = (formData.get("mainCategoryId") as string | null) || null;
  const subCategoryId = (formData.get("subCategoryId") as string | null) || null;
  const stockValue = formData.get("stock");
  const priceValue = formData.get("price");
  const comparePriceValue = formData.get("compareAtPrice");
  const isFeaturedValue = formData.get("isFeatured");

  if (!name.trim()) {
    throw new Error("Product name is required");
  }

  const stock = typeof stockValue === "string" ? parseInt(stockValue, 10) : 0;
  const price = parsePrice(priceValue);
  const compareAtPrice = parsePrice(comparePriceValue) || null;
  const isFeatured = parseBoolean(isFeaturedValue);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/products");
  }

  const slug = slugInput.trim() ? slugify(slugInput) : slugify(name);

  const { error } = await supabase.from("products").insert({
    name: name.trim(),
    slug,
    description: description.trim() || null,
    sku: sku.trim() || null,
    price,
    compare_at_price: compareAtPrice,
    stock: Number.isFinite(stock) ? stock : 0,
    main_category_id: mainCategoryId,
    sub_category_id: subCategoryId,
    status,
    is_featured: isFeatured,
    thumbnail_url: thumbnailUrl.trim() || null,
    created_by: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/products/${slug}`);
  redirect("/admin/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const name = (formData.get("name") as string | null) ?? "";
  const slugInput = (formData.get("slug") as string | null) ?? "";
  const description = (formData.get("description") as string | null) ?? "";
  const sku = (formData.get("sku") as string | null) ?? "";
  const thumbnailUrl = (formData.get("thumbnailUrl") as string | null) ?? "";
  const status = (formData.get("status") as string | null) ?? "draft";
  const mainCategoryId = (formData.get("mainCategoryId") as string | null) || null;
  const subCategoryId = (formData.get("subCategoryId") as string | null) || null;
  const stockValue = formData.get("stock");
  const priceValue = formData.get("price");
  const comparePriceValue = formData.get("compareAtPrice");
  const isFeaturedValue = formData.get("isFeatured");

  if (!name.trim()) {
    throw new Error("Product name is required");
  }

  const stock = typeof stockValue === "string" ? parseInt(stockValue, 10) : 0;
  const price = parsePrice(priceValue);
  const compareAtPrice = parsePrice(comparePriceValue) || null;
  const isFeatured = parseBoolean(isFeaturedValue);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/products");
  }

  const slug = slugInput.trim() ? slugify(slugInput) : slugify(name);

  const { data: existing } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .single();

  const { error } = await supabase
    .from("products")
    .update({
      name: name.trim(),
      slug,
      description: description.trim() || null,
      sku: sku.trim() || null,
      price,
      compare_at_price: compareAtPrice,
      stock: Number.isFinite(stock) ? stock : 0,
      main_category_id: mainCategoryId,
      sub_category_id: subCategoryId,
      status,
      is_featured: isFeatured,
      thumbnail_url: thumbnailUrl.trim() || null,
    })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/products/${slug}`);
  if (existing?.slug && existing.slug !== slug) {
    revalidatePath(`/products/${existing.slug}`);
  }
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/products");
  }

  const { data: existing } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .single();

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  if (existing?.slug) {
    revalidatePath(`/products/${existing.slug}`);
  }
}
