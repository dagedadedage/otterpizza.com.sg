import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentStatus } from "@/lib/hitpay";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("order");

  if (!orderNumber) {
    return NextResponse.json({ error: "Missing order number" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true, status: true, paymentStatus: true, paymentId: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If order is still PENDING and has a paymentId, check HitPay directly
    if (order.status === "PENDING" && order.paymentId) {
      try {
        const hitpay = await getPaymentStatus(order.paymentId);
        if (["completed", "succeeded", "paid"].includes(hitpay.status)) {
          // Webhook missed — update order now
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "PAID", paymentStatus: "completed" },
          });
          await prisma.orderStatusLog.create({
            data: {
              orderId: order.id,
              fromStatus: "PENDING",
              toStatus: "PAID",
              changedBy: 0,
              note: "Payment confirmed via HitPay API (webhook fallback)",
            },
          });
          return NextResponse.json({ status: "PAID", paymentStatus: "completed" });
        }
        return NextResponse.json({ status: "PENDING", paymentStatus: hitpay.status });
      } catch {
        // HitPay API call failed — return current status
      }
    }

    return NextResponse.json({
      status: order.status,
      paymentStatus: order.paymentStatus,
    });
  } catch {
    return NextResponse.json({ status: "PENDING", paymentStatus: "pending" });
  }
}
