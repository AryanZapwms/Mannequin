"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function ShopSortSelect({ currentSort }: { currentSort?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("sort", e.target.value);
    } else {
      params.delete("sort");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      defaultValue={currentSort ?? ""}
      onChange={handleChange}
      className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-light focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all cursor-pointer"
    >
      <option value="">Default sorting</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="newest">Latest</option>
    </select>
  );
}
