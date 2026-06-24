"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Check, X } from "lucide-react";

export interface PaymentInfo {
  paymentMethod: string;
  referenceNumber: string;
  note: string;
}

interface MarkAsPaidDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (info: PaymentInfo) => void;
  loading?: boolean;
}

export function MarkAsPaidDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: MarkAsPaidDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [note, setNote] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ paymentMethod, referenceNumber: referenceNumber.trim(), note: note.trim() });
    setReferenceNumber("");
    setNote("");
    setPaymentMethod("Bank Transfer");
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-xl border border-border shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark">Mark Order as Paid</h3>
          <button onClick={onClose} className="text-muted hover:text-dark">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option>Bank Transfer</option>
              <option>PayNow</option>
              <option>Cash</option>
              <option>PayPal</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Reference / Transaction ID
            </label>
            <Input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g., Txn #12345 or payer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Note <span className="text-muted font-normal">(optional)</span>
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional info"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Confirm Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
