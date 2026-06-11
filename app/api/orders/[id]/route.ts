import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getOrderById } from "@/lib/services/order";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let order;
  try {
    order = await getOrderById(id);
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const isOwner = order.user_id === user.id;
  const isStaff = user.role === "admin" || user.role === "staff";
  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
