"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductTable } from "@/components/admin/menu/ProductTable";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  salePrice: number | null;
  inStock: boolean;
  isFeatured: boolean;
  category: Category;
}

export default function AdminMenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showObsolete, setShowObsolete] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCategory) params.set("categoryId", String(selectedCategory));
      if (showObsolete) params.set("showObsolete", "1");
      params.set("page", String(page));
      params.set("limit", "50");

      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/menu?${params}`, {
          credentials: "include",
        }),
        fetch("/api/admin/categories", {
          credentials: "include",
        }),
      ]);

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(productsData.data || []);
      setTotalPages(productsData.totalPages || 1);
      setTotal(productsData.total || 0);
      setCategories(categoriesData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, page, showObsolete]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleToggleStock = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/menu/${id}/stock`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to toggle stock");
      await fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      await fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark">Menu Management</h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showObsolete}
              onChange={(e) => { setShowObsolete(e.target.checked); setPage(1); }}
              className="cursor-pointer"
            />
            Show Obsolete
          </label>
          <Button variant="outline" size="sm" onClick={fetchProducts}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" onClick={fetchProducts}>
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <ProductTable
          products={products}
          categories={categories}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
          onSearch={handleSearch}
          onCategoryFilter={handleCategoryFilter}
          onToggleStock={handleToggleStock}
          onDelete={handleDelete}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
        />
      )}
    </div>
  );
}
