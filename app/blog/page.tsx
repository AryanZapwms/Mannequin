import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { dbConnect } from "@/lib/db/connect";
import { BlogPost } from "@/lib/db/models/BlogPost";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import RevealWrapper from "@/components/RevealWrapper";

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

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(iso),
  );
}

export default async function BlogPage() {
  await dbConnect();

  const postDocs = await BlogPost.find({ status: "published" })
    .populate("authorId", "displayName")
    .sort({ publishedAt: -1 });

  const posts = postDocs.map((p) => ({
    id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? null,
    cover_image_url: p.coverImageUrl ?? null,
    published_at: p.publishedAt ? p.publishedAt.toISOString() : null,
    tags: p.tags ?? [],
    content: p.content ?? null,
    author: p.authorId
      ? {
          display_name:
            (p.authorId as unknown as { displayName?: string | null })
              .displayName ?? null,
        }
      : null,
  }));

  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="w-full bg-brand-cream bg-glow-gold">
        <div className="mx-auto max-w-[1160px] px-6 pb-10 pt-[clamp(40px,6vw,72px)] text-center">
          <RevealWrapper>
            <p className="mb-4 flex items-center justify-center gap-2 font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
              <span aria-hidden className="text-brand-gold-500">
                ✦
              </span>
              Our Journal
            </p>
            <h1 className="font-display text-display font-light italic text-brand-espresso">
              Skin Deep
            </h1>
            <p className="mx-auto mt-4 max-w-[560px] font-body text-base leading-[1.8] text-brand-body">
              Expert tips, ingredient breakdowns, and real stories from the
              Mannequin Care community.
            </p>
          </RevealWrapper>
        </div>
      </section>

      <section className="w-full pb-[clamp(56px,8vw,120px)]">
        <div className="mx-auto max-w-[1160px] px-6">
          {posts.length === 0 ? (
            <div className="rounded-feature border border-brand-sand bg-brand-linen p-16 text-center">
              <p className="font-body text-brand-body">
                No posts published yet — check back soon.
              </p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <RevealWrapper>
                  <Link
                    href={`/blog/${featured.slug}`}
                    className="group mb-14 grid gap-0 overflow-hidden rounded-feature border border-brand-sand bg-white shadow-soft transition-shadow duration-300 hover:shadow-card lg:grid-cols-2"
                  >
                    <div className="relative aspect-video overflow-hidden lg:aspect-auto lg:min-h-[340px]">
                      {featured.cover_image_url ? (
                        <Image
                          src={featured.cover_image_url}
                          alt={featured.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-brand-linen bg-glow-gold font-display text-5xl font-light italic text-brand-sand">
                          Mannequin Care
                        </div>
                      )}
                      <div className="absolute left-5 top-5">
                        <span className="rounded-full bg-brand-gold-500 px-3.5 py-1.5 font-sub text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-espresso shadow-gold">
                          Featured
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center p-8 lg:p-10">
                      {featured.tags.length ? (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {featured.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-brand-gold-100 px-3 py-1 font-sub text-[10px] font-medium uppercase tracking-[0.12em] text-brand-copper"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <h2 className="mb-3 font-display text-[clamp(1.5rem,2.6vw,2.125rem)] font-light leading-[1.2] text-brand-espresso transition-colors group-hover:text-brand-copper">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="mb-5 line-clamp-3 font-body text-sm leading-[1.8] text-brand-body">
                          {featured.excerpt}
                        </p>
                      )}
                      <div className="mb-6 flex flex-wrap items-center gap-4 font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
                        {featured.published_at && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(featured.published_at)}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {readingTime(featured.content)} min read
                        </span>
                        {featured.author?.display_name && (
                          <span className="normal-case tracking-normal">
                            by {featured.author.display_name}
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-2 font-sub text-xs font-semibold uppercase tracking-[0.12em] text-brand-copper transition-all group-hover:gap-3">
                        Read Article <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </RevealWrapper>
              )}

              {/* Grid of remaining posts */}
              {rest.length > 0 && (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post, i) => (
                    <RevealWrapper key={post.id} delay={(i % 3) * 90}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group flex h-full flex-col overflow-hidden rounded-card border border-brand-sand bg-white shadow-soft transition-shadow duration-300 hover:shadow-card"
                      >
                        <div className="relative aspect-video overflow-hidden">
                          {post.cover_image_url ? (
                            <Image
                              src={post.cover_image_url}
                              alt={post.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-brand-linen bg-glow-gold font-display text-2xl font-light italic text-brand-sand">
                              Mannequin Care
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-6">
                          {post.tags.length ? (
                            <div className="mb-2.5 flex flex-wrap gap-1.5">
                              {post.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-brand-gold-100 px-2.5 py-0.5 font-sub text-[10px] font-medium uppercase tracking-[0.1em] text-brand-copper"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          <h3 className="mb-2 line-clamp-2 font-display text-lg font-light leading-[1.3] text-brand-espresso transition-colors group-hover:text-brand-copper">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="mb-4 line-clamp-2 flex-1 font-body text-sm leading-[1.7] text-brand-body">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="mt-auto flex items-center justify-between font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
                            {post.published_at && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(post.published_at)}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {readingTime(post.content)} min
                            </span>
                          </div>
                        </div>
                      </Link>
                    </RevealWrapper>
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
