import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

const productReviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: null },
    body: { type: String, default: null },
    status: { type: String, enum: REVIEW_STATUSES, default: "pending", required: true },
    adminResponse: { type: String, default: null },
  },
  { timestamps: true, collection: "product_reviews" },
);

productReviewSchema.index({ productId: 1 });
productReviewSchema.index({ userId: 1 });

export type ProductReviewDoc = InferSchemaType<typeof productReviewSchema>;

export const ProductReview: Model<ProductReviewDoc> =
  models.ProductReview ?? model<ProductReviewDoc>("ProductReview", productReviewSchema);
