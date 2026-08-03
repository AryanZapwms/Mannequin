"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, Tag } from "lucide-react";
import type { CouponFormState } from "@/app/(admin)/admin/coupons/actions";

export interface CouponProductOption {
  id: string;
  name: string;
}

export interface CouponFormValues {
  id?: string;
  code: string;
  description: string;
  type: "percent" | "fixed";
  value: number;
  /** yyyy-MM-dd, or "" for never expires */
  expiresAt: string;
  usageLimit: string;
  isActive: boolean;
  productIds: string[];
}

const EMPTY: CouponFormValues = {
  code: "",
  description: "",
  type: "percent",
  value: 10,
  expiresAt: "",
  usageLimit: "",
  isActive: true,
  productIds: [],
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function CouponForm({
  products,
  action,
  initial,
  submitLabel = "Create coupon",
}: {
  products: CouponProductOption[];
  action: (prev: CouponFormState, formData: FormData) => Promise<CouponFormState>;
  initial?: CouponFormValues;
  submitLabel?: string;
}) {
  const values = initial ?? EMPTY;
  const [state, formAction] = useActionState(action, null);

  const [type, setType] = useState<"percent" | "fixed">(values.type);
  const [selected, setSelected] = useState<string[]>(values.productIds);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => product.name.toLowerCase().includes(term));
  }, [products, search]);

  const toggleProduct = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id],
    );
  };

  return (
    <form action={formAction} className="space-y-5">
      {values.id ? <input type="hidden" name="couponId" value={values.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`code-${values.id ?? "new"}`}>Coupon code</Label>
          <Input
            id={`code-${values.id ?? "new"}`}
            name="code"
            defaultValue={values.code}
            placeholder="MONSOON20"
            required
            className="uppercase"
          />
          <p className="text-xs text-muted-foreground">
            Letters, numbers, hyphen or underscore. Shown to customers exactly as typed.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`description-${values.id ?? "new"}`}>Description (internal)</Label>
          <Input
            id={`description-${values.id ?? "new"}`}
            name="description"
            defaultValue={values.description}
            placeholder="Monsoon sale — mannequins only"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor={`type-${values.id ?? "new"}`}>Discount type</Label>
          <select
            id={`type-${values.id ?? "new"}`}
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "percent" | "fixed")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="percent">Percentage off</option>
            <option value="fixed">Flat amount off</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`value-${values.id ?? "new"}`}>
            {type === "percent" ? "Percent (%)" : "Amount (₹)"}
          </Label>
          <Input
            id={`value-${values.id ?? "new"}`}
            name="value"
            type="number"
            min={1}
            max={type === "percent" ? 100 : undefined}
            step="0.01"
            defaultValue={values.value}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`expiresAt-${values.id ?? "new"}`}>Expires on</Label>
          <Input
            id={`expiresAt-${values.id ?? "new"}`}
            name="expiresAt"
            type="date"
            defaultValue={values.expiresAt}
          />
          <p className="text-xs text-muted-foreground">Leave blank for no expiry.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`usageLimit-${values.id ?? "new"}`}>Usage limit</Label>
          <Input
            id={`usageLimit-${values.id ?? "new"}`}
            name="usageLimit"
            type="number"
            min={1}
            step="1"
            defaultValue={values.usageLimit}
            placeholder="Unlimited"
          />
        </div>
      </div>

      {/* ── Product scope ─────────────────────────────────────────── */}
      <div className="space-y-3 rounded-xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Applies to
            </p>
            <p className="text-xs text-muted-foreground">
              {selected.length === 0
                ? "Every product — the discount applies to the whole cart."
                : `${selected.length} product${selected.length === 1 ? "" : "s"} — only these items are discounted.`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setSelected((prev) => [
                  ...new Set([...prev, ...filtered.map((product) => product.id)]),
                ])
              }
              className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-100"
            >
              Select {search ? "filtered" : "all"}
            </button>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-100"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>

        <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border bg-background p-2">
          {filtered.length === 0 ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">No products match that search.</p>
          ) : (
            filtered.map((product) => (
              <label
                key={product.id}
                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  name="productIds"
                  value={product.id}
                  checked={selected.includes(product.id)}
                  onChange={() => toggleProduct(product.id)}
                  className="h-4 w-4 rounded border-input"
                />
                <span className="truncate">{product.name}</span>
              </label>
            ))
          )}
        </div>

        {/* Selections hidden by the search filter still need to post */}
        {selected
          .filter((id) => !filtered.some((product) => product.id === id))
          .map((id) => (
            <input key={id} type="hidden" name="productIds" value={id} />
          ))}
      </div>

      <label className="flex items-center gap-3 text-sm font-medium">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={values.isActive}
          className="h-4 w-4 rounded border-input"
        />
        Active — customers can redeem this code
      </label>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{state.success}</p>
      )}

      <SubmitButton label={submitLabel} />
    </form>
  );
}
