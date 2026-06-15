import type { Metadata } from "next";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { ShopProductCard } from "@/components/shop-product-card";
import { ShopSortSelect } from "@/components/shop-sort-select";
import { PriceRangeFilter } from "@/components/price-range-filter";
import { Pagination } from "@/components/pagination";
import { dbConnect } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { ProductCategory } from "@/lib/db/models/ProductCategory";
import { toShopProduct } from "@/lib/services/product";


const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Shop | Mannequin Care",
  description: "Browse our full range of natural skincare and haircare products.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const params = await searchParams;
  await dbConnect();

  // Pagination
  const currentPage = Math.max(1, parseInt(params?.page ?? "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Fetch categories
  const categoryDocs = await ProductCategory.find().sort({ name: 1 });
  const allCategories = categoryDocs.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    parent_id: c.parentId ? c.parentId.toString() : null,
  }));

  // Build product filter
  const filter: Record<string, any> = { status: "active" };

  if (params?.category) {
    const matchedCategory = allCategories.find((c) => c.slug === params.category);
    if (matchedCategory) {
      filter.$or = [{ mainCategoryId: matchedCategory.id }, { subCategoryId: matchedCategory.id }];
    } else {
      filter.$or = [{ mainCategoryId: null }, { subCategoryId: null }];
    }
  }

  if (params?.minPrice || params?.maxPrice) {
    filter.price = {};
    if (params?.minPrice) filter.price.$gte = parseFloat(params.minPrice);
    if (params?.maxPrice) filter.price.$lte = parseFloat(params.maxPrice);
  }

  if (params?.search) {
    filter.name = { $regex: params.search, $options: "i" };
  }

  // Sorting
  const sort = typeof params?.sort === "string" ? params.sort : "";
  const sortSpec: Record<string, 1 | -1> =
    sort === "price_asc"
      ? { price: 1 }
      : sort === "price_desc"
        ? { price: -1 }
        : { createdAt: -1 };

  const [productDocs, total] = await Promise.all([
    Product.find(filter).sort(sortSpec).skip(offset).limit(PAGE_SIZE),
    Product.countDocuments(filter),
  ]);

  const mainCategories = allCategories.filter((c) => c.parent_id === null);
  const subCategoriesByParent = allCategories.reduce<Record<string, typeof allCategories>>(
    (acc, cat) => {
      if (!cat.parent_id) return acc;
      acc[cat.parent_id] = acc[cat.parent_id] || [];
      acc[cat.parent_id].push(cat);
      return acc;
    },
    {}
  );

  const allProducts = productDocs.map(toShopProduct);

  // Check if any filters are active
  const hasActiveFilters = params?.category || params?.minPrice || params?.maxPrice || params?.search;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 mt-10 lg:py-12">

        {/* ═══ Mobile / Tablet: Horizontal Category Scroll ═══ */}
        <div className="mb-6 lg:hidden">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
            <Link
              href="/shop"
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${!params?.category
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              All
            </Link>
            {mainCategories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${params?.category === category.slug
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {category.name}
              </Link>
            ))}
            {/* Sub-categories as smaller pills */}
            {mainCategories.map((category) =>
              (subCategoriesByParent[category.id] ?? []).map((sub) => (
                <Link
                  key={sub.id}
                  href={`/shop?category=${sub.slug}`}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition-all ${params?.category === sub.slug
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:text-gray-700"
                    }`}
                >
                  {sub.name}
                </Link>
              )),
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* ═══ Desktop Sidebar ═══ */}
          <aside className="hidden lg:block space-y-5">
            {/* Search */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <form action="/shop" method="get">
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    placeholder="Search products…"
                    defaultValue={params?.search}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-4 pr-11 text-sm placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Active Filters
                  </h3>
                  <Link
                    href="/shop"
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </Link>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {params?.search && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white">
                      "{params.search}"
                    </span>
                  )}
                  {params?.minPrice && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white">
                      Min ₹{params.minPrice}
                    </span>
                  )}
                  {params?.maxPrice && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white">
                      Max ₹{params.maxPrice}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            <PriceRangeFilter
              initialMin={params?.minPrice ? Number(params.minPrice) : undefined}
              initialMax={params?.maxPrice ? Number(params.maxPrice) : undefined}
            />

            {/* Categories */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Categories
              </h3>
              <nav className="space-y-0.5">
                <Link
                  href="/shop"
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition-all ${!params?.category
                      ? "bg-gray-900 font-medium text-white shadow-sm"
                      : "font-normal text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  All Products
                  <span className={`text-[11px] ${!params?.category ? "text-gray-400" : "text-gray-400"
                    }`}>
                    {total}
                  </span>
                </Link>

                {mainCategories.map((category) => (
                  <div key={category.id}>
                    <Link
                      href={`/shop?category=${category.slug}`}
                      className={`flex items-center rounded-xl px-3.5 py-2.5 text-sm transition-all ${params?.category === category.slug
                          ? "bg-gray-900 font-medium text-white shadow-sm"
                          : "font-normal text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {category.name}
                    </Link>

                    {subCategoriesByParent[category.id] && (
                      <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-3">
                        {subCategoriesByParent[category.id].map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/shop?category=${sub.slug}`}
                            className={`block rounded-lg px-3 py-2 text-xs transition-all ${params?.category === sub.slug
                                ? "bg-gray-800 font-medium text-white"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                              }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* ═══ Mobile: Search + Price (stacked) ═══ */}
          <div className="space-y-4 lg:hidden">
            {/* Search */}
            <form action="/shop" method="get">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search products…"
                  defaultValue={params?.search}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-4 pr-12 text-sm placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Active Filters — mobile */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {params?.search && (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white">
                    "{params.search}"
                  </span>
                )}
                {params?.minPrice && (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white">
                    Min ₹{params.minPrice}
                  </span>
                )}
                {params?.maxPrice && (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white">
                    Max ₹{params.maxPrice}
                  </span>
                )}
                <Link
                  href="/shop"
                  className="shrink-0 flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Clear
                </Link>
              </div>
            )}

            {/* Price filter — mobile */}
            <PriceRangeFilter
              initialMin={params?.minPrice ? Number(params.minPrice) : undefined}
              initialMax={params?.maxPrice ? Number(params.maxPrice) : undefined}
            />
          </div>

          {/* ═══ Products Grid ═══ */}
          <main>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-5">
              <p className="text-sm text-gray-500 font-light">
                {total} {total === 1 ? "product" : "products"} found
              </p>
              <ShopSortSelect currentSort={sort} />
            </div>

            {/* Products */}
            {allProducts.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-sm text-gray-500 font-light mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <Link
                    href="/shop"
                    className="inline-block px-6 py-3 bg-black text-white text-sm rounded-xl hover:bg-gray-900 transition-colors"
                  >
                    Clear Filters
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-5 grid-cols-2 lg:grid-cols-3">
                  {allProducts.map((product) => (
                    <ShopProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {total > PAGE_SIZE && (
                  <div className="mt-10 flex justify-center">
                    <Pagination
                      total={total}
                      pageSize={PAGE_SIZE}
                      currentPage={currentPage}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
