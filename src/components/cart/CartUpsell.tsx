"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart-context";
import { showCartToast } from "@/components/cart/CartToast";

interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  inStock: boolean;
}

export function CartUpsell() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { addItem } = useCart();

  const fetchProducts = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/menu?featured=true&page=${p}&limit=8`);
      if (res.ok) {
        const data = await res.json();
        const items = (data.products || []).map((item: any) => ({
          id: item.id, sku: item.sku, name: item.name, slug: item.slug,
          price: Number(item.price), salePrice: item.salePrice ? Number(item.salePrice) : null,
          imageUrl: item.imageUrl, inStock: item.inStock,
        }));
        if (p === 1) setProducts(items);
        else setProducts(prev => [...prev, ...items]);
        setHasMore(data.hasMore || false);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  const displayPrice = (p: Product) => p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price;
  const hasSale = (p: Product) => p.salePrice != null && p.salePrice < p.price;

  const handleAdd = (p: Product) => {
    addItem({ productId: p.id, sku: p.slug, name: p.name, price: p.price, salePrice: p.salePrice, quantity: 1, imageUrl: p.imageUrl });
    showCartToast(p.name);
  };

  if (products.length === 0 && !loading) return null;

  return (
    <div id="cart-upsell" className="rounded-lg border border-border bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-dark">Add to Your Order</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {products.filter(p => p.inStock).map((p) => (
          <div key={p.id} className="group flex flex-col rounded-lg border border-border overflow-hidden hover:shadow-sm transition-shadow">
            <Link href={`/menu/${p.slug}`} className="aspect-[4/3] bg-cream flex items-center justify-center overflow-hidden">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <span className="text-2xl">🍕</span>
              )}
            </Link>
            <div className="p-2 flex flex-col flex-1">
              <p className="text-[11px] font-semibold text-dark leading-tight line-clamp-2">{p.name}</p>
              <p className="text-[10px] text-muted font-mono">{p.sku}</p>
              <div className="mt-auto pt-1 flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className={`text-xs font-bold ${hasSale(p) ? "text-primary" : "text-dark"}`}>{formatPrice(displayPrice(p))}</span>
                  {hasSale(p) && <span className="text-[10px] text-muted line-through">{formatPrice(p.price)}</span>}
                </div>
                <button
                  onClick={() => handleAdd(p)}
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors cursor-pointer shrink-0"
                  aria-label={`Add ${p.name}`}
                  title="Quick add"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" onClick={() => { const np = page + 1; setPage(np); fetchProducts(np); }} disabled={loading}>
            {loading ? "Loading..." : <><ChevronDown className="w-4 h-4" /> Load More</>}
          </Button>
        </div>
      )}
    </div>
  );
}
