import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pizza } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, parseTags } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/product/AddToCartButton";

function getTagVariant(
  tag: string
): "default" | "signature" | "sale" | "mustTry" {
  const lower = tag.toLowerCase();
  if (lower === "signature") return "signature";
  if (lower === "must-try" || lower === "musttry") return "mustTry";
  if (lower === "sale") return "sale";
  return "default";
}

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    select: { slug: true },
  });
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, imageUrl: true },
  });

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.description || `${product.name} — Otter Pizza`,
    alternates: {
      canonical: `/menu/${slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.description || `${product.name} — Otter Pizza`,
      images: product.imageUrl ? [{ url: product.imageUrl }] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  const numericPrice = Number(product.price);
  const numericSalePrice = product.salePrice
    ? Number(product.salePrice)
    : null;
  const hasSale =
    numericSalePrice != null && numericSalePrice < numericPrice;
  const currentPrice = hasSale ? numericSalePrice : numericPrice;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/order"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Order
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product image */}
          <div className="aspect-[15/10] rounded-2xl bg-cream flex items-center justify-center overflow-hidden border border-border">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Pizza className="h-24 w-24 text-muted/30" />
            )}
          </div>

          {/* Product details */}
          <div className="flex flex-col">
            {/* Category label */}
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              {product.category.name}
            </span>

            {/* Product name */}
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-dark leading-tight">
              <span className="text-muted font-medium">{product.sku}</span>{" "}
              {product.name}
            </h1>

            {/* Tags */}
            {(() => {
              const tags = parseTags(product.tags);
              return tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant={getTagVariant(tag)}>
                    {tag}
                  </Badge>
                ))}
              </div>
              );
            })()}

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-primary">
                {formatPrice(currentPrice!)}
              </span>
              {hasSale && (
                <span className="text-lg text-muted line-through">
                  {formatPrice(numericPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-dark uppercase tracking-wider">
                  Ingredients
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Stock status */}
            <div className="mt-4">
              {product.inStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  In Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-3 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Add to Cart */}
            <div className="mt-8 pt-6 border-t border-border">
              <AddToCartButton
                productId={product.id}
                name={product.name}
                price={currentPrice!}
                imageUrl={product.imageUrl}
                showQuantity
                size="lg"
                inStock={product.inStock}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description || "",
            image: product.imageUrl || "https://otterpizza.com.sg/images/logo.png",
            sku: product.sku,
            offers: {
              "@type": "Offer",
              price: currentPrice,
              priceCurrency: "SGD",
              availability: product.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          }),
        }}
      />

      {/* BreadcrumbList structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://otterpizza.com.sg",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Menu",
                item: "https://otterpizza.com.sg/order",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: product.name,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
