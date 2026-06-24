import { NextRequest, NextResponse } from "next/server";
import { StoreService } from "@/lib/services/store-service";
import { checkAdminAuth } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const stores = await StoreService.listStores(includeInactive);
    return NextResponse.json(stores);
  } catch (error) {
    console.error("Failed to fetch stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    if (!body.name || !body.address || !body.unit || !body.building || !body.postalCode) {
      return NextResponse.json(
        { error: "Missing required fields: name, address, unit, building, postalCode" },
        { status: 400 }
      );
    }

    const store = await StoreService.createStore({
      name: body.name,
      address: body.address,
      unit: body.unit,
      building: body.building,
      postalCode: body.postalCode,
      grabUrl: body.grabUrl,
      foodpandaUrl: body.foodpandaUrl,
      deliverooUrl: body.deliverooUrl,
      latitude: body.latitude ? Number(body.latitude) : undefined,
      longitude: body.longitude ? Number(body.longitude) : undefined,
      isActive: body.isActive !== false,
      sortOrder: body.sortOrder || 0,
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error("Failed to create store:", error);
    return NextResponse.json(
      { error: "Failed to create store" },
      { status: 500 }
    );
  }
}
