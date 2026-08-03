import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/lib/db/connect";
import {
  EmailVerification,
  MAX_VERIFICATION_ATTEMPTS,
} from "@/lib/db/models/EmailVerification";
import { hashCode, isValidEmail } from "@/lib/services/email-verification";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Enter the 6-digit code" }, { status: 400 });
    }

    await dbConnect();

    const record = await EmailVerification.findOne({ email });
    if (!record) {
      return NextResponse.json(
        { error: "Request a code before verifying" },
        { status: 400 },
      );
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "That code has expired. Request a new one." },
        { status: 410 },
      );
    }

    if (record.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many incorrect attempts. Request a new code." },
        { status: 429 },
      );
    }

    if (!safeEqual(record.codeHash, hashCode(code))) {
      record.attempts += 1;
      await record.save();

      const left = MAX_VERIFICATION_ATTEMPTS - record.attempts;
      return NextResponse.json(
        {
          error:
            left > 0
              ? `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.`
              : "Too many incorrect attempts. Request a new code.",
        },
        { status: 400 },
      );
    }

    record.verifiedAt = new Date();
    record.consumedAt = null;
    await record.save();

    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error("Verification confirm error:", err);
    return NextResponse.json({ error: "Could not verify the code" }, { status: 500 });
  }
}
