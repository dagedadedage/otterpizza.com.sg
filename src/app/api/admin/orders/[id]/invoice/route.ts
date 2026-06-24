import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAuth } from "@/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: { include: { product: true } },
        store: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const formatPrice = (n: number) => `$${n.toFixed(2)}`;
    const orderDate = new Date(order.createdAt).toLocaleString("en-SG", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Singapore",
    });

    const isDelivery = order.deliveryType === "delivery";
    const gstMode = order.gstAmount > 0 && order.total === order.subtotal - order.discount + order.deliveryFee
      ? "INCLUSIVE" : "EXCLUSIVE";

    const invoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice ${order.orderNumber} | Otter Pizza</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #2D1B14; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #E85D2C; padding-bottom: 20px; }
  .logo { font-size: 24px; font-weight: 800; color: #E85D2C; }
  .company-info { text-align: right; font-size: 11px; color: #666; line-height: 1.6; }
  .invoice-title { font-size: 20px; font-weight: 700; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
  .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #999; margin-bottom: 6px; }
  .section-text { font-size: 13px; line-height: 1.7; }
  table { width: 100%; border-collapse: collapse; margin: 24px 0; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #999; padding: 10px 8px; border-bottom: 1px solid #eee; }
  td { font-size: 13px; padding: 10px 8px; border-bottom: 1px solid #f5f5f5; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  .totals { margin-left: auto; width: 280px; margin-top: 8px; }
  .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
  .totals-divider { border-top: 1px solid #ddd; margin: 8px 0; }
  .totals-total { font-size: 16px; font-weight: 700; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; font-size: 10px; color: #999; text-align: center; line-height: 1.6; }
  .gst-note { font-size: 10px; color: #999; margin-top: 4px; text-align: right; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <img src="/images/logo.png" alt="Otter Pizza" style="height:48px;width:auto;" />
    <div style="font-size:12px;color:#666;margin-top:4px;">Tax Invoice</div>
  </div>
  <div class="company-info">
    <strong style="font-size:13px;color:#2D1B14;">OTTER PIZZA PTE. LTD.</strong><br>
    GST Reg No: 202217000H<br>
    71 Ubi Road 1 #08-41 Oxley Bizhub<br>
    Singapore 408732
  </div>
</div>

<div class="invoice-title">Invoice ${order.orderNumber}</div>

<div class="grid">
  <div>
    <div class="section-title">Bill To</div>
    <div class="section-text">
      ${order.customerName}<br>
      ${order.customerEmail}<br>
      ${order.customerPhone || ""}
    </div>
  </div>
  <div style="text-align:right;">
    <div class="section-title">Order Details</div>
    <div class="section-text">
      Order #: ${order.orderNumber}<br>
      Date: ${orderDate}<br>
      Type: ${isDelivery ? "Delivery" : "Self Pick-up"}<br>
      Status: ${order.status}
    </div>
  </div>
</div>

${isDelivery ? `
<div class="grid">
  <div>
    <div class="section-title">Delivery Address</div>
    <div class="section-text">
      ${order.deliveryAddress || ""}${order.deliveryUnit ? ", " + order.deliveryUnit : ""}<br>
      Singapore ${order.deliveryPostalCode || ""}<br>
      ${order.deliveryDate ? "Date: " + order.deliveryDate : ""} ${order.deliveryTimeslot ? "| Time: " + order.deliveryTimeslot : ""}
    </div>
  </div>
  ${order.store ? `
  <div style="text-align:right;">
    <div class="section-title">Pick-up / Service Store</div>
    <div class="section-text">
      ${order.store.name}<br>
      ${order.store.address}
    </div>
  </div>` : ""}
</div>` : `
<div class="grid">
  <div>
    <div class="section-title">Pick-up Store</div>
    <div class="section-text">
      ${order.store ? `${order.store.name}<br>${order.store.address}` : "Not specified"}<br>
      ${order.deliveryDate ? "Date: " + order.deliveryDate : ""} ${order.deliveryTimeslot ? "| Time: " + order.deliveryTimeslot : ""}
    </div>
  </div>
</div>`}

<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Product</th>
      <th class="text-center">Qty</th>
      <th class="text-right">Unit Price</th>
      <th class="text-right">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${order.items.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.product.name}</td>
      <td class="text-center">${item.quantity}</td>
      <td class="text-right">${formatPrice(Number(item.unitPrice))}</td>
      <td class="text-right">${formatPrice(Number(item.totalPrice))}</td>
    </tr>`).join("")}
  </tbody>
</table>

<div class="totals">
  <div class="totals-row"><span>Subtotal</span><span>${formatPrice(Number(order.subtotal))}</span></div>
  ${Number(order.discount) > 0 ? `<div class="totals-row"><span>Discount</span><span>-${formatPrice(Number(order.discount))}</span></div>` : ""}
  ${Number(order.deliveryFee) > 0 ? `<div class="totals-row"><span>Delivery Fee</span><span>${formatPrice(Number(order.deliveryFee))}</span></div>` : ""}
  ${Number(order.gstAmount) > 0 ? `<div class="totals-row"><span>GST (${order.gstRate}% Incl.)</span><span>${formatPrice(Number(order.gstAmount))}</span></div>` : ""}
  <div class="totals-divider"></div>
  <div class="totals-row totals-total"><span>Total (SGD)</span><span>${formatPrice(Number(order.total))}</span></div>
</div>

<div class="footer">
  <p>OTTER PIZZA PTE. LTD. | GST Reg No: 202217000H</p>
  <p>71 Ubi Road 1 #08-41 Oxley Bizhub, Singapore 408732</p>
  <p>This is a computer-generated invoice. No signature is required.</p>
</div>

<script>window.print();</script>
</body>
</html>`;

    return new NextResponse(invoiceHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("[invoice] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
