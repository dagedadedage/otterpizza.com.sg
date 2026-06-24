import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/lib/services/product-service";
import { checkAdminAuth } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId")
      ? Number(searchParams.get("categoryId"))
      : undefined;
    const search = searchParams.get("search") || undefined;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 50;

    const result = await ProductService.listProducts({
      categoryId,
      search,
      page,
      limit,
    });

    // Serialize tags for each product
    const serialized = {
      ...result,
      data: result.data.map((product) => ({
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
      })),
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    if (!body.sku || !body.name || !body.slug || !body.categoryId) {
      return NextResponse.json(
        { error: "Missing required fields: sku, name, slug, categoryId" },
        { status: 400 }
      );
    }

    if (typeof body.price !== "number" || body.price < 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    const product = await ProductService.createProduct({
      sku: body.sku,
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: Number(body.price),
      salePrice: body.salePrice ? Number(body.salePrice) : undefined,
      imageUrl: body.imageUrl,
      categoryId: Number(body.categoryId),
      inStock: body.inStock !== false,
      isFeatured: body.isFeatured === true,
      tags: body.tags || [],
      sortOrder: body.sortOrder || 0,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create product:", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A product with this SKU or slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
