"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateReviewStatus(formData: FormData) {
  const reviewId = formData.get("reviewId");
  const status = formData.get("status");
  const response = (formData.get("response") as string | null) ?? null;

  if (typeof reviewId !== "string") {
    throw new Error("Review id is required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/reviews");
  }

  const { error } = await supabase
    .from("product_reviews")
    .update({
      status,
      admin_response: response && response.trim().length > 0 ? response.trim() : null,
    })
    .eq("id", reviewId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/reviews");
}
