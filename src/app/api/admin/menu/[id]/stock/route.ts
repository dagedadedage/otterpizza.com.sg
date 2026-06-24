import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/lib/services/product-service";
import { checkAdminAuth } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const product = await ProductService.toggleStock(Number(id));
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Failed to toggle stock:", error);
    if (error?.message === "Product not found") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to toggle stock" },
      { status: 500 }
    );
  }
}
