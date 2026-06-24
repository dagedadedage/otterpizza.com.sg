import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refundPayment } from "@/lib/hitpay";
import { requireRole } from "@/lib/auth";

// POST - refund an order via HitPay
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole(request, ["ADMIN"]);
  if ("error" in result) return result.error;

  try {
    const { id } = await params;
    const orderId = parseInt(id);
    const body = await request.json().catch(() => ({}));
    const refundAmount = body.amount ? Number(body.amount) : undefined;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.paymentId) {
      return NextResponse.json(
        { error: "Order has no payment ID — cannot refund" },
        { status: 400 }
      );
    }

    if (order.status === "REFUNDED") {
      return NextResponse.json(
        { error: "Order has already been refunded" },
        { status: 400 }
      );
    }

    // Call HitPay refund API (best-effort)
    let refundNote = "";
    try {
      await refundPayment(order.paymentId, refundAmount);
      refundNote = refundAmount
        ? `Partial refund of $${refundAmount.toFixed(2)} via HitPay`
        : "Full refund via HitPay";
    } catch (err: any) {
      console.error("[refund] HitPay refund error:", err);
      // Proceed with local refund even if HitPay fails
      refundNote = refundAmount
        ? `Partial refund of $${refundAmount.toFixed(2)} — HitPay call failed: ${err.message}`
        : `Full refund — HitPay call failed: ${err.message}`;
    }

    // Update order status
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "REFUNDED",
        paymentStatus: "refunded",
      },
    });

    await prisma.orderStatusLog.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: "REFUNDED",
        changedBy: result.user.userId,
        note: refundNote,
      },
    });

    return NextResponse.json({
      success: true,
      order: { id: updated.id, orderNumber: updated.orderNumber, status: updated.status },
    });
  } catch (error) {
    console.error("[refund] Error:", error);
    return NextResponse.json(
      { error: "Refund failed" },
      { status: 500 }
    );
  }
}
