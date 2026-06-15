import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { dbConnect } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { toShopProduct } from "@/lib/services/product";
import { ShopProductCard } from "@/components/shop-product-card";
import RevealWrapper from "@/components/RevealWrapper";

export default async function OurProducts() {
  await dbConnect();

  const productDocs = await Product.find({ status: "active" })
    .sort({ createdAt: -1 })
    .limit(6);

  const allProducts = productDocs.map(toShopProduct);

  return (
    <section className="w-full bg-brand-gold-50 py-[clamp(60px,8vw,120px)]">
      <div className="mx-auto max-w-[1280px] px-6">
        {/* Section Header */}
        <RevealWrapper className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
              Top Brand
            </p>
            <h2 className="mt-3 font-display text-heading font-semibold text-brand-espresso">
              Beauty Care Products
            </h2>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 border-b border-brand-copper pb-0.5 font-sub text-sm font-medium text-brand-copper transition-colors hover:text-brand-espresso"
          >
            View All
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </RevealWrapper>

        {/* Products Grid */}
        {allProducts.length === 0 ? (
          <RevealWrapper delay={100} className="mt-12 rounded-card border border-brand-sand bg-white p-12 text-center shadow-soft">
            <p className="font-body text-brand-body">No products available</p>
          </RevealWrapper>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allProducts.map((product, i) => (
              <RevealWrapper key={product.id} delay={(i % 3) * 100}>
                <ShopProductCard product={product} />
              </RevealWrapper>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
