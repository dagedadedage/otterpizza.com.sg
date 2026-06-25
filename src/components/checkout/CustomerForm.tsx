"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Truck, Store } from "lucide-react";

interface Store {
  id: number;
  name: string;
  address: string;
}

export interface CustomerFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryType: "delivery" | "pickup";
  deliveryDate: string;
  storeId: string;
  deliveryAddress: string;
  deliveryUnit: string;
  deliveryPostalCode: string;
  deliveryTimeslot: string;
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
  deliveryAddress?: string;
  deliveryPostalCode?: string;
  deliveryTimeslot?: string;
}

function generateTimeslots(selectedDate: string, deliveryType: "delivery" | "pickup"): string[] {
  const slots: string[] = [];
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const isToday = selectedDate === today;

  const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
  const openTimeMinutes = 10 * 60; // 10am
  const closeTimeMinutes = 22 * 60; // 10pm

  const isDelivery = deliveryType === "delivery";
  const asapLabel = isDelivery ? "ASAP (~30-45 min)" : "ASAP (~30 min)";
  const minAdvanceMinutes = isDelivery ? 60 : 30;

  // Add ASAP option for today (only within operating hours: 10am to 9:30pm)
  if (isToday && currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < closeTimeMinutes - 30) {
    slots.push(asapLabel);
  }

  // Operating hours: 10am to 10pm (last slot at 10:00pm), 30-min increments
  for (let h = 10; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      // Skip 10:30pm (outside hours)
      if (h === 22 && m > 0) continue;

      const slotTime = new Date(selectedDate + "T00:00:00");
      slotTime.setHours(h, m, 0, 0);

      // For today: skip slots too close to now (delivery: 60 min, pickup: 30 min)
      if (isToday && slotTime.getTime() < now.getTime() + minAdvanceMinutes * 60 * 1000) {
        continue;
      }

      const h12 = h % 12 || 12;
      const ampm = h >= 12 ? "PM" : "AM";
      const label = `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
      slots.push(label);
    }
  }
  return slots;
}

function generateDateOptions(): { value: string; label: string }[] {
  const dates: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const value = d.toISOString().split("T")[0];
    const label =
      i === 0
        ? `Today, ${d.toLocaleDateString("en-SG", { day: "numeric", month: "short" })}`
        : i === 1
          ? `Tomorrow, ${d.toLocaleDateString("en-SG", { day: "numeric", month: "short" })}`
          : d.toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short" });
    dates.push({ value, label });
  }
  return dates;
}

export default function CustomerForm({
  onSubmit,
  isSubmitting,
  error,
}: CustomerFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [storeId, setStoreId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryUnit, setDeliveryUnit] = useState("");
  const [deliveryPostalCode, setDeliveryPostalCode] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todaySlots = generateTimeslots(todayStr, "delivery");
    if (todaySlots.length > 0) return todayStr;
    // No slots today — use tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [deliveryTimeslot, setDeliveryTimeslot] = useState("");
  const [notes, setNotes] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const dateOptions = useMemo(() => generateDateOptions(), []);
  const timeslots = useMemo(() => generateTimeslots(deliveryDate, deliveryType), [deliveryDate, deliveryType]);

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch("/api/stores");
        if (res.ok) {
          const data = (await res.json()) as Store[];
          setStores(data);
        }
      } catch {
        // Silently fail
      } finally {
        setStoresLoading(false);
      }
    }
    fetchStores();
  }, []);

  // Auto-advance date if no slots available (e.g. past 9:30pm)
  useEffect(() => {
    if (timeslots.length > 0) {
      setDeliveryTimeslot((prev) => prev && timeslots.includes(prev) ? prev : timeslots[0]);
    } else {
      setDeliveryTimeslot("");
      // If today has no slots, jump to the first date that does
      for (const d of dateOptions) {
        if (generateTimeslots(d.value, deliveryType).length > 0) {
          setDeliveryDate(d.value);
          break;
        }
      }
    }
  }, [timeslots, dateOptions, deliveryType]);

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
    if (deliveryType === "pickup" && !storeId) {
      errors.storeId = "Please select a store for pick-up";
    }
    if (!deliveryTimeslot) {
      errors.deliveryTimeslot = "Please select a timeslot";
    }
    if (deliveryType === "delivery") {
      if (!deliveryAddress.trim()) {
        errors.deliveryAddress = "Delivery address is required";
      }
      if (!deliveryPostalCode.trim()) {
        errors.deliveryPostalCode = "Postal code is required";
      }
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
      deliveryType,
      deliveryDate,
      storeId,
      deliveryAddress: deliveryAddress.trim(),
      deliveryUnit: deliveryUnit.trim(),
      deliveryPostalCode: deliveryPostalCode.trim(),
      deliveryTimeslot,
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

      {/* Delivery / Pick-up toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setDeliveryType("delivery")}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
            deliveryType === "delivery"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border text-muted hover:border-primary/30"
          }`}
        >
          <Truck className="h-4 w-4" />
          Delivery
        </button>
        <button
          type="button"
          onClick={() => setDeliveryType("pickup")}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
            deliveryType === "pickup"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border text-muted hover:border-primary/30"
          }`}
        >
          <Store className="h-4 w-4" />
          Self Pick-up
        </button>
      </div>

      {/* Name + Email */}
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

      {/* Date + Time slot (for both delivery and pickup) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="w-full">
          <Label htmlFor="delivery-date" className="mb-1.5 block text-sm font-medium text-dark">
            Date *
          </Label>
          <select
            id="delivery-date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            disabled={isSubmitting}
            className="flex h-10 w-full rounded-lg border border-border bg-warm-white px-3 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {dateOptions.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full">
          <Label htmlFor="delivery-timeslot" className="mb-1.5 block text-sm font-medium text-dark">
            Time *
          </Label>
          <select
            id="delivery-timeslot"
            value={deliveryTimeslot}
            onChange={(e) => setDeliveryTimeslot(e.target.value)}
            disabled={isSubmitting}
            className="flex h-10 w-full rounded-lg border border-border bg-warm-white px-3 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {timeslots.length > 0 ? (
              timeslots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))
            ) : (
              <option value="">No slots available</option>
            )}
          </select>
          {validationErrors.deliveryTimeslot && (
            <p className="mt-1 text-xs text-accent" role="alert">
              {validationErrors.deliveryTimeslot}
            </p>
          )}
        </div>
      </div>

      {/* Delivery: address */}
      {deliveryType === "delivery" && (
        <>
          <Input
            label="Delivery Address *"
            id="delivery-address"
            placeholder="Block/Street name"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            error={validationErrors.deliveryAddress}
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Unit"
              id="delivery-unit"
              placeholder="#01-23"
              value={deliveryUnit}
              onChange={(e) => setDeliveryUnit(e.target.value)}
              disabled={isSubmitting}
            />
            <Input
              label="Postal Code *"
              id="delivery-postal"
              placeholder="123456"
              value={deliveryPostalCode}
              onChange={(e) => setDeliveryPostalCode(e.target.value)}
              error={validationErrors.deliveryPostalCode}
              disabled={isSubmitting}
            />
          </div>
        </>
      )}

      {/* Pick-up: store select */}
      {deliveryType === "pickup" && (
        <div className="w-full">
          <Label htmlFor="customer-store" className="mb-1.5 block text-sm font-medium text-dark">
            Pick-up Store *
          </Label>
          <select
            id="customer-store"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            disabled={isSubmitting || storesLoading}
            className="flex h-10 w-full rounded-lg border border-border bg-warm-white px-3 py-2 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {storesLoading ? "Loading stores..." : "Select a store"}
            </option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} — {store.address}
              </option>
            ))}
          </select>
          {validationErrors.storeId && (
            <p className="mt-1 text-xs text-accent" role="alert">
              {validationErrors.storeId}
            </p>
          )}
        </div>
      )}

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
        {isSubmitting ? "Processing..." : "Place Order & Pay"}
      </Button>
    </form>
  );
}
