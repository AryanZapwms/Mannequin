import { Schema, model, models, type ClientSession, type Model, type HydratedDocument, type InferSchemaType } from "mongoose";

export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

const productMediaSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: null },
    altText: { type: String, default: null },
    sortOrder: { type: Number, required: true, default: 0 },
  },
  { _id: true },
);

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: null },
    sku: { type: String, default: null },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, default: null },
    stock: { type: Number, required: true, default: 0 },
    mainCategoryId: { type: Schema.Types.ObjectId, ref: "ProductCategory", default: null },
    subCategoryId: { type: Schema.Types.ObjectId, ref: "ProductCategory", default: null },
    status: { type: String, enum: PRODUCT_STATUSES, default: "draft", required: true },
    isFeatured: { type: Boolean, required: true, default: false },
    thumbnailUrl: { type: String, default: null },
    thumbnailPublicId: { type: String, default: null },
    media: { type: [productMediaSchema], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, collection: "products" },
);

productSchema.index({ mainCategoryId: 1 });
productSchema.index({ subCategoryId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ name: "text", slug: "text" });

export interface ProductModel extends Model<ProductDoc> {
  /** Atomically decrements stock, clamped at 0 — replaces the `decrement_stock` RPC */
  decrementStock(
    productId: string,
    quantity: number,
    session?: ClientSession,
  ): Promise<HydratedDocument<ProductDoc> | null>;
}

productSchema.static(
  "decrementStock",
  async function decrementStock(productId: string, quantity: number, session?: ClientSession) {
    return this.findByIdAndUpdate(
      productId,
      [{ $set: { stock: { $max: [0, { $subtract: ["$stock", quantity] }] } } }],
      { new: true, session },
    );
  },
);

export type ProductDoc = InferSchemaType<typeof productSchema>;

export const Product = (models.Product ??
  model<ProductDoc, ProductModel>("Product", productSchema)) as ProductModel;
