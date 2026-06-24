import { NextRequest, NextResponse } from "next/server";
import { StoreService } from "@/lib/services/store-service";
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

    const store = await StoreService.updateStore(Number(id), {
      name: body.name,
      address: body.address,
      unit: body.unit,
      building: body.building,
      postalCode: body.postalCode,
      grabUrl: body.grabUrl,
      foodpandaUrl: body.foodpandaUrl,
      deliverooUrl: body.deliverooUrl,
      latitude: body.latitude !== undefined ? Number(body.latitude) : undefined,
      longitude: body.longitude !== undefined ? Number(body.longitude) : undefined,
      isActive: body.isActive,
      sortOrder: body.sortOrder,
    });

    return NextResponse.json(store);
  } catch (error: any) {
    console.error("Failed to update store:", error);
    if (error?.message === "Store not found") {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update store" },
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
    await StoreService.deleteStore(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete store:", error);
    if (error?.message === "Store not found") {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete store" },
      { status: 500 }
    );
  }
}
