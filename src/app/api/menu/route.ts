import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 8;

    // Featured/high-value products for cart upsell
    if (featured === "true") {
      const skip = (page - 1) * limit;
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: { inStock: true },
          orderBy: { price: "desc" },
          skip,
          take: limit,
        }),
        prisma.product.count({ where: { inStock: true } }),
      ]);
      const serialized = products.map((p) => ({
        ...p, price: Number(p.price), salePrice: p.salePrice ? Number(p.salePrice) : null,
      }));
      return NextResponse.json({ products: serialized, total, page, limit, hasMore: skip + limit < total });
    }

    const categories = await prisma.category.findMany({
      include: {
        products: {
          where: { inStock: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const serialized = categories.map((category) => ({
      ...category,
      products: category.products.map((product) => ({
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
      })),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 },
    );
  }
}
