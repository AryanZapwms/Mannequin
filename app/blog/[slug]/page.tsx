import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, excerpt, cover_image_url")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) return { title: "Post Not Found" };

  return {
    title: `${data.title} | Mannequin Care Blog`,
    description: data.excerpt ?? data.title,
    openGraph: {
      title: data.title,
      description: data.excerpt ?? data.title,
      images: data.cover_image_url ? [data.cover_image_url] : [],
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
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, content, cover_image_url, published_at, tags, author:author_id(display_name, avatar_url)"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!post) notFound();

  // Fetch related posts (same tags or recent)
  const { data: related } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image_url, published_at")
    .eq("status", "published")
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(3);

  const author = post.author as { display_name: string | null; avatar_url: string | null } | null;
  const tags = post.tags as string[] | null;

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
        {tags?.length ? (
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
      {(related ?? []).length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50 py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">More Articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(related ?? []).map((rp) => (
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
