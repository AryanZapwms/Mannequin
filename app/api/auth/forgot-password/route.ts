import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { PasswordResetToken } from "@/lib/db/models/PasswordResetToken";
import { sendEmail } from "@/lib/services/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    // Always respond with success to avoid leaking whether an email is registered
    const genericResponse = NextResponse.json({
      message: "If an account exists for that email, a reset link has been sent.",
    });

    if (!email) {
      return genericResponse;
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (user) {
      const rawToken = randomBytes(32).toString("hex");
      await PasswordResetToken.create({
        tokenHash: hashToken(rawToken),
        userId: user._id,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      });

      const baseUrl = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const resetUrl = `${baseUrl}/auth/reset-password/${rawToken}`;

      await sendEmail({
        to: user.email,
        subject: "Reset your Mannequin Care password",
        html: `
          <p>Hi ${user.displayName ?? ""},</p>
          <p>We received a request to reset your password. This link expires in 1 hour:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
      }).catch((e) => console.error("Password reset email error:", e));
    }

    return genericResponse;
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
