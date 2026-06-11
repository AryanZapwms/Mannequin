"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { ProductReview } from "@/lib/db/models/ProductReview";

export async function updateReviewStatus(formData: FormData) {
  const reviewId = formData.get("reviewId");
  const status = formData.get("status");
  const response = (formData.get("response") as string | null) ?? null;

  if (typeof reviewId !== "string") {
    throw new Error("Review id is required");
  }

  await requireStaff();

  await dbConnect();
  await ProductReview.findByIdAndUpdate(reviewId, {
    status,
    adminResponse: response && response.trim().length > 0 ? response.trim() : null,
  });

  revalidatePath("/admin/reviews");
}
