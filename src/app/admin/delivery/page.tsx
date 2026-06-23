"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Save, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ADMIN_KEY = "otter-pizza-admin-2024";
function authHeaders(): Record<string, string> {
  return { "x-admin-key": ADMIN_KEY };
}

export default function DeliverySettingsPage() {
  const [fee, setFee] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/delivery", { headers: authHeaders(), credentials: "include" })
      .then((res) => res.json())
      .then((data) => { if (data.fee !== undefined) setFee(data.fee); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(null);
    try {
      const res = await fetch("/api/admin/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
        body: JSON.stringify({ fee }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setSuccess("Saved");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark">Delivery Settings</h2>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </Button>
      </div>
      {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      {success && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{success}</div>}
      <div className="bg-white rounded-xl border border-border p-6 max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"><Truck className="w-5 h-5 text-primary" /></div>
          <div><h3 className="font-semibold text-dark">Delivery Fee</h3><p className="text-sm text-muted">Flat delivery fee per order</p></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-dark font-medium">$</span>
          <Input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} min={0} step={0.5} className="w-24" />
        </div>
      </div>
    </div>
  );
}
