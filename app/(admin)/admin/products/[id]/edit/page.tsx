import { notFound } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { ProductCategory } from "@/lib/db/models/ProductCategory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProduct } from "../../actions"; 
import { ImageUpload } from "@/components/image-upload";
import { GalleryUpload } from "@/components/gallery-upload";

export default async function EditProductPage({
  params
}: {
  params: Promise<{ id: string }>

}) {
  const { id } = await params;
  await dbConnect();
  const [productDoc, categoryDocs] = await Promise.all([
    Product.findById(id),
    ProductCategory.find().sort({ name: 1 }),
  ]);

  if (!productDoc) {
    notFound();
  }

  const product = {
    id: productDoc._id.toString(),
    name: productDoc.name,
    slug: productDoc.slug,
    description: productDoc.description ?? null,
    sku: productDoc.sku ?? null,
    price: productDoc.price,
    compare_at_price: productDoc.compareAtPrice ?? null,
    stock: productDoc.stock,
    main_category_id: productDoc.mainCategoryId ? productDoc.mainCategoryId.toString() : "",
    sub_category_id: productDoc.subCategoryId ? productDoc.subCategoryId.toString() : "",
    status: productDoc.status,
    is_featured: productDoc.isFeatured,
    thumbnail_url: productDoc.thumbnailUrl ?? null,
    thumbnail_public_id: productDoc.thumbnailPublicId ?? null,
    media: [...(productDoc.media ?? [])]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        url: item.url,
        publicId: item.publicId ?? null,
        altText: item.altText ?? null,
      })),
  };

  const categories = categoryDocs.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    parent_id: c.parentId ? c.parentId.toString() : null,
  }));

  const mainCategories = categories.filter((category) => category.parent_id === null);
  const subCategories = categories.filter((category) => category.parent_id !== null);

  async function handleSubmit(formData: FormData) {
    "use server";
    await updateProduct(id, formData);
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Edit product</h1>
          <p className="text-sm text-muted-foreground">Update product information and availability.</p>
        </div>
        <Link href="/admin/products" className="text-sm font-medium text-primary">
          Back to products
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={product.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" defaultValue={product.slug} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={5}
                defaultValue={product.description ?? ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={product.price ?? 0} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">Compare at price</Label>
                <Input
                  id="compareAtPrice"
                  name="compareAtPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.compare_at_price ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" name="stock" type="number" min="0" defaultValue={product.stock ?? 0} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mainCategoryId">Main category</Label>
                <select
                  id="mainCategoryId"
                  name="mainCategoryId"
                  defaultValue={product.main_category_id ?? ""}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  defaultValue={product.sub_category_id ?? ""}
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
              <Input id="sku" name="sku" defaultValue={product.sku ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <ImageUpload
                name="thumbnailUrl"
                publicIdName="thumbnailPublicId"
                defaultValue={product.thumbnail_url ?? ""}
                defaultPublicId={product.thumbnail_public_id ?? ""}
                folder="products/thumbnails"
                ownerType="product"
                ownerId={product.id}
                label="Upload Thumbnail"
              />
            </div>
            <div className="space-y-2">
              <Label>Gallery images</Label>
              <p className="text-xs text-muted-foreground">
                Additional images shown on the product page alongside the thumbnail.
              </p>
              <GalleryUpload
                name="media"
                defaultValue={product.media}
                folder="products/media"
                ownerType="product"
                ownerId={product.id}
                label="Add Images"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={product.status ?? "draft"}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-7">
                <input
                  id="isFeatured"
                  name="isFeatured"
                  type="checkbox"
                  defaultChecked={product.is_featured}
                  className="h-4 w-4"
                />
                <Label htmlFor="isFeatured" className="font-medium">
                  Feature this product
                </Label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit">Update product</Button>
              <Link href="/admin/products" className="text-sm font-medium text-muted-foreground">
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}