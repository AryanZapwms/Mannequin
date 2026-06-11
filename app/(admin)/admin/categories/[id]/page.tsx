import { notFound } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/db/connect";
import { ProductCategory } from "@/lib/db/models/ProductCategory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateCategory } from "../actions";

export default async function EditCategoryPage({ 
     params 
   }: { 
     params: Promise<{ id: string }> 
   }) {
     const { id } = await params;

     await dbConnect();
     const [categoryDoc, categoryDocs] = await Promise.all([
       ProductCategory.findById(id),
       ProductCategory.find().sort({ name: 1 }),
     ]);

     if (!categoryDoc) {
       notFound();
     }

     const category = {
       id: categoryDoc._id.toString(),
       name: categoryDoc.name,
       slug: categoryDoc.slug,
       description: categoryDoc.description ?? null,
       parent_id: categoryDoc.parentId ? categoryDoc.parentId.toString() : null,
     };

     const categories = categoryDocs.map((c) => ({
       id: c._id.toString(),
       name: c.name,
       parent_id: c.parentId ? c.parentId.toString() : null,
     }));

     const mainCategories = categories.filter((item) => item.parent_id === null && item.id !== category.id);

     async function submit(formData: FormData) {
       "use server";
       await updateCategory(id, formData);
     }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Edit category</h1>
          <p className="text-sm text-muted-foreground">Adjust hierarchy, naming, or descriptions.</p>
        </div>
        <Link href="/admin/categories" className="text-sm font-medium text-primary">
          Back to categories
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Category details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={category.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={category.slug ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={category.description ?? ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">Parent category</Label>
              <select
                id="parentId"
                name="parentId"
                defaultValue={category.parent_id ?? ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Main category</option>
                {mainCategories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit">Save changes</Button>
              <Link href="/admin/categories" className="text-sm font-medium text-muted-foreground">
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
