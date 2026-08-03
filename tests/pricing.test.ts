import { describe, expect, it, beforeEach, vi } from "vitest";

/**
 * Unit tests for the server-side cart pricing. These cover the maths that
 * decides what a customer is actually charged, so a regression here is a money
 * bug rather than a cosmetic one.
 *
 * The database layer is mocked; the pricing rules themselves run for real.
 */

const state = vi.hoisted(() => ({
  products: [] as Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
    status: string;
  }>,
  coupon: null as null | {
    code: string;
    type: "percent" | "fixed";
    value: number;
    productIds: string[];
    expiresAt: Date | null;
    isActive: boolean;
    usageLimit: number | null;
    usedCount: number;
  },
  legacySetting: null as null | { value: { type: string; value: number } },
}));

vi.mock("@/lib/db/connect", () => ({
  dbConnect: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/db/models/Product", () => ({
  Product: {
    find: (query: any) => ({
      select: async () => {
        const wanted: string[] = query?._id?.$in ?? [];
        return state.products
          .filter((p) => wanted.includes(p.id))
          .map((p) => ({
            _id: { toString: () => p.id },
            name: p.name,
            price: p.price,
            stock: p.stock,
            status: p.status,
          }));
      },
    }),
  },
}));

vi.mock("@/lib/db/models/SiteSetting", () => ({
  SiteSetting: { findOne: async () => state.legacySetting },
}));

vi.mock("@/lib/db/models/Coupon", async () => {
  // Keep the real redeemability rules — they're pure logic worth testing
  const actual = await vi.importActual<typeof import("@/lib/db/models/Coupon")>(
    "@/lib/db/models/Coupon",
  );
  return {
    ...actual,
    Coupon: {
      findOne: async ({ code }: { code: string }) =>
        state.coupon && state.coupon.code === code
          ? { ...state.coupon, productIds: state.coupon.productIds.map((id) => ({ toString: () => id })) }
          : null,
    },
  };
});

const { priceCart, PricingError, TAX_RATE, FLAT_SHIPPING } = await import(
  "@/lib/services/pricing"
);

// Valid 24-hex ObjectId strings
const MANNEQUIN = "aaaaaaaaaaaaaaaaaaaaaaa1";
const CREAM = "bbbbbbbbbbbbbbbbbbbbbbb2";
const STAND = "ccccccccccccccccccccccc3";

function coupon(overrides: Partial<NonNullable<typeof state.coupon>> = {}) {
  return {
    code: "SAVE",
    type: "percent" as const,
    value: 10,
    productIds: [] as string[],
    expiresAt: null,
    isActive: true,
    usageLimit: null,
    usedCount: 0,
    ...overrides,
  };
}

beforeEach(() => {
  state.products = [
    { id: MANNEQUIN, name: "Full Body Mannequin", price: 1000, stock: 10, status: "active" },
    { id: CREAM, name: "Vitamin E Cream", price: 200, stock: 10, status: "active" },
    { id: STAND, name: "Display Stand", price: 50, stock: 10, status: "active" },
  ];
  state.coupon = null;
  state.legacySetting = null;
});

describe("cart totals", () => {
  it("prices from the database, ignoring anything the client claims", async () => {
    const result = await priceCart([
      { product_id: MANNEQUIN, quantity: 2, price: 1, name: "hacked" } as any,
    ]);

    expect(result.subtotal).toBe(2000);
    expect(result.lines[0].unit_price).toBe(1000);
    expect(result.lines[0].name).toBe("Full Body Mannequin");
  });

  it("gives free shipping at or above the threshold", async () => {
    const result = await priceCart([{ product_id: MANNEQUIN, quantity: 1 }]);
    expect(result.shipping).toBe(0);
  });

  it("charges flat shipping below the threshold", async () => {
    const result = await priceCart([{ product_id: STAND, quantity: 1 }]);
    expect(result.subtotal).toBe(50);
    expect(result.shipping).toBe(FLAT_SHIPPING);
    expect(result.total).toBe(50 + FLAT_SHIPPING + 50 * TAX_RATE);
  });

  it("collapses duplicate lines for the same product", async () => {
    const result = await priceCart([
      { product_id: CREAM, quantity: 2 },
      { product_id: CREAM, quantity: 3 },
    ]);

    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].quantity).toBe(5);
    expect(result.subtotal).toBe(1000);
  });

  it("taxes the discounted amount, not the gross subtotal", async () => {
    state.coupon = coupon({ code: "SAVE", value: 10 });

    const result = await priceCart([{ product_id: MANNEQUIN, quantity: 1 }], "SAVE");

    expect(result.discount).toBe(100);
    expect(result.tax).toBe((1000 - 100) * TAX_RATE);
    expect(result.total).toBe(1000 - 100 + 0 + (1000 - 100) * TAX_RATE);
  });
});

describe("cart validation", () => {
  it("rejects an empty cart", async () => {
    await expect(priceCart([])).rejects.toBeInstanceOf(PricingError);
  });

  it("rejects a malformed product id", async () => {
    await expect(priceCart([{ product_id: "not-an-id", quantity: 1 }])).rejects.toThrow(
      /valid product/i,
    );
  });

  it.each([0, -1, 1.5])("rejects quantity %s", async (quantity) => {
    await expect(priceCart([{ product_id: CREAM, quantity }])).rejects.toThrow(/quantity/i);
  });

  it("rejects a product that no longer exists", async () => {
    state.products = [];
    await expect(priceCart([{ product_id: CREAM, quantity: 1 }])).rejects.toThrow(
      /no longer available/i,
    );
  });

  it("rejects a product that is not active", async () => {
    state.products[1].status = "draft";
    await expect(priceCart([{ product_id: CREAM, quantity: 1 }])).rejects.toThrow(
      /no longer available/i,
    );
  });

  it("rejects insufficient stock with a 409", async () => {
    state.products[1].stock = 2;

    await expect(priceCart([{ product_id: CREAM, quantity: 3 }])).rejects.toMatchObject({
      status: 409,
      message: expect.stringMatching(/out of stock/i),
    });
  });
});

describe("coupons", () => {
  it("applies a percentage across the whole cart when unscoped", async () => {
    state.coupon = coupon({ code: "SAVE10", value: 10 });

    const result = await priceCart(
      [
        { product_id: MANNEQUIN, quantity: 1 },
        { product_id: CREAM, quantity: 1 },
      ],
      "SAVE10",
    );

    expect(result.subtotal).toBe(1200);
    expect(result.discount).toBe(120);
    expect(result.coupon_code).toBe("SAVE10");
  });

  it("only discounts the products a scoped coupon covers", async () => {
    // 20% off mannequins only, in a cart that also holds cream
    state.coupon = coupon({ code: "MANNEQ20", value: 20, productIds: [MANNEQUIN] });

    const result = await priceCart(
      [
        { product_id: MANNEQUIN, quantity: 1 }, // 1000
        { product_id: CREAM, quantity: 1 }, //  200
      ],
      "MANNEQ20",
    );

    expect(result.subtotal).toBe(1200);
    // 20% of 1000, NOT 20% of 1200
    expect(result.discount).toBe(200);
  });

  it("caps a fixed discount at the eligible subtotal, never the whole cart", async () => {
    state.coupon = coupon({ code: "FLAT500", type: "fixed", value: 500, productIds: [STAND] });

    const result = await priceCart(
      [
        { product_id: STAND, quantity: 1 }, // 50
        { product_id: MANNEQUIN, quantity: 1 }, // 1000
      ],
      "FLAT500",
    );

    // Only the ₹50 stand is eligible, so the ₹500 code can take at most ₹50
    expect(result.discount).toBe(50);
    expect(result.total).toBeGreaterThan(0);
  });

  it("rejects a scoped coupon when the cart holds none of its products", async () => {
    state.coupon = coupon({ code: "MANNEQ20", productIds: [MANNEQUIN] });

    await expect(
      priceCart([{ product_id: CREAM, quantity: 1 }], "MANNEQ20"),
    ).rejects.toThrow(/doesn't apply/i);
  });

  it("rejects an expired coupon", async () => {
    state.coupon = coupon({ code: "OLD", expiresAt: new Date(Date.now() - 1000) });

    await expect(priceCart([{ product_id: CREAM, quantity: 1 }], "OLD")).rejects.toThrow(
      /expired|no longer available/i,
    );
  });

  it("accepts a coupon whose expiry is still in the future", async () => {
    state.coupon = coupon({ code: "LIVE", expiresAt: new Date(Date.now() + 60_000) });

    const result = await priceCart([{ product_id: CREAM, quantity: 1 }], "LIVE");
    expect(result.discount).toBe(20);
  });

  it("rejects a paused coupon", async () => {
    state.coupon = coupon({ code: "PAUSED", isActive: false });

    await expect(priceCart([{ product_id: CREAM, quantity: 1 }], "PAUSED")).rejects.toThrow(
      /expired|no longer available/i,
    );
  });

  it("rejects a coupon that has hit its usage limit", async () => {
    state.coupon = coupon({ code: "LIMITED", usageLimit: 5, usedCount: 5 });

    await expect(priceCart([{ product_id: CREAM, quantity: 1 }], "LIMITED")).rejects.toThrow(
      /expired|no longer available/i,
    );
  });

  it("rejects an unknown code", async () => {
    await expect(priceCart([{ product_id: CREAM, quantity: 1 }], "NOPE")).rejects.toThrow(
      /invalid or expired/i,
    );
  });

  it("normalises the code to uppercase before lookup", async () => {
    state.coupon = coupon({ code: "SAVE10", value: 10 });

    const result = await priceCart([{ product_id: CREAM, quantity: 1 }], "  save10 ");
    expect(result.coupon_code).toBe("SAVE10");
    expect(result.discount).toBe(20);
  });

  it("still honours legacy SiteSetting coupons", async () => {
    state.legacySetting = { value: { type: "percent", value: 50 } };

    const result = await priceCart([{ product_id: CREAM, quantity: 1 }], "OLDSCHOOL");
    expect(result.discount).toBe(100);
  });

  it("treats no coupon as no discount", async () => {
    const result = await priceCart([{ product_id: CREAM, quantity: 1 }]);
    expect(result.discount).toBe(0);
    expect(result.coupon_code).toBeNull();
  });
});
