import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { updateAddress, deleteAddress, setDefaultAddress } from "@/lib/services/address";

const UPDATABLE_FIELDS = [
  "full_name",
  "phone",
  "street_address",
  "city",
  "state",
  "postal_code",
  "country",
  "is_default",
] as const;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  if (body?.action === "set-default") {
    const type = body?.type === "billing" || body?.type === "shipping" ? body.type : null;
    if (!type) {
      return NextResponse.json({ error: "A valid address type is required" }, { status: 400 });
    }
    try {
      const address = await setDefaultAddress(user.id, id, type);
      return NextResponse.json({ address });
    } catch {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }
  }

  const updates: Record<string, unknown> = {};
  for (const field of UPDATABLE_FIELDS) {
    if (field in body) updates[field] = body[field];
  }

  try {
    const address = await updateAddress(user.id, id, updates);
    return NextResponse.json({ address });
  } catch {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await deleteAddress(user.id, id);
  return NextResponse.json({ message: "Address deleted" });
}
