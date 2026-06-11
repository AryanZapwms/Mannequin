import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { dbConnect } from "@/lib/db/connect";
import { BlogPost } from "@/lib/db/models/BlogPost";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";

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

// Render plain-text content with basic paragraph splitting
function renderContent(content: string) {
  return content
    .split(/\n{2,}/)
    .map((para, i) => (
      <p key={i} className="leading-relaxed text-gray-700">
        {para.trim()}
      </p>
    ));
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

  const author = postDoc.authorId
    ? {
        display_name: (postDoc.authorId as any).displayName ?? null,
        avatar_url: (postDoc.authorId as any).avatarUrl ?? null,
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
    <div className="min-h-screen bg-white">
      {/* Cover image */}
      {post.cover_image_url && (
        <div className="relative h-64 w-full overflow-hidden md:h-96">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      <article className="container mx-auto max-w-3xl px-4 py-12">
        {/* Back */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Tags */}
        {tags.length ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* Title */}
        <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-4xl">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-gray-100 pb-6 text-sm text-gray-400">
          {author?.display_name && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                {author.display_name.charAt(0).toUpperCase()}
              </div>
              <span>{author.display_name}</span>
            </div>
          )}
          {post.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(
                new Date(post.published_at)
              )}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readingTime(post.content)} min read
          </span>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-8 text-lg font-medium leading-relaxed text-gray-600 border-l-4 border-amber-400 pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        {post.content ? (
          <div className="prose prose-gray max-w-none space-y-4 text-base">
            {renderContent(post.content)}
          </div>
        ) : (
          <p className="text-gray-400 italic">No content available.</p>
        )}
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50 py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">More Articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/blog/${rp.slug}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {rp.cover_image_url ? (
                      <Image
                        src={rp.cover_image_url}
                        alt={rp.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-amber-50 text-amber-300 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-5">
                    <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
                      {rp.title}
                    </h3>
                    {rp.excerpt && (
                      <p className="line-clamp-2 text-xs text-gray-500">{rp.excerpt}</p>
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
