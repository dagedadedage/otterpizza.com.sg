import { Resend } from "resend";
import nodemailer from "nodemailer";

const FROM_NAME = "Otter Pizza";
const FROM_EMAIL = "orders@otterpizza.com.sg";
const ADMIN_EMAIL = "orders@otterpizza.com.sg";

// Resend client (works once DNS is verified)
const resend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "your_resend_api_key"
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Nodemailer via Gmail SMTP.
// Authenticate with a real Workspace account, send from the Google Group address.
// The authenticated user must be an Owner of the Google Group with "Send as" permission.
const gmailUser = process.env.GMAIL_USER || "";
const gmailPass = process.env.GMAIL_APP_PASSWORD || "";
const gmailFrom = process.env.GMAIL_FROM || FROM_EMAIL; // Default: orders@otterpizza.com.sg
const useGmail = gmailUser && gmailPass;

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
  paymentUrl?: string | null;
  orderId?: number;
}

function formatPrice(cents: number): string {
  return `$${cents.toFixed(2)}`;
}

function buildHtml(data: OrderEmailData, status: string, extraInfo?: string): string {
  const deliveryInfo =
    data.deliveryType === "pickup"
      ? "Self Pick-up"
      : data.deliveryType === "delivery"
        ? `Delivery${data.deliveryAddress ? ` to ${data.deliveryAddress}` : ""}${data.deliveryDate ? ` on ${data.deliveryDate}` : ""}${data.deliveryTimeslot ? ` at ${data.deliveryTimeslot}` : ""}`
        : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#FEFBF7">
    <!-- Gold header strip with logo -->
    <div style="background:#FDD000;padding:24px 20px;text-align:center;border-radius:12px 12px 0 0">
      <img src="https://otterpizza.com/images/logo.png" alt="Otter Pizza" style="height:48px;width:auto" />
    </div>
    <!-- Status banner -->
    <div style="background:#FFF8F0;border-left:1px solid #E8D5C4;border-right:1px solid #E8D5C4;padding:24px;text-align:center">
      <h2 style="color:#2D1B14;margin:0 0 4px 0;font-size:18px">${status}</h2>
      <p style="color:#8B7355;margin:0;font-size:14px">Order ${data.orderNumber}</p>
      ${extraInfo ? `<p style="color:#2D1B14;margin:12px 0 0 0;font-size:13px">${extraInfo}</p>` : ""}
    </div>
    <!-- Order details -->
    <div style="background:white;border:1px solid #E8D5C4;border-top:none;border-radius:0 0 12px 12px;padding:20px">
      <p style="color:#2D1B14;font-weight:600;margin:0 0 8px 0">Hi ${data.customerName},</p>
      ${deliveryInfo ? `<p style="color:#8B7355;margin:0 0 12px 0;font-size:13px">${deliveryInfo}</p>` : ""}
      <table style="width:100%;border-collapse:collapse">
        <tr style="border-bottom:1px solid #E8D5C4"><th style="text-align:left;padding:8px;font-size:12px;color:#8B7355">Item</th><th style="text-align:center;padding:8px;font-size:12px;color:#8B7355">Qty</th><th style="text-align:right;padding:8px;font-size:12px;color:#8B7355">Price</th></tr>
        ${data.items.map(i => `<tr style="border-bottom:1px solid #E8D5C4"><td style="padding:8px;font-size:13px;color:#2D1B14">${i.name}</td><td style="text-align:center;padding:8px;font-size:13px;color:#2D1B14">${i.quantity}</td><td style="text-align:right;padding:8px;font-size:13px;color:#2D1B14">${formatPrice(i.totalPrice)}</td></tr>`).join("")}
      </table>
      <div style="margin-top:16px;border-top:1px solid #E8D5C4;padding-top:12px">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#8B7355;margin:4px 0"><span>Subtotal</span><span>${formatPrice(data.subtotal)}</span></div>
        ${data.discount > 0 ? `<div style="display:flex;justify-content:space-between;font-size:13px;color:#E85D2C;margin:4px 0"><span>Discount</span><span>-${formatPrice(data.discount)}</span></div>` : ""}
        ${data.deliveryFee > 0 ? `<div style="display:flex;justify-content:space-between;font-size:13px;color:#8B7355;margin:4px 0"><span>Delivery Fee</span><span>${formatPrice(data.deliveryFee)}</span></div>` : ""}
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#8B7355;margin:4px 0"><span>GST (9%)</span><span>${formatPrice(data.gstAmount)}</span></div>
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:15px;color:#2D1B14;margin:8px 0;border-top:1px solid #E8D5C4;padding-top:8px"><span>Total</span><span>${formatPrice(data.total)}</span></div>
      </div>
    </div>
    <p style="color:#8B7355;font-size:11px;text-align:center;margin:20px 0">Thank you for ordering from Otter Pizza!<br/>Questions? Reply to this email.</p>
  </body></html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const recipients = [to, ADMIN_EMAIL];

  // Try Gmail SMTP first (works immediately, no DNS needed)
  if (useGmail) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user: gmailUser, pass: gmailPass },
      });
      await transporter.sendMail({
        from: `"${FROM_NAME}" <${gmailFrom}>`,
        replyTo: gmailFrom,
        to: recipients.join(", "),
        subject,
        html,
      });
      console.log(`[email] Sent via Gmail: ${subject} to ${to} (from ${gmailFrom})`);
      return;
    } catch (err: any) {
      console.error(`[email] Gmail failed: ${err.message}`);
    }
  }

  // Fall back to Resend (works once DNS is verified)
  if (resend) {
    try {
      const { error } = await resend.emails.send({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: recipients,
        subject,
        html,
      });
      if (error) {
        console.error(`[email] Resend failed: ${error.message}`);
      } else {
        console.log(`[email] Sent via Resend: ${subject} to ${to}`);
      }
      return;
    } catch (err: any) {
      console.error(`[email] Resend failed: ${err.message}`);
    }
  }

  console.log(`[email] No transport configured. Skipping: ${subject}`);
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://otterpizza.com";
  const invoiceUrl = data.orderId ? `${appUrl}/api/admin/orders/${data.orderId}/invoice` : null;
  const invoiceButton = invoiceUrl
    ? `<div style="text-align:center;margin:24px 0">
        <a href="${invoiceUrl}" style="display:inline-block;background:#2D1B14;color:white;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:600;font-size:14px">📄 Download Invoice</a>
       </div>`
    : "";
  return sendEmail(data.customerEmail, `🍕 Order Confirmed — ${data.orderNumber}`, buildHtml(data, "🍕 Order Confirmed!", "Your payment has been received and your order is being prepared.") + invoiceButton);
}

export async function sendPendingPaymentReminder(data: OrderEmailData) {
  const paymentButton = data.paymentUrl
    ? `<div style="text-align:center;margin:24px 0">
        <a href="${data.paymentUrl}" style="display:inline-block;background:#E85D2C;color:white;padding:14px 32px;border-radius:24px;text-decoration:none;font-weight:600;font-size:16px">💳 Make Payment</a>
        <p style="color:#8B7355;font-size:12px;margin-top:8px">Click the button above to complete your payment securely via HitPay</p>
       </div>`
    : "";
  return sendEmail(
    data.customerEmail,
    `💳 Payment Pending — ${data.orderNumber}`,
    buildHtml(data, "💳 Payment Pending", "Your order has been received. Please complete your payment to confirm your order.") + paymentButton
  );
}

export async function sendReadyForPickup(data: OrderEmailData) {
  return sendEmail(data.customerEmail, `📦 Ready for Pick-up — ${data.orderNumber}`, buildHtml(data, "📦 Order Ready for Pick-up!", "Your order is ready for collection. Please come to our store to pick it up."));
}

export async function sendOutForDelivery(data: OrderEmailData, trackingUrl?: string) {
  const extraInfo = trackingUrl
    ? `Track your delivery: <a href="${trackingUrl}" style="color:#E85D2C">${trackingUrl}</a>`
    : "Your order is on its way!";
  return sendEmail(data.customerEmail, `🚀 Out for Delivery — ${data.orderNumber}`, buildHtml(data, "🚀 Out for Delivery!", extraInfo));
}
