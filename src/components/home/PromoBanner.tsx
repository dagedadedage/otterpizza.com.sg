"use client";

import { useEffect, useState } from "react";

interface Promo {
  id: number;
  name: string;
  description: string | null;
  minAmount: number | string;
  type: string;
  value: number | string;
}

const DEFAULT_PROMOS = [
  { label: "FREE DELIVERY (ABOVE $60)", emoji: "🙃" },
  { label: "10% OFF (ABOVE $200)", emoji: "🙃" },
  { label: "15% OFF (ABOVE $500)", emoji: "🙃" },
];

export function PromoBanner() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchPromos() {
      try {
        const res = await fetch("/api/promotions");
        if (res.ok) {
          const data = await res.json();
          setPromos(Array.isArray(data) ? data : data.promotions ?? []);
        }
      } catch {
        // Silently fall back to hardcoded defaults
      } finally {
        setLoaded(true);
      }
    }
    fetchPromos();
  }, []);

  const displayText =
    loaded && promos.length > 0
      ? promos
          .map(
            (p) =>
              `${p.description || p.name}${
                p.type === "PERCENTAGE_DISCOUNT"
                  ? ` (${p.value}% OFF)`
                  : ""
              }`
          )
          .join(" 🙃 ")
      : DEFAULT_PROMOS.map((p) => `${p.label}`).join(" 🙃 ");

  return (
    <div className="bg-gold">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <p className="text-center text-sm sm:text-base font-bold text-dark tracking-wide leading-relaxed">
          {displayText}
        </p>
      </div>
    </div>
  );
}
