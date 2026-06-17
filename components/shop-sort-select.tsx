"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function ShopSortSelect({
  currentSort,
}: {
  currentSort?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (e.target.value) {
      params.set("sort", e.target.value);
    } else {
      params.delete("sort");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative w-full sm:w-auto">
      <select
        defaultValue={currentSort ?? ""}
        onChange={handleChange}
        className="
          h-11
          w-full
          min-w-[180px]
          appearance-none
          rounded-xl
          border
          border-gray-200
          bg-white
          pl-4
          pr-10
          text-sm
          font-medium
          text-gray-700
          shadow-sm
          transition-all
          duration-200
          cursor-pointer
          hover:border-[#f5c400]
          focus:border-[#f5c400]
          focus:outline-none
          focus:ring-2
          focus:ring-[#f5c400]/20
        "
      >
        <option value="">Default Sorting</option>
        <option value="price_asc">
          Price: Low to High
        </option>
        <option value="price_desc">
          Price: High to Low
        </option>
        <option value="newest">
          Latest Arrivals
        </option>
      </select>

      <ChevronDown
        className="
          pointer-events-none
          absolute
          right-3
          top-1/2
          h-4
          w-4
          -translate-y-1/2
          text-gray-400
        "
      />
    </div>
  );
}