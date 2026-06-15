import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { dbConnect } from "@/lib/db/connect";
import { BlogPost } from "@/lib/db/models/BlogPost";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import MarkdownContent from "@/components/blog/MarkdownContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const data = await BlogPost.findOne({ slug, status: "published" }).select(
    "title excerpt coverImageUrl",
  );

  if (!data) return { title: "Post Not Found" };

  return {
    title: `${data.title} | Mannequin Care Blog`,
    description: data.excerpt ?? data.title,
    openGraph: {
      title: data.title,
      description: data.excerpt ?? data.title,
      images: data.coverImageUrl ? [data.coverImageUrl] : [],
    },
  };
}

function readingTime(content: string | null): number {
  if (!content) return 1;
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await dbConnect();

  const postDoc = await BlogPost.findOne({ slug, status: "published" }).populate(
    "authorId",
    "displayName avatarUrl",
  );

  if (!postDoc) notFound();

  const post = {
    id: postDoc._id.toString(),
    title: postDoc.title,
    slug: postDoc.slug,
    excerpt: postDoc.excerpt ?? null,
    content: postDoc.content ?? null,
    cover_image_url: postDoc.coverImageUrl ?? null,
    published_at: postDoc.publishedAt ? postDoc.publishedAt.toISOString() : null,
    tags: postDoc.tags ?? [],
  };

  const populatedAuthor = postDoc.authorId as unknown as {
    displayName?: string | null;
    avatarUrl?: string | null;
  } | null;

  const author = populatedAuthor
    ? {
        display_name: populatedAuthor.displayName ?? null,
        avatar_url: populatedAuthor.avatarUrl ?? null,
      }
    : null;

  // Fetch related posts (most recent, excluding this one)
  const relatedDocs = await BlogPost.find({ status: "published", slug: { $ne: slug } })
    .sort({ publishedAt: -1 })
    .limit(3);

  const related = relatedDocs.map((rp) => ({
    id: rp._id.toString(),
    title: rp.title,
    slug: rp.slug,
    excerpt: rp.excerpt ?? null,
    cover_image_url: rp.coverImageUrl ?? null,
    published_at: rp.publishedAt ? rp.publishedAt.toISOString() : null,
  }));

  const tags = post.tags;

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Cover image */}
      {post.cover_image_url && (
        <div className="relative h-72 w-full overflow-hidden md:h-[420px]">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/55 via-brand-espresso/10 to-transparent" />
        </div>
      )}

      <article
        className={`container mx-auto max-w-3xl px-6 pb-16 ${
          post.cover_image_url ? "pt-10" : "pt-[clamp(40px,6vw,72px)]"
        }`}
      >
        {/* Back */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 font-sub text-xs font-medium uppercase tracking-[0.12em] text-brand-mocha transition-colors hover:text-brand-copper"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Journal
        </Link>

        {/* Tags */}
        {tags.length ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold-100 px-3 py-1 font-sub text-[10px] font-medium uppercase tracking-[0.12em] text-brand-copper"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* Title */}
        <h1 className="mb-5 font-display text-[clamp(2rem,4vw,3rem)] font-light leading-[1.12] text-brand-espresso">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-5 border-b border-brand-sand pb-6 font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
          {author?.display_name && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold-100 font-sub text-xs font-semibold text-brand-copper">
                {author.display_name.charAt(0).toUpperCase()}
              </div>
              <span className="normal-case tracking-normal">
                {author.display_name}
              </span>
            </div>
          )}
          {post.published_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(
                new Date(post.published_at)
              )}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {readingTime(post.content)} min read
          </span>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-8 border-l-2 border-brand-gold-400 pl-5 font-display text-xl font-light italic leading-[1.5] text-brand-body">
            {post.excerpt}
          </p>
        )}

        {/* Content — drop a leading H1 so it doesn't duplicate the title above */}
        {post.content ? (
          <MarkdownContent
            content={post.content.replace(/^﻿?\s*#\s+.*(?:\r?\n)+/, "")}
          />
        ) : (
          <p className="font-body italic text-brand-mocha">No content available.</p>
        )}
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="border-t border-brand-sand bg-brand-linen py-16">
          <div className="container mx-auto max-w-[1160px] px-6">
            <p className="mb-2 flex items-center gap-2 font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
              <span aria-hidden className="text-brand-gold-500">
                ✦
              </span>
              Keep Reading
            </p>
            <h2 className="mb-8 font-display text-heading font-light italic text-brand-espresso">
              More Articles
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/blog/${rp.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-card border border-brand-sand bg-white shadow-soft transition-shadow duration-300 hover:shadow-card"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {rp.cover_image_url ? (
                      <Image
                        src={rp.cover_image_url}
                        alt={rp.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-brand-linen bg-glow-gold font-display text-xl font-light italic text-brand-sand">
                        Mannequin Care
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-2 line-clamp-2 font-display text-base font-light leading-[1.3] text-brand-espresso transition-colors group-hover:text-brand-copper">
                      {rp.title}
                    </h3>
                    {rp.excerpt && (
                      <p className="line-clamp-2 font-body text-sm leading-[1.7] text-brand-body">
                        {rp.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
