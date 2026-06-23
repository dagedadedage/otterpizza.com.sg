"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Eye, ChevronLeft, ChevronRight, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  store?: { id: number; name: string } | null;
  deliveryType?: string | null;
}

interface OrderTableProps {
  orders: Order[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onConfirm?: (id: number) => void;
  onCancel?: (id: number) => void;
  onDelete?: (id: number) => void;
  showStore?: boolean;
}

export function OrderTable({
  orders,
  page,
  totalPages,
  total,
  onPageChange,
  onConfirm,
  onCancel,
  onDelete,
  showStore = true,
}: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">No orders found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream border-b border-border">
              <th className="text-left px-4 py-3 font-semibold text-dark">
                Date
              </th>
              <th className="text-left px-4 py-3 font-semibold text-dark">
                Order #
              </th>
              <th className="text-left px-4 py-3 font-semibold text-dark">
                Customer
              </th>
              {showStore && (
                <th className="text-left px-4 py-3 font-semibold text-dark">
                  Type
                </th>
              )}
              <th className="text-right px-4 py-3 font-semibold text-dark">
                Total
              </th>
              <th className="text-center px-4 py-3 font-semibold text-dark">
                Status
              </th>
              <th className="text-center px-4 py-3 font-semibold text-dark">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-warm-white/50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString("en-SG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 font-mono text-sm font-medium">
                  {order.orderNumber}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-dark">
                    {order.customerName}
                  </div>
                  <div className="text-xs text-muted">
                    {order.customerEmail}
                  </div>
                </td>
                {showStore && (
                  <td className="px-4 py-3 text-sm text-muted">
                    {order.deliveryType === "delivery" ? "Delivery" : order.deliveryType === "pickup" ? "Pick-up" : "—"}
                  </td>
                )}
                <td className="px-4 py-3 text-right font-semibold text-dark">
                  {formatPrice(Number(order.total))}
                </td>
                <td className="px-4 py-3 text-center">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    {order.status === "PENDING" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onConfirm?.(order.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Confirm"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCancel?.(order.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { if (confirm("Delete this order permanently?")) onDelete?.(order.id); }}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted">
            {total} total orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
