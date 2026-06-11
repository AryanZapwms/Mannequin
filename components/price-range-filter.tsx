"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

const MIN = 0;
const MAX = 10000;
const STEP = 100;

const PRESETS = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹2K", min: 500, max: 2000 },
  { label: "₹2K – ₹5K", min: 2000, max: 5000 },
  { label: "₹5K+", min: 5000, max: 10000 },
];

export function PriceRangeFilter({
  initialMin,
  initialMax,
}: {
  initialMin?: number;
  initialMax?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [minVal, setMinVal] = useState(initialMin ?? MIN);
  const [maxVal, setMaxVal] = useState(initialMax ?? MAX);

  const leftPercent = ((minVal - MIN) / (MAX - MIN)) * 100;
  const rightPercent = ((maxVal - MIN) / (MAX - MIN)) * 100;

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.min(Number(e.target.value), maxVal - STEP);
      setMinVal(val);
    },
    [maxVal],
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(Number(e.target.value), minVal + STEP);
      setMaxVal(val);
    },
    [minVal],
  );

  const applyPreset = useCallback((min: number, max: number) => {
    setMinVal(min);
    setMaxVal(max);
  }, []);

  const applyFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (minVal > MIN) {
      params.set("minPrice", String(minVal));
    } else {
      params.delete("minPrice");
    }
    if (maxVal < MAX) {
      params.set("maxPrice", String(maxVal));
    } else {
      params.delete("maxPrice");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }, [minVal, maxVal, searchParams, pathname, router]);

  const fmt = (v: number) =>
    v >= 1000 ? `₹${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K` : `₹${v}`;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
          <SlidersHorizontal className="h-3.5 w-3.5 text-white" />
        </div>
        <h3 className="text-sm font-semibold tracking-wide text-gray-900">
          Price Range
        </h3>
      </div>

      {/* Live value labels */}
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800 tabular-nums">
          {fmt(minVal)}
        </span>
        <span className="mx-2 text-[10px] text-gray-300">—</span>
        <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800 tabular-nums">
          {fmt(maxVal)}
        </span>
      </div>

      {/* Slider track */}
      <div className="relative mb-5 h-10 w-full">
        {/* Background track */}
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gray-200" />

        {/* Active / filled range */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gray-900 transition-all duration-75"
          style={{
            left: `${leftPercent}%`,
            right: `${100 - rightPercent}%`,
          }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={minVal}
          onChange={handleMinChange}
          className="range-thumb top-1/2"
          aria-label="Minimum price"
        />

        {/* Max thumb */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={maxVal}
          onChange={handleMaxChange}
          className="range-thumb top-1/2"
          style={{ zIndex: maxVal <= MIN + STEP ? 5 : 3 }}
          aria-label="Maximum price"
        />
      </div>

      {/* Presets */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => {
          const isActive = minVal === p.min && maxVal === p.max;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.min, p.max)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                isActive
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Apply button */}
      <button
        type="button"
        onClick={applyFilter}
        className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-black"
      >
        Apply Filter
      </button>
    </div>
  );
}
