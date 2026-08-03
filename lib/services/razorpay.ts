import crypto from "crypto";
import Razorpay from "razorpay";

/**
 * Server-only Razorpay helpers. This module deliberately does NOT carry the
 * "use server" directive — that would publish every export as a server action
 * the browser could invoke, including payment capture.
 */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export interface RazorpayOrderOptions {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  notes: Record<string, any>;
  created_at: number;
}

export async function createRazorpayOrder(options: RazorpayOrderOptions): Promise<RazorpayOrder> {
  const order = await razorpay.orders.create({
    amount: Math.round(options.amount * 100),
    currency: options.currency || "INR",
    receipt: options.receipt,
    notes: options.notes,
  });

  return order as unknown as RazorpayOrder;
}

/** Constant-time compare so signature checks don't leak timing information */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies the `razorpay_signature` returned by Razorpay Checkout.
 * Must be called on the server — a browser-side result proves nothing.
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error("RAZORPAY_KEY_SECRET is not configured");
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return safeEqual(expected, signature);
}

/** Verifies the `x-razorpay-signature` header on an incoming webhook */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
    return false;
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

export async function fetchPayment(paymentId: string): Promise<any> {
  return razorpay.payments.fetch(paymentId);
}

export async function fetchRazorpayOrder(orderId: string): Promise<any> {
  return razorpay.orders.fetch(orderId);
}

export async function capturePayment(paymentId: string, amount: number): Promise<any> {
  return razorpay.payments.capture(paymentId, Math.round(amount * 100), "INR");
}
