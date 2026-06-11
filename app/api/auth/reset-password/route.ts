import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { PasswordResetToken } from "@/lib/db/models/PasswordResetToken";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!token) {
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await dbConnect();

    const tokenDoc = await PasswordResetToken.findOne({ tokenHash: hashToken(token) });
    if (!tokenDoc || tokenDoc.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(tokenDoc.userId, { passwordHash });
    await PasswordResetToken.deleteOne({ _id: tokenDoc._id });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
