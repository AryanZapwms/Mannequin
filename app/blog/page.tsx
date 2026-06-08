import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | Mannequin Care",
  description:
    "Skincare tips, ingredient guides, and wellness advice from the Mannequin Care team.",
};

function readingTime(content: string | null): number {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, cover_image_url, published_at, tags, content, author:author_id(display_name)"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const posts = data ?? [];
  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-amber-50 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-800 mb-4">
            Our Blog
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl mb-4">
            Skin Deep
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-500">
            Expert tips, ingredient breakdowns, and real stories from our community.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-16 text-center">
              <p className="text-gray-500">No posts published yet. Check back soon!</p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group mb-16 grid gap-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md lg:grid-cols-2"
                >
                  <div className="relative aspect-video overflow-hidden lg:aspect-auto lg:min-h-[320px]">
                    {featured.cover_image_url ? (
                      <Image
                        src={featured.cover_image_url}
                        alt={featured.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 text-amber-400 text-sm">
                        No cover image
                      </div>
                    )}
                    <div className="absolute left-4 top-4">
                      <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                        Featured
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center p-8">
                    {(featured.tags as string[] | null)?.length ? (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {(featured.tags as string[]).slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <h2 className="mb-3 text-2xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors leading-snug">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="mb-4 line-clamp-3 text-sm text-gray-500 leading-relaxed">
                        {featured.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
                      {featured.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                            new Date(featured.published_at)
                          )}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {readingTime(featured.content)} min read
                      </span>
                      {(featured.author as any)?.display_name && (
                        <span>by {(featured.author as any).display_name}</span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-black group-hover:gap-3 transition-all">
                      Read Article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              )}

              {/* Grid of remaining posts */}
              {rest.length > 0 && (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md flex flex-col"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        {post.cover_image_url ? (
                          <Image
                            src={post.cover_image_url}
                            alt={post.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 text-amber-300 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 p-5">
                        {(post.tags as string[] | null)?.length ? (
                          <div className="mb-2 flex flex-wrap gap-1.5">
                            {(post.tags as string[]).slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-gray-600 transition-colors leading-snug">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="mb-4 flex-1 line-clamp-2 text-sm text-gray-500">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                          {post.published_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                                new Date(post.published_at)
                              )}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {readingTime(post.content)} min
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
