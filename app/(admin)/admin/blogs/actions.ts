"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { BlogPost, type BlogStatus } from "@/lib/db/models/BlogPost";

const slugify = (input: string) =>
  input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function createPost(formData: FormData) {
  const title = (formData.get("title") as string | null) ?? "";
  const slugInput = (formData.get("slug") as string | null) ?? "";
  const content = (formData.get("content") as string | null) ?? "";
  const excerpt = (formData.get("excerpt") as string | null) ?? "";
  const coverImageUrl = (formData.get("coverImageUrl") as string | null) ?? "";
  const status = ((formData.get("status") as string | null) ?? "draft") as BlogStatus;

  if (!title.trim()) {
    throw new Error("Title is required");
  }

  const user = await requireStaff();

  const slug = slugInput.trim() ? slugify(slugInput) : slugify(title);

  await dbConnect();
  await BlogPost.create({
    title: title.trim(),
    slug,
    content: content.trim() || null,
    excerpt: excerpt.trim() || null,
    coverImageUrl: coverImageUrl.trim() || null,
    status,
    authorId: user.id,
    publishedAt: status === "published" ? new Date() : null,
  });

  revalidatePath("/admin/blogs");
  redirect("/admin/blogs");
}

export async function updatePost(postId: string, formData: FormData) {
  const title = (formData.get("title") as string | null) ?? "";
  const slugInput = (formData.get("slug") as string | null) ?? "";
  const content = (formData.get("content") as string | null) ?? "";
  const excerpt = (formData.get("excerpt") as string | null) ?? "";
  const coverImageUrl = (formData.get("coverImageUrl") as string | null) ?? "";
  const status = ((formData.get("status") as string | null) ?? "draft") as BlogStatus;

  if (!title.trim()) {
    throw new Error("Title is required");
  }

  await requireStaff();

  const slug = slugInput.trim() ? slugify(slugInput) : slugify(title);

  await dbConnect();
  await BlogPost.findByIdAndUpdate(postId, {
    title: title.trim(),
    slug,
    content: content.trim() || null,
    excerpt: excerpt.trim() || null,
    coverImageUrl: coverImageUrl.trim() || null,
    status,
    publishedAt: status === "published" ? new Date() : null,
  });

  revalidatePath(`/admin/blogs/${postId}`);
  revalidatePath("/admin/blogs");
  redirect("/admin/blogs");
}

export async function deletePost(postId: string) {
  await requireStaff();

  await dbConnect();
  await BlogPost.findByIdAndDelete(postId);

  revalidatePath("/admin/blogs");
}
