import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAuth } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where = includeInactive ? {} : { isActive: true };

    const promotions = await prisma.promotion.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Failed to fetch promotions:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    if (!body.name || body.minAmount === undefined || !body.type || body.value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, minAmount, type, value" },
        { status: 400 }
      );
    }

    const validTypes = ["FREE_DELIVERY", "PERCENTAGE_DISCOUNT", "FIXED_DISCOUNT"];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        {
          error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Duplicate check: same name + type + minAmount
    const existing = await prisma.promotion.findFirst({
      where: {
        name: body.name,
        type: body.type,
        minAmount: Number(body.minAmount),
      },
    });
    if (existing) {
      return NextResponse.json(
        {
          error: `A promotion "${body.name}" (${body.type}, $${body.minAmount}) already exists`,
        },
        { status: 409 }
      );
    }

    const promotion = await prisma.promotion.create({
      data: {
        name: body.name,
        description: body.description || null,
        minAmount: Number(body.minAmount),
        type: body.type,
        value: Number(body.value),
        isActive: body.isActive !== false,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
      },
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error("Failed to create promotion:", error);
    return NextResponse.json(
      { error: "Failed to create promotion" },
      { status: 500 }
    );
  }
}
