"use server";

import { revalidatePath } from "next/cache";
import { isValidObjectId } from "mongoose";
import { requireStaff } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { Coupon, COUPON_TYPES, type CouponType } from "@/lib/db/models/Coupon";

export type CouponFormState = { error?: string; success?: string } | null;

function parseForm(formData: FormData) {
  const code = ((formData.get("code") as string | null) ?? "").trim().toUpperCase();
  const description = ((formData.get("description") as string | null) ?? "").trim();
  const typeInput = (formData.get("type") as string | null) ?? "percent";
  const valueInput = Number(formData.get("value"));
  const expiresAtInput = ((formData.get("expiresAt") as string | null) ?? "").trim();
  const usageLimitInput = ((formData.get("usageLimit") as string | null) ?? "").trim();
  const isActive = formData.get("isActive") === "on";
  // Checkbox group — one entry per selected product
  const productIds = formData
    .getAll("productIds")
    .map((id) => String(id))
    .filter((id) => isValidObjectId(id));

  if (!code) {
    throw new Error("Coupon code is required");
  }
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    throw new Error("Code must be 3–32 characters: letters, numbers, hyphen or underscore");
  }
  if (!(COUPON_TYPES as readonly string[]).includes(typeInput)) {
    throw new Error("Invalid discount type");
  }
  const type = typeInput as CouponType;

  if (!Number.isFinite(valueInput) || valueInput <= 0) {
    throw new Error("Discount value must be greater than zero");
  }
  if (type === "percent" && valueInput > 100) {
    throw new Error("A percentage discount cannot exceed 100");
  }

  let expiresAt: Date | null = null;
  if (expiresAtInput) {
    const parsed = new Date(expiresAtInput);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Invalid expiry date");
    }
    expiresAt = parsed;
  }

  let usageLimit: number | null = null;
  if (usageLimitInput) {
    const parsed = Number(usageLimitInput);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new Error("Usage limit must be a whole number of 1 or more");
    }
    usageLimit = parsed;
  }

  return {
    code,
    description: description || null,
    type,
    value: valueInput,
    expiresAt,
    usageLimit,
    isActive,
    productIds,
  };
}

export async function createCoupon(
  _prev: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  try {
    const user = await requireStaff();
    const data = parseForm(formData);

    await dbConnect();

    const existing = await Coupon.findOne({ code: data.code });
    if (existing) {
      return { error: `Coupon code ${data.code} already exists` };
    }

    await Coupon.create({ ...data, createdBy: user.id });

    revalidatePath("/admin/coupons");
    return { success: `Coupon ${data.code} created` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create coupon" };
  }
}

export async function updateCoupon(
  _prev: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  try {
    const couponId = formData.get("couponId");
    if (typeof couponId !== "string") {
      return { error: "Coupon id is required" };
    }

    await requireStaff();
    const data = parseForm(formData);

    await dbConnect();

    // Another coupon must not already hold this code
    const clash = await Coupon.findOne({ code: data.code, _id: { $ne: couponId } });
    if (clash) {
      return { error: `Coupon code ${data.code} already exists` };
    }

    await Coupon.findByIdAndUpdate(couponId, data);

    revalidatePath("/admin/coupons");
    return { success: "Changes saved" };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update coupon" };
  }
}

export async function toggleCoupon(formData: FormData) {
  const couponId = formData.get("couponId");
  if (typeof couponId !== "string") {
    throw new Error("Coupon id is required");
  }

  await requireStaff();

  await dbConnect();
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new Error("Coupon not found");
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(formData: FormData) {
  const couponId = formData.get("couponId");
  if (typeof couponId !== "string") {
    throw new Error("Coupon id is required");
  }

  await requireStaff();

  await dbConnect();
  await Coupon.findByIdAndDelete(couponId);

  revalidatePath("/admin/coupons");
}
