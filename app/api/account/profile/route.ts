import { NextResponse } from "next/server";
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
