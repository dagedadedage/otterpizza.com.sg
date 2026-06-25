import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, getPaymentStatus } from "@/lib/hitpay";
import { sendOrderConfirmation, sendOrderCancelled } from "@/lib/email";

/**
 * HitPay webhook handler.
 *
 * HitPay sends TWO types of webhooks to the same endpoint:
 * 1. Payment-request callback (set via "webhook" param on create):
 *    - HMAC in JSON body "hmac" field, signed with API key as salt
 * 2. Event webhook (registered in HitPay dashboard):
 *    - HMAC in "hitpay-signature" header, signed with per-webhook secret
 *
 * We try header signature first, then body hmac field.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // Parse payload first (needed for both verification and processing)
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ received: true });
    }

    // Try to verify signature from header (event webhook) or body hmac (payment-request callback)
    const headerSig = request.headers.get("hitpay-signature") || "";
    const bodyHmac = (payload.hmac as string) || "";
    let verified = false;

    if (headerSig) {
      // Event webhook: signature in header, signed with webhook salt
      verified = verifyWebhookSignature(rawBody, headerSig);
      if (verified) {
        console.log("[webhook] Verified via hitpay-signature header");
      } else {
        console.warn("[webhook] Invalid hitpay-signature header");
      }
    }

    if (!verified && bodyHmac) {
      // Payment-request callback: hmac in body, signed with API key
      verified = verifyWebhookSignature(rawBody, bodyHmac);
      if (verified) {
        console.log("[webhook] Verified via body hmac field");
      } else {
        console.warn("[webhook] Invalid body hmac field");
      }
    }

    // Fallback: if HMAC verification fails but payload has payment data,
    // verify by calling HitPay API directly
    if (!verified) {
      const fallbackId = (payload.payment_request_id as string) || (payload.id as string) || "";
      if (fallbackId && payload.status === "completed") {
        try {
          const hitpayStatus = await getPaymentStatus(fallbackId);
          if (["completed", "succeeded", "paid"].includes(hitpayStatus.status)) {
            console.log("[webhook] HMAC failed but HitPay API confirms payment completed");
            verified = true;
          } else {
            console.warn("[webhook] HMAC failed and HitPay API status is", hitpayStatus.status);
          }
        } catch (e) {
          console.warn("[webhook] HMAC failed and HitPay API call failed:", e);
        }
      }
    }

    if (!verified) {
      console.warn("[webhook] HMAC verification failed — rejecting");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
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
          paymentMethod: "PayNow / Card via HitPay",
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
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        publicToken: (updatedOrder as any).publicToken,
        customerName: updatedOrder.customerName,
        customerEmail: updatedOrder.customerEmail,
        items: updatedOrder.items.map((i) => ({ sku: (i as any).product?.sku || "", name: (i as any).product?.name || "Item", quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.totalPrice })),
        subtotal: updatedOrder.subtotal,
        deliveryFee: updatedOrder.deliveryFee,
        discount: updatedOrder.discount,
        gstAmount: updatedOrder.gstAmount,
        total: updatedOrder.total,
        deliveryType: updatedOrder.deliveryType,
        deliveryDate: updatedOrder.deliveryDate,
        deliveryTimeslot: updatedOrder.deliveryTimeslot,
        deliveryAddress: updatedOrder.deliveryAddress,
        paymentMethod: "PayNow / Card via HitPay",
        paymentNote: `Payment ID: ${paymentId}`,
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

      // Send cancellation email
      const failedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: true } } },
      });
      if (failedOrder) {
        sendOrderCancelled({
          orderId: failedOrder.id,
          orderNumber: failedOrder.orderNumber,
          publicToken: (failedOrder as any).publicToken,
          customerName: failedOrder.customerName,
          customerEmail: failedOrder.customerEmail,
          items: failedOrder.items.map((i: any) => ({ sku: (i as any).product?.sku || "", name: (i as any).product?.name || "Item", quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.totalPrice })),
          subtotal: failedOrder.subtotal, deliveryFee: failedOrder.deliveryFee, discount: failedOrder.discount,
          gstAmount: failedOrder.gstAmount, total: failedOrder.total,
          deliveryType: failedOrder.deliveryType, deliveryDate: failedOrder.deliveryDate,
          deliveryTimeslot: failedOrder.deliveryTimeslot, deliveryAddress: failedOrder.deliveryAddress,
        }, `Payment ${paymentStatus} — order automatically cancelled.`).catch((err) => console.error("[webhook] Email failed:", err));
      }

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
