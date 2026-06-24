"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Save, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GstSettingsPage() {
  const [rate, setRate] = useState<number>(9);
  const [mode, setMode] = useState<"INCLUSIVE" | "EXCLUSIVE">("EXCLUSIVE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/gst", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load GST settings");
      const data = await res.json();
      setRate(data.rate);
      setMode(data.mode);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/gst", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ rate, mode }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      setSuccess("GST settings saved successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark">GST Settings</h2>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GST Rate */}
        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Percent className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-dark">GST Rate</h3>
              <p className="text-sm text-muted">Current Singapore GST rate</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              min={0}
              max={100}
              step={0.1}
              className="w-24"
            />
            <span className="text-dark font-medium">%</span>
          </div>
        </div>

        {/* GST Mode */}
        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Percent className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-dark">GST Mode</h3>
              <p className="text-sm text-muted">
                How GST is applied to product prices
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMode("EXCLUSIVE")}
              className={`flex-1 p-4 rounded-lg border-2 text-left transition-colors ${
                mode === "EXCLUSIVE"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="font-semibold text-dark text-sm">Exclusive (Markup)</div>
              <div className="text-xs text-muted mt-1">
                GST added on top. E.g., $10.00 + 9% = $10.90
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode("INCLUSIVE")}
              className={`flex-1 p-4 rounded-lg border-2 text-left transition-colors ${
                mode === "INCLUSIVE"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="font-semibold text-dark text-sm">Inclusive</div>
              <div className="text-xs text-muted mt-1">
                GST already in price. $10.00 includes 9% GST
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Calculation Preview */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="font-semibold text-dark mb-3">Calculation Example</h3>
        <div className="text-sm text-muted space-y-1">
          <p>Sample subtotal: <span className="text-dark font-medium">$100.00</span></p>
          {mode === "EXCLUSIVE" ? (
            <>
              <p>GST ({rate}% on top): <span className="text-dark font-medium">${(100 * rate / 100).toFixed(2)}</span></p>
              <p className="font-semibold text-dark mt-2">Total: ${(100 + 100 * rate / 100).toFixed(2)}</p>
            </>
          ) : (
            <>
              <p>GST ({rate}% embedded): <span className="text-dark font-medium">${(100 * rate / (100 + rate)).toFixed(2)}</span></p>
              <p className="font-semibold text-dark mt-2">Base price (excl. GST): ${(100 * 100 / (100 + rate)).toFixed(2)}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
