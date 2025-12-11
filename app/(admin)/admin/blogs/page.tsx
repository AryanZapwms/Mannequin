import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deletePost } from "./actions";
import { Edit2, Plus, Trash2 } from "lucide-react";

async function removePost(formData: FormData) {
  "use server";
  const postId = formData.get("postId");
  if (typeof postId !== "string") {
    throw new Error("Post id is required");
  }
  await deletePost(postId);
}

export default async function BlogsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status, published_at, updated_at")
    .order("created_at", { ascending: false });

  const posts = data ?? [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Blog</h1>
          <p className="text-sm text-muted-foreground">Publish news, guides, and announcements.</p>
        </div>
        <Link href="/admin/blogs/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Write post
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-3 pr-4">Title</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Published</th>
                <th className="py-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No posts yet.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="text-sm">
                    <td className="py-3 pr-4">
                      <div className="font-semibold">{post.title}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{post.slug}</td>
                    <td className="py-3 px-4 capitalize">{post.status}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {post.published_at
                        ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(post.published_at))
                        : "—"}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/blogs/${post.id}`} className="inline-flex">
                          <Button variant="outline" size="icon" aria-label={`Edit ${post.title}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form action={removePost}>
                          <input type="hidden" name="postId" value={post.id} />
                          <Button variant="destructive" size="icon" aria-label={`Delete ${post.title}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}
