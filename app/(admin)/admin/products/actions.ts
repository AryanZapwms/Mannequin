"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { Product, type ProductStatus } from "@/lib/db/models/Product";

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

interface ParsedMediaItem {
  url: string;
  publicId: string | null;
  altText: string | null;
  sortOrder: number;
}

const parseMedia = (formData: FormData): ParsedMediaItem[] => {
  const raw = (formData.get("media") as string | null) ?? "[]";
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter(
      (item): item is { url: string; publicId?: string | null; altText?: string | null } =>
        Boolean(item) && typeof item === "object" && typeof (item as any).url === "string" && (item as any).url.trim().length > 0,
    )
    .map((item, index) => ({
      url: item.url.trim(),
      publicId: item.publicId ? String(item.publicId).trim() || null : null,
      altText: item.altText ? String(item.altText).trim() || null : null,
      sortOrder: index,
    }));
};

export async function createProduct(formData: FormData) {
  const name = (formData.get("name") as string | null) ?? "";
  const slugInput = (formData.get("slug") as string | null) ?? "";
  const description = (formData.get("description") as string | null) ?? "";
  const sku = (formData.get("sku") as string | null) ?? "";
  const thumbnailUrl = (formData.get("thumbnailUrl") as string | null) ?? "";
  const thumbnailPublicId = (formData.get("thumbnailPublicId") as string | null) ?? "";
  const status = ((formData.get("status") as string | null) ?? "draft") as ProductStatus;
  const mainCategoryId = (formData.get("mainCategoryId") as string | null) || null;
  const subCategoryId = (formData.get("subCategoryId") as string | null) || null;
  const stockValue = formData.get("stock");
  const priceValue = formData.get("price");
  const comparePriceValue = formData.get("compareAtPrice");
  const isFeaturedValue = formData.get("isFeatured");
  const media = parseMedia(formData);

  if (!name.trim()) {
    throw new Error("Product name is required");
  }

  const stock = typeof stockValue === "string" ? parseInt(stockValue, 10) : 0;
  const price = parsePrice(priceValue);
  const compareAtPrice = parsePrice(comparePriceValue) || null;
  const isFeatured = parseBoolean(isFeaturedValue);

  const user = await requireStaff();

  const slug = slugInput.trim() ? slugify(slugInput) : slugify(name);

  await dbConnect();
  await Product.create({
    name: name.trim(),
    slug,
    description: description.trim() || null,
    sku: sku.trim() || null,
    price,
    compareAtPrice,
    stock: Number.isFinite(stock) ? stock : 0,
    mainCategoryId,
    subCategoryId,
    status,
    isFeatured,
    thumbnailUrl: thumbnailUrl.trim() || null,
    thumbnailPublicId: thumbnailPublicId.trim() || null,
    media,
    createdBy: user.id,
  });

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
  const thumbnailPublicId = (formData.get("thumbnailPublicId") as string | null) ?? "";
  const status = ((formData.get("status") as string | null) ?? "draft") as ProductStatus;
  const mainCategoryId = (formData.get("mainCategoryId") as string | null) || null;
  const subCategoryId = (formData.get("subCategoryId") as string | null) || null;
  const stockValue = formData.get("stock");
  const priceValue = formData.get("price");
  const comparePriceValue = formData.get("compareAtPrice");
  const isFeaturedValue = formData.get("isFeatured");
  const media = parseMedia(formData);

  if (!name.trim()) {
    throw new Error("Product name is required");
  }

  const stock = typeof stockValue === "string" ? parseInt(stockValue, 10) : 0;
  const price = parsePrice(priceValue);
  const compareAtPrice = parsePrice(comparePriceValue) || null;
  const isFeatured = parseBoolean(isFeaturedValue);

  await requireStaff();

  const slug = slugInput.trim() ? slugify(slugInput) : slugify(name);

  await dbConnect();
  const existing = await Product.findById(productId).select("slug");

  await Product.findByIdAndUpdate(productId, {
    name: name.trim(),
    slug,
    description: description.trim() || null,
    sku: sku.trim() || null,
    price,
    compareAtPrice,
    stock: Number.isFinite(stock) ? stock : 0,
    mainCategoryId,
    subCategoryId,
    status,
    isFeatured,
    thumbnailUrl: thumbnailUrl.trim() || null,
    thumbnailPublicId: thumbnailPublicId.trim() || null,
    media,
  });

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
  await requireStaff();

  await dbConnect();
  const existing = await Product.findById(productId).select("slug");
  await Product.findByIdAndDelete(productId);

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  if (existing?.slug) {
    revalidatePath(`/products/${existing.slug}`);
  }
}