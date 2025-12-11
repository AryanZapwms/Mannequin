"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function upsertSetting(formData: FormData) {
  const key = (formData.get("key") as string | null) ?? "";
  const value = (formData.get("value") as string | null) ?? "";
  const description = (formData.get("description") as string | null) ?? "";

  if (!key.trim()) {
    throw new Error("Setting key is required");
  }

  let parsedValue: unknown;
  try {
    parsedValue = value ? JSON.parse(value) : {};
  } catch (error) {
    throw new Error("Value must be valid JSON");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/settings");
  }

  const { error } = await supabase.from("site_settings").upsert(
    {
      key: key.trim(),
      value: parsedValue,
      description: description.trim() || null,
    },
    { onConflict: "key" }
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/settings");
}

export async function deleteSetting(settingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/settings");
  }

  const { error } = await supabase.from("site_settings").delete().eq("id", settingId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/settings");
}
