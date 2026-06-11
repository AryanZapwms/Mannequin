import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

export const USER_ROLES = ["customer", "staff", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Hashed with bcrypt — null for accounts created via OAuth (not used yet, but
    // kept nullable so the schema doesn't have to change if a provider is added later)
    passwordHash: { type: String, default: null },
    displayName: { type: String, default: null },
    role: { type: String, enum: USER_ROLES, default: "customer", required: true },
    phone: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    emailVerified: { type: Date, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "users" },
);

userSchema.index({ role: 1 });

export type UserDoc = InferSchemaType<typeof userSchema>;

export const User: Model<UserDoc> = models.User ?? model<UserDoc>("User", userSchema);
