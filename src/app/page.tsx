import Link from "next/link";
import { ArrowRight, MapPin, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/menu/ProductCard";
import { PromoBanner } from "@/components/home/PromoBanner";

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

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-cream to-warm-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-primary/15" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-primary/20" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center py-20">
          {/* Large circular brand container */}
          <div className="mx-auto mb-8 w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-primary to-primary-hover shadow-xl flex items-center justify-center ring-4 ring-primary/20">
            <div className="text-center px-4">
              <span className="block text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                OTTER
              </span>
              <span className="block text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                PIZZA
              </span>
            </div>
          </div>

          <h1 className="sr-only">Otter Pizza - Singapore&apos;s Neighbourhood Pizzeria</h1>

          <p className="mt-6 text-lg sm:text-xl text-muted max-w-xl mx-auto leading-relaxed">
            Singapore&apos;s Neighbourhood Pizzeria
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="primary" size="lg" asChild>
              <Link href="/order">
                <ShoppingBag className="h-5 w-5" />
                Order Online
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/menu">
                View Menu
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/locate-us">
                <MapPin className="h-5 w-5" />
                Locate Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <PromoBanner />

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-16 sm:py-20 bg-warm-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-dark">
                  Featured Favourites
                </h2>
                <p className="mt-2 text-muted">
                  Our most loved pizzas, handpicked for you
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/menu">
                  View Full Menu
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
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
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-20 bg-cream">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-dark">
            Ready to Order?
          </h2>
          <p className="mt-3 text-muted max-w-lg mx-auto">
            Fresh, handcrafted pizzas made with quality ingredients. Order online for delivery or pickup.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="primary" size="lg" asChild>
              <Link href="/order">
                <ShoppingBag className="h-5 w-5" />
                Order Now
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/menu">
                Browse Menu
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
