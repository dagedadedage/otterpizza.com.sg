import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/services/order-service";
import { checkAdminAuth } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const storeId = searchParams.get("storeId")
      ? Number(searchParams.get("storeId"))
      : undefined;
    const search = searchParams.get("search") || undefined;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const result = await OrderService.listOrders({
      status,
      storeId,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list orders:", error);
    return NextResponse.json(
      { error: "Failed to list orders" },
      { status: 500 }
    );
  }
}
