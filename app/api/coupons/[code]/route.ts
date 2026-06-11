import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connect";
import { SiteSetting } from "@/lib/db/models/SiteSetting";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  await dbConnect();

  const setting = await SiteSetting.findOne({ key: `COUPON_${code.toUpperCase().trim()}` });
  if (!setting) {
    return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 404 });
  }

  return NextResponse.json({ coupon: setting.value });
}
