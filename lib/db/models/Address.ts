import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

export const ADDRESS_TYPES = ["billing", "shipping"] as const;
export type AddressType = (typeof ADDRESS_TYPES)[number];

const addressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ADDRESS_TYPES, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "India" },
    isDefault: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, collection: "addresses" },
);

addressSchema.index({ userId: 1 });
addressSchema.index({ userId: 1, type: 1 });
// Mirrors the Postgres partial unique index: only one default address per user+type
addressSchema.index(
  { userId: 1, type: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } },
);

export type AddressDoc = InferSchemaType<typeof addressSchema>;

export const Address: Model<AddressDoc> =
  models.Address ?? model<AddressDoc>("Address", addressSchema);
