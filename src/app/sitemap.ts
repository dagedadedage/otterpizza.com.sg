import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.otterpizza.com.sg";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/menu`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/order`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/locate-us`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Product pages with images
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { inStock: true },
      select: { slug: true, updatedAt: true, imageUrl: true, name: true },
    });
    productPages = products
      .filter((p) => p.slug !== "testing-05") // exclude test products
      .map((p) => ({
        url: `${baseUrl}/menu/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        images: p.imageUrl
          ? [`${baseUrl}${encodeURI(p.imageUrl)}`]
          : undefined,
      }));
  } catch {
    // Sitemap generation should never break the build
  }

  // Category landing pages
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true },
    });
    categoryPages = categories.map((c) => ({
      url: `${baseUrl}/order?category=${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Sitemap generation should never break the build
  }

  return [...staticPages, ...productPages, ...categoryPages];
}
