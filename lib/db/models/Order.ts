import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

export const ORDER_STATUSES = ["pending", "processing", "completed", "cancelled", "refunded"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["pending", "authorized", "paid", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
    productSnapshot: { type: Schema.Types.Mixed, default: null },
  },
  { _id: true },
);

// Embedded — mirrors billing_address/shipping_address jsonb columns
const addressSnapshotSchema = new Schema(
  {
    full_name: String,
    phone: String,
    street_address: String,
    city: String,
    state: String,
    postal_code: String,
    country: String,
    email: String,
  },
  { _id: false, strict: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: ORDER_STATUSES, default: "pending", required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "pending", required: true },
    subtotal: { type: Number, required: true, default: 0 },
    discountTotal: { type: Number, required: true, default: 0 },
    taxTotal: { type: Number, required: true, default: 0 },
    shippingTotal: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "INR" },
    paymentProvider: { type: String, default: null },
    billingAddress: { type: addressSnapshotSchema, default: null },
    shippingAddress: { type: addressSnapshotSchema, default: null },
    notes: { type: String, default: null },
    items: { type: [orderItemSchema], default: [] },
    placedAt: { type: Date, default: Date.now },
    /** Razorpay order id (`order_...`) — the handle the webhook reconciles against */
    razorpayOrderId: { type: String, default: null },
    /** Razorpay payment id (`pay_...`) — needed for refunds and reconciliation */
    razorpayPaymentId: { type: String, default: null },
    /** Client-supplied key that makes order creation safe to retry */
    idempotencyKey: { type: String, default: null },
    /** Lets a guest open their own confirmation page without an account */
    guestToken: { type: String, default: null },
    guestEmail: { type: String, default: null },
  },
  { timestamps: { createdAt: false, updatedAt: true }, collection: "orders" },
);

orderSchema.index({ userId: 1 });
orderSchema.index({ placedAt: -1 });
// Partial + unique: at most one order per key/payment, but many orders may have none.
orderSchema.index(
  { idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } },
);
orderSchema.index(
  { razorpayPaymentId: 1 },
  { unique: true, partialFilterExpression: { razorpayPaymentId: { $type: "string" } } },
);
orderSchema.index({ razorpayOrderId: 1 });

export type OrderDoc = InferSchemaType<typeof orderSchema>;

export const Order: Model<OrderDoc> = models.Order ?? model<OrderDoc>("Order", orderSchema);
