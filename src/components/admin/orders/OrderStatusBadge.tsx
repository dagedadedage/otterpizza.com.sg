"use client";

import { cn } from "@/lib/utils";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  PAID: {
    label: "Paid",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  READY: {
    label: "Ready for Pick-up",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  FULFILLED: {
    label: "Fulfilled",
    className: "bg-emerald-600 text-white border-emerald-700",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  // Legacy statuses kept for existing orders
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  PREPARING: {
    label: "Preparing",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-gray-400";
    case "PAID":
      return "bg-emerald-500";
    case "ACCEPTED":
      return "bg-blue-500";
    case "READY":
      return "bg-yellow-500";
    case "OUT_FOR_DELIVERY":
      return "bg-yellow-500";
    case "FULFILLED":
      return "bg-emerald-600";
    case "CANCELLED":
      return "bg-red-500";
    case "REFUNDED":
      return "bg-purple-500";
    // Legacy
    case "CONFIRMED":
      return "bg-blue-500";
    case "PREPARING":
      return "bg-amber-500";
    case "COMPLETED":
      return "bg-slate-500";
    default:
      return "bg-gray-400";
  }
}
