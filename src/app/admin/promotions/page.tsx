"use client";

import { useState, useEffect, useCallback } from "react";
import { formatPrice } from "@/lib/utils";
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Save,
  X,
  Percent,
  DollarSign,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ADMIN_KEY = "otter-pizza-admin-2024";

interface Promotion {
  id: number;
  name: string;
  description: string | null;
  minAmount: number;
  type: string;
  value: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

const typeIcons: Record<string, React.ElementType> = {
  FREE_DELIVERY: Truck,
  PERCENTAGE_DISCOUNT: Percent,
  FIXED_DISCOUNT: DollarSign,
};

const typeLabels: Record<string, string> = {
  FREE_DELIVERY: "Free Delivery",
  PERCENTAGE_DISCOUNT: "% Discount",
  FIXED_DISCOUNT: "Fixed Discount",
};

const emptyForm = {
  name: "",
  description: "",
  minAmount: "",
  type: "FIXED_DISCOUNT" as string,
  value: "",
  isActive: true,
  startsAt: "",
  endsAt: "",
};

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/promotions?includeInactive=true", {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (!res.ok) throw new Error("Failed to fetch promotions");
      const data = await res.json();
      setPromotions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setFormError(null);
  };

  const handleEdit = (promo: Promotion) => {
    setFormData({
      name: promo.name,
      description: promo.description || "",
      minAmount: String(promo.minAmount),
      type: promo.type,
      value: String(promo.value),
      isActive: promo.isActive,
      startsAt: promo.startsAt
        ? new Date(promo.startsAt).toISOString().slice(0, 16)
        : "",
      endsAt: promo.endsAt
        ? new Date(promo.endsAt).toISOString().slice(0, 16)
        : "",
    });
    setEditingId(promo.id);
    setShowForm(true);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.value || !formData.minAmount) {
      setFormError("Name, value, and minimum amount are required");
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/promotions/${editingId}`
        : "/api/admin/promotions";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": ADMIN_KEY,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          minAmount: Number(formData.minAmount),
          type: formData.type,
          value: Number(formData.value),
          isActive: formData.isActive,
          startsAt: formData.startsAt || undefined,
          endsAt: formData.endsAt || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save promotion");
      }

      resetForm();
      await fetchPromotions();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": ADMIN_KEY,
        },
        body: JSON.stringify({ isActive: !current }),
      });
      if (!res.ok) throw new Error("Failed to toggle promotion");
      await fetchPromotions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (!res.ok) throw new Error("Failed to delete promotion");
      await fetchPromotions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark">Promotions</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPromotions}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Promotion
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" onClick={fetchPromotions}>
            Retry
          </Button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark">
              {editingId ? "Edit Promotion" : "New Promotion"}
            </h3>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Promotion Name *"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Free Delivery Weekend"
                required
              />
              <div>
                <Label htmlFor="promo-type">Type *</Label>
                <select
                  id="promo-type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="mt-1.5 flex h-10 w-full rounded-lg border border-border bg-warm-white px-3 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="FREE_DELIVERY">Free Delivery</option>
                  <option value="PERCENTAGE_DISCOUNT">Percentage Discount</option>
                  <option value="FIXED_DISCOUNT">Fixed Discount</option>
                </select>
              </div>
            </div>

            <Input
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Description of the promotion..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Minimum Amount ($) *"
                type="number"
                step="0.01"
                min="0"
                value={formData.minAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minAmount: e.target.value,
                  }))
                }
                placeholder="20.00"
                required
              />
              <Input
                label="Value *"
                type="number"
                step="0.01"
                min="0"
                value={formData.value}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                placeholder={formData.type === "PERCENTAGE_DISCOUNT" ? "10" : "5.00"}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="datetime-local"
                value={formData.startsAt}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startsAt: e.target.value,
                  }))
                }
              />
              <Input
                label="End Date"
                type="datetime-local"
                value={formData.endsAt}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    endsAt: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="promo-active"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="promo-active">Active</Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingId ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Promotions List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-12 text-muted bg-white rounded-xl border border-border">
          No promotions yet. Click "Add Promotion" to create one.
        </div>
      ) : (
        <div className="grid gap-4">
          {promotions.map((promo) => {
            const Icon = typeIcons[promo.type] || DollarSign;
            const isExpired =
              promo.endsAt && new Date(promo.endsAt) < new Date();

            return (
              <div
                key={promo.id}
                className={`bg-white rounded-xl border shadow-sm p-5 ${
                  !promo.isActive ? "border-gray-200 opacity-60" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2.5 rounded-lg ${
                        promo.isActive
                          ? "bg-primary-light text-primary"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark">{promo.name}</h3>
                      {promo.description && (
                        <p className="text-sm text-muted mt-0.5">
                          {promo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                        <span className="font-medium">
                          {typeLabels[promo.type]}
                        </span>
                        <span>
                          Value:{" "}
                          {promo.type === "PERCENTAGE_DISCOUNT"
                            ? `${promo.value}%`
                            : formatPrice(promo.value)}
                        </span>
                        <span>Min: {formatPrice(promo.minAmount)}</span>
                        {promo.startsAt && (
                          <span>
                            From:{" "}
                            {new Date(promo.startsAt).toLocaleDateString()}
                          </span>
                        )}
                        {promo.endsAt && (
                          <span>
                            To:{" "}
                            {new Date(promo.endsAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(promo)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(promo.id, promo.isActive)}
                      className={
                        promo.isActive
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      {promo.isActive ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(promo.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {isExpired && (
                  <div className="mt-2 text-xs text-red-500 font-medium">
                    This promotion has expired.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
