import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { Order as OrderModel } from "@/lib/db/models/Order";
import { getOrderById } from "@/lib/services/order";

/** Constant-time compare so a token can't be guessed byte by byte */
function tokenMatches(expected: string | null | undefined, provided: string | null): boolean {
  if (!expected || !provided) return false;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let order;
  try {
    order = await getOrderById(id);
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Guests reach their own confirmation with the one-time token issued at checkout
  const token = request.nextUrl.searchParams.get("token");
  if (token) {
    await dbConnect();
    const doc = await OrderModel.findById(id).select("guestToken");
    if (tokenMatches(doc?.guestToken, token)) {
      return NextResponse.json({ order });
    }
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isOwner = order.user_id === user.id;
  const isStaff = user.role === "admin" || user.role === "staff";
  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
