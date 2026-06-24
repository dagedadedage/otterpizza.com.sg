import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/services/order-service";
import { checkAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { sendReadyForPickup, sendOutForDelivery, sendOrderCancelled, sendOrderRefunded } from "@/lib/email";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const order = await OrderService.getOrder(Number(id));
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();

    const validTransitions: Record<string, string[]> = {
      PENDING: ["PAID", "CANCELLED"],
      PAID: ["READY", "OUT_FOR_DELIVERY", "CANCELLED", "REFUNDED"],
      ACCEPTED: ["READY", "OUT_FOR_DELIVERY", "CANCELLED", "REFUNDED"],
      READY: ["FULFILLED", "OUT_FOR_DELIVERY", "CANCELLED", "REFUNDED"],
      OUT_FOR_DELIVERY: ["FULFILLED", "CANCELLED", "REFUNDED"],
      FULFILLED: [],
      CANCELLED: [],
      REFUNDED: [],
      // Legacy transitions
      CONFIRMED: ["ACCEPTED", "CANCELLED"],
      PREPARING: ["READY", "CANCELLED"],
      COMPLETED: [],
    };

    const order = await OrderService.getOrder(Number(id));
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (body.status) {
      const allowed = validTransitions[order.status] || [];
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          {
            error: `Cannot transition from ${order.status} to ${body.status}. Allowed: ${allowed.join(", ") || "none"}`,
          },
          { status: 400 }
        );
      }

      // Enforce delivery-type-aware transitions
      const isPickup = order.deliveryType === "pickup";
      if (body.status === "READY" && !isPickup) {
        return NextResponse.json(
          { error: "Delivery orders should use Out for Delivery, not Ready for Pick-up" },
          { status: 400 }
        );
      }
      if (body.status === "OUT_FOR_DELIVERY" && isPickup) {
        return NextResponse.json(
          { error: "Pickup orders should use Ready for Pick-up, not Out for Delivery" },
          { status: 400 }
        );
      }

      // Build payment note for manual payment marking
      let note = body.note as string | undefined;
      if (body.status === "PAID" && body.paymentMethod) {
        const parts = [`Manual payment via ${body.paymentMethod}`];
        if (body.paymentReference) parts.push(`Ref: ${body.paymentReference}`);
        if (body.paymentNote) parts.push(`(${body.paymentNote})`);
        note = parts.join(" — ");

        // Store payment info on the order record
        await prisma.order.update({
          where: { id: Number(id) },
          data: {
            paymentStatus: "manual",
            paymentMethod: body.paymentMethod as string,
          },
        });
      }

      await OrderService.updateStatus(
        Number(id),
        body.status,
        body.changedBy || 0,
        note
      );

      // Send status notification emails (after tracking URL is saved)
      if (body.status === "READY" || body.status === "OUT_FOR_DELIVERY" || body.status === "CANCELLED" || body.status === "REFUNDED") {
        // Update tracking URL first if provided
        if (body.deliveryTrackingUrl !== undefined) {
          await OrderService.updateTrackingUrl(Number(id), body.deliveryTrackingUrl || null);
        }
        const fullOrder = await OrderService.getOrder(Number(id));
        if (fullOrder) {
          const emailData = {
            orderId: fullOrder.id,
            orderNumber: fullOrder.orderNumber,
            customerName: fullOrder.customerName,
            customerEmail: fullOrder.customerEmail,
            items: (fullOrder as any).items?.map((i: any) => ({ name: i.product?.name || "Item", quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.totalPrice })) || [],
            subtotal: fullOrder.subtotal, deliveryFee: fullOrder.deliveryFee, discount: fullOrder.discount,
            gstAmount: fullOrder.gstAmount, total: fullOrder.total,
            deliveryType: fullOrder.deliveryType, deliveryDate: fullOrder.deliveryDate,
            deliveryTimeslot: fullOrder.deliveryTimeslot, deliveryAddress: fullOrder.deliveryAddress,
          };
          if (body.status === "READY") {
            sendReadyForPickup(emailData).catch((err) => console.error("[orders] Email failed:", err));
          } else if (body.status === "OUT_FOR_DELIVERY") {
            sendOutForDelivery(emailData, fullOrder.deliveryTrackingUrl || undefined).catch((err) => console.error("[orders] Email failed:", err));
          } else if (body.status === "CANCELLED") {
            sendOrderCancelled(emailData, body.note as string || "Order cancelled by administrator").catch((err) => console.error("[orders] Email failed:", err));
          } else if (body.status === "REFUNDED") {
            sendOrderRefunded(emailData).catch((err) => console.error("[orders] Email failed:", err));
          }
        }
      }
    }

    // Update remaining fields (tracking URL if not already handled above)
    if (body.deliveryTrackingUrl !== undefined && body.status !== "READY" && body.status !== "OUT_FOR_DELIVERY" && body.status !== "CANCELLED" && body.status !== "REFUNDED") {
      await OrderService.updateTrackingUrl(Number(id), body.deliveryTrackingUrl || null);
    }

    if (body.note && !body.status) {
      await OrderService.addNote(Number(id), body.note, body.changedBy || 0);
    }

    const updated = await OrderService.getOrder(Number(id));
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const orderId = Number(id);

    // Delete related records first (SQLite doesn't support cascade)
    await prisma.orderItem.deleteMany({ where: { orderId } });
    await prisma.orderStatusLog.deleteMany({ where: { orderId } });
    await prisma.orderNote.deleteMany({ where: { orderId } });
    await prisma.order.delete({ where: { id: orderId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
