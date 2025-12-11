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

export async function createPost(formData: FormData) {
  const title = (formData.get("title") as string | null) ?? "";
  const slugInput = (formData.get("slug") as string | null) ?? "";
  const content = (formData.get("content") as string | null) ?? "";
  const excerpt = (formData.get("excerpt") as string | null) ?? "";
  const coverImageUrl = (formData.get("coverImageUrl") as string | null) ?? "";
  const status = (formData.get("status") as string | null) ?? "draft";

  if (!title.trim()) {
    throw new Error("Title is required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/blogs");
  }

  const slug = slugInput.trim() ? slugify(slugInput) : slugify(title);

  const { error } = await supabase.from("blog_posts").insert({
    title: title.trim(),
    slug,
    content: content.trim() || null,
    excerpt: excerpt.trim() || null,
    cover_image_url: coverImageUrl.trim() || null,
    status,
    author_id: user.id,
    published_at: status === "published" ? new Date().toISOString() : null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/blogs");
  redirect("/admin/blogs");
}

export async function updatePost(postId: string, formData: FormData) {
  const title = (formData.get("title") as string | null) ?? "";
  const slugInput = (formData.get("slug") as string | null) ?? "";
  const content = (formData.get("content") as string | null) ?? "";
  const excerpt = (formData.get("excerpt") as string | null) ?? "";
  const coverImageUrl = (formData.get("coverImageUrl") as string | null) ?? "";
  const status = (formData.get("status") as string | null) ?? "draft";

  if (!title.trim()) {
    throw new Error("Title is required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/blogs");
  }

  const slug = slugInput.trim() ? slugify(slugInput) : slugify(title);

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title: title.trim(),
      slug,
      content: content.trim() || null,
      excerpt: excerpt.trim() || null,
      cover_image_url: coverImageUrl.trim() || null,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/blogs/${postId}`);
  revalidatePath("/admin/blogs");
  redirect("/admin/blogs");
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/blogs");
  }

  const { error } = await supabase.from("blog_posts").delete().eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/blogs");
}
