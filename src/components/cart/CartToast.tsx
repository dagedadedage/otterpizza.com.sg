"use client";

import { useEffect, useState, useCallback } from "react";
import { ShoppingCart, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastItem {
  id: number;
  name: string;
}

let toastId = 0;
const listeners: Set<(item: ToastItem) => void> = new Set();

export function showCartToast(name: string) {
  const item: ToastItem = { id: ++toastId, name };
  listeners.forEach((fn) => fn(item));
}

export function CartToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((item: ToastItem) => {
    setToasts((prev) => [...prev, item]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== item.id));
    }, 2500);
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => { listeners.delete(addToast); };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 bg-dark text-white px-4 py-3 rounded-xl shadow-lg",
            "animate-[slideUp_0.3s_ease-out]"
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary shrink-0">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Added to Cart</p>
            <p className="text-xs text-white/70 truncate max-w-[200px]">{toast.name}</p>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="ml-2 text-white/50 hover:text-white shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
