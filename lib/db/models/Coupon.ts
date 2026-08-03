import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

export const COUPON_TYPES = ["percent", "fixed"] as const;
export type CouponType = (typeof COUPON_TYPES)[number];

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: null },
    type: { type: String, enum: COUPON_TYPES, required: true, default: "percent" },
    /** Percentage (1-100) when type is "percent", rupees when type is "fixed" */
    value: { type: Number, required: true, min: 0 },
    /**
     * Products this code applies to. Empty means it discounts the whole cart;
     * otherwise only matching line items count toward the discount.
     */
    productIds: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
    /** Null means the code never expires */
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, required: true, default: true },
    /** Null means unlimited redemptions */
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, required: true, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, collection: "coupons" },
);

couponSchema.index({ isActive: 1, expiresAt: 1 });

export type CouponDoc = InferSchemaType<typeof couponSchema>;

export const Coupon: Model<CouponDoc> =
  models.Coupon ?? model<CouponDoc>("Coupon", couponSchema);

/** True when the code is live right now — active, not expired, not exhausted */
export function isCouponRedeemable(coupon: {
  isActive: boolean;
  expiresAt?: Date | null;
  usageLimit?: number | null;
  usedCount: number;
}): boolean {
  if (!coupon.isActive) return false;
  if (coupon.expiresAt && coupon.expiresAt.getTime() <= Date.now()) return false;
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return false;
  return true;
}
