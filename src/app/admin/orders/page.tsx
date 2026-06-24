"use client";

import { useState, useEffect, useCallback } from "react";
import { OrderTable } from "@/components/admin/orders/OrderTable";
import { Search, Filter, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusTabs = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Ready", value: "READY" },
  { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Fulfilled", value: "FULFILLED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" },
];

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  store: { id: number; name: string } | null;
  deliveryType?: string | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await fetch(`/api/admin/orders?${params}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      setOrders(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleConfirm = async (id: number, currentStatus: string, paymentInfo?: { paymentMethod: string; referenceNumber: string; note: string }) => {
    // Only PENDING -> PAID (via payment dialog); other transitions via detail page
    if (currentStatus !== "PENDING") return;
    const nextStatus = "PAID";
    const body: Record<string, unknown> = { status: nextStatus, changedBy: 0 };

    // Include payment info when marking as paid
    if (paymentInfo) {
      body.paymentMethod = paymentInfo.paymentMethod;
      body.paymentReference = paymentInfo.referenceNumber;
      body.paymentNote = paymentInfo.note;
    }

    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(body),
      });
      fetchOrders();
    } catch { alert("Failed to update order"); }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this order?")) return;
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status: "CANCELLED", changedBy: 0 }),
      });
      fetchOrders();
    } catch { alert("Failed to cancel order"); }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      fetchOrders();
    } catch { alert("Failed to delete order"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark">Orders</h2>
        <Button variant="outline" size="sm" onClick={fetchOrders}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? "bg-primary text-white"
                : "bg-white text-muted hover:text-dark hover:bg-gray-100 border border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by order number, customer name, or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button variant="primary" size="sm" onClick={handleSearch}>
          <Search className="w-4 h-4" />
          Search
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" onClick={fetchOrders}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Orders Table */}
      {!loading && !error && (
        <OrderTable
          orders={orders}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={handlePageChange}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
