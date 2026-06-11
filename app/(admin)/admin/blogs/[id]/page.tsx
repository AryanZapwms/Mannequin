import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db/connect";
import { BlogPost } from "@/lib/db/models/BlogPost";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updatePost } from "../actions";
import { MarkdownEditor } from "@/components/markdown-editor";
import { ImageUpload } from "@/components/image-upload";

export default async function EditBlogPostPage({
   params 
  }: { 
    params: Promise<{ id: string }>
  
  }) {
    const { id } = await params;
  await dbConnect();
  const postDoc = await BlogPost.findById(id).select(
    "title slug excerpt content coverImageUrl status"
  );

  if (!postDoc) {
    notFound();
  }

  const post = {
    id: postDoc._id.toString(),
    title: postDoc.title,
    slug: postDoc.slug,
    excerpt: postDoc.excerpt ?? null,
    content: postDoc.content ?? null,
    cover_image_url: postDoc.coverImageUrl ?? null,
    status: postDoc.status,
  };

  async function submit(formData: FormData) {
    "use server";
    await updatePost(id, formData);
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Edit post</h1>
          <p className="text-sm text-muted-foreground">Refine content or adjust publication status.</p>
        </div>
        <Link href="/admin/blogs" className="text-sm font-medium text-primary">
          Back to posts
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Post content</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={post.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={post.slug} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                defaultValue={post.excerpt ?? ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Content (Markdown)</Label>
              <MarkdownEditor
                name="content"
                defaultValue={post.content ?? ""}
                rows={18}
              />
            </div>
            <div className="space-y-2">
              <Label>Cover image</Label>
              <ImageUpload
                name="coverImageUrl"
                publicIdName="coverImagePublicId"
                defaultValue={post.cover_image_url ?? ""}
                folder="blogs/covers"
                ownerType="blog"
                ownerId={post.id}
                label="Upload Cover"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={post.status ?? "draft"}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
