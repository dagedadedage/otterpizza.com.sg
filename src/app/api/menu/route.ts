import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          where: { inStock: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Convert Decimal fields to numbers for JSON serialization
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
