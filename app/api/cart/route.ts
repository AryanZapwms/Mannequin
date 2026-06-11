import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getCartItems, addToCart } from "@/lib/services/cart";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getCartItems(user.id);
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const productId = typeof body?.productId === "string" ? body.productId : "";
  const quantity =
    typeof body?.quantity === "number" && body.quantity > 0 ? body.quantity : 1;

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const item = await addToCart(user.id, productId, quantity);
  return NextResponse.json({ item });
}
