"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice, cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onCategoryFilter: (categoryId: number | null) => void;
  onToggleStock: (id: number) => void;
  onDelete: (id: number) => void;
  searchQuery: string;
  selectedCategory: number | null;
}

export function ProductTable({
  products,
  categories,
  page,
  totalPages,
  total,
  onPageChange,
  onSearch,
  onCategoryFilter,
  onToggleStock,
  onDelete,
  searchQuery,
  selectedCategory,
}: ProductTableProps) {
  const [searchInput, setSearchInput] = useState(searchQuery);

  const handleSearch = () => {
    onSearch(searchInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-12 h-12 mx-auto text-muted/40 mb-4" />
        <p className="text-muted">No products found.</p>
        <Button variant="primary" size="sm" className="mt-4" asChild>
          <Link href="/admin/menu/new">
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-warm-white text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={selectedCategory ?? ""}
          onChange={(e) =>
            onCategoryFilter(e.target.value ? Number(e.target.value) : null)
          }
          className="h-10 rounded-lg border border-border bg-warm-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <Button variant="primary" size="sm" onClick={handleSearch}>
          <Search className="w-4 h-4" />
          Search
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/admin/menu/new">
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream border-b border-border">
              <th className="text-left px-4 py-3 font-semibold text-dark">
                SKU
              </th>
              <th className="text-left px-4 py-3 font-semibold text-dark">
                Name
              </th>
              <th className="text-left px-4 py-3 font-semibold text-dark">
                Category
              </th>
              <th className="text-right px-4 py-3 font-semibold text-dark">
                Price
              </th>
              <th className="text-center px-4 py-3 font-semibold text-dark">
                Sale
              </th>
              <th className="text-center px-4 py-3 font-semibold text-dark">
                Stock
              </th>
              <th className="text-center px-4 py-3 font-semibold text-dark">
                Featured
              </th>
              <th className="text-center px-4 py-3 font-semibold text-dark">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-warm-white/50 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-muted">
                  {product.sku}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/menu/${product.id}/edit`}
                    className="font-medium text-dark hover:text-primary transition-colors"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-muted">
                  {product.category?.name || "—"}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-dark">
                  {formatPrice(Number(product.price))}
                </td>
                <td className="px-4 py-3 text-center">
                  {product.salePrice ? (
                    <span className="text-green-600 font-medium">
                      {formatPrice(Number(product.salePrice))}
                    </span>
                  ) : (
                    <span className="text-muted/50">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onToggleStock(product.id)}
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors",
                      product.inStock
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    )}
                  >
                    {product.inStock ? (
                      <ToggleRight className="w-3.5 h-3.5" />
                    ) : (
                      <ToggleLeft className="w-3.5 h-3.5" />
                    )}
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  {product.isFeatured ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      Featured
                    </span>
                  ) : (
                    <span className="text-muted/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/menu/${product.id}/edit`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(product.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted">
            {total} product{total !== 1 ? "s" : ""} found
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
