import crypto from "crypto";

const HITPAY_API_KEY = process.env.HITPAY_API_KEY || "";
const HITPAY_WEBHOOK_SALT = process.env.HITPAY_WEBHOOK_SALT || "";
const HITPAY_BASE_URL =
  process.env.HITPAY_BASE_URL || "https://api.sandbox.hit-pay.com/v1";

function requireApiKey(): string {
  if (!HITPAY_API_KEY) {
    throw new Error("HITPAY_API_KEY environment variable is not set. Payment processing is disabled.");
  }
  return HITPAY_API_KEY;
}

export interface CreatePaymentParams {
  amount: number;
  currency: string;
  email: string;
  name: string;
  phone?: string;
  referenceNumber: string;
  redirectUrl: string;
  paymentMethods?: string[];
}

export interface PaymentRequest {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  amount: string;
  currency: string;
  status: string;
  purpose: string | null;
  reference_number: string;
  payment_methods: string[];
  url: string;
  redirect_url: string;
  allow_repeated_payments: boolean;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export async function createPaymentRequest(
  params: CreatePaymentParams
): Promise<PaymentRequest> {
  const body = new URLSearchParams({
    amount: params.amount.toFixed(2),
    currency: params.currency,
    email: params.email,
    name: params.name,
    reference_number: params.referenceNumber,
    redirect_url: params.redirectUrl,
  });

  if (params.phone) body.append("phone", params.phone);
  if (params.paymentMethods?.length) {
    params.paymentMethods.forEach((m) =>
      body.append("payment_methods[]", m)
    );
  }

  // Set webhook URL for automatic payment status updates
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.otterpizza.com.sg";
  body.append("webhook", `${appUrl}/api/webhooks/hitpay`);

  const res = await fetch(`${HITPAY_BASE_URL}/payment-requests`, {
    method: "POST",
    headers: {
      "X-BUSINESS-API-KEY": requireApiKey(),
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`HitPay API error: ${res.status} ${error}`);
  }

  return res.json();
}

export async function getPaymentStatus(
  paymentRequestId: string
): Promise<PaymentRequest> {
  const res = await fetch(
    `${HITPAY_BASE_URL}/payment-requests/${paymentRequestId}`,
    {
      headers: {
        "X-BUSINESS-API-KEY": requireApiKey(),
        "X-Requested-With": "XMLHttpRequest",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`HitPay API error: ${res.status}`);
  }

  return res.json();
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  // Try both salts: webhook salt and API key (HitPay uses different salts for different webhook types)
  const salts = [HITPAY_WEBHOOK_SALT, HITPAY_API_KEY].filter(Boolean);
  for (const salt of salts) {
    const computed = crypto
      .createHmac("sha256", salt)
      .update(rawBody)
      .digest("hex");

    try {
      if (crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature))) {
        return true;
      }
    } catch {
      // Buffer length mismatch — continue to next salt
    }
  }
  return false;
}

/**
 * HitPay does not support programmatic refunds via REST API.
 * Refunds must be processed manually through the HitPay dashboard:
 * https://dashboard.hit-pay.com
 *
 * This function is kept as a no-op — the order status is updated
 * to REFUNDED locally, and the admin is instructed to process
 * the refund in the HitPay dashboard separately.
 */
export async function refundPayment(
  paymentRequestId: string,
  amount?: number
): Promise<void> {
  // No-op: HitPay has no refund API. Refunds are manual via dashboard.
  console.log(
    `[hitpay] Refund requested for ${paymentRequestId} (amount: ${amount}). Process manually at https://dashboard.hit-pay.com`
  );
}
