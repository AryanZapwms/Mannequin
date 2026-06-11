import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const passwordResetTokenSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
  },
  { collection: "password_reset_tokens" },
);

// TTL index — MongoDB automatically deletes the document once `expiresAt` passes
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type PasswordResetTokenDoc = InferSchemaType<typeof passwordResetTokenSchema>;

export const PasswordResetToken: Model<PasswordResetTokenDoc> =
  models.PasswordResetToken ??
  model<PasswordResetTokenDoc>("PasswordResetToken", passwordResetTokenSchema);
