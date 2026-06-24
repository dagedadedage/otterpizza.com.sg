import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/hitpay";
import { sendOrderConfirmation } from "@/lib/email";

/**
 * HitPay webhook handler.
 * HitPay sends POST with JSON body containing payment status updates.
 * We verify the HMAC signature (X-Signature header) then process the event.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature") || "";

    // Verify HMAC signature if present
    if (signature) {
      const isValid = verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.warn("[webhook] Invalid HMAC signature");
        return NextResponse.json({ received: true }); // 200 to prevent retries
      }
    }

    // Parse payload
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ received: true });
    }

    const paymentId = (payload.payment_request_id as string) || (payload.id as string) || "";
    const paymentStatus = (payload.status as string) || "";
    const eventType = request.headers.get("hitpay-event-type") || payload.event_type as string || "";
    const referenceNumber = payload.reference_number as string || "";
    const chargeId = payload.charge_id as string || "";

    console.log(`[webhook] Received: paymentId=${paymentId}, status=${paymentStatus}, event=${eventType}, ref=${referenceNumber}`);

    if (!paymentId && !referenceNumber) {
      console.warn("[webhook] No payment ID or reference in payload");
      return NextResponse.json({ received: true });
    }

    // Find order — try paymentId first, then reference number, then charge ID
    let order = null;
    if (paymentId) {
      order = await prisma.order.findFirst({ where: { paymentId } });
    }
    if (!order && referenceNumber) {
      order = await prisma.order.findFirst({ where: { orderNumber: referenceNumber } });
      if (order) {
        // Update the order with the correct paymentId if it was missing
        if (!order.paymentId && paymentId) {
          await prisma.order.update({
            where: { id: order.id },
            data: { paymentId },
          });
        }
        console.log(`[webhook] Matched by reference: ${referenceNumber}`);
      }
    }
    if (!order && chargeId) {
      // HitPay may send charge ID instead of payment request ID
      order = await prisma.order.findFirst({ where: { paymentId: chargeId } });
    }

    if (!order) {
      console.warn(`[webhook] No order found for paymentId=${paymentId} ref=${referenceNumber}`);
      return NextResponse.json({ received: true });
    }

    // Handle refund event (charge.updated with refunded_amount)
    const refundedAmount = payload.refunded_amount as number | undefined;
    if (refundedAmount && refundedAmount > 0) {
      const currentStatus = order.status;
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "REFUNDED",
          paymentStatus: "refunded",
        },
      });
      await prisma.orderStatusLog.create({
        data: {
          orderId: order.id,
          fromStatus: currentStatus,
          toStatus: "REFUNDED",
          changedBy: 0,
          note: `Payment refunded via HitPay webhook (amount: $${refundedAmount})`,
        },
      });
      console.log(`[webhook] Order ${order.orderNumber} refunded (amount: ${refundedAmount})`);
      return NextResponse.json({ received: true });
    }

    // Skip if order is in a final state
    const finalStatuses = ["CANCELLED", "REFUNDED", "FULFILLED"];
    if (finalStatuses.includes(order.status)) {
      console.log(`[webhook] Order ${order.orderNumber} is ${order.status} (final), skipping`);
      return NextResponse.json({ received: true });
    }

    // Process based on payment status
    const completedStatuses = ["completed", "succeeded", "paid"];
    const failedStatuses = ["failed", "cancelled", "expired", "refunded"];

    if (completedStatuses.includes(paymentStatus.toLowerCase())) {
      // Payment completed — confirm the order
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentStatus: "completed",
        },
        include: {
          items: { include: { product: true } },
        },
      });

      await prisma.orderStatusLog.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: "PAID",
          changedBy: 0,
          note: `Payment completed via HitPay webhook (status: ${paymentStatus})`,
        },
      });

      // Send order confirmation email
      sendOrderConfirmation({
        orderNumber: updatedOrder.orderNumber,
        customerName: updatedOrder.customerName,
        customerEmail: updatedOrder.customerEmail,
        items: updatedOrder.items.map((i) => ({ name: i.product?.name || "Item", quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.totalPrice })),
        subtotal: updatedOrder.subtotal,
        deliveryFee: updatedOrder.deliveryFee,
        discount: updatedOrder.discount,
        gstAmount: updatedOrder.gstAmount,
        total: updatedOrder.total,
        deliveryType: updatedOrder.deliveryType,
        deliveryDate: updatedOrder.deliveryDate,
        deliveryTimeslot: updatedOrder.deliveryTimeslot,
        deliveryAddress: updatedOrder.deliveryAddress,
      }).catch((err) => console.error("[webhook] Email failed:", err));

      console.log(`[webhook] Order ${order.orderNumber} auto-confirmed (payment ${paymentStatus})`);
    } else if (failedStatuses.includes(paymentStatus.toLowerCase())) {
      // Payment failed — cancel the order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          paymentStatus: paymentStatus,
        },
      });

      await prisma.orderStatusLog.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: "CANCELLED",
          changedBy: 0,
          note: `Payment ${paymentStatus} via HitPay webhook`,
        },
      });

      console.log(`[webhook] Order ${order.orderNumber} cancelled (payment ${paymentStatus})`);
    } else {
      // Intermediate status — just update payment status
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: paymentStatus },
      });
      console.log(`[webhook] Order ${order.orderNumber} payment status updated to ${paymentStatus}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook] Error:", error);
    return NextResponse.json({ received: true });
  }
}
