import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import {
  EmailVerification,
  VERIFICATION_TTL_MINUTES,
  RESEND_COOLDOWN_SECONDS,
} from "@/lib/db/models/EmailVerification";
import { sendEmail } from "@/lib/services/email";
import { generateCode, hashCode, isValidEmail } from "@/lib/services/email-verification";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    await dbConnect();

    // Nothing to verify if they already have an account — send them to sign in
    const existingUser = await User.findOne({ email }).select("_id");
    if (existingUser) {
      return NextResponse.json(
        { error: "You already have an account with this email. Please sign in.", accountExists: true },
        { status: 409 },
      );
    }

    const existing = await EmailVerification.findOne({ email });

    if (existing) {
      const sinceLastSend = Date.now() - existing.lastSentAt.getTime();
      const cooldown = RESEND_COOLDOWN_SECONDS * 1000;
      if (sinceLastSend < cooldown) {
        const retryAfter = Math.ceil((cooldown - sinceLastSend) / 1000);
        return NextResponse.json(
          { error: `Please wait ${retryAfter}s before requesting another code`, retryAfter },
          { status: 429 },
        );
      }
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MINUTES * 60 * 1000);

    // Re-sending resets attempts and clears any earlier verified state
    await EmailVerification.findOneAndUpdate(
      { email },
      {
        email,
        codeHash: hashCode(code),
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(),
        verifiedAt: null,
        consumedAt: null,
      },
      { upsert: true, new: true },
    );

    await sendEmail({
      to: email,
      subject: `${code} is your Mannequin Care verification code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDF6EC; padding: 24px;">
          <div style="background: #3D2B1F; color: #fff; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">Mannequin Care</h1>
          </div>
          <div style="background: #fff; padding: 32px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="margin: 0 0 8px; color: #5C4033;">Your verification code is</p>
            <p style="margin: 0 0 20px; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3D2B1F;">${code}</p>
            <p style="margin: 0; color: #8B6914; font-size: 14px;">
              This code expires in ${VERIFICATION_TTL_MINUTES} minutes. If you didn't request it, you can ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ sent: true, expiresInMinutes: VERIFICATION_TTL_MINUTES });
  } catch (err) {
    console.error("Verification send error:", err);
    return NextResponse.json({ error: "Could not send the code. Please try again." }, { status: 500 });
  }
}
