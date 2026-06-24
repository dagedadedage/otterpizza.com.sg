"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { OrderTimeline } from "@/components/admin/orders/OrderTimeline";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Send,
  User,
  Mail,
  Phone,
  Store,
  CreditCard,
  Hash,
  Calendar,
  FileText,
  Package,
  Truck,
  Printer,
  MapPin,
  Clock,
  Link2,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: number;
    name: string;
    sku?: string;
  };
}

interface StoreInfo {
  id: number;
  name: string;
  address: string;
}

interface StatusLog {
  id: number;
  fromStatus: string | null;
  toStatus: string;
  changedBy: number;
  note: string | null;
  createdAt: string;
}

interface AdminNote {
  id: number;
  content: string;
  createdBy: number;
  createdAt: string;
}

interface OrderData {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  store: StoreInfo | null;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  gstAmount: number;
  gstRate: number;
  total: number;
  status: string;
  paymentMethod: string | null;
  paymentId: string | null;
  paymentStatus: string | null;
  deliveryType: string | null;
  deliveryDate: string | null;
  deliveryAddress: string | null;
  deliveryUnit: string | null;
  deliveryPostalCode: string | null;
  deliveryTimeslot: string | null;
  deliveryTrackingUrl: string | null;
  notes: string | null;
  items: OrderItem[];
  statusLogs: StatusLog[];
  adminNotes: AdminNote[];
  createdAt: string;
  updatedAt: string;
}

const statusTransitions: Record<string, { label: string; nextStatus: string; variant: "primary" | "secondary" | "outline" }[]> = {
  PENDING: [
    { label: "Mark as Paid", nextStatus: "PAID", variant: "primary" },
    { label: "Cancel Order", nextStatus: "CANCELLED", variant: "outline" },
  ],
  PAID: [
    { label: "Accept Order", nextStatus: "ACCEPTED", variant: "primary" },
    { label: "Cancel Order", nextStatus: "CANCELLED", variant: "outline" },
  ],
  ACCEPTED: [
    { label: "Ready for Pick-up", nextStatus: "READY", variant: "primary" },
    { label: "Out for Delivery", nextStatus: "OUT_FOR_DELIVERY", variant: "secondary" },
    { label: "Cancel Order", nextStatus: "CANCELLED", variant: "outline" },
  ],
  READY: [
    { label: "Fulfill (Picked Up)", nextStatus: "FULFILLED", variant: "primary" },
    { label: "Cancel Order", nextStatus: "CANCELLED", variant: "outline" },
  ],
  OUT_FOR_DELIVERY: [
    { label: "Fulfill (Delivered)", nextStatus: "FULFILLED", variant: "primary" },
    { label: "Cancel Order", nextStatus: "CANCELLED", variant: "outline" },
  ],
  FULFILLED: [],
  CANCELLED: [],
  // Legacy transitions for existing orders
  CONFIRMED: [
    { label: "Accept Order", nextStatus: "ACCEPTED", variant: "primary" },
    { label: "Cancel Order", nextStatus: "CANCELLED", variant: "outline" },
  ],
  PREPARING: [
    { label: "Ready for Pick-up", nextStatus: "READY", variant: "primary" },
    { label: "Cancel Order", nextStatus: "CANCELLED", variant: "outline" },
  ],
  COMPLETED: [],
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [trackingUrl, setTrackingUrl] = useState("");
  const [trackingSaving, setTrackingSaving] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Order not found");
        }
        throw new Error("Failed to fetch order");
      }
      const data = await res.json();
      setOrder(data);
      setTrackingUrl(data.deliveryTrackingUrl || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusChange = async (newStatus: string) => {
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
          changedBy: 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update status");
      }

      await fetchOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const [refunding, setRefunding] = useState(false);

  const handleRefund = async () => {
    if (!confirm("Refund this payment? This cannot be undone.")) return;
    setRefunding(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Refund failed");
      }
      await fetchOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRefunding(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setNoteLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          note: noteText,
          changedBy: 0,
        }),
      });

      if (!res.ok) throw new Error("Failed to add note");

      setNoteText("");
      await fetchOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setNoteLoading(false);
    }
  };

  const handleSaveTrackingUrl = async () => {
    setTrackingSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          deliveryTrackingUrl: trackingUrl,
        }),
      });
      if (!res.ok) throw new Error("Failed to save tracking URL");
      await fetchOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setTrackingSaving(false);
    }
  };

  const handlePrintInvoice = () => {
    window.open(`/api/admin/orders/${params.id}/invoice`, "_blank");
  };

  const handleDelete = async () => {
    if (!confirm("Permanently delete this order? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/admin/orders");
    } catch { alert("Failed to delete order"); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-muted">{error || "Order not found"}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/admin/orders")}>
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>
          <Button variant="primary" onClick={fetchOrder}>
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const transitions = statusTransitions[order.status] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-dark">
              Order {order.orderNumber}
            </h2>
            <p className="text-sm text-muted">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleString("en-SG", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintInvoice}>
            <Printer className="w-4 h-4" />
            Invoice
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 border-red-300 hover:bg-red-50 gap-1">
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
          <OrderStatusBadge status={order.status} className="text-sm px-3 py-1" />
        </div>
      </div>

      {/* Status Actions */}
      {transitions.length > 0 && (
        <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-cream border border-border">
          <span className="text-sm font-medium text-dark self-center">
            Update Status:
          </span>
          {transitions.map((action) => (
            <Button
              key={action.nextStatus}
              variant={action.variant}
              size="md"
              onClick={() => handleStatusChange(action.nextStatus)}
              disabled={statusLoading}
            >
              {statusLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              {action.label}
            </Button>
          ))}
          {order.paymentId && ["PAID", "ACCEPTED", "READY"].includes(order.status) && (
            <Button
              variant="outline"
              size="md"
              onClick={handleRefund}
              disabled={refunding}
              className="text-purple-600 border-purple-300 hover:bg-purple-50"
            >
              {refunding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Refund Payment
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl border border-border shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-dark">Order Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-warm-white/50">
                    <th className="text-left px-6 py-3 font-medium text-muted">
                      Product
                    </th>
                    <th className="text-center px-6 py-3 font-medium text-muted">
                      Qty
                    </th>
                    <th className="text-right px-6 py-3 font-medium text-muted">
                      Unit Price
                    </th>
                    <th className="text-right px-6 py-3 font-medium text-muted">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-3 font-medium text-dark">
                        {item.product.name}
                      </td>
                      <td className="px-6 py-3 text-center text-muted">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-3 text-right text-muted">
                        {formatPrice(Number(item.unitPrice))}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-dark">
                        {formatPrice(Number(item.totalPrice))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-warm-white/30">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm text-muted">
                      Subtotal
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-dark">
                      {formatPrice(Number(order.subtotal))}
                    </td>
                  </tr>
                  {order.discount > 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-sm text-muted">
                        Discount
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-green-600">
                        -{formatPrice(Number(order.discount))}
                      </td>
                    </tr>
                  )}
                  {order.deliveryFee > 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-sm text-muted">
                        Delivery Fee
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-dark">
                        {formatPrice(Number(order.deliveryFee))}
                      </td>
                    </tr>
                  )}
                  {(order.gstAmount ?? 0) > 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-sm text-muted">
                        GST ({order.gstRate ?? 9}%)
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-dark">
                        {formatPrice(Number(order.gstAmount))}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-border">
                    <td colSpan={3} className="px-6 py-3 text-right font-semibold text-dark">
                      Total
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-lg text-primary">
                      {formatPrice(Number(order.total))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-xl border border-border shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-dark">Order Timeline</h3>
            </div>
            <div className="px-6 py-4">
              <OrderTimeline statusLogs={order.statusLogs} />
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-xl border border-border shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-dark">Admin Notes</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Add Note */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Add a note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                  className="flex-1 h-10 rounded-lg border border-border bg-warm-white px-3 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!noteText.trim() || noteLoading}
                >
                  {noteLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Add
                </Button>
              </div>

              {/* Notes List */}
              {order.adminNotes.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">
                  No notes yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {order.adminNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg bg-warm-white border border-border"
                    >
                      <p className="text-sm text-dark">{note.content}</p>
                      <p className="text-xs text-muted mt-1">
                        User #{note.createdBy} &middot;{" "}
                        {new Date(note.createdAt).toLocaleString("en-SG", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-border shadow-sm">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-dark">Customer</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted shrink-0" />
                <span className="text-sm text-dark">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted shrink-0" />
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="text-sm text-primary hover:underline"
                >
                  {order.customerEmail}
                </a>
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted shrink-0" />
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {order.customerPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Order Type & Delivery Info */}
          <div className="bg-white rounded-xl border border-border shadow-sm">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-dark">Order Type</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-3">
                {order.deliveryType === "delivery" ? (
                  <Truck className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <Store className="w-4 h-4 text-primary shrink-0" />
                )}
                <span className="text-sm font-medium text-dark">
                  {order.deliveryType === "delivery" ? "Delivery" : "Self Pick-up"}
                </span>
              </div>
              {order.deliveryType === "delivery" && order.deliveryAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                  <p className="text-sm text-muted">
                    {order.deliveryAddress}
                    {order.deliveryUnit && `, ${order.deliveryUnit}`}
                    <br />S{order.deliveryPostalCode}
                  </p>
                </div>
              )}
              {order.deliveryDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted shrink-0" />
                  <span className="text-sm text-muted">
                    {order.deliveryDate} {order.deliveryTimeslot && `at ${order.deliveryTimeslot}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Store Info */}
          <div className="bg-white rounded-xl border border-border shadow-sm">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-dark">Store</h3>
            </div>
            <div className="px-5 py-4">
              {order.store ? (
                <div className="flex items-center gap-3">
                  <Store className="w-4 h-4 text-muted shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-dark">
                      {order.store.name}
                    </p>
                    <p className="text-xs text-muted">{order.store.address}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted">No store assigned</p>
              )}
            </div>
          </div>

          {/* Delivery Tracking (if delivery) */}
          {order.deliveryType === "delivery" && (
            <div className="bg-white rounded-xl border border-border shadow-sm">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-dark">Delivery Tracking</h3>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter tracking URL..."
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    className="flex-1 text-xs"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveTrackingUrl}
                    disabled={trackingSaving}
                  >
                    {trackingSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {order.deliveryTrackingUrl && (
                  <a
                    href={order.deliveryTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:underline"
                  >
                    <Link2 className="w-3 h-3" />
                    Open tracking link
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-border shadow-sm">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-dark">Payment</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-muted shrink-0" />
                <span className="text-sm text-dark">
                  {order.paymentMethod || "Not specified"}
                </span>
              </div>
              {order.paymentStatus && (
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted shrink-0" />
                  <span className="text-sm text-dark">
                    {order.paymentStatus}
                  </span>
                </div>
              )}
              {order.paymentId && (
                <div className="flex items-center gap-3">
                  <Hash className="w-4 h-4 text-muted shrink-0" />
                  <span className="text-xs font-mono text-muted">
                    {order.paymentId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-white rounded-xl border border-border shadow-sm">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-dark">Order Notes</h3>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-muted">{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
