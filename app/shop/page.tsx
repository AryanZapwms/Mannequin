// import { createClient } from "@/lib/supabase/server";
// import { Search, Heart, ShoppingCart } from "lucide-react";
// import Link from "next/link";
// import { ShopProductCard } from "@/components/shop-product-card";

// export default async function ShopPage({
//   searchParams,
// }: {
//   // Next.js may pass searchParams as a Promise in some runtime/streaming modes,
//   // so we await it below. Keep type loose to avoid TS pain here.
//   searchParams: any;
// }) {
//   // unwrap searchParams promise
//   const params = await searchParams;

//   const supabase = await createClient();

//   // Fetch categories
//   const { data: categories } = await supabase
//     .from("product_categories")
//     .select("id, name, slug, parent_id")
//     .order("name", { ascending: true });

//   // Build product query
//   let query = supabase
//     .from("products")
//     .select(
//       "*, main_category:product_categories!main_category_id(name), sub_category:product_categories!sub_category_id(name)"
//     )
//     .eq("status", "active");

//   // Apply filters using params (already awaited)
//   if (params?.category) {
//     query = query.or(
//       `main_category_id.eq.${params.category},sub_category_id.eq.${params.category}`
//     );
//   }

//   if (params?.minPrice) {
//     query = query.gte("price", parseFloat(params.minPrice));
//   }

//   if (params?.maxPrice) {
//     query = query.lte("price", parseFloat(params.maxPrice));
//   }

//   if (params?.search) {
//     query = query.ilike("name", `%${params.search}%`);
//   }

//   const { data: products } = await query.order("created_at", { ascending: false });

//   const allCategories = categories ?? [];
//   const mainCategories = allCategories.filter((c) => c.parent_id === null);
//   const subCategoriesByParent = allCategories.reduce<Record<string, typeof allCategories>>(
//     (acc, cat) => {
//       if (!cat.parent_id) return acc;
//       acc[cat.parent_id] = acc[cat.parent_id] || [];
//       acc[cat.parent_id].push(cat);
//       return acc;
//     },
//     {}
//   );

//   const allProducts = products ?? [];

//   return (
//     <div className="container mx-auto px-4 py-8 mt-10">
//       <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
//         {/* Sidebar */}
//         <aside className="space-y-6">
//           {/* Search */}
//           <div className="rounded-lg bg-gray-50 p-4">
//             <form action="/shop" method="get">
//               <div className="relative">
//                 <input
//                   type="text"
//                   name="search"
//                   placeholder="Search products..."
//                   defaultValue={params?.search}
//                   className="w-full rounded-md border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm focus:border-gray-400 focus:outline-none"
//                 />
//                 <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
//                   <Search className="h-4 w-4 text-gray-400" />
//                 </button>
//               </div>
//             </form>
//           </div>

//           {/* Price Filter */}
//           <div className="rounded-lg bg-white p-4 shadow-sm">
//             <h3 className="mb-4 font-semibold">Filter by price</h3>
//             <form action="/shop" method="get" className="space-y-4">
//               {params?.category && <input type="hidden" name="category" value={params.category} />}
//               {params?.search && <input type="hidden" name="search" value={params.search} />}

//               <div className="space-y-2">
//                 <label className="text-sm text-gray-600">Min Price: ₹{params?.minPrice || 0}</label>
//                 <input
//                   type="range"
//                   name="minPrice"
//                   min="0"
//                   max="1000"
//                   step="10"
//                   defaultValue={params?.minPrice || 0}
//                   className="w-full accent-yellow-400"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm text-gray-600">
//                   Max Price: ₹{params?.maxPrice || 1000}
//                 </label>
//                 <input
//                   type="range"
//                   name="maxPrice"
//                   min="0"
//                   max="1000"
//                   step="10"
//                   defaultValue={params?.maxPrice || 1000}
//                   className="w-full accent-yellow-400"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="w-full rounded-md bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-500"
//               >
//                 Filter
//               </button>
//             </form>
//           </div>

//           {/* Categories */}
//           <div className="rounded-lg bg-white p-4 shadow-sm">
//             <h3 className="mb-4 font-semibold">Our Categories</h3>
//             <div className="space-y-2">
//               {mainCategories.map((category) => (
//                 <div key={category.id}>
//                   <Link
//                     href={`/shop?category=${category.id}`}
//                     className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
//                       params?.category === category.id
//                         ? "bg-gray-100 text-black"
//                         : "text-gray-700 hover:bg-gray-50"
//                     }`}
//                   >
//                     {category.name}
//                   </Link>

//                   {subCategoriesByParent[category.id] && (
//                     <div className="ml-4 mt-1 space-y-1">
//                       {subCategoriesByParent[category.id].map((sub) => (
//                         <Link
//                           key={sub.id}
//                           href={`/shop?category=${sub.id}`}
//                           className={`block rounded px-3 py-1.5 text-xs transition-colors ${
//                             params?.category === sub.id
//                               ? "bg-gray-100 text-black"
//                               : "text-gray-600 hover:bg-gray-50"
//                           }`}
//                         >
//                           {sub.name}
//                         </Link>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </aside>

//         {/* Products Grid */}
//         <main>
//           {/* Header */}
//           <div className="mb-6 flex items-center justify-between">
//             <p className="text-sm text-gray-600">
//               Showing 1–{allProducts.length} of {allProducts.length} results
//             </p>
//             <select className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-gray-400 focus:outline-none">
//               <option>Default sorting</option>
//               <option>Price: Low to High</option>
//               <option>Price: High to Low</option>
//               <option>Latest</option>
//             </select>
//           </div>

//           {/* Products */}
//           {allProducts.length === 0 ? (
//             <div className="rounded-lg bg-gray-50 p-12 text-center">
//               <p className="text-gray-600">No products found</p>
//             </div>
//           ) : (
//             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//               {allProducts.map((product) => (
//                 <ShopProductCard key={product.id} product={product} />
//               ))}
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }



import { createClient } from "@/lib/supabase/server";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { ShopProductCard } from "@/components/shop-product-card";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Fetch categories
  const { data: categories } = await supabase
    .from("product_categories")
    .select("id, name, slug, parent_id")
    .order("name", { ascending: true });

  // Build product query
  let query = supabase
    .from("products")
    .select(
      "*, main_category:product_categories!main_category_id(name), sub_category:product_categories!sub_category_id(name)"
    )
    .eq("status", "active");

  // Apply filters
  if (params?.category) {
    query = query.or(
      `main_category_id.eq.${params.category},sub_category_id.eq.${params.category}`
    );
  }

  if (params?.minPrice) {
    query = query.gte("price", parseFloat(params.minPrice));
  }

  if (params?.maxPrice) {
    query = query.lte("price", parseFloat(params.maxPrice));
  }

  if (params?.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  const { data: products } = await query.order("created_at", { ascending: false });

  const allCategories = categories ?? [];
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

  const allProducts = products ?? [];

  // Check if any filters are active
  const hasActiveFilters = params?.category || params?.minPrice || params?.maxPrice || params?.search;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 mt-10">
       

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Search */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <form action="/shop" method="get">
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    placeholder="Search products..."
                    defaultValue={params?.search}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-12 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
                  />
                  <button 
                    type="submit" 
                    className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                  >
                    <Search className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </form>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-sm tracking-wide">Active Filters</h3>
                  <Link 
                    href="/shop"
                    className="text-xs text-gray-500 hover:text-black transition-colors flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear All
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {params?.search && (
                    <span className="px-3 py-1.5 bg-black text-white text-xs rounded-full">
                      Search: {params.search}
                    </span>
                  )}
                  {params?.minPrice && (
                    <span className="px-3 py-1.5 bg-black text-white text-xs rounded-full">
                      Min: ₹{params.minPrice}
                    </span>
                  )}
                  {params?.maxPrice && (
                    <span className="px-3 py-1.5 bg-black text-white text-xs rounded-full">
                      Max: ₹{params.maxPrice}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Price Filter */}
            <div className="bg-gray-50 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="h-4 w-4 text-black" />
                <h3 className="font-medium text-sm tracking-wide text-black">Price Range</h3>
              </div>
              
              <form action="/shop" method="get" className="space-y-6">
                {params?.category && <input type="hidden" name="category" value={params.category} />}
                {params?.search && <input type="hidden" name="search" value={params.search} />}

                <div className="space-y-3">
                  <label className="text-xs font-light text-black">
                    Minimum: ₹{params?.minPrice || 0}
                  </label>
                  <input
                    type="range"
                    name="minPrice"
                    min="0"
                    max="10000"
                    step="100"
                    defaultValue={params?.minPrice || 0}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs text-black font-light">
                    Maximum: ₹{params?.maxPrice || 10000}
                  </label>
                  <input
                    type="range"
                    name="maxPrice"
                    min="0"
                    max="10000"
                    step="100"
                    defaultValue={params?.maxPrice || 10000}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black hover:bg-gray-100 transition-colors"
                >
                  Apply Filter
                </button>
              </form>
            </div>

            {/* Categories */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-medium text-sm tracking-wide mb-4">Categories</h3>
              <div className="space-y-1">
                <Link
                  href="/shop"
                  className={`block rounded-xl px-4 py-2.5 text-sm font-light transition-all ${
                    !params?.category
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All Products
                </Link>
                
                {mainCategories.map((category) => (
                  <div key={category.id}>
                    <Link
                      href={`/shop?category=${category.id}`}
                      className={`block rounded-xl px-4 py-2.5 text-sm font-light transition-all ${
                        params?.category === category.id
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {category.name}
                    </Link>

                    {subCategoriesByParent[category.id] && (
                      <div className="ml-4 mt-1 space-y-1">
                        {subCategoriesByParent[category.id].map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/shop?category=${sub.id}`}
                            className={`block rounded-lg px-4 py-2 text-xs font-light transition-all ${
                              params?.category === sub.id
                                ? "bg-gray-900 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-6">
              <p className="text-sm text-gray-500 font-light">
                {allProducts.length} {allProducts.length === 1 ? 'product' : 'products'} found
              </p>
              <select className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-light focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all cursor-pointer">
                <option>Default sorting</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Latest</option>
              </select>
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
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {allProducts.map((product) => (
                  <ShopProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}