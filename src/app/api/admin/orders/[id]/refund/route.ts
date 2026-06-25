import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { sendOrderRefunded } from "@/lib/email";

// POST - mark an order as refunded
// Note: HitPay does not support programmatic refunds via REST API.
// The admin must process the actual refund in the HitPay dashboard separately:
// https://dashboard.hit-pay.com
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

    if (order.status === "REFUNDED") {
      return NextResponse.json(
        { error: "Order has already been refunded" },
        { status: 400 }
      );
    }

    // Update order status
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "REFUNDED",
        paymentStatus: "refunded",
      },
    });

    const amountNote = refundAmount
      ? `Partial refund of $${refundAmount.toFixed(2)}`
      : "Full refund";

    await prisma.orderStatusLog.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: "REFUNDED",
        changedBy: result.user.userId,
        note: `${amountNote}. Process actual refund at https://dashboard.hit-pay.com if paid via HitPay.`,
      },
    });

    // Send refund email to customer
    try {
      const fullOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
      });
      if (fullOrder) {
        sendOrderRefunded({
          orderId: fullOrder.id,
          orderNumber: fullOrder.orderNumber,
          publicToken: fullOrder.publicToken,
          customerName: fullOrder.customerName,
          customerEmail: fullOrder.customerEmail,
          items: fullOrder.items.map((i: any) => ({ sku: i.product?.sku || "", name: i.product?.name || "Item", quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.totalPrice })),
          subtotal: fullOrder.subtotal, deliveryFee: fullOrder.deliveryFee, discount: fullOrder.discount,
          gstAmount: fullOrder.gstAmount, total: fullOrder.total,
          deliveryType: fullOrder.deliveryType, deliveryDate: fullOrder.deliveryDate,
          deliveryTimeslot: fullOrder.deliveryTimeslot, deliveryAddress: fullOrder.deliveryAddress,
          paymentMethod: fullOrder.paymentMethod,
          paymentNote: amountNote,
        }).catch((err) => console.error("[refund] Email failed:", err));
      }
    } catch (err) {
      console.error("[refund] Email error:", err);
    }

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
