import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const productCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: null },
    parentId: { type: Schema.Types.ObjectId, ref: "ProductCategory", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, collection: "product_categories" },
);

productCategorySchema.index({ parentId: 1 });

export type ProductCategoryDoc = InferSchemaType<typeof productCategorySchema>;

export const ProductCategory: Model<ProductCategoryDoc> =
  models.ProductCategory ?? model<ProductCategoryDoc>("ProductCategory", productCategorySchema);
