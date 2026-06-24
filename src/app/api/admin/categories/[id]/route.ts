import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/lib/services/product-service";
import { checkAdminAuth } from "@/lib/admin-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();

    const category = await ProductService.updateCategory(Number(id), {
      name: body.name,
      slug: body.slug,
      sortOrder: body.sortOrder,
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Failed to update category:", error);
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    await ProductService.deleteCategory(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    if (error?.message?.includes("Cannot delete category")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
