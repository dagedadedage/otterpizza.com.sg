"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Loader2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const [status, setStatus] = useState<string>("pending");
  const [checking, setChecking] = useState(true);

  // Always verify payment status with backend (never trust URL param)
  useEffect(() => {
    if (!orderNumber) {
      setChecking(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;
    let stopped = false;

    const checkStatus = async () => {
      if (stopped) return;
      try {
        const res = await fetch(`/api/checkout/status?order=${orderNumber}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "PAID" || data.status === "CONFIRMED" || data.paymentStatus === "completed") {
            setStatus("completed");
            setChecking(false);
            stopped = true;
            return;
          }
        }
      } catch { /* keep polling */ }

      attempts++;
      if (attempts >= maxAttempts) {
        setChecking(false);
        stopped = true;
      }
    };

    // Check immediately, then every 2 seconds (up to 20s total)
    checkStatus();
    const interval = setInterval(() => {
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setChecking(false);
        return;
      }
      checkStatus();
    }, 2000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [orderNumber]);

  const isCompleted = status === "completed";

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      {checking ? (
        <>
          <div className="mb-6 flex h-20 w-20 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-dark">Verifying Payment...</h1>
          <p className="text-muted">Checking your payment status. Please wait a moment.</p>
        </>
      ) : (
        <>
          <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${isCompleted ? "bg-green-100" : "bg-amber-100"}`}>
            <CheckCircle className={`h-10 w-10 ${isCompleted ? "text-green-600" : "text-amber-600"}`} />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-dark">
            {isCompleted ? "Order Confirmed!" : "Payment Not Completed"}
          </h1>

          <p className="mb-2 text-muted">
            {isCompleted
              ? "Thank you for your order! We have received it and will start preparing it soon."
              : "Your order has been received but payment was not completed. Please complete your payment to confirm your order. A payment link will be sent to your email."}
          </p>

          {orderNumber && (
            <div className="mt-4 rounded-lg border border-border bg-cream px-6 py-3">
              <p className="text-sm text-muted">Order Number</p>
              <p className="text-xl font-bold text-primary">{orderNumber}</p>
            </div>
          )}

          <p className="mt-6 text-sm text-muted">
            A confirmation email will be sent to your email address with the order details and payment status.
          </p>
        </>
      )}

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
