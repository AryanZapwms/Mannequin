"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { ProductCategory } from "@/lib/db/models/ProductCategory";

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

  const user = await requireStaff();

  const slug = slugInput.trim() ? slugify(slugInput) : slugify(name);

  await dbConnect();
  await ProductCategory.create({
    name: name.trim(),
    description: description.trim() || null,
    slug,
    parentId,
    createdBy: user.id,
  });

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

  await requireStaff();

  const slug = slugInput.trim() ? slugify(slugInput) : slugify(name);

  await dbConnect();
  await ProductCategory.findByIdAndUpdate(categoryId, {
    name: name.trim(),
    description: description.trim() || null,
    slug,
    parentId,
  });

  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(categoryId: string) {
  await requireStaff();

  await dbConnect();
  await ProductCategory.findByIdAndDelete(categoryId);

  revalidatePath("/admin/categories");
}
