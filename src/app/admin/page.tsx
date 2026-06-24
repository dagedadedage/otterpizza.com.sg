"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  acceptedOrders: number;
  readyOrders: number;
  outForDeliveryOrders: number;
  fulfilledOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  todayRevenue: number;
}

interface RecentOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
  store: { id: number; name: string } | null;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/orders/stats", { credentials: "include" }),
        fetch("/api/admin/orders?limit=5", { credentials: "include" }),
      ]);

      if (!statsRes.ok || !ordersRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();

      setStats(statsData);
      setRecentOrders(ordersData.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-muted">Failed to load dashboard: {error}</p>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Pending",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      color: "text-gray-600 bg-gray-100",
    },
    {
      label: "Paid",
      value: stats?.paidOrders ?? 0,
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      label: "Accepted",
      value: stats?.acceptedOrders ?? 0,
      icon: CheckCircle2,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Ready",
      value: stats?.readyOrders ?? 0,
      icon: PackageCheck,
      color: "text-amber-600 bg-amber-100",
    },
    {
      label: "Out for Delivery",
      value: stats?.outForDeliveryOrders ?? 0,
      icon: ShoppingCart,
      color: "text-indigo-600 bg-indigo-100",
    },
    {
      label: "Fulfilled",
      value: stats?.fulfilledOrders ?? 0,
      icon: CheckCircle2,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Today's Orders",
      value: stats?.todayOrders ?? 0,
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Today's Revenue",
      value: formatPrice(stats?.todayRevenue ?? 0),
      icon: DollarSign,
      color: "text-green-600 bg-green-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark">Dashboard Overview</h2>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-border p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-dark">{card.value}</p>
                </div>
                <div
                  className={`p-2.5 rounded-lg ${card.color} opacity-80`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-dark">Recent Orders</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/orders">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-muted">
            No orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-warm-white/50">
                  <th className="text-left px-6 py-3 font-medium text-muted">
                    Order #
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-muted">
                    Customer
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-muted">
                    Store
                  </th>
                  <th className="text-right px-6 py-3 font-medium text-muted">
                    Total
                  </th>
                  <th className="text-center px-6 py-3 font-medium text-muted">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 font-medium text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-warm-white/30 transition-colors"
                  >
                    <td className="px-6 py-3 font-mono text-sm font-medium">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-3 text-dark">{order.customerName}</td>
                    <td className="px-6 py-3 text-muted">
                      {order.store?.name || "—"}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold">
                      {formatPrice(Number(order.total))}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
