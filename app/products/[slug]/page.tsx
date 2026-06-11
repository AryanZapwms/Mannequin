import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { ProductActions } from "@/components/product-actions";
import { ProductGallery } from "@/components/product-gallery";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { ProductCategory } from "@/lib/db/models/ProductCategory";
import { ProductReview } from "@/lib/db/models/ProductReview";
import { WishlistItem } from "@/lib/db/models/WishlistItem";

type CategoryRef = { id: string; name: string; slug: string } | null;

type ListedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  thumbnail_url: string | null;
};

function toListedProduct(doc: any): ListedProduct {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    price: doc.price,
    compare_at_price: doc.compareAtPrice ?? null,
    thumbnail_url: doc.thumbnailUrl ?? null,
  };
}

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
  const relatedProducts = relatedDocs.map(toListedProduct);

  const suggestedDocs = await Product.find({ status: "active", _id: { $ne: productDoc._id } })
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(4);
  const suggestedProducts = suggestedDocs.map(toListedProduct);

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

    const existingReview = await ProductReview.findOne({ productId: product.id, userId: user.id });

    if (existingReview) {
      existingReview.rating = ratingValue;
      existingReview.title = titleValue.trim() || null;
      existingReview.body = bodyValue.trim() || null;
      existingReview.status = "approved";
      await existingReview.save();
    } else {
      await ProductReview.create({
        rating: ratingValue,
        title: titleValue.trim() || null,
        body: bodyValue.trim() || null,
        productId: product.id,
        userId: user.id,
        status: "approved",
      });
    }

    revalidatePath(`/products/${product.slug}`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-gray-900">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-gray-900">
          Shop
        </Link>
        {product.main_category ? (
          <>
            <span>/</span>
            <Link href={`/shop?category=${product.main_category.id}`} className="hover:text-gray-900">
              {product.main_category.name}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <ProductGallery images={allImages} discount={discount} />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.sub_category ? <p className="text-sm text-gray-600">{product.sub_category.name}</p> : null}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`h-5 w-5 ${index < filledStars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {reviewCount > 0 ? `${roundedAverage.toFixed(1)} (${reviewCount} review${reviewCount === 1 ? "" : "s"})` : "No reviews yet"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
            {product.compare_at_price && product.compare_at_price > product.price ? (
              <span className="text-xl text-gray-500 line-through">₹{product.compare_at_price.toFixed(2)}</span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {product.stock && product.stock > 0 ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-600">In Stock ({product.stock} available)</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-red-600">Out of Stock</span>
              </>
            )}
          </div>

          {product.description ? (
            <div className="border-t border-gray-200 pt-6">
              <p className="leading-relaxed text-gray-700">{product.description}</p>
            </div>
          ) : null}

          {product.sku ? (
            <div className="text-sm text-gray-600">
              <span className="font-medium">SKU:</span> {product.sku}
            </div>
          ) : null}

          <ProductActions
            productId={product.id}
            productSlug={product.slug}
            productName={product.name}
            productPrice={product.price}
            productThumbnailUrl={product.thumbnail_url}
            maxStock={product.stock ?? 0}
            isOutOfStock={!product.stock || product.stock === 0}
            initialInWishlist={initialInWishlist}
            initialWishlistItemId={initialWishlistItemId}
          />

          <div className="space-y-3 rounded-lg bg-gray-50 p-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">✓</span>
              <span>Free shipping on orders over ₹500</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">✓</span>
              <span>Easy returns within 30 days</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">✓</span>
              <span>100% authentic products</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[2fr,1fr]">
        <section>
          <h2 className="mb-4 text-2xl font-bold">Customer Reviews</h2>
          {reviewCount === 0 ? (
            <p className="text-sm text-gray-600">No reviews yet. Be the first to share your experience.</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-lg border p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {review.user?.display_name ?? "Customer"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${index < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.title ? <p className="mt-3 text-sm font-medium text-gray-900">{review.title}</p> : null}
                  {review.body ? <p className="mt-2 text-sm text-gray-700">{review.body}</p> : null}
                  {review.admin_response ? (
                    <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                      <p className="font-medium text-gray-900">Store response</p>
                      <p className="mt-1">{review.admin_response}</p>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-lg border p-5">
          <h3 className="mb-4 text-lg font-semibold">
            {authUser ? (userReview ? "Update your review" : "Write a review") : "Sign in to review"}
          </h3>
          {authUser ? (
            <>
              <form action={submitReview} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="rating" className="text-sm font-medium text-gray-700">
                    Rating
                  </label>
                  <select
                    id="rating"
                    name="rating"
                    defaultValue={userReview?.rating?.toString() ?? "5"}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    required
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} {value === 1 ? "star" : "stars"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Headline (optional)
                  </label>
                  <input
                    id="title"
                    name="title"
                    defaultValue={userReview?.title ?? ""}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Summarize your experience"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="body" className="text-sm font-medium text-gray-700">
                    Review
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    defaultValue={userReview?.body ?? ""}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="What did you like or dislike?"
                  />
                </div>
                <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">
                  Submit review
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4 text-sm text-gray-600">
              <p>You need to be signed in to share your thoughts about this product.</p>
              <Link
                href={`/auth/login?next=/products/${product.slug}`}
                className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Sign in to review
              </Link>
            </div>
          )}
        </aside>
      </div>

      {relatedProducts.length > 0 ? (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relProduct) => (
              <Link
                key={relProduct.id}
                href={`/products/${relProduct.slug}`}
                className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square bg-gray-100">
                  {relProduct.thumbnail_url ? (
                    <Image
                      src={relProduct.thumbnail_url}
                      alt={relProduct.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-900">{relProduct.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">₹{relProduct.price.toFixed(2)}</span>
                    {relProduct.compare_at_price && relProduct.compare_at_price > relProduct.price ? (
                      <span className="text-sm text-gray-500 line-through">₹{relProduct.compare_at_price.toFixed(2)}</span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-16">
        <h2 className="mb-6 text-2xl font-bold">Suggested for You</h2>
        {suggestedProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {suggestedProducts.map((suggested) => (
              <Link
                key={suggested.id}
                href={`/products/${suggested.slug}`}
                className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square bg-gray-100">
                  {suggested.thumbnail_url ? (
                    <Image
                      src={suggested.thumbnail_url}
                      alt={suggested.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-900">{suggested.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">₹{suggested.price.toFixed(2)}</span>
                    {suggested.compare_at_price && suggested.compare_at_price > suggested.price ? (
                      <span className="text-sm text-gray-500 line-through">₹{suggested.compare_at_price.toFixed(2)}</span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">no product found in the suggestions</p>
        )}
      </div>
    </div>
  );
}
