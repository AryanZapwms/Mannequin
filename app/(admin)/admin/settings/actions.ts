"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { SiteSetting } from "@/lib/db/models/SiteSetting";

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
  } catch {
    throw new Error("Value must be valid JSON");
  }

  await requireAdmin();

  await dbConnect();
  await SiteSetting.findOneAndUpdate(
    { key: key.trim() },
    {
      key: key.trim(),
      value: parsedValue,
      description: description.trim() || null,
    },
    { upsert: true },
  );

  revalidatePath("/admin/settings");
}

export async function deleteSetting(settingId: string) {
  await requireAdmin();

  await dbConnect();
  await SiteSetting.findByIdAndDelete(settingId);

  revalidatePath("/admin/settings");
}
