import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/services/order-service";
import { checkAdminAuth } from "@/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAdminAuth(request);
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
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();

    const validTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PREPARING", "CANCELLED"],
      PREPARING: ["READY", "CANCELLED"],
      READY: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
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

      await OrderService.updateStatus(
        Number(id),
        body.status,
        body.changedBy || 0,
        body.note
      );
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
