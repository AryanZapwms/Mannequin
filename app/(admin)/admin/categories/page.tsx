import Link from "next/link";
import { dbConnect } from "@/lib/db/connect";
import { ProductCategory } from "@/lib/db/models/ProductCategory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory, deleteCategory } from "./actions";
import { Edit2, Plus, Trash2 } from "lucide-react";

async function removeCategory(formData: FormData) {
  "use server";
  const categoryId = formData.get("categoryId");
  if (typeof categoryId !== "string" || categoryId.length === 0) {
    throw new Error("Category id is required");
  }
  await deleteCategory(categoryId);
}

export default async function CategoriesPage() {
  await dbConnect();
  const categoryDocs = await ProductCategory.find().sort({ name: 1 });

  const categories = categoryDocs.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    parent_id: c.parentId ? c.parentId.toString() : null,
  }));
  const mainCategories = categories.filter((category) => category.parent_id === null);
  const subCategoriesByParent = categories.reduce<Record<string, typeof categories>>((acc, category) => {
    if (!category.parent_id) return acc;
    acc[category.parent_id] = acc[category.parent_id] || [];
    acc[category.parent_id].push(category);
    return acc;
  }, {});

  return (
    <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <Card className="order-2 lg:order-1">
        <CardHeader>
          <CardTitle>Existing categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {mainCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          ) : (
            <div className="space-y-4">
              {mainCategories.map((category) => (
                <div key={category.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold">{category.name}</p>
                      <p className="text-xs text-muted-foreground">Slug: {category.slug}</p>
                      {category.description ? (
                        <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/categories/${category.id}`} className="inline-flex">
                        <Button variant="outline" size="icon" aria-label={`Edit ${category.name}`}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={removeCategory}>
                        <input type="hidden" name="categoryId" value={category.id} />
                        <Button variant="destructive" size="icon" aria-label={`Delete ${category.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                  {subCategoriesByParent[category.id]?.length ? (
                    <div className="mt-4 space-y-2 rounded-lg border bg-muted/40 p-3">
                      {subCategoriesByParent[category.id].map((subCategory) => (
                        <div key={subCategory.id} className="flex items-center justify-between gap-4 rounded-md bg-background px-3 py-2">
                          <div>
                            <p className="text-sm font-medium">{subCategory.name}</p>
                            <p className="text-xs text-muted-foreground">Slug: {subCategory.slug}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Link href={`/admin/categories/${subCategory.id}`} className="inline-flex">
                              <Button variant="ghost" size="icon" aria-label={`Edit ${subCategory.name}`}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <form action={removeCategory}>
                              <input type="hidden" name="categoryId" value={subCategory.id} />
                              <Button variant="ghost" size="icon" aria-label={`Delete ${subCategory.name}`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="order-1 lg:order-2">
        <CardHeader>
          <CardTitle>Add category</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Skincare" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" placeholder="skincare" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Optional description"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">Parent category</Label>
              <select id="parentId" name="parentId" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Main category</option>
                {mainCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Save category
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
