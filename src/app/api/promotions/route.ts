import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        OR: [
          { startsAt: null },
          { startsAt: { lte: new Date() } },
        ],
        AND: [
          { endsAt: null },
          { endsAt: { gte: new Date() } },
        ],
      },
      orderBy: { minAmount: "asc" },
    });

    const serialized = promotions.map((promo) => ({
      ...promo,
      minAmount: Number(promo.minAmount),
      value: Number(promo.value),
      startsAt: promo.startsAt?.toISOString() ?? null,
      endsAt: promo.endsAt?.toISOString() ?? null,
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("Failed to fetch promotions:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotions" },
      { status: 500 },
    );
  }
}
