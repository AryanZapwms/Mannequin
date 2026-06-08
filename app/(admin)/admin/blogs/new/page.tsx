import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createPost } from "../actions";
import { MarkdownEditor } from "@/components/markdown-editor";
import { ImageUpload } from "@/components/image-upload";

export default async function NewBlogPostPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Write a post</h1>
          <p className="text-sm text-muted-foreground">Share updates, news, or educational content.</p>
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
          <form action={createPost} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" placeholder="auto-generated if empty" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Content (Markdown)</Label>
              <MarkdownEditor
                name="content"
                placeholder="Write your post in Markdown…"
                rows={18}
              />
            </div>
            <div className="space-y-2">
              <Label>Cover image</Label>
              <ImageUpload
                name="coverImageUrl"
                bucket="blog-images"
                folder="covers"
                label="Upload Cover"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Publish
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
