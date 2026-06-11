import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { updateCartQuantity, removeFromCart } from "@/lib/services/cart";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const quantity = typeof body?.quantity === "number" ? body.quantity : null;

  if (quantity === null) {
    return NextResponse.json({ error: "quantity is required" }, { status: 400 });
  }

  try {
    const item = await updateCartQuantity(user.id, id, quantity);
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const item = await removeFromCart(user.id, id);
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }
}
