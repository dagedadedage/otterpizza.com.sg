import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/hitpay";

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

    console.log(`[webhook] Received: paymentId=${paymentId}, status=${paymentStatus}, event=${eventType}`);

    if (!paymentId) {
      console.warn("[webhook] No payment ID in payload");
      return NextResponse.json({ received: true });
    }

    // Find order by payment ID
    const order = await prisma.order.findFirst({
      where: { paymentId },
    });

    if (!order) {
      console.warn(`[webhook] No order found for paymentId: ${paymentId}`);
      return NextResponse.json({ received: true });
    }

    // If order already processed, skip
    if (order.status !== "PENDING") {
      console.log(`[webhook] Order ${order.orderNumber} already ${order.status}, skipping`);
      return NextResponse.json({ received: true });
    }

    // Process based on payment status
    const completedStatuses = ["completed", "succeeded", "paid"];
    const failedStatuses = ["failed", "cancelled", "expired", "refunded"];

    if (completedStatuses.includes(paymentStatus.toLowerCase())) {
      // Payment completed — confirm the order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CONFIRMED",
          paymentStatus: "completed",
        },
      });

      await prisma.orderStatusLog.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: "CONFIRMED",
          changedBy: 0,
          note: `Payment completed via HitPay webhook (status: ${paymentStatus})`,
        },
      });

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
