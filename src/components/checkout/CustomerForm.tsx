"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Store {
  id: number;
  name: string;
  address: string;
}

interface CustomerFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  storeId: string;
  notes: string;
}

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  isSubmitting: boolean;
  error?: string | null;
}

interface ValidationErrors {
  customerName?: string;
  customerEmail?: string;
  storeId?: string;
}

export default function CustomerForm({
  onSubmit,
  isSubmitting,
  error,
}: CustomerFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [storeId, setStoreId] = useState("");
  const [notes, setNotes] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch("/api/stores");
        if (res.ok) {
          const data = (await res.json()) as Store[];
          setStores(data);
          if (data.length === 1) {
            setStoreId(String(data[0].id));
          }
        }
      } catch {
        // Silently fail — user can still type manually
      } finally {
        setStoresLoading(false);
      }
    }
    fetchStores();
  }, []);

  function validate(): boolean {
    const errors: ValidationErrors = {};
    if (!customerName.trim()) {
      errors.customerName = "Name is required";
    }
    if (!customerEmail.trim()) {
      errors.customerEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      errors.customerEmail = "Please enter a valid email address";
    }
    if (!storeId) {
      errors.storeId = "Please select a store";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      storeId,
      notes: notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          className="rounded-lg border border-accent/30 bg-red-50 p-4 text-sm text-accent"
          role="alert"
        >
          {error}
        </div>
      )}

      <Input
        label="Name *"
        id="customer-name"
        placeholder="Your full name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        error={validationErrors.customerName}
        disabled={isSubmitting}
      />

      <Input
        label="Email *"
        id="customer-email"
        type="email"
        placeholder="you@example.com"
        value={customerEmail}
        onChange={(e) => setCustomerEmail(e.target.value)}
        error={validationErrors.customerEmail}
        disabled={isSubmitting}
      />

      <Input
        label="Phone"
        id="customer-phone"
        type="tel"
        placeholder="+65 9123 4567"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        disabled={isSubmitting}
      />

      {/* Store select */}
      <div className="w-full">
        <Label htmlFor="customer-store" className="mb-1.5 block text-sm font-medium text-dark">
          Store *
        </Label>
        <select
          id="customer-store"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          disabled={isSubmitting || storesLoading}
          className="flex h-10 w-full rounded-lg border border-border bg-warm-white px-3 py-2 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          aria-invalid={!!validationErrors.storeId}
        >
          <option value="">
            {storesLoading ? "Loading stores..." : "Select a store"}
          </option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
        {validationErrors.storeId && (
          <p className="mt-1 text-xs text-accent" role="alert">
            {validationErrors.storeId}
          </p>
        )}
      </div>

      {/* Order notes */}
      <div className="w-full">
        <Label htmlFor="customer-notes" className="mb-1.5 block text-sm font-medium text-dark">
          Order Notes
        </Label>
        <textarea
          id="customer-notes"
          rows={3}
          placeholder="Any special requests or dietary notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
          className="flex w-full rounded-lg border border-border bg-warm-white px-3 py-2 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          "Place Order & Pay"
        )}
      </Button>
    </form>
  );
}
