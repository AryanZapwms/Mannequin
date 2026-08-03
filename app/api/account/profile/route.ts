import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(sessionUser.id).select("displayName phone");

  return NextResponse.json({
    displayName: user?.displayName ?? null,
    phone: user?.phone ?? null,
  });
}

export async function POST(request: NextRequest) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const displayName = typeof body.displayName === "string" ? body.displayName.trim() || null : null;
  const phone = typeof body.phone === "string" ? body.phone.trim() || null : null;

  await dbConnect();
  const user = await User.findByIdAndUpdate(
    sessionUser.id,
    { displayName, phone },
    { new: true },
  ).select("displayName phone");

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    displayName: user.displayName ?? null,
    phone: user.phone ?? null,
  });
}
