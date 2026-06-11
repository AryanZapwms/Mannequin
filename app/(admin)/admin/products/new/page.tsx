import { dbConnect } from "@/lib/db/connect";
import { ProductCategory } from "@/lib/db/models/ProductCategory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createProduct } from "../actions";
import Link from "next/link";
import { ImageUpload } from "@/components/image-upload";

export default async function NewProductPage() {
  await dbConnect();
  const categoryDocs = await ProductCategory.find().sort({ name: 1 });

  const categories = categoryDocs.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    parent_id: c.parentId ? c.parentId.toString() : null,
  }));

  const mainCategories = categories.filter((category) => category.parent_id === null);
  const subCategories = categories.filter((category) => category.parent_id !== null);

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Add product</h1>
          <p className="text-sm text-muted-foreground">Create a new product and assign categories and pricing.</p>
        </div>
        <Link href="/admin/products" className="text-sm font-medium text-primary">
          Cancel
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createProduct} className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" placeholder="auto-generated if empty" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">Compare at price</Label>
                <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" name="stock" type="number" min="0" defaultValue="0" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mainCategoryId">Main category</Label>
                <select
                  id="mainCategoryId"
                  name="mainCategoryId"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select main category</option>
                  {mainCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subCategoryId">Sub category</Label>
                <select
                  id="subCategoryId"
                  name="subCategoryId"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Optional</option>
                  {subCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <ImageUpload
                name="thumbnailUrl"
                publicIdName="thumbnailPublicId"
                folder="products/thumbnails"
                label="Upload Thumbnail"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-7">
                <input id="isFeatured" name="isFeatured" type="checkbox" className="h-4 w-4" />
                <Label htmlFor="isFeatured" className="font-medium">
                  Feature this product
                </Label>
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Save product
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
