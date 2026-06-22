import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/lib/services/product-service";
import { checkAdminAuth } from "@/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const product = await ProductService.getProduct(Number(id));
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      ...product,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
    });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();

    const product = await ProductService.updateProduct(Number(id), {
      sku: body.sku,
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: body.price !== undefined ? Number(body.price) : undefined,
      salePrice:
        body.salePrice !== undefined
          ? body.salePrice !== null
            ? Number(body.salePrice)
            : null
          : undefined,
      imageUrl: body.imageUrl,
      categoryId: body.categoryId,
      inStock: body.inStock,
      isFeatured: body.isFeatured,
      tags: body.tags,
      sortOrder: body.sortOrder,
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Failed to update product:", error);
    if (error?.message === "Product not found") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A product with this SKU or slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    await ProductService.deleteProduct(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    if (error?.message === "Product not found") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
