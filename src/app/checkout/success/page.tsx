"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const status = searchParams.get("status");

  const isPending = status === "pending";

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      {/* Checkmark animation */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <h1 className="mb-2 text-2xl font-bold text-dark">
        {isPending ? "Payment Initiated!" : "Order Confirmed!"}
      </h1>

      <p className="mb-2 text-muted">
        {isPending
          ? "Your payment is being processed. You will receive a confirmation shortly."
          : "Thank you for your order! We have received it and will start preparing it soon."}
      </p>

      {orderNumber && (
        <div className="mt-4 rounded-lg border border-border bg-cream px-6 py-3">
          <p className="text-sm text-muted">Order Number</p>
          <p className="text-xl font-bold text-primary">{orderNumber}</p>
        </div>
      )}

      <p className="mt-6 text-sm text-muted">
        A confirmation email will be sent to your email address with the order
        details and payment status.
      </p>

      <Link href="/" className="mt-8">
        <Button variant="primary" size="lg">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
