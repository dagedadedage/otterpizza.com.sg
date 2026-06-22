import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatPrice, generateOrderNumber } from "@/lib/utils";
import { createPaymentRequest } from "@/lib/hitpay";
import { calculatePromotions } from "@/lib/promotions";
import type { CartItem } from "@/store/cart-context";

interface CheckoutItemInput {
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CheckoutBody {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  storeId?: number;
  notes?: string;
  items: CheckoutItemInput[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;

    // --- Validation ---
    if (!body.customerName || typeof body.customerName !== "string" || !body.customerName.trim()) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 },
      );
    }

    if (
      !body.customerEmail ||
      typeof body.customerEmail !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail)
    ) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 },
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 },
      );
    }

    // Validate each item has valid fields
    for (const item of body.items) {
      if (!item.productId || item.quantity < 1 || item.unitPrice < 0) {
        return NextResponse.json(
          { error: "Invalid item data" },
          { status: 400 },
        );
      }
    }

    // --- Calculate totals ---
    const subtotal = body.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    // Build CartItem array for promotion calculation
    const cartItems: CartItem[] = body.items.map((item) => ({
      productId: item.productId,
      sku: "",
      name: "",
      price: item.unitPrice,
      quantity: item.quantity,
    }));

    const promo = calculatePromotions(cartItems);
    const total = subtotal - promo.discountAmount + promo.deliveryFee;

    if (total < 0) {
      return NextResponse.json(
        { error: "Invalid total amount" },
        { status: 400 },
      );
    }

    // --- Generate order number ---
    const orderNumber = generateOrderNumber();

    // --- Create order in database ---
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: body.customerName.trim(),
        customerEmail: body.customerEmail.trim(),
        customerPhone: body.customerPhone?.trim() || null,
        storeId: body.storeId || null,
        notes: body.notes?.trim() || null,
        subtotal,
        discount: promo.discountAmount,
        deliveryFee: promo.deliveryFee,
        total,
        status: "PENDING",
        items: {
          create: body.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: { items: true },
    });

    // --- Call HitPay to create payment request ---
    let paymentUrl: string | null = null;
    let hitpayPaymentId: string | null = null;

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
      const hitpayResponse = await createPaymentRequest({
        amount: total,
        currency: "SGD",
        email: body.customerEmail.trim(),
        name: body.customerName.trim(),
        phone: body.customerPhone?.trim() || undefined,
        referenceNumber: orderNumber,
        redirectUrl: `${appUrl}/checkout/success?order=${orderNumber}`,
        paymentMethods: ["paynow_online", "card", "grabpay_direct"],
      });

      paymentUrl = hitpayResponse.url;
      hitpayPaymentId = hitpayResponse.id;

      // Update order with HitPay payment request ID
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentId: hitpayPaymentId },
      });
    } catch (hitpayError) {
      // If HITPAY_API_KEY is not configured, use a mock URL for development
      const hasApiKey = !!process.env.HITPAY_API_KEY;
      if (!hasApiKey) {
        console.warn(
          "[checkout] HITPAY_API_KEY not set — using mock redirect URL",
        );
        paymentUrl = `${appUrl}/checkout/success?order=${orderNumber}&status=pending`;
      } else {
        console.error("[checkout] HitPay error:", hitpayError);
        // Payment creation failed but order was created — still return order number
        paymentUrl = `${appUrl}/checkout/success?order=${orderNumber}&status=pending`;
      }
    }

    // --- Create initial status log ---
    await prisma.orderStatusLog.create({
      data: {
        orderId: order.id,
        toStatus: "PENDING",
        changedBy: 0,
        note: "Order created",
      },
    }).catch((err: unknown) => {
      console.error("[checkout] Failed to create status log:", err);
    });

    return NextResponse.json({
      url: paymentUrl,
      orderNumber,
      orderId: order.id,
    });
  } catch (error) {
    console.error("[checkout] Error processing checkout:", error);
    return NextResponse.json(
      { error: "Failed to process checkout. Please try again." },
      { status: 500 },
    );
  }
}
