"use client";

import { useState, useEffect, useCallback } from "react";
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
  MapPin,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ADMIN_KEY = "otter-pizza-admin-2024";

interface Store {
  id: number;
  name: string;
  address: string;
  unit: string;
  building: string;
  postalCode: string;
  grabUrl: string | null;
  foodpandaUrl: string | null;
  deliverooUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm = {
  name: "",
  address: "",
  unit: "",
  building: "",
  postalCode: "",
  grabUrl: "",
  foodpandaUrl: "",
  deliverooUrl: "",
  latitude: "",
  longitude: "",
  sortOrder: "0",
};

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stores?includeInactive=true", {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (!res.ok) throw new Error("Failed to fetch stores");
      const data = await res.json();
      setStores(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setFormError(null);
  };

  const handleEdit = (store: Store) => {
    setFormData({
      name: store.name,
      address: store.address,
      unit: store.unit,
      building: store.building,
      postalCode: store.postalCode,
      grabUrl: store.grabUrl || "",
      foodpandaUrl: store.foodpandaUrl || "",
      deliverooUrl: store.deliverooUrl || "",
      latitude: store.latitude ? String(store.latitude) : "",
      longitude: store.longitude ? String(store.longitude) : "",
      sortOrder: String(store.sortOrder),
    });
    setEditingId(store.id);
    setShowForm(true);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (
      !formData.name.trim() ||
      !formData.address.trim() ||
      !formData.unit.trim() ||
      !formData.building.trim() ||
      !formData.postalCode.trim()
    ) {
      setFormError("Name, address, unit, building, and postal code are required");
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/stores/${editingId}`
        : "/api/admin/stores";
      const method = editingId ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        name: formData.name,
        address: formData.address,
        unit: formData.unit,
        building: formData.building,
        postalCode: formData.postalCode,
        grabUrl: formData.grabUrl || undefined,
        foodpandaUrl: formData.foodpandaUrl || undefined,
        deliverooUrl: formData.deliverooUrl || undefined,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        sortOrder: Number(formData.sortOrder) || 0,
        isActive: true,
      };

      if (editingId) {
        body.isActive = undefined;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": ADMIN_KEY,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save store");
      }

      resetForm();
      await fetchStores();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/stores/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": ADMIN_KEY,
        },
        body: JSON.stringify({ isActive: !current }),
      });
      if (!res.ok) throw new Error("Failed to update store");
      await fetchStores();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this store? Orders linked to it will be affected."
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/stores/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (!res.ok) throw new Error("Failed to delete store");
      await fetchStores();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark">Stores</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchStores}>
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
            Add Store
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" onClick={fetchStores}>
            Retry
          </Button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark">
              {editingId ? "Edit Store" : "New Store"}
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
            <Input
              label="Store Name *"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Otter Pizza @ Orchard"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Address *"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="123 Orchard Road"
                required
              />
              <Input
                label="Unit *"
                value={formData.unit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, unit: e.target.value }))
                }
                placeholder="#01-01"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Building *"
                value={formData.building}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    building: e.target.value,
                  }))
                }
                placeholder="Orchard Central"
                required
              />
              <Input
                label="Postal Code *"
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    postalCode: e.target.value,
                  }))
                }
                placeholder="238896"
                required
              />
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-dark mb-3">
                Delivery Platform Links
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Grab URL"
                  value={formData.grabUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      grabUrl: e.target.value,
                    }))
                  }
                  placeholder="https://food.grab.com/..."
                />
                <Input
                  label="Foodpanda URL"
                  value={formData.foodpandaUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      foodpandaUrl: e.target.value,
                    }))
                  }
                  placeholder="https://www.foodpanda.sg/..."
                />
                <Input
                  label="Deliveroo URL"
                  value={formData.deliverooUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deliverooUrl: e.target.value,
                    }))
                  }
                  placeholder="https://deliveroo.com.sg/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Latitude"
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    latitude: e.target.value,
                  }))
                }
                placeholder="1.3049"
              />
              <Input
                label="Longitude"
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    longitude: e.target.value,
                  }))
                }
                placeholder="103.8318"
              />
              <Input
                label="Sort Order"
                type="number"
                min="0"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sortOrder: e.target.value,
                  }))
                }
              />
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

      {/* Stores List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-12 text-muted bg-white rounded-xl border border-border">
          No stores yet. Click "Add Store" to create one.
        </div>
      ) : (
        <div className="grid gap-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className={`bg-white rounded-xl border shadow-sm p-5 ${
                !store.isActive ? "border-gray-200 opacity-60" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2.5 rounded-lg ${
                      store.isActive
                        ? "bg-primary-light text-primary"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark">{store.name}</h3>
                    <p className="text-sm text-muted mt-0.5">
                      {store.address}, #{store.unit}, {store.building},{" "}
                      {store.postalCode}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                      {store.grabUrl && (
                        <a
                          href={store.grabUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Grab
                        </a>
                      )}
                      {store.foodpandaUrl && (
                        <a
                          href={store.foodpandaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Foodpanda
                        </a>
                      )}
                      {store.deliverooUrl && (
                        <a
                          href={store.deliverooUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Deliveroo
                        </a>
                      )}
                      {store.latitude && store.longitude && (
                        <span>
                          {store.latitude}, {store.longitude}
                        </span>
                      )}
                      <span>Order: {store.sortOrder}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(store)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(store.id, store.isActive)}
                    className={store.isActive ? "text-green-600" : "text-gray-400"}
                  >
                    {store.isActive ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(store.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {!store.isActive && (
                <div className="mt-2 text-xs text-muted font-medium">
                  This store is inactive.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
