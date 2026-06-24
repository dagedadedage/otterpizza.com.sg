import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/services/order-service";
import { checkAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

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
      PAID: ["ACCEPTED", "CANCELLED"],
      ACCEPTED: ["READY", "OUT_FOR_DELIVERY", "CANCELLED"],
      READY: ["FULFILLED", "CANCELLED"],
      OUT_FOR_DELIVERY: ["FULFILLED", "CANCELLED"],
      FULFILLED: [],
      CANCELLED: [],
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
    }

    if (body.note && !body.status) {
      await OrderService.addNote(Number(id), body.note, body.changedBy || 0);
    }

    // Update delivery tracking URL
    if (body.deliveryTrackingUrl !== undefined) {
      await OrderService.updateTrackingUrl(Number(id), body.deliveryTrackingUrl || null);
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
