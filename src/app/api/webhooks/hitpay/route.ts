import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/hitpay";

/**
 * HitPay webhook handler.
 *
 * Expected headers:
 *   - Hitpay-Event-Type: payment_request.completed | charge.created | charge.updated
 *   - X-Signature: HMAC-SHA256 signature of the raw body
 *
 * The raw body MUST be read as text (not JSON) to verify the HMAC.
 */
export async function POST(request: NextRequest) {
  try {
    // Read raw body as text — critical for HMAC verification
    const rawBody = await request.text();

    // Get the signature from headers
    const signature = request.headers.get("x-signature") || "";
    const eventType = request.headers.get("hitpay-event-type") || "";

    if (!eventType) {
      console.warn("[webhook] Missing Hitpay-Event-Type header");
      return NextResponse.json(
        { error: "Missing event type header" },
        { status: 400 },
      );
    }

    // Verify HMAC signature
    if (signature) {
      const isValid = verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.warn("[webhook] Invalid HMAC signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    } else {
      console.warn("[webhook] Missing X-Signature header — skipping verification");
    }

    // Parse the JSON body
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const paymentId = (payload.payment_request_id as string) || "";
    const paymentStatus = (payload.status as string) || "";

    if (!paymentId) {
      console.warn("[webhook] No payment_request_id in payload");
      return NextResponse.json(
        { error: "Missing payment_request_id" },
        { status: 400 },
      );
    }

    // Find the order by paymentId
    const order = await prisma.order.findFirst({
      where: { paymentId },
    });

    if (!order) {
      console.warn(`[webhook] No order found for paymentId: ${paymentId}`);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 },
      );
    }

    // Handle based on event type
    switch (eventType) {
      case "payment_request.completed":
      case "charge.created": {
        // Payment was completed successfully
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
            note: `Payment completed (HitPay event: ${eventType})`,
          },
        });

        console.log(
          `[webhook] Order ${order.orderNumber} confirmed via ${eventType}`,
        );
        break;
      }

      case "charge.updated": {
        // Could be a refund
        if (
          paymentStatus === "refunded" ||
          paymentStatus === "partially_refunded"
        ) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "REFUNDED",
              paymentStatus: paymentStatus,
            },
          });

          await prisma.orderStatusLog.create({
            data: {
              orderId: order.id,
              fromStatus: order.status,
              toStatus: "REFUNDED",
              changedBy: 0,
              note: `Payment ${paymentStatus} (HitPay event: ${eventType})`,
            },
          });

          console.log(
            `[webhook] Order ${order.orderNumber} refunded`,
          );
        } else {
          // Other charge update — just log the payment status
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: paymentStatus,
            },
          });

          console.log(
            `[webhook] Order ${order.orderNumber} payment status updated to ${paymentStatus}`,
          );
        }
        break;
      }

      default: {
        console.log(
          `[webhook] Unhandled event type: ${eventType} for order ${order.orderNumber}`,
        );
      }
    }

    // Always return 200 OK so HitPay doesn't retry
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook] Error processing webhook:", error);
    // Return 200 to prevent HitPay retries even on internal errors
    return NextResponse.json({ received: true });
  }
}
