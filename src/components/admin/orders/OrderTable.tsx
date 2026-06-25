"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Eye, ChevronLeft, ChevronRight, Check, X, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkAsPaidDialog, type PaymentInfo } from "./MarkAsPaidDialog";

type SortField = "createdAt" | "orderNumber" | "customerName" | "total" | "status" | "deliveryType";
type SortDir = "asc" | "desc";

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
  onConfirm?: (id: number, currentStatus: string, paymentInfo?: PaymentInfo) => void;
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
  const [paymentDialogOrder, setPaymentDialogOrder] = useState<{ id: number; status: string } | null>(null);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      let va: string | number = "";
      let vb: string | number = "";
      switch (sortField) {
        case "createdAt": va = a.createdAt; vb = b.createdAt; break;
        case "orderNumber": va = a.orderNumber; vb = b.orderNumber; break;
        case "customerName": va = a.customerName.toLowerCase(); vb = b.customerName.toLowerCase(); break;
        case "total": va = Number(a.total); vb = Number(b.total); break;
        case "status": va = a.status; vb = b.status; break;
        case "deliveryType": va = a.deliveryType || ""; vb = b.deliveryType || ""; break;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [orders, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  const Th = ({ field, children, className }: { field?: SortField; children: React.ReactNode; className?: string }) => (
    <th className={`${className || "text-left"} px-4 py-3 font-semibold text-dark ${field ? "cursor-pointer select-none hover:bg-primary-light/30" : ""}`} onClick={() => field && handleSort(field)}>
      <div className="flex items-center gap-1">{children}{field && <SortIcon field={field} />}</div>
    </th>
  );

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">No orders found.</p>
      </div>
    );
  }

  const colSpan = showStore ? 8 : 7;
  if (orders.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <tbody><tr><td colSpan={colSpan} className="text-center py-12 text-muted">No orders found.</td></tr></tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream border-b border-border">
              <Th className="text-center w-10">#</Th>
              <Th field="createdAt">Date</Th>
              <Th field="orderNumber">Order #</Th>
              <Th field="customerName">Customer</Th>
              {showStore && <Th field="deliveryType">Type</Th>}
              <Th field="total" className="text-right">Total</Th>
              <Th field="status" className="text-center">Status</Th>
              <th className="text-center px-4 py-3 font-semibold text-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedOrders.map((order, idx) => (
              <tr
                key={order.id}
                className="hover:bg-warm-white/50 transition-colors"
              >
                <td className="px-4 py-3 text-xs text-muted text-center">
                  {(page - 1) * 50 + idx + 1}
                </td>
                <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleString("en-SG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
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
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </Button>
                    {/* Mark Paid — only for PENDING */}
                    <Button
                      size="sm"
                      onClick={() => setPaymentDialogOrder({ id: order.id, status: order.status })}
                      disabled={order.status !== "PENDING"}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Paid
                    </Button>
                    {/* Cancel — only for non-final statuses */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCancel?.(order.id)}
                      disabled={["CANCELLED", "REFUNDED", "FULFILLED"].includes(order.status)}
                      className="text-red-600 border-red-300 hover:bg-red-50 gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Info Dialog */}
      <MarkAsPaidDialog
        open={!!paymentDialogOrder}
        onClose={() => setPaymentDialogOrder(null)}
        onConfirm={(info) => {
          if (paymentDialogOrder && onConfirm) {
            onConfirm(paymentDialogOrder.id, paymentDialogOrder.status, info);
          }
          setPaymentDialogOrder(null);
        }}
      />

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
