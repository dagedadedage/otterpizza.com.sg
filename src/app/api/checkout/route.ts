import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { formatPrice, generateOrderNumber } from "@/lib/utils";
import { createPaymentRequest } from "@/lib/hitpay";
import { calculatePromotions } from "@/lib/promotions";
import { sendPendingPaymentReminder } from "@/lib/email";
import type { CartItem } from "@/lib/cart-utils";

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
  deliveryType?: string;
  deliveryDate?: string;
  storeId?: number;
  deliveryAddress?: string;
  deliveryUnit?: string;
  deliveryPostalCode?: string;
  deliveryTimeslot?: string;
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

    // Fetch promo tiers from DB and calculate applicable promotion
    let promoTiers: any[] = [];
    try {
      promoTiers = await prisma.promotion.findMany({
        where: { isActive: true },
        orderBy: { minAmount: "asc" },
      });
    } catch { /* use empty tiers = no promos */ }
    const promo = calculatePromotions(cartItems, promoTiers.map(t => ({
      type: t.type,
      minAmount: Number(t.minAmount),
      value: Number(t.value),
      name: t.name,
      description: t.description,
    })));

    // Delivery fee: 0 if promo applies, otherwise from DB setting
    let deliveryFee = 0;
    if (promo.type === "none") {
      try {
        const deliverySetting = await prisma.deliverySetting.findFirst();
        if (deliverySetting) deliveryFee = deliverySetting.fee;
      } catch (e) { console.warn("[checkout] Delivery setting fetch failed:", e); }
    }

    const baseAmount = subtotal - promo.discountAmount;

    // --- Calculate GST ---
    let gstAmount = 0;
    let gstRate = 9;
    let gstMode = "EXCLUSIVE";
    try {
      const gstSetting = await prisma.gstSetting.findFirst();
      if (gstSetting && gstSetting.rate > 0) {
        gstRate = gstSetting.rate;
        gstMode = gstSetting.mode;
        if (gstMode === "EXCLUSIVE") {
          gstAmount = Math.round(baseAmount * gstRate) / 100;
        } else {
          // INCLUSIVE: extract embedded GST (informational only)
          gstAmount = Math.round(baseAmount * gstRate / (100 + gstRate) * 100) / 100;
        }
      }
    } catch (e) {
      console.warn("[checkout] GST setting fetch failed, using defaults:", e);
    }

    // INCLUSIVE: GST already in prices, don't add. EXCLUSIVE: add GST on top.
    const gstAddon = gstMode === "EXCLUSIVE" ? gstAmount : 0;
    const total = baseAmount + deliveryFee + gstAddon;

    if (total < 0) {
      return NextResponse.json(
        { error: "Invalid total amount" },
        { status: 400 },
      );
    }

    // --- Generate order number ---
    const orderNumber = generateOrderNumber();

    const publicToken = crypto.randomUUID();

    // Atomic: stock check + order creation in transaction to prevent oversell
    let order: any;
    try {
      order = await prisma.$transaction(async (tx) => {
        for (const item of body.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { inStock: true, name: true },
          });
          if (!product || !product.inStock) {
            throw new Error(`${product?.name || "Item"} is currently out of stock`);
          }
        }
        return tx.order.create({
          data: {
            orderNumber,
            publicToken,
            customerName: body.customerName.trim(),
            customerEmail: body.customerEmail.trim(),
            customerPhone: body.customerPhone?.trim() || null,
            storeId: body.storeId || null,
            deliveryType: body.deliveryType || null,
            deliveryDate: body.deliveryDate || null,
            deliveryAddress: body.deliveryAddress?.trim() || null,
            deliveryUnit: body.deliveryUnit?.trim() || null,
            deliveryPostalCode: body.deliveryPostalCode?.trim() || null,
            deliveryTimeslot: body.deliveryTimeslot || null,
            notes: body.notes?.trim() || null,
            subtotal,
            discount: promo.discountAmount,
            deliveryFee: deliveryFee,
            gstAmount,
            gstRate,
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
          include: { items: { include: { product: true } } },
        });
      });
    } catch (e: any) {
      return NextResponse.json(
        { error: e?.message || "Failed to create order" },
        { status: 400 },
      );
    }

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
        paymentMethods: ["paynow_online", "card"],
      });

      paymentUrl = hitpayResponse.url;
      hitpayPaymentId = hitpayResponse.id;

      // Update order with HitPay payment request ID and initial status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentId: hitpayPaymentId,
          paymentStatus: "pending",
        },
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

    // --- Send pending payment email (awaited, 2-min delay with status check) ---
    sendPendingPaymentReminder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      publicToken: order.publicToken,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      paymentUrl,
      items: order.items.map((i: any) => ({ sku: i.product?.sku || "", name: i.product?.name || "Item", quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.totalPrice })),
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      gstAmount: order.gstAmount,
      total: order.total,
      deliveryType: order.deliveryType,
      deliveryDate: order.deliveryDate,
      deliveryTimeslot: order.deliveryTimeslot,
      deliveryAddress: order.deliveryAddress,
    }).catch((err) => console.error("[checkout] Email failed:", err));

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
