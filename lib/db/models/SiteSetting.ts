import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const siteSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String, default: null },
  },
  { timestamps: { createdAt: false, updatedAt: true }, collection: "site_settings" },
);

export type SiteSettingDoc = InferSchemaType<typeof siteSettingSchema>;

export const SiteSetting: Model<SiteSettingDoc> =
  models.SiteSetting ?? model<SiteSettingDoc>("SiteSetting", siteSettingSchema);
