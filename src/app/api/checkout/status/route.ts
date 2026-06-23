import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("order");

  if (!orderNumber) {
    return NextResponse.json({ error: "Missing order number" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: { status: true, paymentStatus: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: order.status,
      paymentStatus: order.paymentStatus,
    });
  } catch {
    return NextResponse.json({ status: "PENDING", paymentStatus: "pending" });
  }
}
