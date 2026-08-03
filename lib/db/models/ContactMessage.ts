import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

export const CONTACT_MESSAGE_STATUSES = ["new", "read", "resolved", "spam"] as const;
export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, default: "Contact Form Inquiry", trim: true },
    message: { type: String, required: true },
    status: { type: String, enum: CONTACT_MESSAGE_STATUSES, default: "new", required: true },
    adminNotes: { type: String, default: null },
    /** Set when the sender was signed in; null for guests */
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    /** False when the notification/auto-reply emails failed to send */
    emailDelivered: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "contact_messages" },
);

contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1 });

export type ContactMessageDoc = InferSchemaType<typeof contactMessageSchema>;

export const ContactMessage: Model<ContactMessageDoc> =
  models.ContactMessage ?? model<ContactMessageDoc>("ContactMessage", contactMessageSchema);
