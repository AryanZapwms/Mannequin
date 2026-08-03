import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { SiteSetting } from "@/lib/db/models/SiteSetting";
import { Coupon, isCouponRedeemable } from "@/lib/db/models/Coupon";

export const TAX_RATE = 0.05;
export const FREE_SHIPPING_THRESHOLD = 500;
export const FLAT_SHIPPING = 60;

/** Raw cart payload as posted by the browser — only ids and quantities are trusted */
export interface CartLineInput {
  product_id?: string;
  quantity?: number;
}

export interface PricedLine {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface PriceBreakdown {
  lines: PricedLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  coupon_code: string | null;
}

export class PricingError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "PricingError";
    this.status = status;
  }
}

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Money comparison tolerant of float noise — anything under half a paisa is equal */
export function amountsMatch(a: number, b: number) {
  return Math.abs(a - b) < 0.005;
}

/**
 * Resolves a code against the cart. A coupon scoped to specific products only
 * discounts those line items — everything else in the cart is untouched.
 */
export async function resolveCouponDiscount(
  couponCode: string | null | undefined,
  lines: PricedLine[],
  subtotal: number,
): Promise<{ discount: number; code: string | null; eligibleSubtotal: number }> {
  const code = couponCode?.toUpperCase().trim();
  if (!code) return { discount: 0, code: null, eligibleSubtotal: subtotal };

  const coupon = await Coupon.findOne({ code });

  // Legacy codes were stored as SiteSetting rows keyed COUPON_<CODE>. They stay
  // valid (cart-wide, no expiry) until they're recreated in the admin.
  if (!coupon) {
    const setting = await SiteSetting.findOne({ key: `COUPON_${code}` });
    if (!setting) {
      throw new PricingError("Invalid or expired coupon code");
    }

    const legacy = setting.value as { type?: string; value?: number } | null;
    const legacyValue = Number(legacy?.value ?? 0);
    if (!Number.isFinite(legacyValue) || legacyValue <= 0) {
      throw new PricingError("Invalid or expired coupon code");
    }

    const legacyDiscount =
      legacy?.type === "percent"
        ? round2(subtotal * (legacyValue / 100))
        : Math.min(legacyValue, subtotal);

    return {
      discount: Math.min(round2(legacyDiscount), subtotal),
      code,
      eligibleSubtotal: subtotal,
    };
  }

  if (!isCouponRedeemable(coupon)) {
    throw new PricingError("This coupon code has expired or is no longer available");
  }

  const scoped = (coupon.productIds ?? []).map((id) => id.toString());
  const eligibleLines =
    scoped.length === 0 ? lines : lines.filter((line) => scoped.includes(line.product_id));

  if (eligibleLines.length === 0) {
    throw new PricingError("This coupon doesn't apply to any item in your cart");
  }

  const eligibleSubtotal = round2(
    eligibleLines.reduce((sum, line) => sum + line.line_total, 0),
  );

  const value = Number(coupon.value);
  if (!Number.isFinite(value) || value <= 0) {
    throw new PricingError("Invalid or expired coupon code");
  }

  const discount =
    coupon.type === "percent"
      ? round2(eligibleSubtotal * (value / 100))
      : Math.min(value, eligibleSubtotal);

  return {
    discount: Math.min(round2(discount), eligibleSubtotal),
    code,
    eligibleSubtotal,
  };
}

/**
 * Recomputes the whole cart from the database. Prices, names, availability,
 * discounts, shipping and tax all come from server state — the only thing taken
 * from the client is which product and how many. This is the single source of
 * truth for both the Razorpay order amount and the persisted order.
 */
export async function priceCart(
  cartItems: CartLineInput[],
  couponCode?: string | null,
): Promise<PriceBreakdown> {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new PricingError("Cart is empty");
  }

  // Collapse duplicate lines so the same product can't be priced twice
  const quantities = new Map<string, number>();
  for (const item of cartItems) {
    const productId = item?.product_id;
    const quantity = Number(item?.quantity);

    if (typeof productId !== "string" || !isValidObjectId(productId)) {
      throw new PricingError("Cart contains an item without a valid product");
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new PricingError("Cart contains an invalid quantity");
    }

    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
  }

  await dbConnect();
  const productIds = [...quantities.keys()];
  const products = await Product.find({ _id: { $in: productIds } }).select(
    "name price stock status",
  );

  if (products.length !== productIds.length) {
    throw new PricingError("A product in your cart is no longer available");
  }

  const lines: PricedLine[] = products.map((product) => {
    if (product.status !== "active") {
      throw new PricingError(`${product.name} is no longer available`);
    }

    const quantity = quantities.get(product._id.toString())!;
    if (product.stock < quantity) {
      throw new PricingError(`${product.name} is out of stock`, 409);
    }

    const unitPrice = round2(Number(product.price));
    return {
      product_id: product._id.toString(),
      name: product.name,
      quantity,
      unit_price: unitPrice,
      line_total: round2(unitPrice * quantity),
    };
  });

  const subtotal = round2(lines.reduce((sum, line) => sum + line.line_total, 0));
  const { discount, code } = await resolveCouponDiscount(couponCode, lines, subtotal);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const tax = round2((subtotal - discount) * TAX_RATE);
  const total = round2(subtotal - discount + shipping + tax);

  return { lines, subtotal, discount, shipping, tax, total, coupon_code: code };
}
