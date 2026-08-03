import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/** How long a code stays valid once sent */
export const VERIFICATION_TTL_MINUTES = 10;
/** Wrong guesses allowed before the code is burned */
export const MAX_VERIFICATION_ATTEMPTS = 5;
/** A confirmed email may be used to register for this long afterwards */
export const VERIFIED_GRACE_MINUTES = 30;
/** Minimum gap between sends to the same address */
export const RESEND_COOLDOWN_SECONDS = 60;

const emailVerificationSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    /** SHA-256 of the 6-digit code — never store the code itself */
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, required: true, default: 0 },
    lastSentAt: { type: Date, required: true, default: Date.now },
    /** Set once the customer enters the right code */
    verifiedAt: { type: Date, default: null },
    /** Set when the verification is spent on an account, so it can't be reused */
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "email_verifications" },
);

// TTL sweep — documents disappear an hour after the code expires, which is well
// past the grace window a verified record is useful for.
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 60 * 60 });

export type EmailVerificationDoc = InferSchemaType<typeof emailVerificationSchema>;

export const EmailVerification: Model<EmailVerificationDoc> =
  models.EmailVerification ??
  model<EmailVerificationDoc>("EmailVerification", emailVerificationSchema);
