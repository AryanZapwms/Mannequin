import crypto from "crypto";
import {
  EmailVerification,
  VERIFIED_GRACE_MINUTES,
} from "@/lib/db/models/EmailVerification";

export function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/** Six digits, uniformly random — 000000 through 999999 are all reachable */
export function generateCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * True when this address completed verification recently and hasn't already
 * been spent on an account. Call this before creating a user at checkout.
 */
export async function hasFreshVerification(email: string): Promise<boolean> {
  const record = await EmailVerification.findOne({ email: email.toLowerCase().trim() });
  if (!record?.verifiedAt || record.consumedAt) return false;

  const age = Date.now() - record.verifiedAt.getTime();
  return age <= VERIFIED_GRACE_MINUTES * 60 * 1000;
}

/** Marks the verification as spent so the same code can't seed a second account */
export async function consumeVerification(email: string): Promise<void> {
  await EmailVerification.updateOne(
    { email: email.toLowerCase().trim() },
    { consumedAt: new Date() },
  );
}
