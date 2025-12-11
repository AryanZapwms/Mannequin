import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Minus, Plus, Share2, Star } from "lucide-react";

type ReviewRecord = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  admin_response: string | null;
  created_at: string;
  user: {
    id: string;
    display_name: string | null;
  } | null;
};

type UserReviewRecord = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
};

type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number | null;
  thumbnail_url: string | null;
  main_category_id: string | null;
  sub_category_id: string | null;
  main_category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  sub_category: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

type ListedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  thumbnail_url: string | null;
};

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // Await params in Next.js 15+
  const { slug } = await params;
  
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: productData } = await supabase
    .from("products")
    .select(
      `
      *,
      main_category:product_categories!products_main_category_id_fkey(id, name, slug),
      sub_category:product_categories!products_sub_category_id_fkey(id, name, slug)
    `,
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!productData) {
    notFound();
  }

  const product = productData as ProductRecord;

  const reviewsResponse = await supabase
    .from("product_reviews")
    .select(
      `id, rating, title, body, admin_response, created_at, user:profiles(id, display_name)`
    )
    .eq("product_id", product.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const reviews = (reviewsResponse.data ?? []) as ReviewRecord[];

  const { data: userReviewData } = authUser
    ? await supabase
        .from("product_reviews")
        .select("id, rating, title, body")
        .eq("product_id", product.id)
        .eq("user_id", authUser.id)
        .maybeSingle()
    : { data: null };

  const userReview = (userReviewData ?? null) as UserReviewRecord | null;

  let relatedQuery = supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .neq("id", product.id)
    .order("created_at", { ascending: false })
    .limit(4);

  if (product.main_category_id && product.sub_category_id) {
    relatedQuery = relatedQuery.or(
      `main_category_id.eq.${product.main_category_id},sub_category_id.eq.${product.sub_category_id}`,
    );
  } else if (product.main_category_id) {
    relatedQuery = relatedQuery.eq("main_category_id", product.main_category_id);
  } else if (product.sub_category_id) {
    relatedQuery = relatedQuery.eq("sub_category_id", product.sub_category_id);
  }

  const { data: relatedProductsData } = await relatedQuery;
  const relatedProducts = (relatedProductsData ?? []) as ListedProduct[];

  const { data: suggestedProductsData } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .neq("id", product.id)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(4);

  const suggestedProducts = (suggestedProductsData ?? []) as ListedProduct[];

  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : 0;
  const roundedAverage = Math.round(averageRating * 10) / 10;
  const filledStars = Math.round(averageRating);
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  async function submitReview(formData: FormData) {
    "use server";

    const supabaseServer = await createClient();
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    if (!user) {
      redirect(`/auth/login?next=/products/${product.slug}`);
    }

    const ratingValue = Number(formData.get("rating"));
    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const titleValue = (formData.get("title") as string | null) ?? "";
    const bodyValue = (formData.get("body") as string | null) ?? "";

    const { data: existingReview } = await supabaseServer
      .from("product_reviews")
      .select("id")
      .eq("product_id", product.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingReview) {
      const { error } = await supabaseServer
        .from("product_reviews")
        .update({
          rating: ratingValue,
          title: titleValue.trim() || null,
          body: bodyValue.trim() || null,
          status: "approved",
        })
        .eq("id", existingReview.id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabaseServer.from("product_reviews").insert({
        rating: ratingValue,
        title: titleValue.trim() || null,
        body: bodyValue.trim() || null,
        product_id: product.id,
        user_id: user.id,
        status: "approved",
      });

      if (error) {
        throw new Error(error.message);
      }
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
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {product.thumbnail_url ? (
              <Image src={product.thumbnail_url} alt={product.name} fill className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No Image Available</div>
            )}
            {discount > 0 ? (
              <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                -{discount}%
              </div>
            ) : null}
          </div>
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

          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-md border border-gray-300">
                <button className="px-4 py-2 hover:bg-gray-100">
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock || 1}
                  defaultValue="1"
                  className="w-16 border-x border-gray-300 py-2 text-center focus:outline-none"
                />
                <button className="px-4 py-2 hover:bg-gray-100">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                disabled={!product.stock || product.stock === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
            </div>

            <div className="flex gap-3">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-md border-2 border-gray-300 px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50">
                <Heart className="h-5 w-5" />
                Add to Wishlist
              </button>
              <button className="flex items-center justify-center gap-2 rounded-md border-2 border-gray-300 px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

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