import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/lib/services/product-service";
import { checkAdminAuth } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const categories = await ProductService.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug" },
        { status: 400 }
      );
    }

    const category = await ProductService.createCategory({
      name: body.name,
      slug: body.slug,
      sortOrder: body.sortOrder || 0,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create category:", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
