"use client";

import { useState, useEffect, useRef } from "react";
import { searchAddress, type AddressResult } from "@/lib/one-map";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  postalCode: string;
  onChange: (address: string, postalCode: string) => void;
  error?: string;
  disabled?: boolean;
}

export function AddressAutocomplete({ value, postalCode, onChange, error, disabled }: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => { setQuery(value); }, [value]);

  // Search with debounce
  useEffect(() => {
    if (query.length < 3) { setResults([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const data = await searchAddress(query);
      setResults(data);
      setOpen(data.length > 0);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        label="Delivery Address *"
        id="delivery-address"
        placeholder="Enter your address (e.g. 123 Clementi Road or 408732)"
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value, postalCode); }}
        error={error}
        disabled={disabled}
      />
      {loading && (
        <div className="absolute right-3 top-[38px] z-10">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-white border border-border rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <li
              key={i}
              className="px-4 py-2.5 hover:bg-primary-light cursor-pointer border-b border-border/50 last:border-0 text-sm"
              onClick={() => {
                setQuery(r.address);
                onChange(r.address, r.postalCode || postalCode);
                setOpen(false);
              }}
            >
              <p className="font-medium text-dark">{r.address}</p>
              {r.postalCode && <p className="text-xs text-muted mt-0.5">Singapore {r.postalCode}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
