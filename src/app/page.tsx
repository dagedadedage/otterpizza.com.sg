import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/menu/ProductCard";
import { ScooterHero } from "@/components/home/ScooterHero";

export const metadata: Metadata = {
  title: "Singapore Neighbourhood Pizzeria | Otter Pizza",
  description:
    "Fresh, handcrafted pizzas for delivery and pickup in Singapore. Browse our menu, order online, and enjoy neighbourhood pizza at its best.",
  openGraph: {
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Otter Pizza — Singapore's Neighbourhood Pizzeria",
      },
    ],
  },
};

function serializeDecimal(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  if (value && typeof (value as { toNumber: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

type FeaturedProduct = {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  tags: string[];
  inStock: boolean;
};

async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { inStock: true, isFeatured: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
    });
    return products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: serializeDecimal(p.price),
      salePrice: p.salePrice ? serializeDecimal(p.salePrice) : null,
      imageUrl: p.imageUrl,
      tags: parseTags(p.tags),
      inStock: p.inStock,
    }));
  } catch {
    return [];
  }
}

export const revalidate = 60; // refresh featured products every 60s

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div className="flex flex-col">
      <ScooterHero />

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-dark">
                Featured Favourites
              </h2>
              <p className="mt-2 text-muted text-sm">
                Our most loved pizzas, handpicked for you
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  sku={product.sku}
                  name={product.name}
                  slug={product.slug}
                  description={product.description}
                  price={product.price}
                  salePrice={product.salePrice}
                  imageUrl={product.imageUrl}
                  tags={product.tags}
                  inStock={product.inStock}
                />
              ))}
            </div>

            <div className="text-center mt-10">
              <Button variant="ghost" size="md" asChild>
                <Link href="/order">
                  View Full Menu
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-16 bg-gold">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-dark">
            Ready to Order?
          </h2>
          <p className="mt-2 text-dark/70 text-sm max-w-md mx-auto">
            Fresh, handcrafted pizzas made with quality ingredients.
            Order online for delivery or pickup.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="primary" size="lg" className="!bg-white !text-dark hover:!bg-primary-light hover:!text-primary" asChild>
              <Link href="/order">Order Now</Link>
            </Button>
            <Button variant="primary" size="lg" className="!bg-white !text-dark hover:!bg-primary-light hover:!text-primary" asChild>
              <Link href="/menu">Browse Menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Restaurant structured data (homepage only) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            name: "Otter Pizza",
            description:
              "Singapore's neighbourhood pizzeria — fresh, handcrafted pizzas for delivery and pickup.",
            url: "https://otterpizza.com.sg",
            logo: "https://otterpizza.com.sg/images/logo.png",
            image: "https://otterpizza.com.sg/images/logo.png",
            servesCuisine: "Pizza",
            priceRange: "$$",
            address: {
              "@type": "PostalAddress",
              streetAddress: "35 Tuas Bay Walk, #00-00 Westview Food Factory",
              addressLocality: "Singapore",
              postalCode: "636981",
              addressCountry: "SG",
            },
            contactPoint: {
              "@type": "ContactPoint",
              email: "admin@otterpizza.com.sg",
              contactType: "customer service",
            },
            sameAs: [
              "https://www.instagram.com/otterpizzasg",
              "https://www.facebook.com/otterpizzasg",
            ],
          }),
        }}
      />
    </div>
  );
}
