"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateUserRole(formData: FormData) {
  const profileId = formData.get("profileId");
  const role = formData.get("role");

  if (typeof profileId !== "string") {
    throw new Error("Profile id is required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/users");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", profileId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/users");
}
