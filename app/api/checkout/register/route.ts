import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import {
  consumeVerification,
  hasFreshVerification,
  isValidEmail,
} from "@/lib/services/email-verification";

/**
 * Creates the account for a customer checking out without one.
 *
 * Unlike /api/auth/register this refuses to run unless the address has just
 * passed email verification, so checkout can only mint accounts that belong to
 * a mailbox someone actually controls.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    await dbConnect();

    if (!(await hasFreshVerification(email))) {
      return NextResponse.json(
        { error: "Please verify your email address before placing the order", needsVerification: true },
        { status: 403 },
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      passwordHash,
      displayName: displayName || email,
      phone: phone || null,
      role: "customer",
      emailVerified: new Date(),
    });

    // Burn the verification so it can't seed a second account
    await consumeVerification(email);

    return NextResponse.json({ id: user._id.toString(), email: user.email });
  } catch (err) {
    console.error("Checkout registration error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
