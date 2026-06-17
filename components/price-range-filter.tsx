"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

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

  // NEW
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5c400]">
            <SlidersHorizontal className="h-3.5 w-3.5 text-white" />
          </div>

          <h3 className="text-sm font-semibold tracking-wide text-gray-900 md:text-base">
            Price Range
          </h3>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen
            ? "mt-4 max-h-[600px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        {/* Live values */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-800 tabular-nums sm:px-2.5 sm:text-xs">
            {fmt(minVal)}
          </span>

          <span className="flex-1 text-center text-[10px] text-gray-300">
            —
          </span>

          <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-800 tabular-nums sm:px-2.5 sm:text-xs">
            {fmt(maxVal)}
          </span>
        </div>

        {/* Slider */}
        <div className="relative mb-5 h-10 w-full md:mb-6">
          <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gray-200" />

          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#f5c400] transition-all duration-75"
            style={{
              left: `${leftPercent}%`,
              right: `${100 - rightPercent}%`,
            }}
          />

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
        <div className="mb-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const isActive =
              minVal === p.min && maxVal === p.max;

            return (
              <button
                key={p.label}
                type="button"
                onClick={() =>
                  applyPreset(p.min, p.max)
                }
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all sm:text-xs ${
                  isActive
                    ? "bg-[#f5c400] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Apply Button */}
        <button
          type="button"
          onClick={applyFilter}
          className="w-full rounded-xl bg-[#f5c400] px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#f5c400]/90 focus:outline-none focus:ring-2 focus:ring-[#f5c400]/90 focus:ring-offset-2 md:py-2.5"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
}