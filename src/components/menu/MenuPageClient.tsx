"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/menu/ProductCard";

interface ProductData {
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
}

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  products: ProductData[];
}

interface MenuPageClientProps {
  categories: CategoryData[];
}

export function MenuPageClient({ categories }: MenuPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const tabs = useMemo(
    () => [
      { slug: "all", name: "All" },
      ...categories.map((c) => ({ slug: c.slug, name: c.name })),
    ],
    [categories]
  );

  const allProducts = useMemo(
    () => categories.flatMap((c) => c.products),
    [categories]
  );

  const displayedProducts = useMemo(() => {
    if (activeCategory === "all") return allProducts;
    const category = categories.find((c) => c.slug === activeCategory);
    return category?.products ?? [];
  }, [activeCategory, categories, allProducts]);

  return (
    <div>
      {/* Category filter tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.slug}
            type="button"
            onClick={() => setActiveCategory(tab.slug)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              activeCategory === tab.slug
                ? "bg-primary text-white shadow-sm"
                : "bg-cream text-muted hover:bg-primary-light hover:text-primary"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {displayedProducts.length > 0 ? (
        activeCategory === "all" ? (
          /* Group by category with dividers */
          <div className="space-y-10">
            {categories.map((cat) => (
              <section key={cat.id}>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-lg font-bold text-dark shrink-0">{cat.name}</h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {cat.products.map((product) => (
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
              </section>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {displayedProducts.map((product) => (
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
        )
      ) : (
        <div className="text-center py-16">
          <p className="text-muted text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
