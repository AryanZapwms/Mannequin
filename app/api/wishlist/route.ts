import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getWishlistItems, addToWishlist, isInWishlist } from "@/lib/services/wishlist";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = request.nextUrl.searchParams.get("productId");
  if (productId) {
    const inWishlist = await isInWishlist(user.id, productId);
    return NextResponse.json({ inWishlist });
  }

  const items = await getWishlistItems(user.id);
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const productId = typeof body?.productId === "string" ? body.productId : "";
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  try {
    const item = await addToWishlist(user.id, productId);
    return NextResponse.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add to wishlist";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
