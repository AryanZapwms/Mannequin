import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { removeFromWishlist } from "@/lib/services/wishlist";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const item = await removeFromWishlist(user.id, id);
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Wishlist item not found" }, { status: 404 });
  }
}
