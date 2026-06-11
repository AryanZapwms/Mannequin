"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export async function updateUserRole(formData: FormData) {
  const profileId = formData.get("profileId");
  const role = formData.get("role");

  if (typeof profileId !== "string") {
    throw new Error("Profile id is required");
  }

  await requireAdmin();

  await dbConnect();
  await User.findByIdAndUpdate(profileId, { role });

  revalidatePath("/admin/users");
}
