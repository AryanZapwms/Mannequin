import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

export const BLOG_STATUSES = ["draft", "scheduled", "published"] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

const blogPostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: null },
    content: { type: String, default: null },
    coverImageUrl: { type: String, default: null },
    coverImagePublicId: { type: String, default: null },
    status: { type: String, enum: BLOG_STATUSES, default: "draft", required: true },
    publishedAt: { type: Date, default: null },
    authorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    tags: { type: [String], default: [] },
  },
  { timestamps: true, collection: "blog_posts" },
);

blogPostSchema.index({ status: 1 });

export type BlogPostDoc = InferSchemaType<typeof blogPostSchema>;

export const BlogPost: Model<BlogPostDoc> =
  models.BlogPost ?? model<BlogPostDoc>("BlogPost", blogPostSchema);
