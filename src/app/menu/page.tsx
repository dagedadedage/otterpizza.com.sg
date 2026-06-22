import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/utils";
import { MenuPageClient } from "@/components/menu/MenuPageClient";

type SerializedProduct = {
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

type SerializedCategory = {
  id: number;
  name: string;
  slug: string;
  products: SerializedProduct[];
};

function serializeDecimal(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  if (value && typeof (value as { toNumber: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

async function getMenuData(): Promise<SerializedCategory[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { products: { some: { inStock: true } } },
      include: {
        products: {
          where: { inStock: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      products: cat.products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: serializeDecimal(p.price),
        salePrice: p.salePrice ? serializeDecimal(p.salePrice) : null,
        imageUrl: p.imageUrl,
        tags: parseTags(p.tags),
        inStock: p.inStock,
      })),
    }));
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Our Menu",
  description:
    "Browse Otter Pizza's full menu — Classic, Premium, and Specialty pizzas, plus sides and drinks. Order online for delivery or pickup.",
};

export default async function MenuPage() {
  const categories = await getMenuData();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-dark tracking-tight">
            Our Menu
          </h1>
          <p className="mt-3 text-muted max-w-xl mx-auto">
            Handcrafted with fresh ingredients. Every pizza is made to order with love.
          </p>
        </div>

        <MenuPageClient categories={categories} />
      </div>
    </div>
  );
}
