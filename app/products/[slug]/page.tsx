import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { ProductActions } from "@/components/product-actions";
import { ProductGallery } from "@/components/product-gallery";
import { ShopProductCard } from "@/components/shop-product-card";
import RevealWrapper from "@/components/RevealWrapper";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { ProductCategory } from "@/lib/db/models/ProductCategory";
import { ProductReview } from "@/lib/db/models/ProductReview";
import { WishlistItem } from "@/lib/db/models/WishlistItem";
import { toShopProduct } from "@/lib/services/product";

type CategoryRef = { id: string; name: string; slug: string } | null;

function toCategoryRef(doc: any): CategoryRef {
  if (!doc) return null;
  return { id: doc._id.toString(), name: doc.name, slug: doc.slug };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const data = await Product.findOne({ slug, status: "active" }).select(
    "name description thumbnailUrl",
  );

  if (!data) return { title: "Product Not Found" };

  return {
    title: `${data.name} | Mannequin Care`,
    description: data.description ?? `Buy ${data.name} at Mannequin Care.`,
    openGraph: {
      title: data.name,
      description: data.description ?? `Buy ${data.name} at Mannequin Care.`,
      images: data.thumbnailUrl ? [data.thumbnailUrl] : [],
    },
  };
}

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  await dbConnect();

  const authUser = await getCurrentUser();

  const productDoc = await Product.findOne({ slug, status: "active" })
    .populate("mainCategoryId", "name slug")
    .populate("subCategoryId", "name slug");

  if (!productDoc) {
    notFound();
  }

  const product = {
    id: productDoc._id.toString(),
    name: productDoc.name,
    slug: productDoc.slug,
    description: productDoc.description ?? null,
    sku: productDoc.sku ?? null,
    price: productDoc.price,
    compare_at_price: productDoc.compareAtPrice ?? null,
    stock: productDoc.stock ?? null,
    thumbnail_url: productDoc.thumbnailUrl ?? null,
    main_category_id: productDoc.mainCategoryId
      ? (productDoc.mainCategoryId as any)._id?.toString() ?? productDoc.mainCategoryId.toString()
      : null,
    sub_category_id: productDoc.subCategoryId
      ? (productDoc.subCategoryId as any)._id?.toString() ?? productDoc.subCategoryId.toString()
      : null,
    main_category: toCategoryRef(productDoc.mainCategoryId),
    sub_category: toCategoryRef(productDoc.subCategoryId),
  };

  // Combine thumbnail + embedded gallery into one unified image list
  const galleryImages = [...(productDoc.media ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const allImages: { url: string; alt: string }[] = [
    ...(product.thumbnail_url
      ? [{ url: product.thumbnail_url, alt: product.name }]
      : []),
    ...galleryImages.map((g) => ({ url: g.url, alt: g.altText || product.name })),
  ];

  // Check if product is in the logged-in user's wishlist
  let initialInWishlist = false;
  let initialWishlistItemId: string | null = null;
  if (authUser) {
    const wishlistRow = await WishlistItem.findOne({ userId: authUser.id, productId: productDoc._id });
    if (wishlistRow) {
      initialInWishlist = true;
      initialWishlistItemId = wishlistRow._id.toString();
    }
  }

  const reviewDocs = await ProductReview.find({ productId: productDoc._id, status: "approved" })
    .populate("userId", "displayName")
    .sort({ createdAt: -1 });

  const reviews = reviewDocs.map((r) => ({
    id: r._id.toString(),
    rating: r.rating,
    title: r.title ?? null,
    body: r.body ?? null,
    admin_response: r.adminResponse ?? null,
    created_at: (r.createdAt ?? new Date()).toString(),
    user: r.userId
      ? { id: (r.userId as any)._id.toString(), display_name: (r.userId as any).displayName ?? null }
      : null,
  }));

  const userReviewDoc = authUser
    ? await ProductReview.findOne({ productId: productDoc._id, userId: authUser.id })
    : null;

  const userReview = userReviewDoc
    ? {
        id: userReviewDoc._id.toString(),
        rating: userReviewDoc.rating,
        title: userReviewDoc.title ?? null,
        body: userReviewDoc.body ?? null,
      }
    : null;

  const relatedFilter: Record<string, unknown> = {
    status: "active",
    _id: { $ne: productDoc._id },
  };

  if (product.main_category_id && product.sub_category_id) {
    relatedFilter.$or = [
      { mainCategoryId: product.main_category_id },
      { subCategoryId: product.sub_category_id },
    ];
  } else if (product.main_category_id) {
    relatedFilter.mainCategoryId = product.main_category_id;
  } else if (product.sub_category_id) {
    relatedFilter.subCategoryId = product.sub_category_id;
  }

  const relatedDocs = await Product.find(relatedFilter).sort({ createdAt: -1 }).limit(4);
  const relatedProducts = relatedDocs.map(toShopProduct);

  const suggestedDocs = await Product.find({ status: "active", _id: { $ne: productDoc._id } })
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(4);
  const suggestedProducts = suggestedDocs.map(toShopProduct);

  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : 0;
  const roundedAverage = Math.round(averageRating * 10) / 10;
  const filledStars = Math.round(averageRating);
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  async function submitReview(formData: FormData) {
    "use server";

    const user = await getCurrentUser();

    if (!user) {
      redirect(`/auth/login?next=/products/${product.slug}`);
    }

    const ratingValue = Number(formData.get("rating"));
    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const titleValue = (formData.get("title") as string | null) ?? "";
    const bodyValue = (formData.get("body") as string | null) ?? "";

    await dbConnect();

    // One review per customer per product. The form is hidden once a review
    // exists, so this only trips on a request that bypassed the UI.
    const existingReview = await ProductReview.findOne({ productId: product.id, userId: user.id });

    if (existingReview) {
      throw new Error("You have already reviewed this product");
    }

    await ProductReview.create({
      rating: ratingValue,
      title: titleValue.trim() || null,
      body: bodyValue.trim() || null,
      productId: product.id,
      userId: user.id,
      status: "approved",
    });

    revalidatePath(`/products/${product.slug}`);
  }

  const inStock = Boolean(product.stock && product.stock > 0);

  return (
    <div className="w-full bg-brand-cream">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:py-14">
        {/* ── Breadcrumb ─────────────────────────────────────────── */}
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 font-sub text-[11px] font-medium tracking-[0.04em] text-brand-mocha sm:mb-8 sm:text-[12px]">
          <Link href="/" className="transition-colors hover:text-brand-copper">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-brand-sand" />
          <Link href="/shop" className="transition-colors hover:text-brand-copper">
            Shop
          </Link>
          {product.main_category ? (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-brand-sand" />
              <Link
                href={`/shop?category=${product.main_category.slug}`}
                className="transition-colors hover:text-brand-copper"
              >
                {product.main_category.name}
              </Link>
            </>
          ) : null}
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-brand-sand" />
          {/* Long names would otherwise push the trail onto three lines on a phone */}
          <span className="max-w-[55vw] truncate text-brand-espresso sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* ── Product overview ───────────────────────────────────── */}
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-14">
          {/* min-w-0: grid items default to min-width:auto, so they refuse to
              shrink below their content's min-content width — which pushed this
              column to 656px inside a 358px grid and gave the whole page a
              horizontal scrollbar on phones. */}
          <RevealWrapper className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <ProductGallery images={allImages} discount={discount} />
          </RevealWrapper>

          <RevealWrapper delay={120} className="min-w-0 space-y-7">
            <div>
              {product.sub_category ? (
                <p className="mb-3 font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
                  {product.sub_category.name}
                </p>
              ) : null}
              <h1 className="font-display text-display font-semibold leading-[1.1] text-brand-espresso">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-[18px] w-[18px] ${
                      index < filledStars
                        ? "fill-brand-gold-500 text-brand-gold-500"
                        : "fill-brand-sand text-brand-sand"
                    }`}
                  />
                ))}
              </div>
              <span className="font-sub text-sm text-brand-mocha">
                {reviewCount > 0
                  ? `${roundedAverage.toFixed(1)} · ${reviewCount} review${reviewCount === 1 ? "" : "s"}`
                  : "No reviews yet"}
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <span className="font-mono text-3xl text-brand-copper sm:text-4xl">
                ₹{product.price.toFixed(2)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price ? (
                <span className="font-mono text-xl text-brand-mocha/60 line-through">
                  ₹{product.compare_at_price.toFixed(2)}
                </span>
              ) : null}
              {discount > 0 ? (
                <span className="rounded-full bg-brand-gold-100 px-3 py-1 font-sub text-xs font-semibold uppercase tracking-[0.08em] text-brand-espresso">
                  Save {discount}%
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${inStock ? "bg-brand-sage" : "bg-brand-blush"}`}
              />
              <span
                className={`font-sub text-sm font-semibold tracking-[0.04em] ${
                  inStock ? "text-brand-mocha" : "text-brand-copper"
                }`}
              >
                {inStock ? `In Stock — ${product.stock} available` : "Out of Stock"}
              </span>
            </div>

            {product.description ? (
              <div className="border-t border-brand-sand pt-6">
                <p className="font-body text-[15px] leading-[1.8] text-brand-body">{product.description}</p>
              </div>
            ) : null}

            {product.sku ? (
              <p className="font-sub text-[13px] text-brand-mocha">
                <span className="font-semibold text-brand-espresso">SKU:</span> {product.sku}
              </p>
            ) : null}

            <ProductActions
              productId={product.id}
              productSlug={product.slug}
              productName={product.name}
              productPrice={product.price}
              productThumbnailUrl={product.thumbnail_url}
              maxStock={product.stock ?? 0}
              isOutOfStock={!inStock}
              initialInWishlist={initialInWishlist}
              initialWishlistItemId={initialWishlistItemId}
            />

            <div className="grid gap-3 rounded-card border border-brand-sand bg-white p-5 shadow-soft sm:grid-cols-3">
              {[
                { Icon: Truck, label: "Free shipping over ₹500" },
                { Icon: RotateCcw, label: "30-day easy returns" },
                { Icon: ShieldCheck, label: "100% authentic" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon className="h-5 w-5 shrink-0 text-brand-gold-600" strokeWidth={1.5} />
                  <span className="font-sub text-[12px] font-medium text-brand-body">{label}</span>
                </div>
              ))}
            </div>
          </RevealWrapper>
        </div>
                 
        {/* ── Reviews ────────────────────────────────────────────── */}
        {/* Underscore, not a comma: Tailwind arbitrary values can't contain commas */}
        <div className="mt-14 grid gap-8 sm:mt-20 lg:grid-cols-[2fr_1fr] lg:gap-10">
          <section className="min-w-0">
            <p className="font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
              What people say
            </p>
            <h2 className="mt-2 font-display text-heading font-semibold text-brand-espresso">
              Customer Reviews
            </h2>
            {reviewCount === 0 ? (
              <p className="mt-6 font-body text-brand-body">
                No reviews yet. Be the first to share your experience.
              </p>
            ) : (
              <div className="mt-8 space-y-5">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-card border border-brand-sand bg-white p-5 shadow-soft sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="flex flex-wrap items-center gap-2 font-sub text-sm font-semibold text-brand-espresso">
                          {review.user?.display_name ?? "Customer"}
                          {authUser && review.user?.id === authUser.id ? (
                            <span className="rounded-full bg-brand-gold-100 px-2 py-0.5 font-sub text-[10px] font-semibold uppercase tracking-wider text-brand-espresso">
                              Your review
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 font-sub text-xs text-brand-mocha">
                          {new Date(review.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${
                              index < review.rating
                                ? "fill-brand-gold-500 text-brand-gold-500"
                                : "fill-brand-sand text-brand-sand"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.title ? (
                      <p className="mt-4 font-sub text-sm font-semibold text-brand-espresso">{review.title}</p>
                    ) : null}
                    {review.body ? (
                      <p className="mt-2 font-body text-[14px] leading-relaxed text-brand-body">{review.body}</p>
                    ) : null}
                    {review.admin_response ? (
                      <div className="mt-4 rounded-thumb border border-brand-sand bg-brand-gold-50 p-4">
                        <p className="font-sub text-sm font-semibold text-brand-espresso">Store response</p>
                        <p className="mt-1 font-body text-[14px] leading-relaxed text-brand-body">
                          {review.admin_response}
                        </p>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="h-fit min-w-0 rounded-card border border-brand-sand bg-white p-5 shadow-soft sm:p-6 lg:sticky lg:top-24">
            <h3 className="font-display text-2xl font-semibold text-brand-espresso">
              {!authUser
                ? "Sign in to review"
                : userReview
                  ? "You've reviewed this"
                  : "Write a review"}
            </h3>

            {/* Already reviewed — show it back to them instead of the form */}
            {authUser && userReview ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-thumb border border-brand-sand bg-brand-gold-50 p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            index < userReview.rating
                              ? "fill-brand-gold-500 text-brand-gold-500"
                              : "fill-brand-sand text-brand-sand"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-sub text-sm font-semibold text-brand-espresso">
                      {userReview.rating}/5
                    </span>
                  </div>
                  {userReview.title ? (
                    <p className="mt-3 font-sub text-sm font-semibold text-brand-espresso">
                      {userReview.title}
                    </p>
                  ) : null}
                  {userReview.body ? (
                    <p className="mt-1.5 font-body text-[14px] leading-relaxed text-brand-body">
                      {userReview.body}
                    </p>
                  ) : null}
                </div>

                <p className="font-body text-sm leading-relaxed text-brand-body">
                  Thanks for sharing your experience — you can leave one review per product. Need a
                  change?{" "}
                  <Link
                    href="/contact-us"
                    className="font-medium text-brand-copper underline-offset-4 hover:underline"
                  >
                    Contact us
                  </Link>
                  .
                </p>
              </div>
            ) : authUser ? (
              <form action={submitReview} className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="rating" className="font-sub text-sm font-medium text-brand-espresso">
                    Rating
                  </label>
                  <select
                    id="rating"
                    name="rating"
                    defaultValue="5"
                    className="w-full rounded-thumb border border-brand-sand bg-brand-cream px-3 py-2.5 font-body text-sm text-brand-espresso outline-none transition-colors focus:border-brand-gold-500"
                    required
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} {value === 1 ? "star" : "stars"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="title" className="font-sub text-sm font-medium text-brand-espresso">
                    Headline (optional)
                  </label>
                  <input
                    id="title"
                    name="title"
                    className="w-full rounded-thumb border border-brand-sand bg-brand-cream px-3 py-2.5 font-body text-sm text-brand-espresso outline-none transition-colors placeholder:text-brand-mocha/60 focus:border-brand-gold-500"
                    placeholder="Summarize your experience"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="body" className="font-sub text-sm font-medium text-brand-espresso">
                    Review
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    rows={4}
                    className="w-full rounded-thumb border border-brand-sand bg-brand-cream px-3 py-2.5 font-body text-sm text-brand-espresso outline-none transition-colors placeholder:text-brand-mocha/60 focus:border-brand-gold-500"
                    placeholder="What did you like or dislike?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded bg-brand-gold-500 px-4 py-3 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
                >
                  Submit review
                </button>
              </form>
            ) : (
              <div className="mt-5 space-y-4 font-body text-sm text-brand-body">
                <p>You need to be signed in to share your thoughts about this product.</p>
                <Link
                  href={`/auth/login?next=/products/${product.slug}`}
                  className="inline-flex items-center justify-center rounded bg-brand-gold-500 px-5 py-3 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
                >
                  Sign in to review
                </Link>
              </div>
            )}
          </aside>
        </div>

        {/* ── Related products ───────────────────────────────────── */}
        {relatedProducts.length > 0 ? (
          <div className="mt-14 sm:mt-20">
            <p className="font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
              You may also like
            </p>
            <h2 className="mt-2 font-display text-heading font-semibold text-brand-espresso">
              Related Products
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relProduct, i) => (
                <RevealWrapper key={relProduct.id} delay={(i % 4) * 80}>
                  <ShopProductCard product={relProduct} />
                </RevealWrapper>
              ))}
            </div>
          </div>
        ) : null}

        {/* ── Suggested products ─────────────────────────────────── */}
        <div className="mt-14 sm:mt-20">
          <p className="font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
            Picked for you
          </p>
          <h2 className="mt-2 font-display text-heading font-semibold text-brand-espresso">
            Suggested for You
          </h2>
          {suggestedProducts.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {suggestedProducts.map((suggested, i) => (
                <RevealWrapper key={suggested.id} delay={(i % 4) * 80}>
                  <ShopProductCard product={suggested} />
                </RevealWrapper>
              ))}
            </div>
          ) : (
            <p className="mt-6 font-body text-brand-body">No products found in the suggestions.</p>
          )}
        </div>
      </div>
    </div>
  );
}
