import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const existing = await prisma.promotion.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.minAmount !== undefined)
      updateData.minAmount = Number(body.minAmount);
    if (body.type !== undefined) {
      const validTypes = ["FREE_DELIVERY", "PERCENTAGE_DISCOUNT", "FIXED_DISCOUNT"];
      if (!validTypes.includes(body.type)) {
        return NextResponse.json(
          {
            error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updateData.type = body.type;
    }
    if (body.value !== undefined) updateData.value = Number(body.value);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.startsAt !== undefined)
      updateData.startsAt = body.startsAt ? new Date(body.startsAt) : null;
    if (body.endsAt !== undefined)
      updateData.endsAt = body.endsAt ? new Date(body.endsAt) : null;

    const promotion = await prisma.promotion.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error("Failed to update promotion:", error);
    return NextResponse.json(
      { error: "Failed to update promotion" },
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
    const existing = await prisma.promotion.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      );
    }

    await prisma.promotion.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete promotion:", error);
    return NextResponse.json(
      { error: "Failed to delete promotion" },
      { status: 500 }
    );
  }
}
