import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Otter Pizza <orders@otterpizza.com.sg>";
const ADMIN_EMAIL = "orders@otterpizza.com.sg";

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; unitPrice: number; totalPrice: number }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  gstAmount: number;
  total: number;
  deliveryType: string | null;
  deliveryDate: string | null;
  deliveryTimeslot: string | null;
  deliveryAddress: string | null;
}

function formatPrice(cents: number): string {
  return `$${cents.toFixed(2)}`;
}

function buildOrderHtml(data: OrderEmailData, status: string, extraInfo?: string): string {
  const deliveryInfo =
    data.deliveryType === "pickup"
      ? "Self Pick-up"
      : data.deliveryType === "delivery"
        ? `Delivery${data.deliveryAddress ? ` to ${data.deliveryAddress}` : ""}${data.deliveryDate ? ` on ${data.deliveryDate}` : ""}${data.deliveryTimeslot ? ` at ${data.deliveryTimeslot}` : ""}`
        : "";

  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="text-align:center;padding:20px 0">
        <h1 style="color:#E85D2C;margin:0">Otter Pizza</h1>
        <p style="color:#8B7355;font-size:14px">Singapore's Neighbourhood Pizzeria</p>
      </div>

      <div style="background:#FFF8F0;border:1px solid #E8D5C4;border-radius:12px;padding:24px;margin:16px 0">
        <h2 style="color:#2D1B14;margin:0 0 4px 0">${status}</h2>
        <p style="color:#8B7355;margin:0">Order ${data.orderNumber}</p>
        ${extraInfo ? `<p style="color:#2D1B14;margin:12px 0 0 0;font-size:14px">${extraInfo}</p>` : ""}
      </div>

      <div style="background:white;border:1px solid #E8D5C4;border-radius:12px;padding:16px;margin:16px 0">
        <p style="color:#2D1B14;font-weight:600;margin:0 0 8px 0">Hi ${data.customerName},</p>
        ${deliveryInfo ? `<p style="color:#8B7355;margin:0 0 12px 0">${deliveryInfo}</p>` : ""}

        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="border-bottom:1px solid #E8D5C4">
              <th style="text-align:left;padding:8px;font-size:13px;color:#8B7355">Item</th>
              <th style="text-align:center;padding:8px;font-size:13px;color:#8B7355">Qty</th>
              <th style="text-align:right;padding:8px;font-size:13px;color:#8B7355">Price</th>
            </tr>
          </thead>
          <tbody>
            ${data.items
              .map(
                (item) => `
              <tr style="border-bottom:1px solid #E8D5C4">
                <td style="padding:8px;font-size:13px;color:#2D1B14">${item.name}</td>
                <td style="text-align:center;padding:8px;font-size:13px;color:#2D1B14">${item.quantity}</td>
                <td style="text-align:right;padding:8px;font-size:13px;color:#2D1B14">${formatPrice(item.totalPrice)}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <div style="margin-top:16px;border-top:1px solid #E8D5C4;padding-top:12px">
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#8B7355;margin:4px 0">
            <span>Subtotal</span><span>${formatPrice(data.subtotal)}</span>
          </div>
          ${data.discount > 0 ? `<div style="display:flex;justify-content:space-between;font-size:13px;color:#E85D2C;margin:4px 0"><span>Discount</span><span>-${formatPrice(data.discount)}</span></div>` : ""}
          ${data.deliveryFee > 0 ? `<div style="display:flex;justify-content:space-between;font-size:13px;color:#8B7355;margin:4px 0"><span>Delivery Fee</span><span>${formatPrice(data.deliveryFee)}</span></div>` : ""}
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#8B7355;margin:4px 0">
            <span>GST (9%)</span><span>${formatPrice(data.gstAmount)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:15px;color:#2D1B14;margin:8px 0;border-top:1px solid #E8D5C4;padding-top:8px">
            <span>Total</span><span>${formatPrice(data.total)}</span>
          </div>
        </div>
      </div>

      <p style="color:#8B7355;font-size:12px;text-align:center;margin:24px 0">
        Thank you for ordering from Otter Pizza!<br/>
        Questions? Reply to this email — we're here to help.
      </p>
    </div>`;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const html = buildOrderHtml(
    data,
    "🍕 Order Confirmed!",
    "Your payment has been received and your order is being prepared."
  );
  return sendEmail(data.customerEmail, "🍕 Order Confirmed!", html);
}

export async function sendPendingPaymentReminder(data: OrderEmailData) {
  const html = buildOrderHtml(
    data,
    "💳 Payment Pending",
    "Your order has been received but payment is not yet complete. Please complete your payment to confirm your order."
  );
  return sendEmail(data.customerEmail, "💳 Payment Pending — Otter Pizza", html);
}

export async function sendReadyForPickup(data: OrderEmailData) {
  const html = buildOrderHtml(
    data,
    "📦 Order Ready for Pick-up!",
    "Your order is ready for collection. Please come to our store to pick it up."
  );
  return sendEmail(data.customerEmail, "📦 Ready for Pick-up — Otter Pizza", html);
}

export async function sendOutForDelivery(data: OrderEmailData, trackingUrl?: string) {
  const extraInfo = trackingUrl
    ? `Track your delivery: <a href="${trackingUrl}" style="color:#E85D2C">${trackingUrl}</a>`
    : "Your order is on its way!";
  const html = buildOrderHtml(data, "🚀 Out for Delivery!", extraInfo);
  return sendEmail(data.customerEmail, "🚀 Out for Delivery — Otter Pizza", html);
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your_resend_api_key") {
    console.log(`[email] Skipping (no API key configured): ${subject} to ${to}`);
    return;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to, ADMIN_EMAIL],
      subject,
      html,
    });
    if (error) {
      console.error(`[email] Failed to send: ${error.message}`);
    } else {
      console.log(`[email] Sent: ${subject} to ${to} + ${ADMIN_EMAIL} (id: ${data?.id})`);
    }
  } catch (err: any) {
    console.error(`[email] Error sending: ${err.message}`);
  }
}
