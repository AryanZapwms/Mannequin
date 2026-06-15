import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://mannequincare.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/account", "/cart", "/checkout", "/orders", "/wishlist", "/auth"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
