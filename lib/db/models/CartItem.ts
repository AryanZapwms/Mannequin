import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const cartItemSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "cart_items" },
);

cartItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

export type CartItemDoc = InferSchemaType<typeof cartItemSchema>;

export const CartItem: Model<CartItemDoc> =
  models.CartItem ?? model<CartItemDoc>("CartItem", cartItemSchema);
