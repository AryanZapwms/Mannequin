"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { ContactMessage, CONTACT_MESSAGE_STATUSES } from "@/lib/db/models/ContactMessage";
import type { ContactMessageStatus } from "@/lib/db/models/ContactMessage";

function assertStatus(value: unknown): ContactMessageStatus {
  if (
    typeof value !== "string" ||
    !CONTACT_MESSAGE_STATUSES.includes(value as ContactMessageStatus)
  ) {
    throw new Error("Invalid status");
  }
  return value as ContactMessageStatus;
}

export async function updateMessage(formData: FormData) {
  const messageId = formData.get("messageId");
  const notes = (formData.get("notes") as string | null) ?? null;
  const status = assertStatus(formData.get("status"));

  if (typeof messageId !== "string") {
    throw new Error("Message id is required");
  }

  await requireStaff();

  await dbConnect();
  await ContactMessage.findByIdAndUpdate(messageId, {
    status,
    adminNotes: notes && notes.trim().length > 0 ? notes.trim() : null,
  });

  revalidatePath("/admin/messages");
}

/** Flips a "new" message to "read" without touching notes — used by the row-level button */
export async function markMessageRead(formData: FormData) {
  const messageId = formData.get("messageId");

  if (typeof messageId !== "string") {
    throw new Error("Message id is required");
  }

  await requireStaff();

  await dbConnect();
  await ContactMessage.findByIdAndUpdate(messageId, { status: "read" });

  revalidatePath("/admin/messages");
}

export async function deleteMessage(formData: FormData) {
  const messageId = formData.get("messageId");

  if (typeof messageId !== "string") {
    throw new Error("Message id is required");
  }

  await requireStaff();

  await dbConnect();
  await ContactMessage.findByIdAndDelete(messageId);

  revalidatePath("/admin/messages");
}
