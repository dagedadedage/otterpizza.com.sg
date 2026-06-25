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
  { label: "FREE DELIVERY (ABOVE $50)", emoji: "🙃" },
  { label: "5% OFF + FREE DELIVERY (ABOVE $150)", emoji: "🙃" },
  { label: "10% OFF + FREE DELIVERY (ABOVE $250)", emoji: "🙃" },
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

  // Repeat text for seamless marquee
  const marqueeText = `${displayText} 🙃 ${displayText} 🙃 ${displayText}`;

  return (
    <div className="bg-gold overflow-hidden">
      <div className="py-2 sm:py-3 whitespace-nowrap">
        <div className="animate-marquee inline-block">
          <p className="inline text-sm sm:text-base font-bold text-dark tracking-wide">
            {marqueeText}
          </p>
        </div>
        <div className="animate-marquee inline-block">
          <p className="inline text-sm sm:text-base font-bold text-dark tracking-wide">
            {marqueeText}
          </p>
        </div>
      </div>
      <style jsx>{`
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
