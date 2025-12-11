"use server";

import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
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
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(options.amount * 100),
      currency: options.currency || "INR",
      receipt: options.receipt,
      notes: options.notes,
    });

    return order as RazorpayOrder;
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    throw error;
  }
}

export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string,
): Promise<boolean> {
  try {
    const crypto = require("crypto");
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body)
      .digest("hex");

    return signature === expectedSignature;
  } catch (error) {
    console.error("Razorpay verification error:", error);
    throw error;
  }
}

export async function fetchPayment(paymentId: string): Promise<any> {
  try {
    return await razorpay.payments.fetch(paymentId);
  } catch (error) {
    console.error("Razorpay payment fetch error:", error);
    throw error;
  }
}

export async function capturePayment(paymentId: string, amount: number): Promise<any> {
  try {
    return await razorpay.payments.capture(paymentId, Math.round(amount * 100));
  } catch (error) {
    console.error("Razorpay payment capture error:", error);
    throw error;
  }
}
