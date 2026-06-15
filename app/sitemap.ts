import type { MetadataRoute } from "next";
import { dbConnect } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { BlogPost } from "@/lib/db/models/BlogPost";

const BASE_URL =
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://mannequincare.in";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" },
  { path: "/about-us", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact-us", priority: 0.5, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" },
  { path: "/returns", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await dbConnect();

  const [products, posts] = await Promise.all([
    Product.find({ status: "active" }, { slug: 1, updatedAt: 1 }).lean(),
    BlogPost.find({ status: "published" }, { slug: 1, updatedAt: 1 }).lean(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: product.updatedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...productEntries, ...blogEntries];
}
