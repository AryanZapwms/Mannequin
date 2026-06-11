import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const wishlistItemSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "wishlist_items" },
);

// Mirrors the Postgres `unique (user_id, product_id)` constraint —
// duplicate inserts raise a Mongo E11000 error (code 11000), the equivalent of
// Supabase's `error.code === "23505"`.
wishlistItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

export type WishlistItemDoc = InferSchemaType<typeof wishlistItemSchema>;

export const WishlistItem: Model<WishlistItemDoc> =
  models.WishlistItem ?? model<WishlistItemDoc>("WishlistItem", wishlistItemSchema);
