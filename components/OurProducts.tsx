import { dbConnect } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { toShopProduct } from "@/lib/services/product";
import { ShopProductCard } from "@/components/shop-product-card";

export default async function OurProducts() {
  await dbConnect();

  const productDocs = await Product.find({ status: "active" })
    .sort({ createdAt: -1 })
    .limit(6);

  const allProducts = productDocs.map(toShopProduct);

  return (
    <div className="relative w-full overflow-hidden bg-amber-50">

    <div className="container mx-auto px-4 py-16">
      {/* Section Header */}
      <div className="mb-12 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-500">
          TOP BRAND
        </p>
        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
          Beauty Care Products
        </h2>
      </div>

      {/* Products Grid */}
      {allProducts.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-12 text-center">
          <p className="text-gray-600">No products available</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
          {allProducts.map((product) => (
            <ShopProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
